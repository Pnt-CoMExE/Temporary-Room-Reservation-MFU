import { translateRoomName, translateStatus } from "@/utils/translator";

type Translate = (key: string, values?: Record<string, string | number>) => string;

const TITLE_KEYS: Record<string, string> = {
  ส่งคำขอจองสำเร็จ: "notif.submitted_title",
  ยกเลิกการจองแล้ว: "notif.cancelled_title",
  อัปเดตสถานะการจอง: "notif.status_title",
  ยืนยันการชำระเงินแล้ว: "notif.payment_ok_title",
  ปฏิเสธการชำระเงิน: "notif.payment_rejected_title",
};

export function notificationTitle(title: string, t: Translate): string {
  const key = TITLE_KEYS[title];
  return key ? t(key) : title;
}

export function notificationBody(body: string, locale: string, t: Translate): string {
  const submitted = body.match(/^(.+?) · (.+) รอเจ้าหน้าที่ตรวจสอบ$/);
  if (submitted) {
    return t("notif.submitted_body", {
      no: submitted[1],
      room: translateRoomName(submitted[2], locale),
    });
  }

  const cancelled = body.match(/^คำขอ (.+) ถูกยกเลิกเรียบร้อย$/);
  if (cancelled) {
    return t("notif.cancelled_body", { no: cancelled[1] });
  }

  const paid = body.match(/^รายการ (.+) ชำระเงินสำเร็จ — ตรวจสอบใบอนุญาตในอีเมล$/);
  if (paid) {
    return t("notif.payment_ok_body", { no: paid[1] });
  }

  const rejected = body.match(/^รายการ (.+) การชำระเงินไม่ผ่าน(?:: (.+))?$/);
  if (rejected) {
    return rejected[2]
      ? t("notif.payment_rejected_body_remark", { no: rejected[1], remark: rejected[2] })
      : t("notif.payment_rejected_body", { no: rejected[1] });
  }

  const status = body.match(/^(.+?) · (.+?) → (.+?)(?: \((.+)\))?$/);
  if (status) {
    const values = {
      no: status[1],
      room: translateRoomName(status[2], locale),
      status: translateStatus(status[3].trim(), locale),
    };
    return status[4]
      ? t("notif.status_body_remark", { ...values, remark: status[4] })
      : t("notif.status_body", values);
  }

  return body;
}

export function notificationTime(
  createdAt: string | undefined,
  locale: string,
  fallback: string,
  t: Translate
): string {
  if (!createdAt) return fallback;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return fallback;

  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return t("notif.just_now");
  if (mins < 60) return t("notif.minutes_ago", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("notif.hours_ago", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t("notif.days_ago", { n: days });

  return date.toLocaleDateString(locale === "en" ? "en-US" : "th-TH", {
    day: "numeric",
    month: "short",
  });
}
