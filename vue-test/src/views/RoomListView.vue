<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import RoomCard from "../components/RoomCard.vue";

const route = useRoute();

// ข้อมูลตัวแปรสำหรับค้นหาและคัดกรอง
const searchQuery = ref("");
const selectedType = ref("");
const selectedCapacity = ref("");
const sortBy = ref("default");

// รับค่าที่ส่งมาจากหน้า Home (ถ้ามี) มาใส่ในตัวกรอง
onMounted(() => {
  if (route.query.q) searchQuery.value = route.query.q;
  if (route.query.date) {
    console.log("วันที่ต้องการใช้งาน:", route.query.date);
  }
  if (route.query.loc) selectedType.value = route.query.loc;
});

// ข้อมูลห้องจำลอง
const rooms = ref([
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
  {
    id: 4,
    name: "ห้องบรรยายประดู่แดง 1 , 2",
    type: "ห้องบรรยาย",
    capacity: 400,
    location: "อาคารพลเอก สำเภา ชูศรี",
    image:
      "/images/room4.jpg",
    isAvailable: true,
    priceHalfDayInternal: 8200,
  },
  {
    id: 5,
    name: "ห้องปฏิบัติการคอมพิวเตอร์ S1",
    type: "ห้องปฏิบัติการ",
    capacity: 60,
    location: "อาคาร S1",
    image:
      "/images/room5.jpg",
    isAvailable: false,
    priceHalfDayInternal: 4000,
  },
  {
    id: 6,
    name: "ห้องบรรยาย MI 306 (Co-working space)",
    type: "พื้นที่ทำงานร่วม",
    capacity: 60,
    location: "อาคาร I-Park ชั้น 3",
    image:
      "/images/room6.jpg",
    isAvailable: true,
    priceHalfDayInternal: 3030,
  },
]);

const filteredRooms = computed(() => {
  let result = rooms.value;
  if (searchQuery.value) {
    result = result.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }
  if (selectedType.value) {
    result = result.filter((r) => r.type === selectedType.value);
  }
  if (selectedCapacity.value === "small") {
    result = result.filter((r) => r.capacity <= 50);
  } else if (selectedCapacity.value === "medium") {
    result = result.filter((r) => r.capacity > 50 && r.capacity <= 150);
  } else if (selectedCapacity.value === "large") {
    result = result.filter((r) => r.capacity > 150);
  }

  if (sortBy.value === "capacity_asc") {
    result = result.slice().sort((a, b) => a.capacity - b.capacity);
  } else if (sortBy.value === "capacity_desc") {
    result = result.slice().sort((a, b) => b.capacity - a.capacity);
  } else if (sortBy.value === "price_asc") {
    result = result
      .slice()
      .sort((a, b) => a.priceHalfDayInternal - b.priceHalfDayInternal);
  }
  return result;
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="bg-[#ba0b2f] py-16 mb-10 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <h1 class="text-4xl font-extrabold text-white">
          ค้นหาพื้นที่และห้องประชุม
        </h1>
        <p class="text-red-100 mt-2 text-lg">
          เลือกพื้นที่ที่เหมาะกับกิจกรรมของคุณจากรายการทั้งหมดในมหาวิทยาลัยแม่ฟ้าหลวง
        </p>
      </div>
      <div
        class="absolute right-[-5%] bottom-[-20%] opacity-10 text-[15rem] font-bold text-white select-none pointer-events-none"
      >
        ROOMS
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div
        class="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-10 -mt-20 relative z-20"
      >
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >🔍 ค้นหาชื่อห้อง</label
            >
            <input
              type="text"
              v-model="searchQuery"
              placeholder="พิมพ์ชื่อห้อง หรืออาคาร..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >🏢 ประเภทห้อง</label
            >
            <select
              v-model="selectedType"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
            >
              <option value="">ทั้งหมด</option>
              <option value="ห้องประชุม">ห้องประชุม</option>
              <option value="ห้องบรรยาย">ห้องบรรยาย</option>
              <option value="ห้องปฏิบัติการ">ห้องปฏิบัติการ</option>
              <option value="ลานกิจกรรม">ลานกิจกรรม</option>
              <option value="พื้นที่ทำงานร่วม">พื้นที่ทำงานร่วม</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >👥 ความจุ (ท่าน)</label
            >
            <select
              v-model="selectedCapacity"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
            >
              <option value="">ทั้งหมด</option>
              <option value="small">1 - 50 ท่าน</option>
              <option value="medium">51 - 150 ท่าน</option>
              <option value="large">150 ท่านขึ้นไป</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >🔃 จัดเรียงตาม</label
            >
            <select
              v-model="sortBy"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
            >
              <option value="default">แนะนำ</option>
              <option value="price_asc">ราคา: ต่ำไปสูง</option>
              <option value="capacity_asc">ความจุ: น้อยไปมาก</option>
              <option value="capacity_desc">ความจุ: มากไปน้อย</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mb-8 flex items-center justify-between">
        <p class="text-gray-600 font-medium">
          พบห้องที่ตรงกับเงื่อนไขทั้งหมด
          <span class="text-[#ba0b2f] text-xl font-bold">{{
            filteredRooms.length
          }}</span>
          ห้อง
        </p>
        <button
          v-if="searchQuery || selectedType || selectedCapacity"
          @click="
            searchQuery = '';
            selectedType = '';
            selectedCapacity = '';
            sortBy = 'default';
          "
          class="text-sm font-bold text-[#ba0b2f] hover:underline"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RoomCard v-for="room in filteredRooms" :key="room.id" :room="room" />
      </div>

      <div
        v-if="filteredRooms.length === 0"
        class="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 mt-8 shadow-sm"
      >
        <div class="text-6xl mb-6">🔍</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">
          ไม่พบห้องที่คุณกำลังมองหา
        </h3>
        <p class="text-gray-500 max-w-xs mx-auto">
          ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูห้องพักรายการอื่นที่มีในระบบ
        </p>
      </div>
    </div>
  </div>
</template>
