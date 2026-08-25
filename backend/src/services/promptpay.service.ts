// Helper function to calculate CRC16-CCITT (FFFF) checksum for EMVCo QR
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePromptPayPayload(
  target: string = "0994000165789", // MFU Tax / PromptPay ID
  amount?: number
): string {
  const sanitizeTarget = target.replace(/[^0-9]/g, "");
  let targetType = "02"; // 13-digit Tax ID / National ID
  let targetFormatted = sanitizeTarget;

  if (sanitizeTarget.length === 10 && sanitizeTarget.startsWith("0")) {
    targetType = "01"; // Mobile Number
    targetFormatted = "0066" + sanitizeTarget.substring(1);
  }

  const merchantAccountInfo =
    "0016A000000677010111" +
    targetType +
    targetFormatted.length.toString().padStart(2, "0") +
    targetFormatted;

  let payload =
    "000201" + // Payload Format Indicator
    "010212" + // Dynamic QR Code
    "29" +
    merchantAccountInfo.length.toString().padStart(2, "0") +
    merchantAccountInfo +
    "5303764" + // Currency Code THB (764)
    "5802TH"; // Country Code TH

  if (amount != null && amount > 0) {
    const amountStr = amount.toFixed(2);
    payload += "54" + amountStr.length.toString().padStart(2, "0") + amountStr;
  }

  payload += "6304";
  const checksum = crc16(payload);
  return payload + checksum;
}
