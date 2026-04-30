<script setup>
import { ref } from "vue";

const stats = ref({
  pendingCount: 1,
  approvedToday: 12,
  currentMonthRevenue: 124500,
  lastMonthRevenue: 98000,
});

const popularRooms = ref([
  { name: "ห้องประชุมคำมอกหลวง", usage: 85, color: "bg-green-500" },
  { name: "ลานกิจกรรม ลานประดู่แดง", usage: 60, color: "bg-blue-500" },
  { name: "ห้องประชุม ท่าสุด", usage: 35, color: "bg-yellow-500" },
]);

// ✨ เพิ่มตัวแปรสำหรับเปิด/ปิด การแสดงรายได้ย้อนหลัง
const isRevenueExpanded = ref(false);
</script>

<template>
  <div class="space-y-8 animate-fade-up">
    <!-- ส่วนแสดงสถิติ (Stats) -->
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

      <!-- ✨ กล่องรายได้ (เพิ่มลูกเล่นกดขยายดูย้อนหลัง) -->
      <div
        class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center transition-all duration-300"
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

        <!-- ส่วนที่กดคลิกได้ -->
        <div
          @click="isRevenueExpanded = !isRevenueExpanded"
          class="pt-3 border-t border-gray-100 cursor-pointer group select-none"
        >
          <div class="flex justify-between items-center">
            <span
              class="text-sm text-gray-500 font-bold group-hover:text-[#ba0b2f] transition-colors flex items-center gap-1.5"
            >
              รายได้เดือนที่ผ่านมา
              <i
                class="fas text-[10px] transition-transform duration-300"
                :class="
                  isRevenueExpanded
                    ? 'fa-chevron-up text-[#ba0b2f]'
                    : 'fa-chevron-down opacity-50'
                "
              ></i>
            </span>
            <span
              class="text-sm font-black text-gray-700 group-hover:text-[#ba0b2f] transition-colors"
              >฿{{ stats.lastMonthRevenue.toLocaleString() }}</span
            >
          </div>

          <!-- ข้อมูลจำลองย้อนหลัง 2 เดือน (รวมเดือนที่ผ่านมาเป็น 3 เดือน) -->
          <div
            v-show="isRevenueExpanded"
            class="mt-3 flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100"
          >
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400 font-bold"
                ><i class="far fa-calendar-alt mr-1"></i> กุมภาพันธ์ 2569</span
              >
              <span class="text-xs font-black text-gray-500">฿85,000</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400 font-bold"
                ><i class="far fa-calendar-alt mr-1"></i> มกราคม 2569</span
              >
              <span class="text-xs font-black text-gray-500">฿110,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- อัตราการใช้งานห้องพัก -->
    <div class="grid grid-cols-1 gap-6">
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
    </div>
  </div>
</template>
