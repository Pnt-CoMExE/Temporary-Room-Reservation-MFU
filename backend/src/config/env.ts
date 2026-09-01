const isProduction = process.env.NODE_ENV === "production";
const isTest =
  process.env.NODE_ENV === "test" || process.env.VITEST === "true";

function resolveSecret(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value && isProduction && !isTest) {
    throw new Error(`${name} is required when NODE_ENV=production`);
  }
  return value || fallback;
}

export const env = {
  isProduction,
  isTest,
  jwtSecret: resolveSecret("JWT_SECRET", "my_super_secret_key"),
  sessionSecret: resolveSecret(
    "SESSION_SECRET",
    process.env.JWT_SECRET || "my_super_secret_key"
  ),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  frontendOrigins: (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "no-reply@mfu.ac.th",
  },
  smtpEnabled(): boolean {
    return Boolean(this.smtp.host && this.smtp.user && this.smtp.pass);
  },
};
