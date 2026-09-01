#!/usr/bin/env node
/**
 * ตรวจสอบความพร้อมก่อน deploy (localhost / Docker)
 * รัน: node backend/scripts/pre-deploy-check.js
 */
const required = ["JWT_SECRET", "DB_PASSWORD"];
const recommended = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "FRONTEND_URL",
  "PAYMENT_PROVIDER",
];

let failed = false;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env: ${key}`);
    failed = true;
  }
}

for (const key of recommended) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing recommended env: ${key}`);
  }
}

if (process.env.SMTP_HOST) {
  console.log("✅ SMTP configured — emails will send via mail server");
} else {
  console.warn("⚠️  SMTP not configured — emails log to console only");
}

if (process.env.PAYMENT_PROVIDER === "mock_sandbox") {
  console.warn("⚠️  PAYMENT_PROVIDER=mock_sandbox — UAT mode, no real payments");
}

if (failed) {
  process.exit(1);
}

console.log("✅ Pre-deploy check passed");
process.exit(0);
