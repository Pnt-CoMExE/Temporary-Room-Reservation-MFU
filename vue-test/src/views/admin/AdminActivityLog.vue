<script setup>
import { ref } from "vue";

// ✨ จำลองข้อมูล Log (เพิ่มข้อมูลให้เยอะขึ้นเพื่อเทสการเลื่อน)
const logs = ref([
  {
    id: 1,
    timestamp: "30 เมษายน 2569, 15:20:05",
    adminName: "เจ้าหน้าที่ จัดการทรัพย์สิน",
    action: "อนุมัติคำขอจอง",
    details: "อนุมัติรายการจอง: BK-202603015 ของ บจก. เอสซีจี (ร่วม มฟล.) แล้ว",
  },
  {
    id: 2,
    timestamp: "30 เมษายน 2569, 14:45:12",
    adminName: "แอดมิน สมปอง (Admin Support)",
    action: "แนบใบอนุมัติ",
    details: "อัปโหลดเอกสารอนุมัติสำหรับรายการ: BK-202603015",
  },
  {
    id: 3,
    timestamp: "29 เมษายน 2569, 10:30:00",
    adminName: "หัวหน้าแอดมิน สมศรี (Super Admin)",
    action: "เพิ่มข้อมูลห้องพัก (Import)",
    details: "นำเข้าข้อมูลห้องพักใหม่ผ่านไฟล์ Excel/CSV",
  },
  {
    id: 4,
    timestamp: "28 เมษายน 2569, 16:15:22",
    adminName: "เจ้าหน้าที่ จัดการทรัพย์สิน",
    action: "ปฏิเสธคำขอจอง",
    details: "ปฏิเสธรายการจอง: BK-202603017 ของ บริษัท ภายนอก จำกัด",
  },
  {
    id: 5,
    timestamp: "28 เมษายน 2569, 09:05:11",
    adminName: "แอดมิน สมปอง (Admin Support)",
    action: "ยืนยันการชำระเงิน",
    details: "ยืนยันรับชำระเงินของรายการ: BK-202603018",
  },
  {
    id: 6,
    timestamp: "27 เมษายน 2569, 14:20:00",
    adminName: "เจ้าหน้าที่ จัดการทรัพย์สิน",
    action: "โหลดใบขออนุญาต",
    details: "ดาวน์โหลดเอกสารของรายการ: BK-202603018",
  },
  {
    id: 7,
    timestamp: "27 เมษายน 2569, 11:15:42",
    adminName: "หัวหน้าแอดมิน สมศรี (Super Admin)",
    action: "เปิดการให้บริการ",
    details:
      'เปลี่ยนสถานะห้อง "ห้องปฏิบัติการคอมพิวเตอร์ S1" เป็น เปิดการให้บริการ',
  },
  {
    id: 8,
    timestamp: "26 เมษายน 2569, 15:30:00",
    adminName: "เจ้าหน้าที่ จัดการทรัพย์สิน",
    action: "อัปเดตข้อมูลห้องพัก",
    details:
      "แก้ไขข้อมูลห้อง: ลานกิจกรรม ลานประดู่แดง (ความจุ 100 ท่าน, ราคา ฿3000)",
  },
  {
    id: 9,
    timestamp: "25 เมษายน 2569, 09:10:05",
    adminName: "แอดมิน สมปอง (Admin Support)",
    action: "อนุมัติคำขอจอง",
    details: "อนุมัติรายการจอง: BK-202602089 ของ นายสมชาย ใจดี แล้ว",
  },
  {
    id: 10,
    timestamp: "24 เมษายน 2569, 16:45:00",
    adminName: "หัวหน้าแอดมิน สมศรี (Super Admin)",
    action: "ส่งออกข้อมูล (Export)",
    details: "ส่งออกข้อมูลคำขอจองพื้นที่ทั้งหมดเป็นไฟล์ CSV",
  },
]);

const getIcon = (action) => {
  if (action.includes("อนุมัติ"))
    return "fa-check-circle text-green-500 bg-green-50";
  if (action.includes("ปฏิเสธ"))
    return "fa-times-circle text-red-500 bg-red-50";
  if (action.includes("ชำระเงิน")) return "fa-coins text-blue-500 bg-blue-50";
  if (
    action.includes("เอกสาร") ||
    action.includes("โหลด") ||
    action.includes("แนบ") ||
    action.includes("Import") ||
    action.includes("Export") ||
    action.includes("ส่งออก")
  )
    return "fa-file-alt text-purple-500 bg-purple-50";
  if (action.includes("ห้องพัก") || action.includes("บริการ"))
    return "fa-building text-orange-500 bg-orange-50";
  return "fa-info-circle text-gray-500 bg-gray-50";
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header -->
    <div
      class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <i class="fas fa-clipboard-check text-[#ba0b2f]"></i>
          ประวัติการทำงานระบบ
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          บันทึกกิจกรรมทั้งหมดที่เกิดขึ้นโดยผู้ดูแลระบบ (ดึงข้อมูลจาก Database)
        </p>
      </div>
    </div>

    <!-- รายการ Activity Log -->
    <!-- ✨ เพิ่ม max-h-[65vh] และ overflow-y-auto พร้อม custom-scrollbar เพื่อให้เลื่อนได้ -->
    <div
      class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 max-h-[65vh] overflow-y-auto custom-scrollbar"
    >
      <div
        v-if="logs.length === 0"
        class="text-center py-12 text-gray-400 font-bold"
      >
        <div
          class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          <i class="fas fa-history text-gray-300"></i>
        </div>
        <p>ยังไม่มีประวัติการทำงานในระบบ</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="log in logs"
          :key="log.id"
          class="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
        >
          <div
            :class="getIcon(log.action)"
            class="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
          >
            <i class="fas" :class="getIcon(log.action).split(' ')[0]"></i>
          </div>

          <div class="flex-1">
            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1"
            >
              <h4 class="font-black text-gray-900 text-base">
                {{ log.action }}
              </h4>
              <span
                class="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md inline-block w-fit"
              >
                <i class="far fa-clock"></i> {{ log.timestamp }}
              </span>
            </div>
            <p class="text-sm text-gray-600 font-medium">{{ log.details }}</p>

            <p
              class="text-[11px] text-gray-500 font-bold mt-2 uppercase tracking-widest flex items-center gap-1.5"
            >
              <i class="fas fa-user-shield text-[#ba0b2f]"></i>
              ดำเนินการโดย:
              <span class="text-gray-700">{{ log.adminName }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✨ ตกแต่ง Scrollbar ให้ดูเล็กและสวยงามเข้ากับ UI */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
