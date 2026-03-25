<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;

const room = ref(null);
const loading = ref(true);

// จำลองข้อมูลคิวที่ถูกจองแล้วของห้องนี้
const bookedSlots = ref([
  {
    date: "2026-03-25",
    time: "ครึ่งวันเช้า (08:00 - 12:00)",
    status: "จองแล้ว",
  },
  { date: "2026-03-26", time: "เต็มวัน (08:00 - 17:00)", status: "จองแล้ว" },
]);

const fetchRoomDetail = () => {
  setTimeout(() => {
    room.value = {
      id: roomId,
      name:
        roomId == 1
          ? "ห้องประชุม ท่าสุด,นางแล,แม่ข้าวต้ม,ริมกก (AD)"
          : "ห้องประชุมคำมอกหลวง",
      type: roomId == 1 ? "ห้องประชุมขนาดเล็ก" : "ห้องประชุมขนาดใหญ่",
      capacity: roomId == 1 ? 15 : 200,
      location: roomId == 1 ? "อาคารบริหาร (AD)" : "อาคาร M-Square",
      image:
        roomId == 1
          ? "https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      isAvailable: true,
      priceHalfDayInternal: roomId == 1 ? 2400 : 6000,
      priceFullDayInternal: roomId == 1 ? 3600 : 9000,
      description:
        "พื้นที่ถูกออกแบบมาเพื่อรองรับการใช้งานที่หลากหลาย พร้อมระบบโสตทัศนูปกรณ์ที่ทันสมัย สภาพแวดล้อมเงียบสงบ เหมาะสำหรับการจัดกิจกรรม ประชุม สัมมนา หรือการเรียนการสอน...",
      amenities: [
        "โปรเจคเตอร์ / จอทีวี",
        "กระดานไวท์บอร์ด",
        "เครื่องปรับอากาศ",
        "อินเทอร์เน็ต Wi-Fi",
        "จุดเสียบปลั๊กไฟ",
        "โต๊ะ-เก้าอี้ปรับเปลี่ยนรูปแบบได้",
      ],
    };
    loading.value = false;
  }, 500);
};

onMounted(() => fetchRoomDetail());

const goBack = () => router.push("/rooms");
const goToBooking = () => router.push(`/booking/${roomId}`);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

</script>

<template>
  <div class="bg-gray-50 min-h-screen pb-20">
    <div v-if="loading" class="flex flex-col justify-center items-center h-96">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ba0b2f]"
      ></div>
    </div>

    <div v-else-if="room" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        @click="goBack"
        class="mb-6 flex items-center text-gray-600 hover:text-[#ba0b2f] font-semibold transition-colors"
      >
        <span class="mr-2">&larr;</span> ย้อนกลับไปหน้ารายการ
      </button>

      <div
        class="w-full h-100 md:h-125 rounded-2xl overflow-hidden mb-8 shadow-md relative"
      >
        <img
          :src="room.image"
          :alt="room.name"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div>
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              {{ room.name }}
            </h1>
            <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span
                class="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                >📍 {{ room.location }}</span
              >
              <span
                class="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                >👥 รองรับสูงสุด {{ room.capacity }} ท่าน</span
              >
            </div>
            <p class="text-gray-600 leading-relaxed">{{ room.description }}</p>
          </div>

          <hr class="border-gray-200" />

          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              🗓️ ตารางคิวที่ถูกจองแล้ว
            </h3>
            <div
              v-if="bookedSlots.length > 0"
              class="bg-white rounded-xl border border-red-100 overflow-hidden"
            >
              <div
                v-for="(slot, index) in bookedSlots"
                :key="index"
                class="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-red-50"
              >
                <div>
                  <span class="font-semibold text-gray-800">{{
                    formatDate(slot.date)
                  }}</span>
                  <span class="ml-3 text-sm text-gray-600">{{
                    slot.time
                  }}</span>
                </div>
                <span
                  class="text-xs font-bold bg-red-200 text-red-800 px-3 py-1 rounded-full"
                  >ไม่ว่าง</span
                >
              </div>
            </div>
            <p
              v-else
              class="text-gray-500 bg-green-50 px-4 py-3 rounded-lg border border-green-100"
            >
              ✅ ยังไม่มีคิวจองในสัปดาห์นี้ คุณสามารถเลือกจองเวลาใดก็ได้
            </p>
          </div>

          <hr class="border-gray-200" />

          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              สิ่งอำนวยความสะดวก
            </h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              <li
                v-for="(item, index) in room.amenities"
                :key="index"
                class="flex items-center text-gray-700"
              >
                <span class="text-green-500 mr-2">✓</span> {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div
            class="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24"
          >
            <h3 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
              อัตราค่าบริการ
            </h3>
            <div class="space-y-4 mb-8">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">ครึ่งวัน (เช้า/บ่าย)</span>
                <span class="text-xl font-bold text-[#ba0b2f]"
                  >฿{{ room.priceHalfDayInternal.toLocaleString() }}</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">เต็มวัน</span>
                <span class="text-xl font-bold text-[#ba0b2f]"
                  >฿{{ room.priceFullDayInternal.toLocaleString() }}</span
                >
              </div>
            </div>
            <button
              @click="goToBooking"
              class="w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-md hover:shadow-xl bg-[#ba0b2f] hover:bg-[#8c0823]"
            >
              ดำเนินการจองห้อง
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
