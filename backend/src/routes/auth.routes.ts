import { Router, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const router = Router();

const JWT_SECRET = env.jwtSecret;
const FRONTEND_URL = env.frontendUrl;

// Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/` }),
  (req: any, res: Response) => {
    const user = req.user;
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.user_type,
        name: user.firstname,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("mfu_token", token, {
      maxAge: 8 * 60 * 60 * 1000,
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      path: "/",
    });

    res.redirect(
      `${FRONTEND_URL}/?loginSuccess=true&role=${user.user_type}&name=${encodeURIComponent(
        user.firstname
      )}&email=${encodeURIComponent(user.email)}`
    );
  }
);

export default router;
