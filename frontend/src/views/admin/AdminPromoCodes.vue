<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import api from "@/services/api";
import { formatPromoPercent } from "@/utils/bookingStatus";
import { withSwalTheme } from "@/utils/swalTheme";

const { t } = useI18n();

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
    promoCodes.value = res.data.map((p: any) => ({
      ...p,
      discount: parseFloat(String(p.discount ?? "0").replace(/%/g, "")) || 0,
    }));
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
  Swal.fire(
    withSwalTheme(
      {
        title: `<h3 class="text-xl font-black text-gray-900">${t("admin.swal_create_promo")}</h3>`,
        html: `
      <div class="text-left mt-4 space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">${t("admin.swal_promo_code")}</label>
          <input id="swal-code" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-mfu-gold outline-none font-black tracking-widest uppercase text-lg" placeholder="SAVE50">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">${t("admin.swal_promo_discount")}</label>
          <input id="swal-discount" type="number" min="1" max="100" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-amber-800 rounded-xl focus:ring-2 focus:ring-mfu-gold outline-none font-bold" placeholder="100">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">${t("admin.swal_promo_limit")}</label>
          <input id="swal-limit" type="number" min="1" value="100" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-mfu-gold outline-none font-bold">
        </div>
      </div>
    `,
        showCancelButton: true,
        confirmButtonText: t("admin.create_promo"),
        cancelButtonText: t("admin.cancel"),
        preConfirm: () => {
          const code = (
            document.getElementById("swal-code") as HTMLInputElement
          )?.value
            .toUpperCase()
            .trim();
          const discount = (
            document.getElementById("swal-discount") as HTMLInputElement
          )?.value;
          const limit = (document.getElementById("swal-limit") as HTMLInputElement)
            ?.value;
          if (!code || !discount) {
            Swal.showValidationMessage(t("admin.swal_promo_required"));
            return false;
          }
          return {
            code,
            discount: parseFloat(discount),
            limit_count: parseInt(limit) || 100,
          };
        },
      },
      "gold"
    )
  ).then(async (result) => {
    if (!result.isConfirmed || !result.value) return;
    try {
      const res = await api.post("/api/admin/promocodes", result.value);
      promoCodes.value.unshift(res.data);
      saveLog("สร้างรหัสส่วนลด", `สร้างโค้ด: ${result.value.code}`);
      Swal.fire(
        withSwalTheme(
          {
            icon: "success",
            title: t("admin.swal_promo_create_ok"),
            showConfirmButton: false,
            timer: 1300,
          },
          "gold"
        )
      );
    } catch {
      Swal.fire(
        withSwalTheme({
          icon: "error",
          title: t("admin.error"),
          text: t("admin.swal_promo_create_fail"),
        })
      );
    }
  });
};

// ─── Toggle Status ────────────────────────────────────────────
const togglePromoStatus = async (promo: PromoCode) => {
  const isEnable = !promo.is_active;
  const result = await Swal.fire(
    withSwalTheme(
      {
        title: isEnable ? t("admin.swal_promo_enable") : t("admin.swal_promo_disable"),
        html: t("admin.swal_promo_toggle_html", {
          code: promo.code,
          action: isEnable
            ? t("admin.swal_promo_action_on")
            : t("admin.swal_promo_action_off"),
        }),
        icon: "question",
        showCancelButton: true,
        confirmButtonText: t("admin.confirm"),
        cancelButtonText: t("admin.cancel"),
      },
      "gold"
    )
  );

  if (result.isConfirmed) {
    try {
      await api.put(`/api/admin/promocodes/${promo.id}/status`, { isActive: isEnable });
      promo.is_active = isEnable;
      saveLog("เปิด/ปิดโค้ดส่วนลด", `${isEnable ? "เปิด" : "ปิด"}โค้ด: ${promo.code}`);
      Swal.fire(
        withSwalTheme(
          {
            icon: "success",
            title: t("admin.updated"),
            showConfirmButton: false,
            timer: 1000,
          },
          "gold"
        )
      );
    } catch {
      Swal.fire(
        withSwalTheme({
          icon: "error",
          title: t("admin.error"),
          text: t("admin.swal_promo_update_fail"),
        })
      );
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
    <div class="ui-card ui-admin-header p-6 border-mfu-gold/25">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="ticket-alt" class="text-mfu-gold" />
          {{ $t("admin.promo_title") }}
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          {{ $t("admin.promo_subtitle") }}
        </p>
      </div>
      <button
        type="button"
        @click="handleAddPromoCode"
        class="ui-btn-primary w-full sm:w-auto bg-mfu-gold hover:bg-yellow-600 shadow-lg"
      >
        <font-awesome-icon icon="plus" /> {{ $t("admin.create_promo") }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-5 shadow-card border border-gray-200 text-center">
        <p class="text-2xl font-black text-gray-900">{{ promoCodes.length }}</p>
        <p class="text-xs font-bold text-gray-500 mt-1">{{ $t("admin.promo_total") }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-card border border-green-200 text-center">
        <p class="text-2xl font-black text-green-600">{{ activeCount }}</p>
        <p class="text-xs font-bold text-gray-500 mt-1">{{ $t("admin.promo_active") }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-card border border-mfu-gold/40 text-center">
        <p class="text-2xl font-black text-mfu-gold">{{ totalUsed }}</p>
        <p class="text-xs font-bold text-gray-500 mt-1">{{ $t("admin.promo_used") }}</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-card border border-gray-200 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <font-awesome-icon icon="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('admin.search_promo')"
          class="ui-input pl-10 focus:ring-mfu-gold/35 focus:border-mfu-gold/40"
        />
      </div>
      <div class="flex gap-1.5">
        <button
          v-for="val in ['all', 'active', 'inactive'] as const"
          :key="val"
          @click="filterStatus = val"
          :class="filterStatus === val ? 'bg-mfu-gold text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          class="px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
        >
          {{
            val === "all"
              ? $t("admin.filter_all")
              : val === "active"
                ? $t("admin.filter_active")
                : $t("admin.filter_inactive")
          }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="ui-table-card p-6 space-y-4">
      <div v-for="i in 4" :key="i" class="flex items-center gap-4">
        <div class="ui-skeleton h-8 w-24 rounded-lg shrink-0"></div>
        <div class="ui-skeleton flex-1 h-2 rounded-full"></div>
        <div class="ui-skeleton w-16 h-6 rounded-full"></div>
        <div class="ui-skeleton w-12 h-8 rounded-lg"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="filteredCodes.length > 0" class="ui-table-card">
      <div class="ui-table-wrap max-h-[70vh] rounded-none border-0 shadow-none">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr class="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th class="px-6 py-4">{{ $t("admin.col_code") }}</th>
              <th class="px-6 py-4 text-center">{{ $t("admin.col_discount") }}</th>
              <th class="px-6 py-4 text-center">{{ $t("admin.col_usage") }}</th>
              <th class="px-6 py-4 text-center border-l border-gray-100">{{ $t("admin.col_status_toggle") }}</th>
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
                    <font-awesome-icon icon="ticket-alt" class="text-mfu-gold text-xs" />
                  </div>
                  <span class="font-black text-gray-900 tracking-widest text-base">{{ promo.code }}</span>
                </div>
              </td>

              <!-- Discount -->
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-black text-sm">
                  {{ formatPromoPercent(promo.discount) }}
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
                  {{ promo.used_count }} / {{ promo.limit_count }} {{ $t("admin.quota_units") }}
                  <span v-if="usagePercent(promo) >= 100" class="text-red-500 ml-1">{{ $t("admin.quota_full") }}</span>
                </p>
              </td>

              <!-- Toggle only (no delete — Recording 5) -->
              <td class="px-6 py-4 text-center border-l border-gray-100">
                <button
                  @click="togglePromoStatus(promo)"
                  class="text-3xl transition-colors outline-none cursor-pointer"
                  :class="promo.is_active ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'"
                  :title="promo.is_active ? $t('admin.click_to_disable') : $t('admin.click_to_enable')"
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
    <div v-else class="ui-table-card">
      <div class="ui-empty">
        <div class="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-3xl mb-5 border border-yellow-100 mx-auto">
          <font-awesome-icon icon="ticket-alt" class="text-mfu-gold" />
        </div>
        <h3 class="text-xl font-black text-gray-700 mb-2">{{ $t("admin.empty_promo") }}</h3>
        <p class="text-sm text-gray-400 font-medium mb-6 max-w-xs mx-auto">
          {{ $t("admin.empty_promo_hint") }}
        </p>
        <button
          type="button"
          @click="handleAddPromoCode"
          class="ui-btn-primary bg-mfu-gold hover:bg-yellow-600"
        >
          <font-awesome-icon icon="plus" /> {{ $t("admin.create_first_promo") }}
        </button>
      </div>
    </div>
  </div>
</template>
