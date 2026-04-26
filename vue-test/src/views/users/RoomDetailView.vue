<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;

const room = ref(null);
const loading = ref(true);

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
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen pb-24 font-sans">
    <div
      v-if="loading"
      class="flex flex-col justify-center items-center h-screen"
    >
      <div
        class="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#ba0b2f]"
      ></div>
    </div>

    <div v-else-if="room" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        @click="goBack"
        class="mb-8 flex items-center text-gray-500 hover:text-[#ba0b2f] font-bold transition-all group"
      >
        <div
          class="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform"
        >
          <i class="fas fa-arrow-left"></i>
        </div>
        ย้อนกลับไปหน้ารายการ
      </button>

      <div
        class="w-full h-100 md:h-125 rounded-3xl overflow-hidden mb-10 shadow-2xl relative"
      >
        <img
          :src="room.image"
          :alt="room.name"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
        ></div>
        <div class="absolute bottom-0 left-0 p-8 md:p-12 text-white">
          <span
            class="inline-block px-3 py-1 bg-[#ba0b2f] text-xs font-bold uppercase tracking-wider rounded-lg mb-4"
            >{{ room.type }}</span
          >
          <h1
            class="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight"
          >
            {{ room.name }}
          </h1>
          <div class="flex flex-wrap gap-4 text-sm font-medium">
            <span class="flex items-center gap-2"
              ><i class="fas fa-map-marker-alt text-[#d4af37]"></i>
              {{ room.location }}</span
            >
            <span class="text-gray-400">|</span>
            <span class="flex items-center gap-2"
              ><i class="fas fa-users text-[#d4af37]"></i> รองรับสูงสุด
              {{ room.capacity }} ท่าน</span
            >
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="lg:col-span-2 space-y-10">
          <section>
            <h3
              class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
            >
              <i class="fas fa-info-circle text-[#ba0b2f]"></i> รายละเอียด
            </h3>
            <p
              class="text-gray-600 leading-relaxed text-lg bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              {{ room.description }}
            </p>
          </section>

          <section>
            <h3
              class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
            >
              <i class="far fa-calendar-check text-[#ba0b2f]"></i>
              ตารางคิวที่ถูกจองแล้ว
            </h3>
            <div
              v-if="bookedSlots.length > 0"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div
                v-for="(slot, index) in bookedSlots"
                :key="index"
                class="px-6 py-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-red-50 text-[#ba0b2f] flex items-center justify-center"
                  >
                    <i class="far fa-clock"></i>
                  </div>
                  <div>
                    <span class="block font-bold text-gray-900">{{
                      formatDate(slot.date)
                    }}</span>
                    <span class="text-sm text-gray-500">{{ slot.time }}</span>
                  </div>
                </div>
                <span
                  class="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full uppercase tracking-wider"
                  >ไม่ว่าง</span
                >
              </div>
            </div>
            <div
              v-else
              class="bg-green-50/50 p-6 rounded-2xl border border-green-100 flex items-center gap-4 text-green-700"
            >
              <i class="fas fa-check-circle text-2xl"></i>
              <div>
                <p class="font-bold text-lg">ยังไม่มีคิวจองในสัปดาห์นี้</p>
                <p class="text-sm opacity-80">คุณสามารถเลือกจองเวลาใดก็ได้</p>
              </div>
            </div>
          </section>

          <section>
            <h3
              class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
            >
              <i class="fas fa-concierge-bell text-[#ba0b2f]"></i>
              สิ่งอำนวยความสะดวก
            </h3>
            <div
              class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <li
                  v-for="(item, index) in room.amenities"
                  :key="index"
                  class="flex items-center text-gray-700 font-medium"
                >
                  <div
                    class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-xs shrink-0"
                  >
                    <i class="fas fa-check"></i>
                  </div>
                  {{ item }}
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div class="lg:col-span-1">
          <div
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 sticky top-24"
          >
            <h3
              class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6"
            >
              อัตราค่าบริการ (บุคคลภายใน)
            </h3>

            <div class="space-y-4 mb-8">
              <div
                class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span class="text-gray-600 font-medium"
                  >ครึ่งวัน (เช้า/บ่าย)</span
                >
                <span class="text-xl font-black text-[#ba0b2f]"
                  >฿{{ room.priceHalfDayInternal.toLocaleString() }}</span
                >
              </div>
              <div
                class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span class="text-gray-600 font-medium">เต็มวัน</span>
                <span class="text-xl font-black text-[#ba0b2f]"
                  >฿{{ room.priceFullDayInternal.toLocaleString() }}</span
                >
              </div>
            </div>

            <button
              @click="goToBooking"
              class="w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg shadow-red-200 bg-[#ba0b2f] hover:bg-[#8c0823] transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              ดำเนินการจองห้อง <i class="fas fa-arrow-right text-sm"></i>
            </button>
            <p class="text-center text-xs text-gray-400 mt-4">
              *ราคานี้ยังไม่รวมอุปกรณ์เสริมเพิ่มเติม
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
