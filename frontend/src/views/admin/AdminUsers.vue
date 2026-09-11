<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import api from "@/services/api";

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

const roleLabel: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  internal: "บุคลากร MFU",
  co_op: "หน่วยงานร่วมจัด",
  external: "บุคคลภายนอก",
};
const roleBadgeClass: Record<string, string> = {
  admin: "bg-red-50 text-[#ba0b2f] border-red-200",
  internal: "bg-blue-50 text-blue-700 border-blue-200",
  co_op: "bg-yellow-50 text-yellow-700 border-yellow-200",
  external: "bg-gray-50 text-gray-600 border-gray-200",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const toggleActive = async (user: UserItem) => {
  const next = !user.is_active;
  const { isConfirmed } = await Swal.fire({
    title: next ? "เปิดใช้งานบัญชี?" : "ปิดใช้งานบัญชี?",
    html: `<p class="text-sm text-gray-600">${user.firstname} ${user.lastname}<br/><b>${user.email}</b></p>
           <p class="text-xs text-gray-500 mt-2">${next ? "ผู้ใช้จะเข้าสู่ระบบได้ตามปกติ" : "ผู้ใช้จะไม่สามารถ Login ด้วย Google ได้"}</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: next ? "เปิดใช้งาน" : "ปิดใช้งาน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: next ? "#059669" : "#ba0b2f",
  });
  if (!isConfirmed) return;
  try {
    await api.put(`/api/admin/users/${user.id}/active`, { isActive: next });
    user.is_active = next;
    Swal.fire({
      icon: "success",
      title: next ? "เปิดใช้งานแล้ว" : "ปิดใช้งานแล้ว",
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "ไม่สำเร็จ",
      text: err.response?.data?.message || "อัปเดตสถานะบัญชีไม่สำเร็จ",
    });
  }
};

/** Limited role change: promote to admin or demote admin → internal */
const setAdminRole = async (user: UserItem) => {
  const nextRole = user.user_type === "admin" ? "internal" : "admin";
  const { isConfirmed } = await Swal.fire({
    title: nextRole === "admin" ? "ตั้งเป็น Admin?" : "ถอดสิทธิ์ Admin?",
    text: `${user.email} → ${nextRole}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#ba0b2f",
  });
  if (!isConfirmed) return;
  try {
    await api.put(`/api/admin/users/${user.id}/role`, { userType: nextRole });
    user.user_type = nextRole;
    Swal.fire({
      icon: "success",
      title: "อัปเดตสิทธิ์แล้ว",
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "ไม่สำเร็จ",
      text: err.response?.data?.message || "เปลี่ยนสิทธิ์ไม่สำเร็จ",
    });
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="users" class="text-[#ba0b2f]" />
          จัดการผู้ใช้ / แอดมิน
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          เน้นสถิติการจอง และเปิด/ปิดบัญชีแอดมินโดยไม่ต้องแก้โค้ด
        </p>
      </div>
      <div
        class="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200"
      >
        <font-awesome-icon icon="users" class="text-gray-400 text-sm" />
        <span class="text-sm font-black text-gray-700">{{ users.length }} บัญชี</span>
      </div>
    </div>

    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <font-awesome-icon
            icon="search"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อ หรืออีเมล..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ba0b2f]/30"
          />
        </div>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="(label, role) in {
              all: 'ทั้งหมด',
              admin: 'Admin',
              internal: 'บุคลากร',
              co_op: 'Co-op',
              external: 'ภายนอก',
            }"
            :key="role"
            @click="filterRole = role"
            :class="
              filterRole === role
                ? 'bg-[#ba0b2f] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            "
            class="px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          >
            {{ label }}
            <span class="ml-1 opacity-80">({{ roleCounts[role] || 0 }})</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="loading"
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="p-6 space-y-4">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-200 rounded-full w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredUsers.length > 0"
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr
              class="bg-slate-50 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <th class="px-4 py-4">ผู้ใช้</th>
              <th class="px-4 py-4">อีเมล</th>
              <th class="px-4 py-4 text-center">ประเภท</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">สถิติการจอง</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">สถานะบัญชี</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">จัดการ</th>
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
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-[#ba0b2f] to-[#8c0823] flex items-center justify-center text-white font-black text-sm"
                  >
                    {{ user.firstname.charAt(0) }}{{ user.lastname.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-sm">
                      {{ user.firstname }} {{ user.lastname }}
                    </p>
                    <p class="text-[11px] text-gray-400 font-medium">
                      สมัคร {{ formatDate(user.created_at) }}
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
                  {{ roleLabel[user.user_type] || user.user_type }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-base font-black text-gray-900">{{
                    user.total_bookings
                  }}</span>
                  <span class="text-[10px] text-gray-500 font-bold"
                    >ทั้งหมด · อนุมัติ {{ user.approved_bookings }} · ชำระแล้ว
                    {{ user.paid_bookings || 0 }}</span
                  >
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
                  {{ user.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
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
                    {{ user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน" }}
                  </button>
                  <button
                    v-if="user.user_type === 'admin' || user.user_type === 'internal'"
                    @click="setAdminRole(user)"
                    class="px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
                  >
                    {{ user.user_type === "admin" ? "ถอด Admin" : "ตั้งเป็น Admin" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-else
      class="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 flex flex-col items-center justify-center text-center"
    >
      <h3 class="text-xl font-black text-gray-700 mb-2">ไม่พบผู้ใช้</h3>
      <p class="text-sm text-gray-400 font-medium max-w-xs">
        ลองเปลี่ยนคำค้นหา หรือ filter เป็น "ทั้งหมด"
      </p>
    </div>
  </div>
</template>
