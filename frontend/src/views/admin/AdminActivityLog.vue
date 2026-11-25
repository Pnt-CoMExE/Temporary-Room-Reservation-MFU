<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";

interface LogItem {
  id: number;
  timestamp: string;
  adminName: string;
  action: string;
  details: string;
}

const logs = ref<LogItem[]>([]);
const searchQuery = ref("");
const page = ref(1);
const pageSize = 20;

onMounted(async () => {
  try {
    const res = await api.get("/api/admin/logs");
    logs.value = res.data.map((log: any) => ({
      id: log.id,
      timestamp: (() => {
        const d = new Date(log.created_at);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const time = d.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${dd}/${mm}/${yyyy} ${time}`;
      })(),
      adminName: log.admin_name,
      action: log.action,
      details: log.details,
    }));
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
});

const filteredLogs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return logs.value;
  return logs.value.filter(
    (log) =>
      log.action.toLowerCase().includes(q) ||
      String(log.details || "")
        .toLowerCase()
        .includes(q) ||
      String(log.adminName || "")
        .toLowerCase()
        .includes(q) ||
      log.timestamp.toLowerCase().includes(q)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredLogs.value.length / pageSize))
);

const pagedLogs = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredLogs.value.slice(start, start + pageSize);
});

const onSearch = () => {
  page.value = 1;
};

const goPage = (p: number) => {
  page.value = Math.min(totalPages.value, Math.max(1, p));
};

const getIcon = (action: string) => {
  if (action.includes("ยกเว้น") || action.includes("waive"))
    return { icon: ["fas", "gift"], color: "text-indigo-500", bg: "bg-indigo-50" };
  if (action.includes("อนุมัติ"))
    return { icon: ["fas", "check-circle"], color: "text-green-500", bg: "bg-green-50" };
  if (action.includes("ปฏิเสธ"))
    return { icon: ["fas", "times-circle"], color: "text-red-500", bg: "bg-red-50" };
  if (action.includes("ชำระเงิน"))
    return { icon: ["fas", "wallet"], color: "text-blue-500", bg: "bg-blue-50" };
  if (action.includes("Import") || action.includes("นำเข้า"))
    return { icon: ["fas", "file-import"], color: "text-purple-500", bg: "bg-purple-50" };
  if (
    action.includes("เอกสาร") ||
    action.includes("โหลด") ||
    action.includes("แนบ") ||
    action.includes("Export") ||
    action.includes("ส่งออก")
  )
    return { icon: ["fas", "file-download"], color: "text-purple-500", bg: "bg-purple-50" };
  if (action.includes("ห้อง") || action.includes("พื้นที่") || action.includes("บริการ"))
    return { icon: ["fas", "building"], color: "text-orange-500", bg: "bg-orange-50" };
  return { icon: ["fas", "info-circle"], color: "text-gray-500", bg: "bg-gray-50" };
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="ui-card ui-admin-header p-6">
      <div>
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <FontAwesomeIcon :icon="['fas', 'clipboard-check']" class="text-mfu-red" />
          {{ $t("admin.logs_title") }}
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          {{ $t("admin.logs_subtitle") }}
        </p>
      </div>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-card border border-gray-200">
      <div class="relative">
        <FontAwesomeIcon
          :icon="['fas', 'search']"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
        />
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="$t('admin.logs_search_placeholder')"
          class="ui-input pl-10"
          @input="onSearch"
        />
      </div>
      <p class="text-xs text-gray-400 font-medium mt-2">
        {{
          $t("admin.logs_result_count", {
            shown: pagedLogs.length,
            total: filteredLogs.length,
          })
        }}
      </p>
    </div>

    <div
      class="bg-white rounded-3xl shadow-card border border-gray-200 p-6 max-h-[65vh] overflow-y-auto custom-scrollbar"
    >
      <div
        v-if="filteredLogs.length === 0"
        class="text-center py-12 text-gray-400 font-bold"
      >
        <div
          class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          <FontAwesomeIcon :icon="['fas', 'history']" class="text-gray-300" />
        </div>
        <p>{{ $t("admin.empty_logs") }}</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="log in pagedLogs"
          :key="log.id"
          class="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors"
        >
          <div
            :class="[getIcon(log.action).bg, 'w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0']"
          >
            <FontAwesomeIcon :icon="getIcon(log.action).icon" :class="getIcon(log.action).color" />
          </div>

          <div class="flex-1 min-w-0">
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
            <p class="text-sm text-gray-600 font-medium break-words">{{ log.details }}</p>

            <p
              class="text-[11px] text-gray-500 font-bold mt-2 uppercase tracking-widest flex items-center gap-1.5"
            >
              <FontAwesomeIcon :icon="['fas', 'user-shield']" class="text-mfu-red mr-1" />
              {{ $t("admin.acted_by") }}
              <span class="text-gray-700">{{ log.adminName }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="filteredLogs.length > pageSize"
      class="flex items-center justify-center gap-2"
    >
      <button
        type="button"
        class="ui-chip ui-chip-idle cursor-pointer disabled:opacity-40"
        :disabled="page <= 1"
        @click="goPage(page - 1)"
      >
        {{ $t("admin.logs_prev") }}
      </button>
      <span class="text-sm font-bold text-gray-600 px-2">
        {{ $t("admin.logs_page", { page, total: totalPages }) }}
      </span>
      <button
        type="button"
        class="ui-chip ui-chip-idle cursor-pointer disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="goPage(page + 1)"
      >
        {{ $t("admin.logs_next") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
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
