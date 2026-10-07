import crypto from "crypto";

/**
 * Verify Stripe-Signature header (HMAC SHA256).
 * Requires the raw request body bytes — see app.ts webhook middleware.
 */
export function verifyStripeWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  webhookSecret: string,
  toleranceSec = 300
): { ok: true } | { ok: false; reason: string } {
  if (!webhookSecret) {
    return { ok: false, reason: "STRIPE_WEBHOOK_SECRET missing" };
  }
  if (!signatureHeader) {
    return { ok: false, reason: "Missing Stripe-Signature header" };
  }

  const parts = signatureHeader.split(",").map((p) => p.trim());
  let timestamp = "";
  const v1Sigs: string[] = [];
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "t") timestamp = v || "";
    if (k === "v1" && v) v1Sigs.push(v);
  }
  if (!timestamp || v1Sigs.length === 0) {
    return { ok: false, reason: "Malformed Stripe-Signature" };
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) {
    return { ok: false, reason: "Invalid signature timestamp" };
  }
  const age = Math.abs(Math.floor(Date.now() / 1000) - tsNum);
  if (age > toleranceSec) {
    return { ok: false, reason: "Signature timestamp outside tolerance" };
  }

  const payload =
    typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  const signed = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(signed, "utf8")
    .digest("hex");

  const match = v1Sigs.some((sig) => {
    try {
      const a = Buffer.from(expected, "utf8");
      const b = Buffer.from(sig, "utf8");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });

  if (!match) {
    return { ok: false, reason: "Signature mismatch" };
  }
  return { ok: true };
}

export function isStripeLiveKey(secret: string): boolean {
  return secret.startsWith("sk_live_");
}

export function isStripeSecretKey(secret: string): boolean {
  return secret.startsWith("sk_test_") || secret.startsWith("sk_live_");
}
