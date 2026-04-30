<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import AdminDashboard from "./AdminDashboard.vue";
import AdminBookings from "./AdminBookings.vue";
import AdminRooms from "./AdminRooms.vue";
import AdminActivityLog from "./AdminActivityLog.vue";
import AdminBanners from "./AdminBanners.vue";

const router = useRouter();
const activeTab = ref("overview");

const adminProfile = ref({
  fullName: "เจ้าหน้าที่ จัดการทรัพย์สิน",
  role: "Admin",
});

const bookings = ref([
  {
    id: "BK-202603015",
    userName: "บจก. เอสซีจี (ร่วม มฟล.)",
    userType: "co_organizer",
    roomName: "ห้องประชุมคำมอกหลวง",
    date: "2026-03-25",
    duration: "เต็มวัน",
    totalPrice: 4500,
    status: "pending",
  },
  {
    id: "BK-202603016",
    userName: "สมหญิง รักเรียน",
    userType: "internal",
    roomName: "ห้องประชุม ท่าสุด",
    date: "2026-03-28",
    duration: "ครึ่งวันเช้า",
    totalPrice: 2400,
    status: "approved_pending_payment",
  },
  {
    id: "BK-202603017",
    userName: "บริษัท ภายนอก จำกัด",
    userType: "external",
    roomName: "ลานประดู่แดง",
    date: "2026-04-02",
    duration: "เต็มวัน",
    totalPrice: 8000,
    status: "disapproved",
  },
  {
    id: "BK-202603018",
    userName: "นายใจดี มีสุข",
    userType: "external",
    roomName: "ห้องบรรยาย C1",
    date: "2026-04-10",
    duration: "ครึ่งวันบ่าย",
    totalPrice: 3150,
    status: "approved_paid",
  },
]);

const pendingCount = computed(() => {
  return bookings.value.filter((b) => b.status === "pending").length;
});

const confirmLogout = () => {
  Swal.fire({
    html: `
      <div class="relative w-24 h-24 mx-auto mb-6">
        <div class="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
        <div class="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm border-[4px] border-red-50 text-[#ba0b2f] text-4xl">
          <i class="fas fa-sign-out-alt ml-1 translate-x-0.5"></i>
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
        "bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer",
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
        <img
          src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp"
          class="w-full h-full object-cover filter brightness-[0.3]"
        />
        <div
          class="absolute inset-0 bg-linear-to-b from-[#111827]/90 via-[#ba0b2f]/60 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-8 text-center md:text-left"
      >
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
          ระบบบริหารจัดการพื้นที่เช่ามหาวิทยาลัยแม่ฟ้าหลวง
        </p>
      </div>
    </div>

    <div class="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
      <div class="flex flex-col xl:flex-row gap-8">
        <div class="w-full xl:w-1/4">
          <div
            class="bg-white rounded-3xl shadow-sm border border-white/50 p-6 sticky top-8"
          >
            <div class="text-center mb-8 border-b border-gray-100 pb-6">
              <div
                class="w-24 h-24 mx-auto bg-linear-to-tr from-[#ba0b2f] to-[#8c0823] rounded-full flex items-center justify-center text-white text-3xl shadow-lg border-4 border-white mb-4"
              >
                <i class="fas fa-user-shield"></i>
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
                <i class="fas fa-chart-pie w-5"></i> Dashboard
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
                  <i class="fas fa-clipboard-list w-5"></i> จัดการคำขอจอง
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
                <i class="fas fa-building w-5"></i> ข้อมูลห้องพัก (Rooms)
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
                <i class="fas fa-history w-5"></i> ประวัติการทำงาน (Logs)
              </button>

              <!-- ✨ เมนูใหม่ จัดการแบนเนอร์ -->
              <button
                @click="activeTab = 'banners'"
                :class="
                  activeTab === 'banners'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <i class="fas fa-images w-5"></i> จัดการแบนเนอร์ (Banners)
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
                      <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <span>ออกจากระบบ</span>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div class="w-full xl:w-3/4">
          <AdminDashboard v-if="activeTab === 'overview'" />
          <AdminBookings
            v-if="activeTab === 'bookings'"
            :initialBookings="bookings"
          />
          <AdminRooms v-if="activeTab === 'rooms'" />
          <AdminActivityLog v-if="activeTab === 'logs'" />
          <!-- ✨ แสดง Component แบนเนอร์ -->
          <AdminBanners v-if="activeTab === 'banners'" />
        </div>
      </div>
    </div>
  </div>
</template>
