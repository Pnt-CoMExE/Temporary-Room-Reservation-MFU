<script setup>
import { ref } from "vue";

const stats = ref({
  pendingCount: 5,
  approvedToday: 12,
  currentMonthRevenue: 124500,
  lastMonthRevenue: 98000,
});

const popularRooms = ref([
  { name: "ห้องประชุมคำมอกหลวง", usage: 85, color: "bg-green-500" },
  { name: "ลานกิจกรรม ลานประดู่แดง", usage: 60, color: "bg-blue-500" },
  { name: "ห้องประชุม ท่าสุด", usage: 35, color: "bg-yellow-500" },
]);

const recentActivities = ref([
  {
    id: 1,
    text: "ได้รับคำขอจองใหม่ (BK-202603017)",
    time: "10 นาทีที่แล้ว",
    icon: "fas fa-envelope-open-text",
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: 2,
    text: "คุณสมหญิง แจ้งชำระเงิน (BK-202603012)",
    time: "1 ชั่วโมงที่แล้ว",
    icon: "fas fa-file-invoice-dollar",
    color: "text-green-500 bg-green-50",
  },
  {
    id: 3,
    text: "คุณอนุมัติคำขอ (BK-202603014)",
    time: "2 ชั่วโมงที่แล้ว",
    icon: "fas fa-check",
    color: "text-[#ba0b2f] bg-red-50",
  },
  {
    id: 4,
    text: "เพิ่มห้อง 'ห้องบรรยาย C1' เข้าระบบ",
    time: "เมื่อวานนี้",
    icon: "fas fa-plus",
    color: "text-gray-500 bg-gray-100",
  },
]);
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative"
      >
        <div class="flex items-center gap-5">
          <div
            class="w-16 h-16 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center text-2xl shrink-0"
          >
            <i class="fas fa-clock"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-500 mb-1">คำขอรออนุมัติ</p>
            <p class="text-3xl font-black text-gray-900">
              {{ stats.pendingCount }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative"
      >
        <div class="flex items-center gap-5">
          <div
            class="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-2xl shrink-0"
          >
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-500 mb-1">
              อนุมัติแล้ววันนี้
            </p>
            <p class="text-3xl font-black text-gray-900">
              {{ stats.approvedToday }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center"
      >
        <div
          class="absolute right-0 top-0 w-2 h-full bg-linear-to-b from-[#d4af37] to-yellow-500"
        ></div>
        <div class="flex items-center gap-5 mb-4">
          <div
            class="w-16 h-16 rounded-full bg-red-50 text-[#ba0b2f] flex items-center justify-center text-2xl shrink-0"
          >
            <i class="fas fa-wallet"></i>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-500 mb-1">
              รายได้รวมเดือนนี้
            </p>
            <p class="text-3xl font-black text-[#ba0b2f]">
              ฿{{ stats.currentMonthRevenue.toLocaleString() }}
            </p>
          </div>
        </div>
        <div
          class="pt-3 border-t border-gray-100 flex justify-between items-center"
        >
          <span class="text-sm text-gray-500 font-bold"
            >รายได้เดือนที่ผ่านมา</span
          >
          <span class="text-sm font-black text-gray-700"
            >฿{{ stats.lastMonthRevenue.toLocaleString() }}</span
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3
          class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"
        >
          <i class="fas fa-chart-bar text-[#ba0b2f]"></i> อัตราการใช้งานห้องพัก
          (เดือนนี้)
        </h3>
        <div class="space-y-5">
          <div v-for="(room, index) in popularRooms" :key="index">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-gray-700">{{
                room.name
              }}</span>
              <span class="text-sm font-bold text-gray-900"
                >{{ room.usage }}%</span
              >
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                :class="room.color"
                class="h-2.5 rounded-full transition-all duration-1000"
                :style="`width: ${room.usage}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3
          class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"
        >
          <i class="fas fa-history text-[#ba0b2f]"></i> ความเคลื่อนไหวล่าสุด
        </h3>
        <div class="space-y-6">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex gap-4 items-start"
          >
            <div
              :class="activity.color"
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            >
              <i :class="activity.icon"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-800">{{ activity.text }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
