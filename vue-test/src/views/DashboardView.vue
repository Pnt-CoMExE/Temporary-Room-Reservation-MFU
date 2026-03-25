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
  const today = new Date();
  const diffDays = Math.ceil((bDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    alert(
      `❌ ไม่สามารถยกเลิกได้\nระบบอนุญาตให้ยกเลิกล่วงหน้าอย่างน้อย 3 วันทำการ (เหลืออีก ${diffDays} วัน)`
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
  <div class="bg-gray-50 min-h-screen pb-20">
    <div class="bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] py-12 mb-8 relative overflow-hidden shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex justify-between items-center">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p class="text-red-100 mt-2 text-md md:text-lg font-medium">
            จัดการข้อมูลส่วนตัวและติดตามสถานะการจองของคุณ
          </p>
        </div>
        <div class="hidden md:block">
          <RouterLink
            to="/rooms"
            class="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-[#ba0b2f] transition-all duration-300 shadow-lg inline-flex items-center gap-2"
          >
            <i class="fas fa-plus"></i> จองพื้นที่ใหม่
          </RouterLink>
        </div>
      </div>
      <div class="absolute right-[-2%] top-[-50%] opacity-10 text-[10rem] font-black text-white select-none pointer-events-none uppercase">
        MFU
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row gap-8">
        
        <div class="w-full md:w-1/3 lg:w-1/4">
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
            
            <div class="relative w-28 h-28 mx-auto mb-4">
              <div class="w-28 h-28 bg-gray-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-gray-400 text-5xl overflow-hidden">
                <i class="fas fa-user"></i>
              </div>
              <button class="absolute bottom-0 right-0 bg-[#d4af37] text-white w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-yellow-500 hover:scale-110 transition-all cursor-pointer">
                <i class="fas fa-camera text-sm"></i>
              </button>
            </div>
            
            <div class="text-center mb-8">
              <h3 class="text-lg font-bold text-gray-900">{{ userProfile.fullName }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ userProfile.email }}</p>
              <span class="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                <i class="fas fa-check-circle mr-1"></i> ยืนยันตัวตนแล้ว
              </span>
            </div>

            <nav class="space-y-2">
              <button
                @click="activeTab = 'bookings'"
                :class="activeTab === 'bookings' ? 'bg-red-50 text-[#ba0b2f] border-[#ba0b2f]' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 transition-all duration-200 font-semibold text-left"
              >
                <i class="fas fa-ticket-alt w-5 text-center"></i> ประวัติการจอง
              </button>
              
              <button
                @click="activeTab = 'profile'"
                :class="activeTab === 'profile' ? 'bg-red-50 text-[#ba0b2f] border-[#ba0b2f]' : 'text-gray-600 hover:bg-gray-50 border-transparent'"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 transition-all duration-200 font-semibold text-left"
              >
                <i class="fas fa-user-cog w-5 text-center"></i> ข้อมูลส่วนตัว
              </button>

              <div class="pt-4 mt-4 border-t border-gray-100">
                <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-all font-semibold text-left">
                  <i class="fas fa-sign-out-alt w-5 text-center"></i> ออกจากระบบ
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div class="w-full md:w-2/3 lg:w-3/4">
          
          <div v-if="activeTab === 'bookings'" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i class="fas fa-history text-[#ba0b2f]"></i> ประวัติการจองของฉัน
            </h2>
            
            <div
              v-for="booking in myBookings"
              :key="booking.id"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div class="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <span class="text-xs font-black text-gray-500 uppercase tracking-wider">
                  Booking ID: <span class="text-gray-900">{{ booking.id }}</span>
                </span>
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-700 border border-yellow-200': booking.status === 'pending',
                    'bg-green-100 text-green-700 border border-green-200': booking.status === 'approved',
                    'bg-red-100 text-red-700 border border-red-200': booking.status === 'cancelled',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm"
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
                <div class="flex gap-5 items-center">
                  <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-[#ba0b2f] text-2xl shadow-inner">
                    <i class="fas fa-door-open"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900">{{ booking.roomName }}</h3>
                    <div class="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span class="flex items-center gap-1.5"><i class="far fa-calendar-alt text-[#d4af37]"></i> {{ formatDate(booking.bookingDate) }}</span>
                      <span class="hidden sm:inline text-gray-300">|</span>
                      <span class="flex items-center gap-1.5"><i class="far fa-clock text-[#d4af37]"></i> {{ booking.durationText }}</span>
                    </div>
                  </div>
                </div>
                <div class="mt-6 md:mt-0 md:text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
                  <p class="text-2xl font-black text-[#ba0b2f]">
                    ฿{{ booking.totalPrice.toLocaleString() }}
                  </p>
                  <button
                    v-if="booking.status === 'pending'"
                    @click="cancelBooking(booking.id, booking.bookingDate)"
                    class="mt-2 text-sm font-bold text-red-500 hover:text-red-700 underline underline-offset-4 decoration-red-200 hover:decoration-red-500 transition-all"
                  >
                    ยกเลิกการจอง
                  </button>
                </div>
              </div>
            </div>

            <div v-if="myBookings.length === 0" class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div class="text-5xl text-gray-300 mb-4"><i class="fas fa-folder-open"></i></div>
              <h3 class="text-xl font-bold text-gray-700">ยังไม่มีประวัติการจอง</h3>
              <p class="text-gray-400 mt-2">คุณยังไม่ได้ทำรายการจองพื้นที่ใดๆ</p>
              <RouterLink to="/rooms" class="inline-block mt-6 bg-[#ba0b2f] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#8c0823] transition-colors">
                เริ่มค้นหาพื้นที่
              </RouterLink>
            </div>
          </div>

          <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <i class="fas fa-user-edit text-[#ba0b2f]"></i> ข้อมูลส่วนตัว
            </h2>

            <form @submit.prevent="saveProfile" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <div class="space-y-2 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                <h4 class="text-sm font-bold text-gray-900 mb-3"><i class="fas fa-id-card text-gray-400 mr-1"></i> ข้อมูลบัญชี (อ้างอิงจากระบบ)</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">อีเมลมหาวิทยาลัย</label>
                    <input type="email" v-model="userProfile.email" disabled class="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-medium text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">สถานะ</label>
                    <input type="text" value="นักศึกษาปัจจุบัน" disabled class="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-medium text-sm" />
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">ชื่อ-นามสกุล</label>
                <input type="text" v-model="userProfile.fullName" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm" />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">เบอร์โทรศัพท์ติดต่อ</label>
                <input type="tel" v-model="userProfile.phone" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm" />
              </div>

              <div class="space-y-2 md:col-span-2 mt-2">
                <label class="block text-sm font-bold text-gray-700">เปลี่ยนรหัสผ่านใหม่ <span class="text-xs text-gray-400 font-normal">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span></label>
                <div class="relative">
                  <input type="password" v-model="userProfile.password" placeholder="••••••••" class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm" />
                  <i class="fas fa-lock absolute right-4 top-3.5 text-gray-300"></i>
                </div>
              </div>

              <div class="md:col-span-2 pt-6 border-t border-gray-100 mt-2 flex justify-end">
                <button type="submit" class="w-full md:w-auto px-8 py-3.5 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transform hover:-translate-y-0.5 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                  <i class="fas fa-save"></i> บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>