<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import RoomCard from "../components/RoomCard.vue";

const router = useRouter();

// ตัวแปรสำหรับฟอร์มค้นหา
const searchParams = ref({
  query: "",
  date: "",
  location: "",
});

// ฟังก์ชันเมื่อกดปุ่มค้นหา (จะพาไปหน้า Room List พร้อมแนบคำค้นหาไปที่ URL)
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

// ข้อมูลห้องจำลองสำหรับแสดงในหน้าแรก (ห้องแนะนำ 3 ห้อง)
const featuredRooms = ref([
  {
    id: 1,
    name: "ห้องประชุม ท่าสุด,นางแล,แม่ข้าวต้ม,ริมกก (AD)",
    type: "ห้องประชุม",
    capacity: 15,
    location: "อาคารบริหาร (AD)",
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
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
      "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    priceHalfDayInternal: 3000,
  },
]);
</script>

<template>
  <div>
    <header
      class="relative py-28 text-center bg-cover bg-center"
      style="
        background-image:
          linear-gradient(rgba(186, 11, 47, 0.85), rgba(186, 11, 47, 0.85)),
          url(&quot;https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&quot;);
      "
    >
      <div class="max-w-4xl mx-auto px-4 relative z-10">
        <h1
          class="text-4xl md:text-5xl font-extrabold text-[#d4af37] mb-4 drop-shadow-md"
        >
          ระบบบริหารจัดการและจองห้อง
        </h1>
        <p class="text-lg md:text-xl text-white opacity-90 mb-8">
          ค้นหาและจองพื้นที่ภายในมหาวิทยาลัยแม่ฟ้าหลวงได้ง่ายๆ ตลอด 24 ชั่วโมง
        </p>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div
        class="bg-white rounded-xl p-6 shadow-xl -mt-16 relative z-20 mb-16 border border-gray-100"
      >
        <form
          @submit.prevent="handleSearch"
          class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div class="md:col-span-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >ค้นหา</label
            >
            <input
              type="text"
              v-model="searchParams.query"
              placeholder="ชื่อห้อง หรือ อาคาร"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            />
          </div>

          <div class="md:col-span-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >วันที่ต้องการใช้งาน</label
            >
            <input
              type="date"
              v-model="searchParams.date"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            />
          </div>

          <div class="md:col-span-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >สถานที่ / ประเภทห้อง</label
            >
            <select
              v-model="searchParams.location"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            >
              <option value="">ทั้งหมด</option>
              <option value="ห้องประชุม">ห้องประชุม</option>
              <option value="ห้องบรรยาย">ห้องบรรยาย</option>
              <option value="ลานกิจกรรม">ลานกิจกรรมกลางแจ้ง</option>
            </select>
          </div>

          <div class="md:col-span-1">
            <button
              type="submit"
              class="w-full bg-[#ba0b2f] hover:bg-[#8c0823] text-white text-lg font-bold py-3 px-4 rounded-lg transition-colors shadow-md flex justify-center items-center"
            >
              <span class="mr-2">🔍</span> ค้นหาห้องว่าง
            </button>
          </div>
        </form>
      </div>

      <div class="mb-8 flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">พื้นที่แนะนำ</h2>
          <p class="text-gray-500 mt-2">ห้องยอดนิยมที่ถูกจองบ่อยที่สุด</p>
        </div>
        <router-link
          to="/rooms"
          class="text-[#ba0b2f] font-semibold hover:underline hidden sm:block"
        >
          ดูห้องทั้งหมด &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RoomCard v-for="room in featuredRooms" :key="room.id" :room="room" />
      </div>

      <div class="mt-8 text-center sm:hidden">
        <router-link
          to="/rooms"
          class="text-[#ba0b2f] font-semibold hover:underline"
        >
          ดูห้องทั้งหมด &rarr;
        </router-link>
      </div>
    </main>
  </div>
</template>
