<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import AdminBookings from "./AdminBookings.vue";
import AdminRooms from "./AdminRooms.vue";
import AdminActivityLog from "./AdminActivityLog.vue";
import AdminBanners from "./AdminBanners.vue";

// ✨ นำเข้า Chart.js
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  type ChartOptions,
} from "chart.js";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
);

import api, { getCookie } from "@/services/api";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";

interface BookingInfo {
  id: string;
  dbId: number;
  userName: string;
  roomName: string;
  date: string;
  duration: string;
  totalPrice: number;
  status: string;
  hasFeedback: boolean;
  feedbackData?: { rating: number; comment: string };
  actionBy?: string;
  organization_type?: string;
}

interface RevenueMonth {
  label: string;
  revenue: number;
}

interface PopularRoom {
  name: string;
  usage: number;
  color: string;
}

// Helper: decode JWT payload
const getTokenPayload = () => {
  const token = getCookie("mfu_token");
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

const router = useRouter();
const activeTab = ref("overview");

const adminProfile = ref({
  fullName: localStorage.getItem("userName") || "เจ้าหน้าที่ จัดการทรัพย์สิน",
  role: "Admin",
});

const bookings = ref<BookingInfo[]>([]);
const stats = ref<Record<string, number>>({
  pendingCount: 0,
  approvedToday: 0,
  currentMonthRevenue: 0,
});

const fetchAdminData = async () => {
  try {
    const statsRes = await api.get("/api/admin/stats");
    stats.value = statsRes.data;

    const bookingsRes = await api.get("/api/admin/bookings");
    bookings.value = bookingsRes.data.map((b: any) => ({
      ...b,
      id: b.booking_no,
      dbId: b.id,
      userName: b.partner_name || `${b.firstname} ${b.lastname}`,
      roomName: b.room_name,
      date: b.booking_date ? new Date(b.booking_date).toISOString().split('T')[0] : 'N/A',
      duration: b.time_slot === 'full' ? 'เต็มวัน' : b.time_slot === 'half_morning' ? 'ครึ่งวันเช้า' : 'ครึ่งวันบ่าย',
      totalPrice: parseFloat(b.total_price),
      status: b.status,
      hasFeedback: b.feedback_rating != null,
      feedbackData: { rating: b.feedback_rating, comment: b.feedback_comment }
    }));

    // ✅ ดึงข้อมูลรายได้ย้อนหลัง 6 เดือนจาก API จริง
    const revenueRes = await api.get("/api/admin/revenue-by-month");
    if (revenueRes.data && revenueRes.data.length > 0) {
      barChartData.value = {
        labels: revenueRes.data.map((r: any) => r.label),
        datasets: [{
          label: "รายได้ (บาท)",
          backgroundColor: "#ba0b2f",
          borderRadius: 6,
          data: revenueRes.data.map((r: any) => r.revenue),
        }]
      };
      // คำนวณรายได้เดือนที่ผ่านมาจากข้อมูล API (ข้อมูลเรียง ASC, ตัวสุดท้าย = เดือนปัจจุบัน)
      if (revenueRes.data.length > 1) {
        stats.value.lastMonthRevenue = revenueRes.data[revenueRes.data.length - 2].revenue;
      } else {
        stats.value.lastMonthRevenue = 0;
      }
      // เตรียมข้อมูลรายเดือนสำหรับแสดงในส่วนขยาย
      revenueMonths.value = revenueRes.data.map((r: any) => ({
        label: r.label,
        revenue: r.revenue
      }));
    }

    // คำนวณห้องยอดนิยม
    const roomCounts: Record<string, number> = {};
    bookings.value.forEach((b: BookingInfo) => {
      roomCounts[b.roomName] = (roomCounts[b.roomName] || 0) + 1;
    });
    const sortedRooms = Object.entries(roomCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 3)
      .map((entry, index) => {
        const colors = ["bg-green-500", "bg-blue-500", "bg-yellow-500"];
        return {
          name: entry[0],
          usage: Math.min(100, entry[1] * 10),
          color: colors[index % colors.length]
        };
      });
    if (sortedRooms.length > 0) popularRooms.value = sortedRooms;

    // คำนวณ Doughnut Chart
    const typeCounts = { external: 0, internal: 0, co_op: 0 };
    bookings.value.forEach((b: BookingInfo) => {
      if (b.organization_type === 'internal') typeCounts.internal++;
      else if (b.organization_type === 'co_op') typeCounts.co_op++;
      else typeCounts.external++;
    });
    doughnutChartData.value.datasets[0].data = [typeCounts.external, typeCounts.internal, typeCounts.co_op];

  } catch (err) {
    console.error("Error fetching admin data:", err);
  }
};

onMounted(() => fetchAdminData());

const pendingCount = computed(() => {
  return stats.value.pendingCount;
});

const popularRooms = ref<PopularRoom[]>([]);

const isRevenueExpanded = ref(false);

// ข้อมูลรายเดือนสำหรับแสดงในส่วนขยาย
const revenueMonths = ref<RevenueMonth[]>([]);

// ✅ barChartData เริ่มจาก empty แล้วจะถูกเติมจาก API
const barChartData = ref({
  labels: [],
  datasets: [
    {
      label: "รายได้ (บาท)",
      backgroundColor: "#ba0b2f",
      borderRadius: 6,
      data: [],
    },
  ],
});

const barChartOptions = ref<ChartOptions<'bar'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
});

// ข้อมูลกราฟโดนัท
const doughnutChartData = ref({
  labels: ["บุคคลภายนอก", "หน่วยงานภายใน", "ร่วมจัด (Co-op)"],
  datasets: [
    { backgroundColor: ["#ba0b2f", "#1f2937", "#d4af37"], data: [55, 30, 15] },
  ],
});

const doughnutChartOptions = ref<ChartOptions<'doughnut'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "bottom" } },
});

const confirmLogout = () => {
  Swal.fire({
    html: `
      <div class="relative w-24 h-24 mx-auto mb-6">
        <div class="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
        <div class="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm border-[4px] border-red-50 text-[#ba0b2f] text-4xl">
          🚪
        </div>
      </div>
      <h3 class="text-2xl font-black text-gray-900 tracking-tight mb-2">ออกจากระบบ?</h3>
      <p class="text-sm text-gray-500 font-medium px-2">คุณต้องการออกจากระบบการจัดการพื้นที่ใช่หรือไม่?</p>
    `,
    showCancelButton: true,
    confirmButtonText: "ออกจากระบบ",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-sm border border-gray-100 shadow-2xl",
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      confirmButton:
        "bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200 hover:-translate-y-0.5 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      router.push("/");
    }
  });
};
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
    <div class="relative pt-16 pb-32 flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <picture>
          <source srcset="/images/mfu-bg.avif" type="image/avif">
          <source srcset="/images/mfu-bg.webp" type="image/webp">
          <img
            src="/images/mfu-bg.jpg"
            class="w-full h-full object-cover filter brightness-[0.3]"
          />
        </picture>
        <div
          class="absolute inset-0 bg-linear-to-b from-[#111827]/90 via-[#ba0b2f]/60 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-4"
      >
        <div class="text-center md:text-left">
          <span
            class="inline-block py-1.5 px-4 rounded-full bg-black/40 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/30 text-xs font-bold tracking-widest uppercase mb-3 shadow-lg"
            >Administrator Portal</span
          >
          <h1
            class="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2"
          >
            MFU Property Admin
          </h1>
          <p class="text-gray-200 text-lg font-medium">
            {{ $t('admin.dashboard_title') }}
          </p>
        </div>

        <div class="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 shadow-lg">
          <LanguageSwitcher />
        </div>
      </div>
    </div>

    <div class="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
      <div class="flex flex-col xl:flex-row gap-8">
        <!-- Sidebar -->
        <div class="w-full xl:w-1/4">
          <div
            class="bg-white rounded-3xl shadow-sm border border-white/50 p-6 sticky top-8"
          >
            <div class="text-center mb-8 border-b border-gray-100 pb-6">
              <div
                class="w-24 h-24 mx-auto bg-linear-to-tr from-[#ba0b2f] to-[#8c0823] rounded-full flex items-center justify-center text-white text-3xl shadow-lg border-4 border-white mb-4"
              >
                <font-awesome-icon icon="user-shield" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900 mb-1">
                {{ adminProfile.fullName }}
              </h3>
              <span
                class="inline-block px-3 py-1 bg-red-50 text-[#ba0b2f] text-[10px] font-bold uppercase rounded-lg border border-red-100 tracking-wider"
                >{{ adminProfile.role }}</span
              >
            </div>

            <nav class="space-y-2">
              <button
                @click="activeTab = 'overview'"
                :class="
                  activeTab === 'overview'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <font-awesome-icon icon="chart-pie" class="w-5" /> Dashboard
              </button>
              <button
                @click="activeTab = 'bookings'"
                :class="
                  activeTab === 'bookings'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left group cursor-pointer"
              >
                <div class="flex items-center gap-4">
                  <font-awesome-icon icon="clipboard-list" class="w-5" /> จัดการคำขอจอง
                </div>
                <div
                  v-if="pendingCount > 0"
                  class="flex items-center justify-center min-w-5.5 h-5.5 px-1.5 bg-[#ba0b2f] text-white text-[11px] font-black rounded-full shadow-sm ring-2 ring-white"
                >
                  {{ pendingCount }}
                </div>
              </button>
              <button
                @click="activeTab = 'rooms'"
                :class="
                  activeTab === 'rooms'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <font-awesome-icon icon="building" class="w-5" /> ข้อมูลห้องและพื้นที่ (Rooms)
              </button>
              <button
                @click="activeTab = 'logs'"
                :class="
                  activeTab === 'logs'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <font-awesome-icon icon="history" class="w-5" /> ประวัติการทำงาน (Logs)
              </button>
              <button
                @click="activeTab = 'banners'"
                :class="
                  activeTab === 'banners'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <font-awesome-icon icon="bullhorn" class="w-5" /> การประกาศและโปรโมชั่น
              </button>

              <div class="pt-6 mt-6 border-t border-gray-100">
                <button
                  @click="confirmLogout"
                  class="group w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-gray-500 hover:bg-red-50 transition-all font-bold text-sm cursor-pointer"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-red-100 group-hover:text-[#ba0b2f] transition-colors"
                    >
                      <font-awesome-icon icon="sign-out-alt" />
                    </div>
                    <span>ออกจากระบบ</span>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </div>

        <!-- Content Area -->
        <div class="w-full xl:w-3/4">
          <!-- ✨ ส่วน Overview Dashboard ถูกนำมารวมไว้ที่นี่โดยตรง ไม่ต้องแยกไฟล์แล้ว ✨ -->
          <div
            v-if="activeTab === 'overview'"
            class="space-y-8 animate-fade-up"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative"
              >
                <div class="flex items-center gap-5">
                  <div
                    class="w-16 h-16 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center text-2xl shrink-0"
                  >
                    <font-awesome-icon icon="clock" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-500 mb-1">
                      คำขอรออนุมัติ
                    </p>
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
                    <font-awesome-icon icon="check-double" />
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
                class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center transition-all duration-300"
              >
                <div
                  class="absolute right-0 top-0 w-2 h-full bg-linear-to-b from-[#d4af37] to-yellow-500"
                ></div>
                <div class="flex items-center gap-5 mb-4">
                  <div
                    class="w-16 h-16 rounded-full bg-red-50 text-[#ba0b2f] flex items-center justify-center text-2xl shrink-0"
                  >
                    <font-awesome-icon icon="wallet" />
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
                  @click="isRevenueExpanded = !isRevenueExpanded"
                  class="pt-3 border-t border-gray-100 cursor-pointer group select-none"
                >
                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm text-gray-500 font-bold group-hover:text-[#ba0b2f] transition-colors flex items-center gap-1.5"
                      >รายได้เดือนที่ผ่านมา
                      <font-awesome-icon
                        v-if="isRevenueExpanded"
                        icon="chevron-up"
                        class="text-[10px] text-[#ba0b2f] transition-transform duration-300"
                      />
                      <font-awesome-icon
                        v-else
                        icon="chevron-down"
                        class="text-[10px] opacity-50 transition-transform duration-300"
                      /></span
                    ><span
                      class="text-sm font-black text-gray-700 group-hover:text-[#ba0b2f] transition-colors"
                      >฿{{ (stats.lastMonthRevenue || 0).toLocaleString() }}</span
                    >
                  </div>
                  <div
                    v-show="isRevenueExpanded"
                    class="mt-3 flex flex-col gap-2 pt-3 border-t border-dashed border-gray-100"
                  >
                    <div
                      v-for="(month, idx) in revenueMonths.slice().reverse()"
                      :key="idx"
                      class="flex justify-between items-center"
                    >
                      <span class="text-xs text-gray-400 font-bold"
                        ><font-awesome-icon :icon="['far', 'calendar-alt']" class="mr-1" /> {{ month.label }}</span
                      ><span class="text-xs font-black text-gray-500"
                        >฿{{ month.revenue.toLocaleString() }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- กราฟ Chart.js -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
              >
                <h3
                  class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"
                >
                  <font-awesome-icon icon="chart-line" class="text-[#ba0b2f]" /> แนวโน้มรายได้
                </h3>
                <div class="w-full h-64">
                  <Bar :data="barChartData" :options="barChartOptions" />
                </div>
              </div>
              <div
                class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
              >
                <h3
                  class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"
                >
                  <font-awesome-icon icon="chart-pie" class="text-[#d4af37]" />
                  สัดส่วนประเภทผู้เช่า
                </h3>
                <div class="w-full h-64">
                  <Doughnut
                    :data="doughnutChartData"
                    :options="doughnutChartOptions"
                  />
                </div>
              </div>
            </div>

            <!-- ความนิยม -->
            <div
              class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
            >
              <h3
                class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"
              >
                <font-awesome-icon icon="fire-alt" class="text-orange-500" />
                อัตราการใช้งานห้องและพื้นที่
              </h3>
              <div class="space-y-5">
                <div v-for="(room, index) in popularRooms" :key="index">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-gray-700">{{
                      room.name
                    }}</span
                    ><span class="text-sm font-bold text-gray-900"
                      >{{ room.usage }}%</span
                    >
                  </div>
                  <div
                    class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"
                  >
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

          <!-- Components อื่นๆ -->
          <AdminBookings
            v-if="activeTab === 'bookings'"
            :initialBookings="bookings"
          />
          <AdminRooms v-if="activeTab === 'rooms'" />
          <AdminActivityLog v-if="activeTab === 'logs'" />
          <AdminBanners v-if="activeTab === 'banners'" />
        </div>
      </div>
    </div>
  </div>
</template>
