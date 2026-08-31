/**
 * Universal i18n Translator Helper for dynamic backend data
 */

const exactOverrides: Array<{ th: string; en: string }> = [
  { th: "ห้องประชุม C3-101 (Meeting Room C3-101)", en: "C3-101 Meeting Room" },
  { th: "ห้องประชุมใหญ่ C3-Auditorium (C3 Grand Hall)", en: "C3 Grand Hall" },
  { th: "ลานกิจกรรม M-Complex (M-Complex Multipurpose Plaza)", en: "M-Complex Multipurpose Plaza" },
  { th: "ห้องสัมมนา E3A-201 (E3A Seminar Room)", en: "E3A Seminar Room" },
  { th: "สนามลานสนามเปตอง ภายนอกอาคาร", en: "Outdoor Petanque Court" },
  { th: "สนามอัฒจันทร์สนามฟุตบอล (ผู้ใช้บริการน้อยกว่า 500คน)", en: "Football Stadium & Grandstand (Under 500 Capacity)" },
  { th: "สนามอัฒจันทร์สนามฟุตบอล (ผู้ใช้บริการมากกว่า 500คน)", en: "Football Stadium & Grandstand (Over 500 Capacity)" },
  { th: "สนามอาคารกีฬาเฉลิมพระเกียรติ 72 พรรษา", en: "72nd Anniversary Sports Center Field" },
  { th: "สนามอาคารกีฬาเอนกประสงค์", en: "Multipurpose Gymnasium Sports Field" },
];

const replacements: Array<{ th: RegExp; en: string }> = [
  { th: /หอประชุมสมเด็จย่า/g, en: "Somdet Ya Auditorium" },
  { th: /วันชัย ศิริชนะ/g, en: "Vanchai Sirichana" },
  { th: /คำมอกหลวง/g, en: "Khammok Luang" },
  { th: /พวงชมพู/g, en: "Puang Chomphu" },
  { th: /พู่ระหง/g, en: "Phu Rahong" },
  { th: /ชงโค/g, en: "Chongko" },
  { th: /ประดู่แดง/g, en: "Pradoo Daeng" },
  { th: /วนาสวรรค์/g, en: "Wanasawan" },
  { th: /วนาศรม/g, en: "Wanasrom" },
  { th: /วนาพร/g, en: "Wanaporn" },
  { th: /วนาพา/g, en: "Wanapha" },
  { th: /วนาวารี/g, en: "Wanawaree" },
  { th: /วนารมณ์/g, en: "Wanarom" },
  { th: /ศาลาวนาทัศน์/g, en: "Wanatath Pavilion" },
  { th: /พญาเม็งราย/g, en: "Phaya Mengrai" },
  { th: /นางแล/g, en: "Nang Lae" },
  { th: /แม่ข้าวต้ม/g, en: "Mae Khao Tom" },
  { th: /ริมกก/g, en: "Rimkok" },
  { th: /แม่สาย/g, en: "Mae Sai" },
  { th: /ดอยแง่ม/g, en: "Doi Ngaem" },
  { th: /ดอยตุง/g, en: "Doi Tung" },
  { th: /เชียงแสน/g, en: "Chiang Saen" },
  { th: /ท่าสุด/g, en: "Thasud" },
  { th: /เปตอง/g, en: "Petanque" },
  { th: /ปรีคลินิก/g, en: "Pre-clinic" },

  // Buildings & Faculties & Offices
  { th: /อาคารพลเอก สำเภา ชูศรี/g, en: "Gen. Samphao Chusri Bldg" },
  { th: /พลเอก สำเภา ชูศรี/g, en: "Gen. Samphao Chusri" },
  { th: /สำนักวิชาทันตแพทยศาสตร์/g, en: "School of Dentistry" },
  { th: /โรงพยาบาลมหาวิทยาลัยแม่ฟ้าหลวง/g, en: "MFU Hospital" },
  { th: /หน่วยประสานงาน กรุงเทพฯ/g, en: "Bangkok Coordination Office" },
  { th: /อาคารปัญจภูมิ 2/g, en: "Panjaphum Bldg 2" },
  { th: /ศูนย์จีนฯ/g, en: "Sirindhorn Chinese Center" },
  { th: /อาคาร E-Park/g, en: "E-Park Bldg" },
  { th: /อาคาร I-Park/g, en: "I-Park Bldg" },
  { th: /อาคาร E4/g, en: "E4 Bldg" },
  { th: /อาคาร AV/g, en: "AV Bldg" },
  { th: /อาคารสถานที่/g, en: "Buildings & Facilities" },
  { th: /อาคารกีฬาเอนกประสงค์/g, en: "Multipurpose Gymnasium" },
  { th: /อาคารกีฬาเฉลิมพระเกียรติ 72 พรรษา/g, en: "72nd Anniversary Sports Complex" },
  { th: /ศูนย์กีฬา/g, en: "Sports Center" },
  { th: /ภายนอกอาคาร/g, en: "Outdoor" },
  { th: /อาคาร/g, en: "Bldg. " },

  // Room type & facility descriptors
  { th: /ห้องประชุมปฏิบัติการงานครัว/g, en: "Kitchen Operations Lab Meeting Room " },
  { th: /ห้องประชุมฝึกปฏิบัติการทางการบิน/g, en: "Aviation Training Lab Meeting Room " },
  { th: /ห้องประชุมประชุุมทางไกล|ห้องประชุมประชุมทางไกล/g, en: "Teleconference Room " },
  { th: /ห้องปฏิบัติการคอมพิวเตอร์/g, en: "Computer Laboratory " },
  { th: /ห้องปฏิบัติการทางวิทยาศาสตร์/g, en: "Science Laboratory " },
  { th: /ห้องปฏิบัติการ/g, en: "Laboratory " },
  { th: /ห้องประชุมผู้บริหาร/g, en: "Executive Conference Room " },
  { th: /ห้องประชุมย่อย/g, en: "Small Meeting Room " },
  { th: /ห้องประชุมใหญ่/g, en: "Main Conference Room " },
  { th: /ห้องประชุมทั่วไป/g, en: "General Meeting Room " },
  { th: /ห้องประชุมอาหาร/g, en: "Dining Meeting Room " },
  { th: /ห้องประชุม/g, en: "Meeting Room " },
  { th: /ห้องบรรยาย/g, en: "Lecture Room " },
  { th: /ห้องสัมมนา/g, en: "Seminar Room " },
  { th: /หอประชุม/g, en: "Auditorium " },
  { th: /ลานกิจกรรม/g, en: "Activity Plaza " },
  { th: /โรงอาหาร/g, en: "Cafeteria" },
  { th: /ใต้ถุน/g, en: "Ground Floor Area " },
  { th: /โถงกลาง/g, en: "Main Hall" },
  { th: /ลาน/g, en: "Plaza " },

  // Sports Courts
  { th: /สนามลานสนามเปตอง/g, en: "Petanque Court" },
  { th: /สนามวอลเล่ย์บอล/g, en: "Volleyball Court" },
  { th: /สนามบาสเก็ตบอล/g, en: "Basketball Court" },
  { th: /สนามตระกร้อ/g, en: "Sepak Takraw Court" },
  { th: /สนามแบดมินตัน/g, en: "Badminton Court" },
  { th: /สนาม/g, en: "Court " },

  // Attributes
  { th: /ชุดที่/g, en: "Set " },
  { th: /ที่นั่ง/g, en: "Seats" },
  { th: /ผู้ใช้บริการน้อยกว่า/g, en: "Capacity < " },
  { th: /ผู้ใช้บริการมากกว่า/g, en: "Capacity > " },
  { th: /ชั้น (\d+)/g, en: "Fl. $1" },
  { th: /ชั้น/g, en: "Fl. " },
  { th: /ห้อง/g, en: "Room " },
  { th: /คน/g, en: "people" },
];

export function translateRoomName(name: string | undefined | null, locale: string): string {
  if (!name) return "";
  if (locale !== "en") return name;

  const override = exactOverrides.find((p) => p.th === name);
  if (override) return override.en;

  let s = name;
  for (const { th, en } of replacements) {
    s = s.replace(th, en);
  }

  // Smart regex for "Meeting Room <Name> (AD)" -> "<Name> Meeting Room (AD)"
  const meetingMatch = s.match(/^Meeting Room\s+(.*?)\s*(\(AD\))?$/i);
  if (
    meetingMatch &&
    meetingMatch[1] &&
    !meetingMatch[1].startsWith("Fl.") &&
    !meetingMatch[1].match(/^\d+/)
  ) {
    const placeName = meetingMatch[1].trim();
    const suffix = meetingMatch[2] ? ` ${meetingMatch[2]}` : "";
    return `${placeName} Meeting Room${suffix}`;
  }

  return s.replace(/\s+/g, " ").trim();
}

export function translateRoomType(type: string | undefined | null, locale: string): string {
  if (!type) return "Space";
  if (locale !== "en") return type;

  const types: Record<string, string> = {
    "ห้องประชุม": "Meeting Room",
    "ห้องบรรยาย": "Lecture Hall",
    "ห้องสัมมนา": "Seminar Room",
    "ลานกิจกรรม": "Outdoor Plaza",
    "ห้องปฏิบัติการ": "Laboratory",
    "หอประชุม": "Auditorium",
    "ศูนย์กีฬา": "Sports Center",
    "อาคารสถานที่": "Buildings & Facilities",
  };

  return types[type] || translateRoomName(type, locale);
}

export function translateLocation(location: string | undefined | null, locale: string): string {
  if (!location) return "Mae Fah Luang University";
  if (locale !== "en") return location;

  const locations: Record<string, string> = {
    "ห้องประชุม": "Meeting Room Area",
    "ห้องบรรยาย": "Lecture Hall Area",
    "ห้องสัมมนา": "Seminar Area",
    "ลานกิจกรรม": "Outdoor Plaza Area",
    "ห้องปฏิบัติการ": "Lab Building",
    "หอประชุม": "Auditorium Area",
    "ศูนย์กีฬา": "Sports Complex Area",
    "อาคารสถานที่": "Buildings & Facilities Area",
    "มหาวิทยาลัยแม่ฟ้าหลวง": "Mae Fah Luang University",
  };

  if (locations[location]) return locations[location];
  return translateRoomName(location, locale);
}

export function translateDuration(duration: string | undefined | null, locale: string): string {
  if (!duration) return "";
  if (locale !== "en") return duration;

  const durations: Record<string, string> = {
    "เต็มวัน": "Full Day",
    "ครึ่งวันเช้า": "Morning Half Day (08:00-12:00)",
    "ครึ่งวันบ่าย": "Afternoon Half Day (13:00-17:00)",
    "full": "Full Day",
    "half_morning": "Morning Half Day",
    "half_afternoon": "Afternoon Half Day",
  };

  return durations[duration] || duration;
}

export function translateStatus(status: string | undefined | null, locale: string): string {
  if (!status) return "";
  if (locale !== "en") return status;

  const statuses: Record<string, string> = {
    "รออนุมัติ": "Pending Approval",
    "รอชำระเงิน": "Awaiting Payment",
    "สำเร็จแล้ว": "Completed",
    "ไม่อนุมัติ": "Disapproved",
    "ยกเลิกแล้ว": "Cancelled",
    "pending": "Pending Approval",
    "approved_pending_payment": "Awaiting Payment",
    "approved_paid": "Completed",
    "disapproved": "Disapproved",
  };

  return statuses[status] || status;
}
