<script setup>
import { ref } from "vue";

const activeTab = ref("bookings"); // 'bookings' หรือ 'profile'

const myBookings = ref([
  {
    id: "BK-202603001",
    roomName: "ห้องประชุม ท่าสุด",
    bookingDate: "2026-03-25",
    durationText: "ครึ่งวันเช้า",
    totalPrice: 2400,
    status: "pending",
  },
  {
    id: "BK-202602089",
    roomName: "ลานกิจกรรม ลานประดู่แดง",
    bookingDate: "2026-02-14",
    durationText: "เต็มวัน",
    totalPrice: 4500,
    status: "approved",
  },
]);

const userProfile = ref({
  fullName: "นักศึกษา มฟล.",
  email: "student@lamduan.mfu.ac.th",
  phone: "0812345678",
  password: "",
});

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const cancelBooking = (bookingId, bookingDate) => {
  const bDate = new Date(bookingDate);
  const today = new Date(); // ใช้ค่าปัจจุบันของเครื่อง
  const diffDays = Math.ceil((bDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    alert(
      `❌ ไม่สามารถยกเลิกได้\nระบบอนุญาตให้ยกเลิกล่วงหน้าอย่างน้อย 3 วันทำการ (เหลืออีก ${diffDays} วัน)`,
    );
    return;
  }

  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการ "ยกเลิก" การจองรายการนี้?')) {
    const index = myBookings.value.findIndex((b) => b.id === bookingId);
    if (index !== -1) myBookings.value[index].status = "cancelled";
  }
};

const saveProfile = () => {
  alert("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!");
  userProfile.value.password = "";
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="bg-[#ba0b2f] py-16 mb-10 relative overflow-hidden">
      <div
        class="max-w-7xl mx-auto px-4 relative z-10 flex justify-between items-end"
      >
        <div>
          <h1 class="text-4xl font-extrabold text-white">จัดการข้อมูลผู้ใช้</h1>
          <p class="text-red-100 mt-2 text-lg">
            ติดตามสถานะการจองและจัดการโปรไฟล์ส่วนตัวของคุณ
          </p>
        </div>
        <div class="hidden md:block">
          <RouterLink
            to="/rooms"
            class="bg-[#d4af37] text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-500 transition-all shadow-lg inline-block"
          >
            + จองห้องใหม่
          </RouterLink>
        </div>
      </div>
      <div
        class="absolute right-[-5%] bottom-[-20%] opacity-10 text-[12rem] font-bold text-white select-none pointer-events-none uppercase"
      >
        Profile
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div
        class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8 -mt-16 relative z-20"
      >
        <div class="flex p-2">
          <button
            @click="activeTab = 'bookings'"
            :class="
              activeTab === 'bookings'
                ? 'bg-[#ba0b2f] text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            "
            class="flex-1 py-4 font-bold text-center rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i class="fas fa-calendar-alt"></i> ประวัติการจองของฉัน
          </button>
          <button
            @click="activeTab = 'profile'"
            :class="
              activeTab === 'profile'
                ? 'bg-[#ba0b2f] text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            "
            class="flex-1 py-4 font-bold text-center rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i class="fas fa-user-cog"></i> ตั้งค่าโปรไฟล์
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'bookings'" class="space-y-6">
        <div
          v-for="booking in myBookings"
          :key="booking.id"
          class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-transform hover:scale-[1.01]"
        >
          <div
            class="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex justify-between items-center"
          >
            <span
              class="text-xs font-black text-gray-400 uppercase tracking-widest"
              >ID: {{ booking.id }}</span
            >
            <span
              :class="{
                'bg-yellow-100 text-yellow-700': booking.status === 'pending',
                'bg-green-100 text-green-700': booking.status === 'approved',
                'bg-red-100 text-red-700': booking.status === 'cancelled',
              }"
              class="px-4 py-1 rounded-full text-xs font-black uppercase"
            >
              {{
                booking.status === "pending"
                  ? "⏳ รออนุมัติ"
                  : booking.status === "approved"
                    ? "✅ อนุมัติแล้ว"
                    : "❌ ยกเลิกแล้ว"
              }}
            </span>
          </div>
          <div class="p-6 md:flex justify-between items-center">
            <div class="flex gap-4 items-center">
              <div
                class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-[#ba0b2f] text-2xl"
              >
                <i class="fas fa-door-open"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">
                  {{ booking.roomName }}
                </h3>
                <p class="text-gray-500 flex items-center gap-2 mt-1">
                  <i class="far fa-calendar text-[#d4af37]"></i>
                  {{ formatDate(booking.bookingDate) }}
                  <span class="text-gray-300">|</span>
                  <i class="far fa-clock text-[#d4af37]"></i>
                  {{ booking.durationText }}
                </p>
              </div>
            </div>
            <div
              class="mt-6 md:mt-0 md:text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0"
            >
              <p class="text-3xl font-black text-[#ba0b2f]">
                ฿{{ booking.totalPrice.toLocaleString() }}
              </p>
              <button
                v-if="booking.status === 'pending'"
                @click="cancelBooking(booking.id, booking.bookingDate)"
                class="px-5 py-2 mt-2 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors"
              >
                ยกเลิกการจอง
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="myBookings.length === 0"
          class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"
        >
          <p class="text-gray-400">ยังไม่มีประวัติการจอง</p>
        </div>
      </div>

      <div
        v-if="activeTab === 'profile'"
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12"
      >
        <div
          class="flex items-center gap-4 mb-10 border-b border-gray-100 pb-8"
        >
          <div
            class="w-20 h-20 bg-[#ba0b2f] text-white rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-red-200"
          >
            <i class="fas fa-user"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ userProfile.fullName }}
            </h3>
            <p class="text-gray-500">บัญชีผู้ใช้งานระบบ MFU Property</p>
          </div>
        </div>

        <form
          @submit.prevent="saveProfile"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 ml-1"
              >ชื่อ-นามสกุล</label
            >
            <input
              type="text"
              v-model="userProfile.fullName"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 ml-1"
              >อีเมล (มฟล.)</label
            >
            <input
              type="email"
              v-model="userProfile.email"
              disabled
              class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed font-medium"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 ml-1"
              >เบอร์โทรศัพท์ติดต่อ</label
            >
            <input
              type="tel"
              v-model="userProfile.phone"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 ml-1"
              >เปลี่ยนรหัสผ่านใหม่</label
            >
            <input
              type="password"
              v-model="userProfile.password"
              placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
            />
          </div>

          <div class="md:col-span-2 pt-6">
            <button
              type="submit"
              class="w-full md:w-auto px-10 py-4 bg-[#ba0b2f] text-white font-black rounded-2xl hover:bg-[#8c0823] transform hover:scale-105 transition-all shadow-lg shadow-red-100 uppercase tracking-wider"
            >
              บันทึกข้อมูลส่วนตัว
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
