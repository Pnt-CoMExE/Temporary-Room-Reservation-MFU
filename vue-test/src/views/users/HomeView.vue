<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import RoomCard from "@/components/room/RoomCard.vue";

const router = useRouter();

const searchParams = ref({
  query: "",
  date: "",
  location: "",
});

const handleSearch = () => {
  router.push({
    name: "room-list",
    query: {
      q: searchParams.value.query,
      date: searchParams.value.date,
      loc: searchParams.value.location,
    },
  });
};

const featuredRooms = ref([
  {
    id: 1,
    name: "ห้องประชุม ท่าสุด,นางแล,แม่ข้าวต้ม,ริมกก (AD)",
    type: "ห้องประชุม",
    capacity: 15,
    location: "อาคารบริหาร (AD)",
    image: "/images/room1.jpg",
    isAvailable: true,
    priceHalfDayInternal: 2400,
  },
  {
    id: 2,
    name: "ห้องประชุมคำมอกหลวง",
    type: "ห้องประชุม",
    capacity: 200,
    location: "อาคาร M-Square",
    image: "/images/room2.jpg",
    isAvailable: true,
    priceHalfDayInternal: 6000,
  },
  {
    id: 3,
    name: "ลานกิจกรรม ลานประดู่แดง",
    type: "ลานกิจกรรม",
    capacity: 100,
    location: "ลานกิจกรรมกลางแจ้ง",
    image: "/images/room3.jpg",
    isAvailable: true,
    priceHalfDayInternal: 3000,
  },
]);
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
    <div
      class="relative pt-32 pb-48 lg:pt-40 lg:pb-56 flex items-center justify-center overflow-hidden"
    >
      <div class="absolute inset-0 z-0">
        <img
          src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp"
          alt="MFU Background"
          class="w-full h-full object-cover object-center filter brightness-[0.6]"
        />
        <div
          class="absolute inset-0 bg-linear-to-b from-black/40 via-[#ba0b2f]/20 to-[#f8f9fa]"
        ></div>
      </div>

      <div
        class="relative z-10 text-center px-4 w-full max-w-5xl mx-auto animate-fade-up"
      >
        <span
          class="inline-block py-1.5 px-4 rounded-full bg-black/30 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/50 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg"
        >
          MFU Property Reservation
        </span>
        <h1
          class="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl leading-tight"
        >
          ค้นหาและจองพื้นที่ <br class="hidden md:block" />
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-[#d4af37] to-yellow-200"
          >
            มหาวิทยาลัยแม่ฟ้าหลวง
          </span>
        </h1>
        <p
          class="text-lg md:text-xl text-gray-100 mb-12 font-medium max-w-2xl mx-auto drop-shadow-md"
        >
          ระบบจองห้องประชุม ลานกิจกรรม และพื้นที่ส่วนกลาง
          <br class="hidden sm:block" />สะดวก รวดเร็ว เช็คคิวว่างได้ตลอด 24
          ชั่วโมง
        </p>

        <div
          class="bg-white/90 backdrop-blur-xl p-3 md:rounded-full rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto transform translate-y-12"
        >
          <form
            @submit.prevent="handleSearch"
            class="w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200/60"
          >
            <div
              class="flex-1 px-6 py-4 md:py-3 flex items-center hover:bg-gray-50/50 rounded-t-3xl md:rounded-l-full md:rounded-tr-none cursor-text transition-colors group"
            >
              <div
                class="text-[#ba0b2f] mr-4 text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-search"></i>
              </div>
              <div class="w-full text-left">
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                  >ค้นหา</label
                >
                <input
                  type="text"
                  v-model="searchParams.query"
                  placeholder="ชื่อห้อง หรือ อาคาร..."
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-800 font-semibold placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            <div
              class="flex-1 px-6 py-4 md:py-3 flex items-center hover:bg-gray-50/50 cursor-text transition-colors group"
            >
              <div
                class="text-[#ba0b2f] mr-4 text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <i class="far fa-calendar-alt"></i>
              </div>
              <div class="w-full text-left">
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                  >วันที่ใช้งาน</label
                >
                <input
                  type="date"
                  v-model="searchParams.date"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-800 font-semibold outline-none"
                />
              </div>
            </div>

            <div
              class="flex-1 px-6 py-4 md:py-3 flex items-center hover:bg-gray-50/50 cursor-pointer transition-colors group relative"
            >
              <div
                class="text-[#ba0b2f] mr-4 text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-layer-group"></i>
              </div>
              <div class="w-full text-left pr-6">
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                  >ประเภทพื้นที่</label
                >
                <select
                  v-model="searchParams.location"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-800 font-semibold outline-none cursor-pointer appearance-none relative z-10"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="ห้องประชุม">ห้องประชุม</option>
                  <option value="ห้องบรรยาย">ห้องบรรยาย</option>
                  <option value="ลานกิจกรรม">ลานกิจกรรมกลางแจ้ง</option>
                </select>
                <i
                  class="fas fa-chevron-down absolute right-6 top-1/2 transform translate-y-1 text-gray-400 text-xs z-0"
                ></i>
              </div>
            </div>

            <div class="p-2 w-full md:w-auto mt-2 md:mt-0">
              <button
                type="submit"
                class="w-full md:w-auto bg-[#ba0b2f] hover:bg-[#8c0823] text-white text-base font-bold py-4 md:py-4 px-8 rounded-2xl md:rounded-full transition-all duration-300 shadow-md hover:shadow-xl flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>ค้นหาพื้นที่</span>
                <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <div
        class="mb-12 flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-5"
      >
        <div>
          <h2
            class="text-3xl font-extrabold text-gray-900 flex items-center gap-3"
          >
            พื้นที่แนะนำ
            <span class="text-[#d4af37] text-2xl"
              ><i class="fas fa-star"></i
            ></span>
          </h2>
          <p class="text-gray-500 mt-2 text-base">
            ห้องยอดนิยมที่ถูกจองบ่อยที่สุดในมหาวิทยาลัย
          </p>
        </div>
        <router-link
          to="/rooms"
          class="group text-sm font-bold text-[#ba0b2f] hover:text-[#8c0823] transition-all flex items-center gap-2 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-full"
        >
          ดูห้องทั้งหมด
          <i
            class="fas fa-arrow-right transform group-hover:translate-x-1 transition-transform"
          ></i>
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RoomCard v-for="room in featuredRooms" :key="room.id" :room="room" />
      </div>
    </div>

    <div class="bg-white py-24 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          class="text-[#ba0b2f] font-bold tracking-wider text-sm uppercase mb-2 block"
          >How it works</span
        >
        <h2 class="text-3xl font-extrabold text-gray-900 mb-4">
          ขั้นตอนการจองพื้นที่ง่ายๆ
        </h2>
        <p class="text-gray-500 mb-16 max-w-2xl mx-auto text-base">
          เพียง 3 ขั้นตอน คุณก็สามารถใช้งานพื้นที่ของมหาวิทยาลัยได้อย่างรวดเร็ว
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div
            class="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-transparent via-gray-200 to-transparent"
          ></div>

          <div class="flex flex-col items-center relative z-10 group">
            <div
              class="w-24 h-24 bg-white border-4 border-gray-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-red-100 group-hover:bg-red-50"
            >
              <i class="fas fa-search"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              1. ค้นหาและเลือกห้อง
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-62.5">
              ค้นหาห้องที่ตรงกับความต้องการ ตรวจสอบคิวว่างและราคาแบบ Real-time
            </p>
          </div>

          <div class="flex flex-col items-center relative z-10 group">
            <div
              class="w-24 h-24 bg-white border-4 border-gray-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-red-100 group-hover:bg-red-50"
            >
              <i class="fas fa-file-signature"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              2. กรอกข้อมูลและส่งคำขอ
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-62.5">
              ระบุรายละเอียดการจัดงาน เลือกอุปกรณ์เสริม และแนบเอกสารอ้างอิง
            </p>
          </div>

          <div class="flex flex-col items-center relative z-10 group">
            <div
              class="w-24 h-24 bg-white border-4 border-gray-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-red-100 group-hover:bg-red-50"
            >
              <i class="fas fa-qrcode"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              3. รออนุมัติและชำระเงิน
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-62.5">
              เมื่อเจ้าหน้าที่ตรวจสอบและอนุมัติแล้ว สามารถสแกน QR Code
              ชำระเงินได้ทันที
            </p>
          </div>
        </div>
      </div>
    </div>

    <footer
      class="bg-[#111827] text-white py-16 mt-auto border-t-[6px] border-[#ba0b2f]"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12"
      >
        <div>
          <h3 class="text-2xl font-extrabold tracking-wider mb-4">
            <span class="text-[#d4af37]">MFU</span> PROPERTY
          </h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-6">
            ระบบบริหารจัดการพื้นที่เช่าชั่วคราว<br />มหาวิทยาลัยแม่ฟ้าหลวง
            จังหวัดเชียงราย
          </p>
          <div class="flex gap-4">
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ba0b2f] transition-colors"
              ><i class="fab fa-facebook-f"></i
            ></a>
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ba0b2f] transition-colors"
              ><i class="fas fa-globe"></i
            ></a>
          </div>
        </div>

        <div>
          <h4
            class="text-base font-bold text-white mb-6 uppercase tracking-wider"
          >
            ติดต่อส่วนจัดการทรัพย์สิน
          </h4>
          <ul class="text-gray-400 text-sm space-y-4">
            <li class="flex items-start gap-3">
              <i class="fas fa-phone mt-1 text-[#d4af37]"></i>
              <span>053-916-000</span>
            </li>
            <li class="flex items-start gap-3">
              <i class="fas fa-envelope mt-1 text-[#d4af37]"></i>
              <span>property@mfu.ac.th</span>
            </li>
            <li class="flex items-start gap-3">
              <i class="fas fa-map-marker-alt mt-1 text-[#d4af37]"></i>
              <span class="leading-relaxed"
                >อาคารบริหาร (AD) ชั้น 1<br />333 หมู่ 1 ต.ท่าสุด อ.เมือง
                จ.เชียงราย 57100</span
              >
            </li>
          </ul>
        </div>

        <div>
          <h4
            class="text-base font-bold text-white mb-6 uppercase tracking-wider"
          >
            เมนูใช้งาน
          </h4>
          <ul class="text-gray-400 text-sm space-y-3">
            <li>
              <router-link
                to="/rooms"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><i class="fas fa-angle-right text-xs"></i>
                ค้นหาและจองพื้นที่</router-link
              >
            </li>
            <li>
              <a
                href="#"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><i class="fas fa-angle-right text-xs"></i>
                คู่มือการใช้งานระบบ</a
              >
            </li>
            <li>
              <a
                href="#"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><i class="fas fa-angle-right text-xs"></i> อัตราค่าบริการ
                (PDF)</a
              >
            </li>
            <li>
              <a
                href="#"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><i class="fas fa-angle-right text-xs"></i>
                นโยบายความเป็นส่วนตัว</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs"
      >
        <p>&copy; 2026 Mae Fah Luang University. All rights reserved.</p>
        <p>Developed by CE Senior Project Team</p>
      </div>
    </footer>
  </div>
</template>
