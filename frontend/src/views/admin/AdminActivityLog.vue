<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";

interface LogItem {
  id: number;
  timestamp: string;
  adminName: string;
  action: string;
  details: string;
}

// ข้อมูล Log จาก Database
const logs = ref<LogItem[]>([]);

onMounted(async () => {
  try {
    const res = await api.get("/api/admin/logs");
    logs.value = res.data.map((log: any) => ({
      id: log.id,
      timestamp: new Date(log.created_at).toLocaleString("th-TH"),
      adminName: log.admin_name,
      action: log.action,
      details: log.details
    }));
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
});

const getIcon = (action: string) => {
  if (action.includes("อนุมัติ"))
    return { icon: ['fas', 'check-circle'], color: 'text-green-500', bg: 'bg-green-50' };
  if (action.includes("ปฏิเสธ"))
    return { icon: ['fas', 'times-circle'], color: 'text-red-500', bg: 'bg-red-50' };
  if (action.includes("ชำระเงิน")) return { icon: ['fas', 'coins'], color: 'text-blue-500', bg: 'bg-blue-50' };
  if (
    action.includes("เอกสาร") ||
    action.includes("โหลด") ||
    action.includes("แนบ") ||
    action.includes("Import") ||
    action.includes("Export") ||
    action.includes("ส่งออก")
  )
    return { icon: ['fas', 'file-alt'], color: 'text-purple-500', bg: 'bg-purple-50' };
  if (action.includes("ห้อง") || action.includes("พื้นที่") || action.includes("บริการ"))    return { icon: ['fas', 'building'], color: 'text-orange-500', bg: 'bg-orange-50' };
  return { icon: ['fas', 'info-circle'], color: 'text-gray-500', bg: 'bg-gray-50' };
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
          <FontAwesomeIcon :icon="['fas', 'clipboard-check']" class="text-[#ba0b2f]" />
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
          <FontAwesomeIcon :icon="['fas', 'history']" class="text-gray-300" />
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
            :class="[getIcon(log.action).bg, 'w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0']"
          >
            <FontAwesomeIcon :icon="getIcon(log.action).icon" :class="getIcon(log.action).color" />
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
                <FontAwesomeIcon :icon="['far', 'clock']" class="mr-1" /> {{ log.timestamp }}
              </span>
            </div>
            <p class="text-sm text-gray-600 font-medium">{{ log.details }}</p>

            <p
              class="text-[11px] text-gray-500 font-bold mt-2 uppercase tracking-widest flex items-center gap-1.5"
            >
              <FontAwesomeIcon :icon="['fas', 'user-shield']" class="text-[#ba0b2f] mr-1" />
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
