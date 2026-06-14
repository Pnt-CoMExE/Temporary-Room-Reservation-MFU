import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import { query, pool } from "../../../db";
import { verifyToken, verifyAdmin } from "../../middleware/auth";

const router = Router();

const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "room-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// GET /api/admin/rooms — all rooms with pricing
router.get("/", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const result = await query(`
      SELECT r.*,
             p.price_half_day_internal, p.price_full_day_internal,
             p.price_half_day_co_organizer, p.price_full_day_co_organizer,
             p.price_half_day_external, p.price_full_day_external
      FROM rooms r
      LEFT JOIN room_pricing p ON r.id = p.room_id AND p.is_active = TRUE
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("[admin/rooms] Error fetching rooms:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้อง" });
  }
});

// PUT /api/admin/rooms/:id/status — toggle room active status
router.put(
  "/:id/status",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
      await query("UPDATE rooms SET is_active = $1 WHERE id = $2", [isActive, id]);
      res.json({ message: "อัปเดตสถานะสำเร็จ" });
    } catch (err) {
      console.error("[admin/rooms] Error updating status:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  }
);

// PUT /api/admin/rooms/:id — update room details + pricing
router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  async (req: any, res: Response) => {
    const { id } = req.params;
    const { name, type, capacity, prices } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE rooms SET name = $1, type = $2, capacity = $3 WHERE id = $4",
        [name, type, capacity, id]
      );
      if (prices) {
        await client.query(
          "UPDATE room_pricing SET is_active = FALSE WHERE room_id = $1",
          [id]
        );
        await client.query(
          `INSERT INTO room_pricing (room_id, price_half_day_internal, price_full_day_internal,
            price_half_day_co_organizer, price_full_day_co_organizer,
            price_half_day_external, price_full_day_external, effective_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            id,
            prices.halfInternal || 0,
            prices.fullInternal || 0,
            prices.halfCoop || 0,
            prices.fullCoop || 0,
            prices.halfExternal || 0,
            prices.fullExternal || 0,
          ]
        );
      }
      await client.query("COMMIT");
      res.json({ message: "อัปเดตข้อมูลห้องสำเร็จ" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("[admin/rooms] Error updating room:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต" });
    } finally {
      client.release();
    }
  }
);

// POST /api/admin/rooms/upload-image — upload room image
router.post(
  "/upload-image",
  verifyToken,
  verifyAdmin,
  upload.single("roomImage"),
  async (req: any, res: Response) => {
    const { roomId } = req.body;
    if (!req.file) return res.status(400).json({ message: "กรุณาเลือกไฟล์" });
    const imageUrl = `/uploads/${req.file.filename}`;
    try {
      await query("UPDATE rooms SET image_url = $1, updated_at = NOW() WHERE id = $2", [
        imageUrl,
        roomId,
      ]);
      res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imageUrl });
    } catch (err) {
      console.error("[admin/rooms] Error uploading image:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  }
);

// POST /api/admin/import-rooms — import rooms from Excel
router.post(
  "/import",
  verifyToken,
  verifyAdmin,
  upload.single("file"),
  async (req: any, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์ Excel" });
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.readFile(req.file.path);
      const roomsToInsert: any[] = [];

      workbook.worksheets.forEach((worksheet) => {
        console.log(`📑 Processing sheet: ${worksheet.name}`);
        let currentCategory = "ทั่วไป";

        worksheet.eachRow((row: any, rowNumber: number) => {
          if (rowNumber <= 1) return;
          const values = (row.values as any[]).slice(1);

          // Category row detection
          if (values[0] && !values[1] && !values[2]) {
            const possibleCategory = values[0].toString().trim();
            if (["ประเภท", "ลำดับ", "ลำดับที่", "รายการ"].includes(possibleCategory)) return;
            if (isNaN(possibleCategory)) {
              currentCategory = possibleCategory;
              return;
            }
          }

          const roomNameInColB = values[1]?.toString().trim();
          const roomNameInColA = values[0]?.toString().trim();

          if (
            ["ประเภท", "รายการ", "ชื่อห้อง", "ความจุ"].includes(roomNameInColB) ||
            roomNameInColB === "ประเภท"
          )
            return;

          if (roomNameInColB || (roomNameInColA && values[3])) {
            let rawRoomName = roomNameInColB || roomNameInColA;
            if (roomNameInColA && !isNaN(roomNameInColA) && !roomNameInColB) return;

            const capacity = values[2] ? values[2].toString().trim() : "0";
            let names: string[] = rawRoomName
              .split(/[,]|และ/)
              .map((s: string) => s.trim())
              .filter((s: string) => s !== "");

            // Handle multi-room names
            if (names.length > 1) {
              const firstPart = names[0];
              const lastSpaceIndex = firstPart.lastIndexOf(" ");
              if (lastSpaceIndex !== -1) {
                const prefix = firstPart.substring(0, lastSpaceIndex).trim();
                for (let i = 1; i < names.length; i++) {
                  if (!names[i].includes(" ") && !names[i].includes(prefix.split(" ")[0])) {
                    names[i] = `${prefix} ${names[i]}`;
                  }
                }
              }
            }

            // Handle floor expansion
            let expandedNames: string[] = [];
            names.forEach((n: string) => {
              const floors = n.match(/ชั้น\s*(\d+)/g);
              if (floors && floors.length > 1) {
                const baseName = n
                  .replace(/ชั้น\s*(\d+)/g, "")
                  .replace(/\s+/g, " ")
                  .trim();
                floors.forEach((f: string) => {
                  expandedNames.push(`${baseName} ${f}`);
                });
              } else {
                expandedNames.push(n);
              }
            });
            names = expandedNames;

            // Price parsing (from same row + next row)
            const duration = values[3]?.toString().trim();
            const pricesOnThisRow = {
              internal: parseFloat(values[4]) || 0,
              coop: parseFloat(values[5]) || 0,
              external: parseFloat(values[6]) || 0,
            };

            const nextRow = worksheet.getRow(rowNumber + 1);
            const nextValues = (nextRow.values as any[]).slice(1);
            const nextDuration = nextValues[3]?.toString().trim();

            let fullDayPrices: typeof pricesOnThisRow | null = null;
            let halfDayPrices: typeof pricesOnThisRow | null = null;

            if (duration?.includes("เต็มวัน")) fullDayPrices = pricesOnThisRow;
            else if (duration?.includes("ครึ่งวัน")) halfDayPrices = pricesOnThisRow;

            if (nextDuration?.includes("เต็มวัน") && !fullDayPrices) {
              fullDayPrices = {
                internal: parseFloat(nextValues[4]) || 0,
                coop: parseFloat(nextValues[5]) || 0,
                external: parseFloat(nextValues[6]) || 0,
              };
            } else if (nextDuration?.includes("ครึ่งวัน") && !halfDayPrices) {
              halfDayPrices = {
                internal: parseFloat(nextValues[4]) || 0,
                coop: parseFloat(nextValues[5]) || 0,
                external: parseFloat(nextValues[6]) || 0,
              };
            }

            // Normalize room names
            names = names.map((name: string) => {
              let updatedName = name;
              if (currentCategory.includes("ศูนย์กีฬา") && !updatedName.startsWith("สนาม")) {
                updatedName = `สนาม${updatedName}`;
              } else if (
                currentCategory.includes("ห้องประชุม") ||
                currentCategory.includes("ห้องบรรยาย")
              ) {
                if (
                  !updatedName.startsWith("ห้องประชุม") &&
                  !updatedName.startsWith("ห้องบรรยาย")
                ) {
                  if (updatedName.startsWith("ห้อง")) {
                    updatedName = updatedName.replace("ห้อง", "ห้องประชุม");
                  } else {
                    updatedName = `ห้องประชุม${updatedName}`;
                  }
                }
              }
              return updatedName;
            });

            // Deduplicate names
            names.forEach((name: string) => {
              let finalName = name;
              let counter = 1;
              while (roomsToInsert.some((r: any) => r.name === finalName)) {
                finalName = `${name} (ชุดที่ ${counter++} - ${capacity} ที่นั่ง)`;
              }
              roomsToInsert.push({
                name: finalName,
                type: currentCategory,
                capacity,
                prices: { full: fullDayPrices, half: halfDayPrices },
              });
            });
          }
        });
      });

      // Batch insert
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const room of roomsToInsert) {
          const roomRes = await client.query(
            "SELECT id FROM rooms WHERE name = $1",
            [room.name]
          );
          let roomId: number;

          if (roomRes.rows.length > 0) {
            roomId = roomRes.rows[0].id;
            await client.query(
              "UPDATE rooms SET type = $1, capacity = $2 WHERE id = $3",
              [room.type, room.capacity, roomId]
            );
          } else {
            const newRoomRes = await client.query(
              "INSERT INTO rooms (name, type, capacity) VALUES ($1, $2, $3) RETURNING id",
              [room.name, room.type, room.capacity]
            );
            roomId = newRoomRes.rows[0].id;
          }

          await client.query(
            "UPDATE room_pricing SET is_active = FALSE WHERE room_id = $1",
            [roomId]
          );
          await client.query(
            `INSERT INTO room_pricing (
              room_id, price_half_day_internal, price_full_day_internal,
              price_half_day_co_organizer, price_full_day_co_organizer,
              price_half_day_external, price_full_day_external, effective_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
              roomId,
              room.prices.half?.internal || 0,
              room.prices.full?.internal || 0,
              room.prices.half?.coop || 0,
              room.prices.full?.coop || 0,
              room.prices.half?.external || 0,
              room.prices.full?.external || 0,
            ]
          );
        }
        await client.query("COMMIT");
        res.json({
          message: `นำเข้าข้อมูลสำเร็จทั้งหมด ${roomsToInsert.length} รายการ (จากทุก Sheet)`,
          count: roomsToInsert.length,
        });
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("[admin/rooms/import] Error:", err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการประมวลผลไฟล์" });
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

export default router;
