<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import RoomCard from "../components/RoomCard.vue";

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
    image:
      "/images/room1.jpg",
    isAvailable: true,
    priceHalfDayInternal: 2400,
  },
  {
    id: 2,
    name: "ห้องประชุมคำมอกหลวง",
    type: "ห้องประชุม",
    capacity: 200,
    location: "อาคาร M-Square",
    image:
      "/images/room2.jpg",
    isAvailable: true,
    priceHalfDayInternal: 6000,
  },
  {
    id: 3,
    name: "ลานกิจกรรม ลานประดู่แดง",
    type: "ลานกิจกรรม",
    capacity: 100,
    location: "ลานกิจกรรมกลางแจ้ง",
    image:
      "/images/room3.jpg",
    isAvailable: true,
    priceHalfDayInternal: 3000,
  },
]);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="relative pt-32 pb-40 lg:pt-40 lg:pb-48 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img 
          src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp" 
          alt="MFU Background" 
          class="w-full h-full object-cover object-center filter brightness-50"
        />
        <div class="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-[#5c0517]/95"></div>
      </div>

      <div class="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
        <span class="inline-block py-1 px-3 rounded-full bg-red-500/20 text-[#d4af37] border border-[#d4af37]/30 text-sm font-bold tracking-wider mb-4 backdrop-blur-sm">
          MFU PROPERTY RESERVATION
        </span>
        <h1 class="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
          ค้นหาและจองพื้นที่ <br class="hidden md:block" />
          <span class="text-[#d4af37]">มหาวิทยาลัยแม่ฟ้าหลวง</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-200 mb-12 font-medium max-w-2xl mx-auto drop-shadow">
          ระบบจองห้องประชุม ลานกิจกรรม และพื้นที่ส่วนกลาง สะดวก รวดเร็ว เช็คคิวว่างได้ตลอด 24 ชั่วโมง
        </p>

        <div class="bg-white p-2 md:rounded-full rounded-3xl shadow-2xl flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto border border-gray-100 transform translate-y-8">
          <form @submit.prevent="handleSearch" class="w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
            
            <div class="flex-1 px-6 py-3 md:py-2 flex items-center hover:bg-gray-50 rounded-t-3xl md:rounded-l-full md:rounded-tr-none cursor-text transition-colors">
              <div class="text-red-700 mr-3 text-lg"><i class="fas fa-search"></i></div>
              <div class="w-full text-left">
                <label class="block text-xs font-bold text-gray-800 uppercase tracking-wide">ค้นหา</label>
                <input 
                  type="text" 
                  v-model="searchParams.query" 
                  placeholder="ชื่อห้อง หรือ อาคาร..." 
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 placeholder-gray-400 outline-none" 
                />
              </div>
            </div>

            <div class="flex-1 px-6 py-3 md:py-2 flex items-center hover:bg-gray-50 cursor-text transition-colors">
              <div class="text-red-700 mr-3 text-lg"><i class="far fa-calendar-alt"></i></div>
              <div class="w-full text-left">
                <label class="block text-xs font-bold text-gray-800 uppercase tracking-wide">วันที่ใช้งาน</label>
                <input 
                  type="date" 
                  v-model="searchParams.date" 
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 outline-none" 
                />
              </div>
            </div>

            <div class="flex-1 px-6 py-3 md:py-2 flex items-center hover:bg-gray-50 cursor-pointer transition-colors">
              <div class="text-red-700 mr-3 text-lg"><i class="fas fa-layer-group"></i></div>
              <div class="w-full text-left">
                <label class="block text-xs font-bold text-gray-800 uppercase tracking-wide">ประเภทพื้นที่</label>
                <select 
                  v-model="searchParams.location" 
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-gray-600 outline-none cursor-pointer appearance-none"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="ห้องประชุม">ห้องประชุม</option>
                  <option value="ห้องบรรยาย">ห้องบรรยาย</option>
                  <option value="ลานกิจกรรม">ลานกิจกรรมกลางแจ้ง</option>
                </select>
              </div>
            </div>

            <div class="px-2 py-2 w-full md:w-auto mt-2 md:mt-0">
              <button 
                type="submit" 
                class="w-full md:w-auto bg-[#ba0b2f] hover:bg-[#8c0823] text-white text-base font-bold py-4 md:py-3 px-8 rounded-2xl md:rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex justify-center items-center gap-2 transform hover:scale-105"
              >
                <i class="fas fa-search"></i> <span>ค้นหา</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-10">
      <div class="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span class="text-[#ba0b2f]"><i class="fas fa-star"></i></span> พื้นที่แนะนำ
          </h2>
          <p class="text-gray-500 mt-2 text-lg">ห้องยอดนิยมที่ถูกจองบ่อยที่สุดในมหาวิทยาลัย</p>
        </div>
        <router-link
          to="/rooms"
          class="text-[#ba0b2f] font-bold hover:text-[#8c0823] hover:bg-red-50 px-5 py-2.5 rounded-full transition-all flex items-center gap-2"
        >
          ดูห้องทั้งหมด <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RoomCard v-for="room in featuredRooms" :key="room.id" :room="room" />
      </div>
    </div>
  </div>
</template>