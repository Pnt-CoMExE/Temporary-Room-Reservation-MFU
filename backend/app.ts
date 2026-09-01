import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { query } from "./db";
import { errorHandler } from "./src/middleware/errorHandler";
import { verifyToken, verifyAdmin } from "./src/middleware/auth";
import { getRevenueByMonth } from "./src/services/revenue.service";
import { JwtPayload } from "./src/types";
import { generalLimiter, authLimiter, bookingLimiter } from "./src/middleware/rateLimiter";
import { resolveUserType } from "./src/utils/resolveUserType";
import { env } from "./src/config/env";

// ---- Environment ----
dotenv.config();

const FRONTEND_URL = env.frontendUrl;

// ---- Express app ----
const app = express();

// ---- Security & parsing middleware ----
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: env.frontendOrigins.length === 1 ? env.frontendOrigins[0] : env.frontendOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api", generalLimiter);

// ---- Session + Passport ----
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ---- Static files ----
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Passport Google Strategy ----
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile: any, done) => {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePicture = profile.photos[0].value;

      try {
        let res = await query("SELECT * FROM users WHERE email = $1", [email]);
        let user: any;

        if (res.rows.length > 0) {
          user = res.rows[0];
          const userType = resolveUserType(email, user.user_type);
          await query(
            "UPDATE users SET google_id = $1, profile_picture = $2, user_type = $3 WHERE email = $4",
            [googleId, profilePicture, userType, email]
          );
          user.user_type = userType;
        } else {
          const userType = resolveUserType(email);
          const newUser = await query(
            "INSERT INTO users (google_id, firstname, lastname, email, profile_picture, user_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [googleId, firstName, lastName, email, profilePicture, userType]
          );
          user = newUser.rows[0];
        }
        return done(null, user);
      } catch (err) {
        return done(err, null as any);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const res = await query(
      "SELECT id, email, firstname, lastname, user_type, profile_picture FROM users WHERE id = $1",
      [id]
    );
    done(null, res.rows.length > 0 ? res.rows[0] : null);
  } catch (err) {
    done(err, null);
  }
});

// ---- Database migration & Indexing check ----
query(
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bookings' AND column_name = 'memo_document_url'
    ) THEN
      ALTER TABLE bookings ADD COLUMN memo_document_url TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bookings' AND column_name = 'promo_code'
    ) THEN
      ALTER TABLE bookings ADD COLUMN promo_code VARCHAR(50);
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bookings' AND column_name = 'payment_slip_url'
    ) THEN
      ALTER TABLE bookings ADD COLUMN payment_slip_url TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bookings' AND column_name = 'payment_status'
    ) THEN
      ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid';
    END IF;

    -- Database Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(booking_date, time_slot);
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_room_pricing_room_id ON room_pricing(room_id);
  END $$;`
)
  .then(() => console.log("✅ ตรวจสอบ/เพิ่มคอลัมน์ระบบ และสร้าง Database Indexes เรียบร้อยแล้ว"))
  .catch((err: any) =>
    console.error("⚠️ ไม่สามารถปรับปรุงตาราง/ดัชนีระบบ:", err.message)
  );

// ---- Modular Routes ----
import authRoutes from "./src/routes/auth.routes";
import roomRoutes from "./src/routes/room.routes";
import featuredRoomRoutes from "./src/routes/featured-room.routes";
import bookingRoutes from "./src/routes/booking.routes";
import promoRoutes from "./src/routes/promo.routes";
import addonRoutes from "./src/routes/addon.routes";
import userRoutes from "./src/routes/user.routes";
import bannerRoutes from "./src/routes/banner.routes";
import paymentRoutes from "./src/routes/payment.routes";
import adminStatsRoutes from "./src/routes/admin/stats.routes";
import adminBookingRoutes from "./src/routes/admin/booking.routes";
import adminRoomRoutes from "./src/routes/admin/room.routes";
import adminPromoRoutes from "./src/routes/admin/promo.routes";
import adminLogRoutes from "./src/routes/admin/log.routes";
import adminUserRoutes from "./src/routes/admin/user.routes";

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/featured-rooms", featuredRoomRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/promo-codes", promoRoutes);
app.use("/api/addons", addonRoutes);
app.use("/api/user", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
// Standalone revenue endpoint for frontend compatibility (frontend calls /api/admin/revenue-by-month)
app.get("/api/admin/revenue-by-month", verifyToken, verifyAdmin, async (_req: any, res: Response) => {
  try {
    const data = await getRevenueByMonth();
    res.json(data);
  } catch (err) {
    console.error("[revenue-by-month] Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายได้" });
  }
});
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/rooms", adminRoomRoutes);
app.use("/api/admin/promocodes", adminPromoRoutes);
app.use("/api/admin/logs", adminLogRoutes);
app.use("/api/admin/users", adminUserRoutes);

// ---- Centralized error handler ----
app.use(errorHandler);

export default app;
