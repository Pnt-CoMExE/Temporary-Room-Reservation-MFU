<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import RoomCard from "@/components/room/RoomCard.vue";

const route = useRoute();
const searchQuery = ref("");
const selectedType = ref("");
const selectedCapacity = ref("");
const sortBy = ref("default");

onMounted(() => {
  if (route.query.q) searchQuery.value = route.query.q;
  if (route.query.date) console.log("วันที่ต้องการใช้งาน:", route.query.date);
  if (route.query.loc) selectedType.value = route.query.loc;
});

const rooms = ref([
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
  {
    id: 4,
    name: "ห้องบรรยายประดู่แดง 1 , 2",
    type: "ห้องบรรยาย",
    capacity: 400,
    location: "อาคารพลเอก สำเภา ชูศรี",
    image: "/images/room4.jpg",
    isAvailable: true,
    priceHalfDayInternal: 8200,
  },
  {
    id: 5,
    name: "ห้องปฏิบัติการคอมพิวเตอร์ S1",
    type: "ห้องปฏิบัติการ",
    capacity: 60,
    location: "อาคาร S1",
    image: "/images/room5.jpg",
    isAvailable: false,
    priceHalfDayInternal: 4000,
  },
  {
    id: 6,
    name: "ห้องบรรยาย MI 306 (Co-working space)",
    type: "พื้นที่ทำงานร่วม",
    capacity: 60,
    location: "อาคาร I-Park ชั้น 3",
    image: "/images/room6.jpg",
    isAvailable: true,
    priceHalfDayInternal: 3030,
  },
]);

const filteredRooms = computed(() => {
  let result = rooms.value;
  if (searchQuery.value)
    result = result.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  if (selectedType.value)
    result = result.filter((r) => r.type === selectedType.value);
  if (selectedCapacity.value === "small")
    result = result.filter((r) => r.capacity <= 50);
  else if (selectedCapacity.value === "medium")
    result = result.filter((r) => r.capacity > 50 && r.capacity <= 150);
  else if (selectedCapacity.value === "large")
    result = result.filter((r) => r.capacity > 150);

  if (sortBy.value === "capacity_asc")
    result = result.slice().sort((a, b) => a.capacity - b.capacity);
  else if (sortBy.value === "capacity_desc")
    result = result.slice().sort((a, b) => b.capacity - a.capacity);
  else if (sortBy.value === "price_asc")
    result = result
      .slice()
      .sort((a, b) => a.priceHalfDayInternal - b.priceHalfDayInternal);
  return result;
});
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen font-sans flex flex-col">
    <div
      class="relative pt-24 pb-40 lg:pt-32 lg:pb-48 flex items-center justify-center overflow-hidden"
    >
      <div class="absolute inset-0 z-0">
        <img
          src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp"
          alt="MFU Background"
          class="w-full h-full object-cover filter brightness-[0.6]"
        />
        <div
          class="absolute inset-0 bg-linear-to-b from-black/60 via-[#ba0b2f]/30 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="relative z-10 text-center px-4 w-full max-w-5xl mx-auto animate-fade-up"
      >
        <h1
          class="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg"
        >
          ค้นหาพื้นที่และห้องประชุม
        </h1>
        <p
          class="text-lg text-gray-200 font-medium max-w-2xl mx-auto drop-shadow"
        >
          เลือกพื้นที่ที่เหมาะกับกิจกรรมของคุณจากรายการทั้งหมดในมหาวิทยาลัย
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full grow">
      <div
        class="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 mb-12 -mt-24 relative z-20"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><i class="fas fa-search text-[#ba0b2f] mr-1"></i>
              ค้นหาชื่อห้อง</label
            >
            <input
              type="text"
              v-model="searchQuery"
              placeholder="พิมพ์ชื่อห้อง หรืออาคาร..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold"
            />
          </div>
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><i class="fas fa-building text-[#ba0b2f] mr-1"></i>
              ประเภทห้อง</label
            >
            <select
              v-model="selectedType"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold appearance-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="ห้องประชุม">ห้องประชุม</option>
              <option value="ห้องบรรยาย">ห้องบรรยาย</option>
              <option value="ลานกิจกรรม">ลานกิจกรรม</option>
            </select>
          </div>
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><i class="fas fa-users text-[#ba0b2f] mr-1"></i> ความจุ
              (ท่าน)</label
            >
            <select
              v-model="selectedCapacity"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold appearance-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="small">1 - 50 ท่าน</option>
              <option value="medium">51 - 150 ท่าน</option>
              <option value="large">150 ท่านขึ้นไป</option>
            </select>
          </div>
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><i class="fas fa-sort-amount-down text-[#ba0b2f] mr-1"></i>
              จัดเรียงตาม</label
            >
            <select
              v-model="sortBy"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold appearance-none"
            >
              <option value="default">แนะนำ</option>
              <option value="price_asc">ราคา: ต่ำไปสูง</option>
              <option value="capacity_asc">ความจุ: น้อยไปมาก</option>
              <option value="capacity_desc">ความจุ: มากไปน้อย</option>
            </select>
          </div>
        </div>
      </div>

      <div
        class="mb-8 flex items-center justify-between border-b border-gray-200 pb-4"
      >
        <p class="text-gray-600 font-medium text-lg">
          พบห้องที่ตรงกับเงื่อนไข
          <span class="text-[#ba0b2f] text-2xl font-black mx-1">{{
            filteredRooms.length
          }}</span>
          ห้อง
        </p>
        <button
          v-if="
            searchQuery ||
            selectedType ||
            selectedCapacity ||
            sortBy !== 'default'
          "
          @click="
            searchQuery = '';
            selectedType = '';
            selectedCapacity = '';
            sortBy = 'default';
          "
          class="text-sm font-bold text-[#ba0b2f] hover:text-[#8c0823] hover:underline flex items-center gap-1 transition-colors"
        >
          <i class="fas fa-times-circle"></i> ล้างตัวกรอง
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RoomCard v-for="room in filteredRooms" :key="room.id" :room="room" />
      </div>

      <div
        v-if="filteredRooms.length === 0"
        class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 mt-8 shadow-sm"
      >
        <div
          class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl text-gray-300 mx-auto mb-6"
        >
          <i class="fas fa-search-minus"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3">
          ไม่พบห้องที่คุณกำลังมองหา
        </h3>
        <p class="text-gray-500 max-w-sm mx-auto leading-relaxed">
          ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูห้องพักรายการอื่นที่มีในระบบ
        </p>
      </div>
    </div>
  </div>
</template>
