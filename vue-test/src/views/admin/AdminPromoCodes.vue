<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import api from "@/services/api";

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  limit_count: number;
  used_count: number;
  is_active: boolean;
}

const promoCodes = ref<PromoCode[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const filterStatus = ref<"all" | "active" | "inactive">("all");

const saveLog = async (action: string, details: string) => {
  try {
    await api.post("/api/admin/logs", {
      adminName: localStorage.getItem("userName") || "เจ้าหน้าที่ จัดการทรัพย์สิน",
      action,
      details,
    });
  } catch (err) {
    console.error("Failed to save log", err);
  }
};

const fetchPromoCodes = async () => {
  loading.value = true;
  try {
    const res = await api.get("/api/admin/promocodes");
    promoCodes.value = res.data;
  } catch (err) {
    console.error("Error fetching promo codes:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchPromoCodes());

// ─── Computed ────────────────────────────────────────────────
const filteredCodes = computed(() => {
  let list = promoCodes.value;
  if (filterStatus.value === "active") list = list.filter((p) => p.is_active);
  if (filterStatus.value === "inactive") list = list.filter((p) => !p.is_active);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((p) => p.code.toLowerCase().includes(q));
  }
  return list;
});

const activeCount = computed(() => promoCodes.value.filter((p) => p.is_active).length);
const inactiveCount = computed(() => promoCodes.value.filter((p) => !p.is_active).length);
const totalUsed = computed(() => promoCodes.value.reduce((sum, p) => sum + Number(p.used_count), 0));

// ─── Create Promo Code ────────────────────────────────────────
const handleAddPromoCode = () => {
  Swal.fire({
    title: '<h3 class="text-xl font-black text-gray-900">สร้างรหัสส่วนลดใหม่</h3>',
    html: `
      <div class="text-left mt-4 space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">รหัสโปรโมชั่น (Code)</label>
          <input id="swal-code" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none font-black tracking-widest uppercase text-lg" placeholder="เช่น SAVE50">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">มูลค่าส่วนลด (เช่น 20% หรือ 500)</label>
          <input id="swal-discount" type="number" min="1" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-[#ba0b2f] rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold" placeholder="เช่น 20">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">จำนวนสิทธิ์สูงสุด</label>
          <input id="swal-limit" type="number" min="1" value="100" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none font-bold">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "สร้างรหัส",
    cancelButtonText: "ยกเลิก",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-sm",
      confirmButton: "bg-[#d4af37] text-white rounded-xl px-5 py-3 font-bold shadow cursor-pointer",
      cancelButton: "bg-gray-100 text-gray-700 rounded-xl px-5 py-3 font-bold ml-3 cursor-pointer",
    },
    preConfirm: () => {
      const code = (document.getElementById("swal-code") as HTMLInputElement)?.value.toUpperCase().trim();
      const discount = (document.getElementById("swal-discount") as HTMLInputElement)?.value;
      const limit = (document.getElementById("swal-limit") as HTMLInputElement)?.value;
      if (!code || !discount) {
        Swal.showValidationMessage("กรุณากรอกรหัสและมูลค่าส่วนลด");
        return false;
      }
      return { code, discount: parseFloat(discount), limit_count: parseInt(limit) || 100 };
    },
  }).then(async (result) => {
    if (!result.isConfirmed || !result.value) return;
    try {
      const res = await api.post("/api/admin/promocodes", result.value);
      promoCodes.value.unshift(res.data);
      saveLog("สร้างรหัสส่วนลด", `สร้างโค้ด: ${result.value.code}`);
      Swal.fire({ icon: "success", title: "สร้างสำเร็จ!", showConfirmButton: false, timer: 1300 });
    } catch {
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถสร้างรหัสได้ (รหัสอาจซ้ำ)", "error");
    }
  });
};

// ─── Toggle Status ────────────────────────────────────────────
const togglePromoStatus = async (promo: PromoCode) => {
  const isEnable = !promo.is_active;
  const result = await Swal.fire({
    title: isEnable ? "เปิดใช้งานโค้ด?" : "ปิดใช้งานโค้ด?",
    html: `โค้ด <strong>${promo.code}</strong> จะถูก${isEnable ? "เปิด" : "ปิด"}ใช้งาน`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: isEnable ? "#16a34a" : "#6b7280",
  });

  if (result.isConfirmed) {
    try {
      await api.put(`/api/admin/promocodes/${promo.id}/status`, { isActive: isEnable });
      promo.is_active = isEnable;
      saveLog("เปิด/ปิดโค้ดส่วนลด", `${isEnable ? "เปิด" : "ปิด"}โค้ด: ${promo.code}`);
      Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", showConfirmButton: false, timer: 1000 });
    } catch {
      Swal.fire("ผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
    }
  }
};

// ─── Format helpers ───────────────────────────────────────────
const usagePercent = (promo: PromoCode) => {
  if (!promo.limit_count) return 0;
  return Math.min(100, Math.round((Number(promo.used_count) / promo.limit_count) * 100));
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="ticket-alt" class="text-[#d4af37]" />
          รหัสส่วนลด (Promo Codes)
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">สร้างและจัดการโค้ดส่วนลดสำหรับผู้เช่าพื้นที่</p>
      </div>
      <button
        @click="handleAddPromoCode"
        class="w-full sm:w-auto px-6 py-3 bg-[#d4af37] text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <font-awesome-icon icon="plus" /> สร้างรหัสใหม่
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
        <p class="text-2xl font-black text-gray-900">{{ promoCodes.length }}</p>
        <p class="text-xs font-bold text-gray-500 mt-1">โค้ดทั้งหมด</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-green-100 text-center">
        <p class="text-2xl font-black text-green-600">{{ activeCount }}</p>
        <p class="text-xs font-bold text-gray-500 mt-1">กำลังใช้งาน</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-[#d4af37]/20 text-center">
        <p class="text-2xl font-black text-[#d4af37]">{{ totalUsed }}</p>
        <p class="text-xs font-bold text-gray-500 mt-1">ครั้งที่ใช้ไป</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <font-awesome-icon icon="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหารหัสโปรโมชั่น..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30"
        />
      </div>
      <div class="flex gap-1.5">
        <button
          v-for="(label, val) in { all: 'ทั้งหมด', active: 'เปิดใช้งาน', inactive: 'ปิดใช้งาน' }"
          :key="val"
          @click="filterStatus = val as typeof filterStatus"
          :class="filterStatus === val ? 'bg-[#d4af37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          class="px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 space-y-4">
        <div v-for="i in 4" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="h-8 bg-gray-200 rounded-lg w-24 shrink-0"></div>
          <div class="flex-1 h-2 bg-gray-100 rounded-full"></div>
          <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
          <div class="w-12 h-8 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="filteredCodes.length > 0" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr class="bg-gray-50/80 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th class="px-6 py-4">Code</th>
              <th class="px-6 py-4 text-center">ส่วนลด</th>
              <th class="px-6 py-4 text-center">การใช้งาน</th>
              <th class="px-6 py-4 text-center border-l border-gray-100">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="promo in filteredCodes"
              :key="promo.id"
              class="hover:bg-gray-50/60 transition-colors"
              :class="!promo.is_active ? 'opacity-50' : ''"
            >
              <!-- Code -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center shrink-0">
                    <font-awesome-icon icon="ticket-alt" class="text-[#d4af37] text-xs" />
                  </div>
                  <span class="font-black text-gray-900 tracking-widest text-base">{{ promo.code }}</span>
                </div>
              </td>

              <!-- Discount -->
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-[#ba0b2f] font-black text-sm">
                  {{ promo.discount }}%
                </span>
              </td>

              <!-- Usage Progress -->
              <td class="px-6 py-4">
                <div class="w-full bg-gray-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                  <div
                    :class="usagePercent(promo) >= 100 ? 'bg-red-500' : 'bg-blue-500'"
                    class="h-1.5 rounded-full transition-all duration-700"
                    :style="`width: ${usagePercent(promo)}%`"
                  ></div>
                </div>
                <p class="text-[10px] text-gray-500 font-bold text-center">
                  {{ promo.used_count }} / {{ promo.limit_count }} สิทธิ์
                  <span v-if="usagePercent(promo) >= 100" class="text-red-500 ml-1">(เต็มโควตา)</span>
                </p>
              </td>

              <!-- Toggle -->
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <button
                  @click="togglePromoStatus(promo)"
                  class="text-3xl transition-colors outline-none cursor-pointer"
                  :class="promo.is_active ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'"
                  :title="promo.is_active ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'"
                >
                  <font-awesome-icon :icon="promo.is_active ? 'toggle-on' : 'toggle-off'" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-3xl mb-5 border border-yellow-100">
        <font-awesome-icon icon="ticket-alt" class="text-[#d4af37]" />
      </div>
      <h3 class="text-xl font-black text-gray-700 mb-2">ยังไม่มีรหัสส่วนลด</h3>
      <p class="text-sm text-gray-400 font-medium mb-6 max-w-xs">กดปุ่ม "สร้างรหัสใหม่" เพื่อเพิ่มรหัสโปรโมชั่นสำหรับผู้เช่า</p>
      <button
        @click="handleAddPromoCode"
        class="px-6 py-3 bg-[#d4af37] text-white font-bold rounded-xl hover:bg-yellow-600 transition-all cursor-pointer"
      >
        <font-awesome-icon icon="plus" class="mr-2" /> สร้างรหัสแรก
      </button>
    </div>
  </div>
</template>
