<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref("bookings");

// --- ส่วนที่ 1: ข้อมูล Profile (ของเดิมที่คุณมี) ---
const userProfile = ref({
  fullName: "กำลังโหลด...",
  email: "กำลังโหลด...",
  phone: "",
  profileImage: null,
});

const showLogoutModal = ref(false);

onMounted(async () => {
  const storedEmail = localStorage.getItem("userEmail");
  const storedName = localStorage.getItem("userName");
  if (storedEmail) {
    userProfile.value.email = storedEmail;
    try {
      const response = await fetch(
        `http://localhost:3000/api/user/profile?email=${storedEmail}`,
      );
      if (response.ok) {
        const data = await response.json();
        userProfile.value.fullName = `${data.first_name} ${data.last_name}`;
        userProfile.value.phone = data.phone_number || "";
        userProfile.value.profileImage = data.profile_image || null;
      } else if (storedName) userProfile.value.fullName = storedName;
    } catch (error) {
      if (storedName) userProfile.value.fullName = storedName;
    }
  }
});

const handleFileUpload = async (event) => {
  /* โค้ดเชื่อมต่อ API เดิมของคุณ */
};
const saveProfile = async () => {
  /* โค้ดบันทึกเดิมของคุณ */
};

// --- ส่วนที่ 2: ระบบ QR Payment (ที่เพิ่มใหม่) ---
const showQRModal = ref(false);
const selectedBooking = ref(null);

const openPayment = (booking) => {
  selectedBooking.value = booking;
  showQRModal.value = true;
};

// --- ส่วนที่ 3: รายการจองพร้อม Add-ons (ที่เพิ่มใหม่) ---
const myBookings = ref([
  {
    id: "BK-202603001",
    roomName: "ห้องประชุม ท่าสุด",
    bookingDate: "2026-03-25",
    durationText: "ครึ่งวันเช้า",
    totalPrice: 2450,
    status: "pending",
    addons: [{ name: "โต๊ะเอนกประสงค์", qty: 1 }],
  },
  {
    id: "BK-202602090",
    roomName: "ห้องบรรยาย C1",
    bookingDate: "2026-02-20",
    durationText: "เต็มวัน",
    totalPrice: 3150,
    status: "approved_pending_payment",
    addons: [
      { name: "เก้าอี้เบาะนวม", qty: 10 },
      { name: "ไมโครโฟน", qty: 2 },
    ],
  },
  {
    id: "BK-202602089",
    roomName: "ลานกิจกรรม ลานประดู่แดง",
    bookingDate: "2026-02-14",
    durationText: "เต็มวัน",
    totalPrice: 4500,
    status: "approved_paid",
    addons: [],
  },
]);

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "รออนุมัติ";
    case "approved_pending_payment":
      return "รอชำระเงิน";
    case "approved_paid":
      return "สำเร็จแล้ว";
    case "cancelled":
      return "ยกเลิกแล้ว";
    case "disapproved":
      return "ไม่อนุมัติ";
    default:
      return "ไม่ทราบสถานะ";
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "approved_pending_payment":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "approved_paid":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const confirmLogout = () => {
  showLogoutModal.value = false;
  localStorage.clear();
  router.push("/");
};
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
    <div class="relative pt-20 pb-32 flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp"
          class="w-full h-full object-cover filter brightness-[0.4]"
        />
        <div
          class="absolute inset-0 bg-linear-to-b from-black/80 via-[#ba0b2f]/40 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center w-full mt-10 text-white"
      >
        <div>
          <h1
            class="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg mb-2"
          >
            My Dashboard
          </h1>
          <p class="text-gray-200 text-lg font-medium text-center md:text-left">
            จัดการข้อมูลส่วนตัวและติดตามการจองพื้นที่
          </p>
        </div>
        <RouterLink
          to="/rooms"
          class="mt-6 md:mt-0 bg-white text-[#ba0b2f] px-8 py-3.5 rounded-full font-black hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
        >
          <i class="fas fa-plus"></i> จองพื้นที่ใหม่
        </RouterLink>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="w-full md:w-1/3 lg:w-1/4">
          <div
            class="bg-white rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24"
          >
            <div class="relative w-32 h-32 mx-auto mb-6">
              <div
                class="w-full h-full bg-gray-50 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-gray-300 text-5xl overflow-hidden"
              >
                <img
                  v-if="userProfile.profileImage"
                  :src="`http://localhost:3000${userProfile.profileImage}`"
                  class="w-full h-full object-cover"
                />
                <i v-else class="fas fa-user"></i>
              </div>
              <button
                @click="$refs.fileInput.click()"
                class="absolute bottom-1 right-1 bg-[#d4af37] text-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform"
              >
                <i class="fas fa-camera"></i>
              </button>
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept="image/*"
                @change="handleFileUpload"
              />
            </div>
            <div class="text-center mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-1">
                {{ userProfile.fullName }}
              </h3>
              <p class="text-sm text-gray-500 font-medium">
                {{ userProfile.email }}
              </p>
            </div>
            <nav class="space-y-2">
              <button
                @click="activeTab = 'bookings'"
                :class="
                  activeTab === 'bookings'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left"
              >
                <i class="fas fa-ticket-alt w-5"></i> ประวัติการจอง
              </button>
              <button
                @click="activeTab = 'profile'"
                :class="
                  activeTab === 'profile'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left"
              >
                <i class="fas fa-user-cog w-5"></i> ข้อมูลส่วนตัว
              </button>
              <div class="pt-6 mt-6 border-t border-gray-100">
                <button
                  @click="showLogoutModal = true"
                  class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-gray-500 hover:bg-red-50 transition-all font-bold text-sm"
                >
                  <i class="fas fa-sign-out-alt"></i> ออกจากระบบ
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div class="w-full md:w-2/3 lg:w-3/4">
          <div v-if="activeTab === 'bookings'" class="space-y-6">
            <h2
              class="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3"
            >
              <i class="fas fa-history text-[#ba0b2f]"></i>
              รายการจองพื้นที่ของฉัน
            </h2>

            <div
              v-for="booking in myBookings"
              :key="booking.id"
              class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              <div
                class="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center"
              >
                <span
                  class="text-xs font-black text-gray-500 uppercase tracking-widest"
                  >Booking ID:
                  <span class="text-gray-900">{{ booking.id }}</span></span
                >
                <span
                  :class="getStatusClass(booking.status)"
                  class="px-4 py-1.5 rounded-xl text-xs font-bold border shadow-sm"
                >
                  {{ getStatusText(booking.status) }}
                </span>
              </div>

              <div
                class="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div class="grow">
                  <h3
                    class="text-xl font-black text-gray-800 mb-2 group-hover:text-[#ba0b2f] transition-colors"
                  >
                    {{ booking.roomName }}
                  </h3>
                  <div
                    class="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-4"
                  >
                    <span class="flex items-center gap-2"
                      ><i class="far fa-calendar text-[#d4af37]"></i>
                      {{ formatDate(booking.bookingDate) }}</span
                    >
                    <span class="flex items-center gap-2"
                      ><i class="far fa-clock text-[#d4af37]"></i>
                      {{ booking.durationText }}</span
                    >
                  </div>

                  <div
                    v-if="booking.addons.length > 0"
                    class="flex flex-wrap gap-2 pt-2 border-t border-gray-50"
                  >
                    <span
                      v-for="addon in booking.addons"
                      :key="addon.name"
                      class="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold"
                    >
                      + {{ addon.name }} ({{ addon.qty }})
                    </span>
                  </div>
                </div>

                <div
                  class="w-full md:w-auto text-left md:text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0"
                >
                  <p class="text-2xl font-black text-[#ba0b2f]">
                    ฿{{ booking.totalPrice.toLocaleString() }}
                  </p>

                  <button
                    v-if="booking.status === 'approved_pending_payment'"
                    @click="openPayment(booking)"
                    class="mt-3 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <i class="fas fa-qrcode"></i> สแกนจ่ายเงิน
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'profile'"
            class="bg-white rounded-3xl shadow-xl border border-white/50 p-8 md:p-10 animate-fade-up"
          >
            <h2
              class="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3 border-b pb-4"
            >
              <i class="fas fa-user-edit text-[#ba0b2f]"></i> ข้อมูลส่วนตัว
            </h2>

            <form
              @submit.prevent="saveProfile"
              class="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div
                class="md:col-span-2 bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-4"
              >
                <h4
                  class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4"
                >
                  <i class="fas fa-lock text-[#ba0b2f] mr-1"></i>
                  ข้อมูลอ้างอิงจากระบบ
                </h4>
                <div
                  class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold text-gray-500"
                >
                  <div>อีเมลบัญชี: {{ userProfile.email }}</div>
                  <div>สิทธิ์การใช้งาน: บุคคลทั่วไป (External)</div>
                </div>
              </div>

              <div>
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >ชื่อ-นามสกุล <span class="text-red-500">*</span></label
                >
                <input
                  type="text"
                  v-model="userProfile.fullName"
                  class="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >เบอร์โทรศัพท์ <span class="text-red-500">*</span></label
                >
                <input
                  type="tel"
                  v-model="userProfile.phone"
                  class="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                />
              </div>

              <div class="md:col-span-2 mt-8 pt-6 border-t flex justify-end">
                <button
                  type="submit"
                  class="bg-[#ba0b2f] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#8c0823] shadow-lg shadow-red-200 transition-all flex items-center gap-2"
                >
                  บันทึกข้อมูล <i class="fas fa-save"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showQRModal"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
    >
      <div
        class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center animate-fade-up relative overflow-hidden"
      >
        <div class="absolute top-0 left-0 w-full h-2 bg-[#ba0b2f]"></div>
        <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          Scan to Pay
        </h3>
        <p class="text-sm text-gray-500 mb-6 font-medium">
          ยอดชำระสุทธิ:
          <span class="text-[#ba0b2f] font-black text-lg"
            >฿{{ selectedBooking?.totalPrice.toLocaleString() }}</span
          >
        </p>
        <div
          class="bg-white p-4 rounded-3xl border-2 border-dashed border-gray-100 mb-6 inline-block mx-auto shadow-inner"
        >
          <img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MFU_PAYMENT_ID_${selectedBooking?.id}`"
            class="w-48 h-48 mx-auto"
            alt="Payment QR Code"
          />
        </div>
        <div
          class="bg-blue-50 p-4 rounded-2xl text-left mb-8 flex gap-3 border border-blue-100 text-[11px] text-blue-800 leading-relaxed font-medium"
        >
          <i class="fas fa-info-circle text-blue-500 mt-1"></i>
          <p>
            สแกนเพื่อชำระเงินผ่านแอปธนาคาร เมื่อชำระเสร็จแล้ว
            แอดมินจะตรวจสอบข้อมูลภายใน 1 ชั่วโมง
          </p>
        </div>
        <button
          @click="showQRModal = false"
          class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all uppercase tracking-widest text-sm cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>

    <div
      v-if="showLogoutModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
    >
      <div
        class="bg-white rounded-4xl p-8 max-w-sm w-full shadow-2xl text-center animate-fade-up relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-red-500 to-[#ba0b2f]"
        ></div>
        <div
          class="w-24 h-24 rounded-full bg-red-50 text-[#ba0b2f] mx-auto mb-6 flex items-center justify-center text-4xl shadow-inner border-[6px] border-white ring-1 ring-red-100 transform transition-transform hover:scale-110 duration-300"
        >
          <i class="fas fa-sign-out-alt ml-1"></i>
        </div>
        <h3 class="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
          ออกจากระบบ?
        </h3>
        <div class="flex gap-4">
          <button
            @click="showLogoutModal = false"
            class="flex-1 py-4 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 border-2 border-gray-100 transition-all text-sm uppercase tracking-wider"
          >
            ยกเลิก
          </button>
          <button
            @click="confirmLogout"
            class="flex-1 py-4 bg-[#ba0b2f] text-white font-bold rounded-2xl hover:shadow-lg transition-all text-sm uppercase tracking-wider"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
