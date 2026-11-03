<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import api from "@/services/api";
import { formatDateDMY } from "@/utils/dateKey";
import { withSwalTheme } from "@/utils/swalTheme";

const { t } = useI18n();

interface UserItem {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  user_type: string;
  profile_picture: string | null;
  created_at: string;
  total_bookings: number;
  approved_bookings: number;
  paid_bookings?: number;
  is_active: boolean;
}

const users = ref<UserItem[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const filterRole = ref("all");

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/api/admin/users");
    users.value = res.data.map((u: any) => ({
      ...u,
      is_active: u.is_active !== false,
      paid_bookings: Number(u.paid_bookings || 0),
    }));
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchUsers());

const filteredUsers = computed(() => {
  let list = users.value;
  if (filterRole.value !== "all") {
    list = list.filter((u) => u.user_type === filterRole.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (u) =>
        u.firstname.toLowerCase().includes(q) ||
        u.lastname.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }
  return list;
});

const roleCounts = computed(() => {
  const counts: Record<string, number> = {
    all: users.value.length,
    admin: 0,
    internal: 0,
    co_op: 0,
    external: 0,
  };
  users.value.forEach((u) => {
    if (counts[u.user_type] !== undefined) counts[u.user_type]++;
  });
  return counts;
});

const roleLabel = (type: string) =>
  ({
    admin: t("admin.role_admin"),
    internal: t("admin.role_internal"),
    co_op: t("admin.role_coop"),
    external: t("admin.role_external"),
  } as Record<string, string>)[type] || type;
const roleBadgeClass: Record<string, string> = {
  admin: "bg-red-50 text-mfu-red border-red-200",
  internal: "bg-blue-50 text-blue-700 border-blue-200",
  co_op: "bg-yellow-50 text-yellow-700 border-yellow-200",
  external: "bg-gray-50 text-gray-600 border-gray-200",
};

const formatDate = (d: string) => formatDateDMY(d);

const toggleActive = async (user: UserItem) => {
  const next = !user.is_active;
  const { isConfirmed } = await Swal.fire(
    withSwalTheme({
      title: next ? t("admin.swal_enable_account") : t("admin.swal_disable_account"),
      html: `<p class="text-sm text-gray-600">${user.firstname} ${user.lastname}<br/><b>${user.email}</b></p>
           <p class="text-xs text-gray-500 mt-2">${next ? t("admin.swal_account_enable_hint") : t("admin.swal_account_disable_hint")}</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: next ? t("admin.enable") : t("admin.disable"),
      cancelButtonText: t("admin.cancel"),
    })
  );
  if (!isConfirmed) return;
  try {
    await api.put(`/api/admin/users/${user.id}/active`, { isActive: next });
    user.is_active = next;
    Swal.fire(
      withSwalTheme({
        icon: "success",
        title: next ? t("admin.enable") : t("admin.disable"),
        timer: 1200,
        showConfirmButton: false,
      })
    );
  } catch (err: any) {
    Swal.fire(
      withSwalTheme({
        icon: "error",
        title: t("admin.error"),
        text: err.response?.data?.message || t("admin.error"),
      })
    );
  }
};

/** Promote → admin; demote → internal (@mfu.ac.th) หรือ external (โดเมนอื่น) */
const baseRoleForEmail = (email: string): "internal" | "external" => {
  const domain = email.trim().toLowerCase().split("@").pop() || "";
  return domain === "mfu.ac.th" ? "internal" : "external";
};

/** ตั้ง Admin ได้เฉพาะโดเมนตรงๆ @mfu.ac.th (ไม่รวม lamduan / external) */
const canPromoteToAdmin = (email: string): boolean =>
  baseRoleForEmail(email) === "internal";

const setAdminRole = async (user: UserItem) => {
  const promoting = user.user_type !== "admin";
  if (promoting && !canPromoteToAdmin(user.email)) {
    Swal.fire(
      withSwalTheme({
        icon: "info",
        title: t("admin.not_mfu_email_title"),
        text: t("admin.not_mfu_email_title"),
      })
    );
    return;
  }
  const nextRole = promoting ? "admin" : baseRoleForEmail(user.email);
  const { isConfirmed } = await Swal.fire(
    withSwalTheme({
      title: nextRole === "admin" ? t("admin.swal_make_admin") : t("admin.swal_remove_admin"),
      text: `${user.email} → ${nextRole}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("admin.confirm"),
      cancelButtonText: t("admin.cancel"),
    })
  );
  if (!isConfirmed) return;
  try {
    await api.put(`/api/admin/users/${user.id}/role`, { userType: nextRole });
    user.user_type = nextRole;
    Swal.fire(
      withSwalTheme({
        icon: "success",
        title: t("admin.updated"),
        timer: 1200,
        showConfirmButton: false,
      })
    );
  } catch (err: any) {
    Swal.fire(
      withSwalTheme({
        icon: "error",
        title: t("admin.error"),
        text: err.response?.data?.message || t("admin.error"),
      })
    );
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="ui-card ui-admin-header p-6">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="users" class="text-mfu-red" />
          {{ $t("admin.users_title") }}
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          {{ $t("admin.users_subtitle") }}
        </p>
      </div>
      <div
        class="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
      >
        <font-awesome-icon icon="users" class="text-gray-400 text-sm" />
        <span class="text-sm font-black text-gray-700">{{
          $t("admin.accounts_count", { n: users.length })
        }}</span>
      </div>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-card border border-gray-200">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <font-awesome-icon
            icon="search"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('admin.search_users')"
            class="ui-input pl-10"
          />
        </div>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="role in ['all', 'admin', 'internal', 'co_op', 'external']"
            :key="role"
            @click="filterRole = role"
            :class="filterRole === role ? 'ui-chip-active' : 'ui-chip-idle'"
            class="ui-chip"
          >
            {{
              role === "all"
                ? $t("admin.filter_all")
                : role === "admin"
                  ? $t("admin.filter_admin")
                  : role === "internal"
                    ? $t("admin.filter_internal")
                    : role === "co_op"
                      ? $t("admin.filter_coop")
                      : $t("admin.filter_external")
            }}
            <span class="ml-1 opacity-80">({{ roleCounts[role] || 0 }})</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="ui-table-card p-6 space-y-4">
      <div v-for="i in 6" :key="i" class="flex items-center gap-4">
        <div class="ui-skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="ui-skeleton h-3 w-1/3 rounded-full"></div>
          <div class="ui-skeleton h-3 w-1/2 rounded-full"></div>
        </div>
      </div>
    </div>

    <div v-else-if="filteredUsers.length === 0" class="ui-table-card">
      <div class="ui-empty">
        <font-awesome-icon icon="users" class="text-4xl mb-3 opacity-40" />
        <p>{{ $t("admin.empty_users") }}</p>
        <p class="text-sm font-medium mt-2">{{ $t("admin.empty_users_hint") }}</p>
      </div>
    </div>

    <div v-else class="ui-table-card">
      <div class="ui-table-wrap max-h-[70vh] rounded-none border-0 shadow-none">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr
              class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <th class="px-4 py-4">{{ $t("admin.col_user") }}</th>
              <th class="px-4 py-4">{{ $t("admin.col_email") }}</th>
              <th class="px-4 py-4 text-center">{{ $t("admin.col_type") }}</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">{{ $t("admin.col_booking_stats") }}</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">{{ $t("admin.col_account_status") }}</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">{{ $t("admin.col_actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(user, idx) in filteredUsers"
              :key="user.id"
              class="transition-colors"
              :class="[
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
                'hover:bg-amber-50/80',
                !user.is_active ? 'opacity-70' : '',
              ]"
            >
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <img
                    v-if="user.profile_picture"
                    :src="user.profile_picture"
                    class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-mfu-red to-mfu-red-dark flex items-center justify-center text-white font-black text-sm"
                  >
                    {{ user.firstname.charAt(0) }}{{ user.lastname.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-sm">
                      {{ user.firstname }} {{ user.lastname }}
                    </p>
                    <p class="text-[11px] text-gray-400 font-medium">
                      {{ $t("admin.joined", { date: formatDate(user.created_at) }) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-sm text-gray-600 font-medium">{{ user.email }}</span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span
                  :class="roleBadgeClass[user.user_type] || 'bg-gray-100 text-gray-600 border-gray-200'"
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border"
                >
                  {{ roleLabel(user.user_type) }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-base font-black text-gray-900">{{
                    user.total_bookings
                  }}</span>
                  <span class="text-[10px] text-gray-500 font-bold">{{
                    $t("admin.stats_line", {
                      a: user.approved_bookings,
                      p: user.paid_bookings || 0,
                    })
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <span
                  class="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-black border"
                  :class="
                    user.is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  "
                >
                  {{ user.is_active ? $t("admin.active") : $t("admin.inactive") }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <div class="flex flex-col gap-1.5 items-center">
                  <button
                    @click="toggleActive(user)"
                    class="px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap border"
                    :class="
                      user.is_active
                        ? 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    "
                  >
                    {{ user.is_active ? $t("admin.disable") : $t("admin.enable") }}
                  </button>
                  <button
                    v-if="user.user_type === 'admin' || canPromoteToAdmin(user.email)"
                    @click="setAdminRole(user)"
                    class="px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
                  >
                    {{
                      user.user_type === "admin"
                        ? $t("admin.remove_admin")
                        : $t("admin.make_admin")
                    }}
                  </button>
                  <span
                    v-else
                    class="px-2 py-1 text-[10px] font-semibold text-gray-400"
                    :title="$t('admin.not_mfu_email_title')"
                  >
                    {{ $t("admin.not_mfu_email") }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
