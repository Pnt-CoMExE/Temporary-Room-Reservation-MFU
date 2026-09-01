import ExcelJS from "exceljs";
import { pool } from "../../db";

export interface RoomPriceTier {
  internal: number;
  coop: number;
  external: number;
}

export interface ParsedRoomImport {
  name: string;
  type: string;
  capacity: number;
  prices: {
    full: RoomPriceTier | null;
    half: RoomPriceTier | null;
  };
}

function parseCapacity(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;

  const rangeMatch = trimmed.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return Math.max(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10));
  }

  const numMatch = trimmed.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 0;
}

function parsePriceRow(values: ExcelJS.CellValue[]) {
  return {
    internal: parseFloat(String(values[4] ?? 0)) || 0,
    coop: parseFloat(String(values[5] ?? 0)) || 0,
    external: parseFloat(String(values[6] ?? 0)) || 0,
  };
}

export function parseRoomsFromWorkbook(workbook: ExcelJS.Workbook): ParsedRoomImport[] {
  const roomsToInsert: ParsedRoomImport[] = [];

  workbook.worksheets.forEach((worksheet) => {
    let currentCategory = "ทั่วไป";

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return;
      const values = (row.values as ExcelJS.CellValue[]).slice(1);

      if (values[0] && !values[1] && !values[2]) {
        const possibleCategory = values[0].toString().trim();
        if (["ประเภท", "ลำดับ", "ลำดับที่", "รายการ"].includes(possibleCategory)) return;
        if (isNaN(Number(possibleCategory))) {
          currentCategory = possibleCategory;
          return;
        }
      }

      const roomNameInColB = values[1]?.toString().trim();
      const roomNameInColA = values[0]?.toString().trim();

      if (
        ["ประเภท", "รายการ", "ชื่อห้อง", "ความจุ"].includes(roomNameInColB || "") ||
        roomNameInColB === "ประเภท"
      ) {
        return;
      }

      if (roomNameInColB || (roomNameInColA && values[3])) {
        const rawRoomName = roomNameInColB || roomNameInColA;
        if (roomNameInColA && !isNaN(Number(roomNameInColA)) && !roomNameInColB) return;

        const capacity = parseCapacity(values[2] ? values[2].toString().trim() : "0");
        let names = rawRoomName!
          .split(/[,]|และ/)
          .map((s) => s.trim())
          .filter((s) => s !== "");

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

        const expandedNames: string[] = [];
        names.forEach((n) => {
          const floors = n.match(/ชั้น\s*(\d+)/g);
          if (floors && floors.length > 1) {
            const baseName = n
              .replace(/ชั้น\s*(\d+)/g, "")
              .replace(/\s+/g, " ")
              .trim();
            floors.forEach((f) => {
              expandedNames.push(`${baseName} ${f}`);
            });
          } else {
            expandedNames.push(n);
          }
        });
        names = expandedNames;

        const duration = values[3]?.toString().trim();
        const pricesOnThisRow = parsePriceRow(values);

        const nextRow = worksheet.getRow(rowNumber + 1);
        const nextValues = (nextRow.values as ExcelJS.CellValue[]).slice(1);
        const nextDuration = nextValues[3]?.toString().trim();

        let fullDayPrices: RoomPriceTier | null = null;
        let halfDayPrices: RoomPriceTier | null = null;

        if (duration?.includes("เต็มวัน")) fullDayPrices = pricesOnThisRow;
        else if (duration?.includes("ครึ่งวัน")) halfDayPrices = pricesOnThisRow;

        if (nextDuration?.includes("เต็มวัน") && !fullDayPrices) {
          fullDayPrices = parsePriceRow(nextValues);
        } else if (nextDuration?.includes("ครึ่งวัน") && !halfDayPrices) {
          halfDayPrices = parsePriceRow(nextValues);
        }

        names = names.map((name) => {
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

        names.forEach((name) => {
          let finalName = name;
          let counter = 1;
          while (roomsToInsert.some((r) => r.name === finalName)) {
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

  return roomsToInsert;
}

export async function importRoomsToDatabase(rooms: ParsedRoomImport[]): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const room of rooms) {
      const roomRes = await client.query("SELECT id FROM rooms WHERE name = $1", [room.name]);
      let roomId: number;

      if (roomRes.rows.length > 0) {
        roomId = roomRes.rows[0].id;
        await client.query("UPDATE rooms SET type = $1, capacity = $2 WHERE id = $3", [
          room.type,
          room.capacity,
          roomId,
        ]);
      } else {
        const newRoomRes = await client.query(
          "INSERT INTO rooms (name, type, capacity) VALUES ($1, $2, $3) RETURNING id",
          [room.name, room.type, room.capacity]
        );
        roomId = newRoomRes.rows[0].id;
      }

      await client.query("UPDATE room_pricing SET is_active = FALSE WHERE room_id = $1", [roomId]);
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
    return rooms.length;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function importRoomsFromExcelFile(filePath: string): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  for (const worksheet of workbook.worksheets) {
    console.log(`📑 Processing sheet: ${worksheet.name}`);
  }

  const rooms = parseRoomsFromWorkbook(workbook);
  if (rooms.length === 0) {
    throw new Error("ไม่พบข้อมูลห้องในไฟล์ Excel");
  }

  const count = await importRoomsToDatabase(rooms);
  return count;
}
