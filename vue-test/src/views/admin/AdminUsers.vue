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
}

const users = ref<UserItem[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const filterRole = ref("all");

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

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/api/admin/users");
    users.value = res.data;
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchUsers());

// ─── Computed ───────────────────────────────────────────────
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
  const counts: Record<string, number> = { all: users.value.length, admin: 0, internal: 0, co_op: 0, external: 0 };
  users.value.forEach((u) => {
    if (counts[u.user_type] !== undefined) counts[u.user_type]++;
  });
  return counts;
});

// ─── Role display helper ─────────────────────────────────────
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
  new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

// ─── Change Role ─────────────────────────────────────────────
const changeRole = async (user: UserItem) => {
  const roleOptions = [
    { value: "admin", label: "ผู้ดูแลระบบ (Admin)" },
    { value: "internal", label: "บุคลากร MFU (Internal)" },
    { value: "co_op", label: "หน่วยงานร่วมจัด (Co-op)" },
    { value: "external", label: "บุคคลภายนอก (External)" },
  ];

  const { value: newRole } = await Swal.fire({
    title: `<h3 class="text-xl font-black text-gray-900">เปลี่ยน Role ผู้ใช้</h3>`,
    html: `
      <p class="text-sm text-gray-500 mb-4">${user.firstname} ${user.lastname}<br><span class="font-bold text-gray-700">${user.email}</span></p>
      <select id="role-select" class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ba0b2f]">
        ${roleOptions.map((r) => `<option value="${r.value}" ${r.value === user.user_type ? "selected" : ""}>${r.label}</option>`).join("")}
      </select>
    `,
    preConfirm: () => (document.getElementById("role-select") as HTMLSelectElement)?.value,
    showCancelButton: true,
    confirmButtonText: "บันทึก",
    cancelButtonText: "ยกเลิก",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-sm",
      confirmButton: "bg-[#ba0b2f] text-white rounded-xl px-5 py-3 font-bold cursor-pointer",
      cancelButton: "bg-gray-100 text-gray-600 rounded-xl px-5 py-3 font-bold ml-3 cursor-pointer",
    },
  });

  if (!newRole || newRole === user.user_type) return;

  try {
    await api.put(`/api/admin/users/${user.id}/role`, { userType: newRole });
    user.user_type = newRole;
    saveLog("เปลี่ยน Role ผู้ใช้", `เปลี่ยน ${user.email} จาก ${user.user_type} เป็น ${newRole}`);
    Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", showConfirmButton: false, timer: 1200 });
  } catch (err) {
    Swal.fire({ icon: "error", title: "ผิดพลาด", text: "ไม่สามารถเปลี่ยน Role ได้" });
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="users" class="text-[#ba0b2f]" />
          จัดการผู้ใช้ในระบบ
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">ดูและจัดการบัญชีผู้ใช้ทั้งหมดที่ลงทะเบียนผ่าน Google OAuth</p>
      </div>
      <div class="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
        <font-awesome-icon icon="users" class="text-gray-400 text-sm" />
        <span class="text-sm font-black text-gray-700">{{ users.length }} บัญชี</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <font-awesome-icon icon="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาชื่อ หรืออีเมล..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ba0b2f]/30"
          />
        </div>
        <!-- Role Filter Tabs -->
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="(label, role) in { all: 'ทั้งหมด', admin: 'Admin', internal: 'บุคลากร', co_op: 'Co-op', external: 'ภายนอก' }"
            :key="role"
            @click="filterRole = role"
            :class="filterRole === role ? 'bg-[#ba0b2f] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            class="px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap"
          >
            {{ label }}
            <span class="ml-1 opacity-80">({{ roleCounts[role] || 0 }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 space-y-4">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4 animate-pulse">
          <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-200 rounded-full w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded-full w-1/2"></div>
          </div>
          <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
          <div class="w-24 h-8 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div v-else-if="filteredUsers.length > 0" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-gray-50/80 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th class="px-4 py-4">ผู้ใช้</th>
              <th class="px-4 py-4">อีเมล</th>
              <th class="px-4 py-4 text-center">Role</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">สถิติการจอง</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">วันที่สมัคร</th>
              <th class="px-4 py-4 text-center border-l border-gray-100">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50/60 transition-colors"
            >
              <!-- Avatar + Name -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="relative shrink-0">
                    <img
                      v-if="user.profile_picture"
                      :src="user.profile_picture"
                      :alt="`${user.firstname} ${user.lastname}`"
                      class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div
                      v-else
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-[#ba0b2f] to-[#8c0823] flex items-center justify-center text-white font-black text-sm shadow-sm"
                    >
                      {{ user.firstname.charAt(0) }}{{ user.lastname.charAt(0) }}
                    </div>
                    <!-- Online dot for admin -->
                    <div v-if="user.user_type === 'admin'" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-sm">{{ user.firstname }} {{ user.lastname }}</p>
                    <p class="text-[11px] text-gray-400 font-medium">#{{ String(user.id).padStart(4, '0') }}</p>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="px-4 py-3.5">
                <span class="text-sm text-gray-600 font-medium">{{ user.email }}</span>
              </td>

              <!-- Role Badge -->
              <td class="px-4 py-3.5 text-center">
                <span
                  :class="roleBadgeClass[user.user_type] || 'bg-gray-100 text-gray-600 border-gray-200'"
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border uppercase tracking-wide"
                >
                  {{ roleLabel[user.user_type] || user.user_type }}
                </span>
              </td>

              <!-- Booking Stats -->
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-black text-gray-800">{{ user.total_bookings }}</span>
                  <span class="text-[10px] text-gray-400 font-bold">ครั้ง ({{ user.approved_bookings }} อนุมัติ)</span>
                </div>
              </td>

              <!-- Join Date -->
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <span class="text-xs font-bold text-gray-500">{{ formatDate(user.created_at) }}</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5 text-center border-l border-gray-100">
                <button
                  @click="changeRole(user)"
                  class="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-[#ba0b2f] hover:text-white transition-all cursor-pointer whitespace-nowrap"
                >
                  <font-awesome-icon icon="user-edit" class="mr-1.5" />เปลี่ยน Role
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 text-3xl mb-5">
        <font-awesome-icon icon="users" />
      </div>
      <h3 class="text-xl font-black text-gray-700 mb-2">ไม่พบผู้ใช้</h3>
      <p class="text-sm text-gray-400 font-medium max-w-xs">ลองเปลี่ยนคำค้นหา หรือ filter เป็น "ทั้งหมด"</p>
    </div>
  </div>
</template>
