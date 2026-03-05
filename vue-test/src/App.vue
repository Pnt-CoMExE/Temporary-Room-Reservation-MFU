<script setup>
import { ref, computed } from "vue";

const searchQuery = ref("");
const selectedType = ref("");
const selectedCapacity = ref("");
const sortBy = ref("default");

const isModalOpen = ref(false);

const bookingForm = ref({
  roomName: "",
  userName: "",
  userType: "",
  date: "",
  duration: "",
  selectedRoomData: null,
});

const rooms = ref([
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
    priceFullDayInternal: 3600,
    priceHalfDayMixed: 3600,
    priceFullDayMixed: 5400,
    priceHalfDayExternal: 4800,
    priceFullDayExternal: 7200,
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
    priceFullDayInternal: 9000,
    priceHalfDayMixed: 9000,
    priceFullDayMixed: 13500,
    priceHalfDayExternal: 12000,
    priceFullDayExternal: 18000,
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
    priceFullDayInternal: 4500,
    priceHalfDayMixed: 4500,
    priceFullDayMixed: 6750,
    priceHalfDayExternal: 6000,
    priceFullDayExternal: 9000,
  },
  {
    id: 4,
    name: "ห้องบรรยายประดู่แดง 1 , 2",
    type: "ห้องบรรยาย",
    capacity: 400,
    location: "อาคารพลเอก สำเภา ชูศรี",
    image:
      "https://images.unsplash.com/photo-1576085898323-218337e3e43c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    priceHalfDayInternal: 8200,
    priceFullDayInternal: 12300,
    priceHalfDayMixed: 12300,
    priceFullDayMixed: 18450,
    priceHalfDayExternal: 16400,
    priceFullDayExternal: 24600,
  },
  {
    id: 5,
    name: "ห้องปฏิบัติการคอมพิวเตอร์ S1",
    type: "ห้องปฏิบัติการ",
    capacity: 60,
    location: "อาคาร S1",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    priceHalfDayInternal: 4000,
    priceFullDayInternal: 6000,
    priceHalfDayMixed: 6000,
    priceFullDayMixed: 9000,
    priceHalfDayExternal: 8000,
    priceFullDayExternal: 12000,
  },
  {
    id: 6,
    name: "ห้องบรรยาย MI 306 (Co-working space)",
    type: "พื้นที่ทำงานร่วม",
    capacity: 60,
    location: "อาคาร I-Park ชั้น 3",
    image:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    isAvailable: true,
    priceHalfDayInternal: 3030,
    priceFullDayInternal: 4545,
    priceHalfDayMixed: 4545,
    priceFullDayMixed: 6818,
    priceHalfDayExternal: 6818,
    priceFullDayExternal: 9090,
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
  return result;
});

const openBookingModal = (room) => {
  bookingForm.value.selectedRoomData = room;
  bookingForm.value.roomName = room.name;
  bookingForm.value.userName = "";
  bookingForm.value.userType = "";
  bookingForm.value.date = "";
  bookingForm.value.duration = "";
  isModalOpen.value = true;
};

const closeBookingModal = () => {
  isModalOpen.value = false;
};

const calculateEstimatedPrice = () => {
  const room = bookingForm.value.selectedRoomData;
  const type = bookingForm.value.userType;
  const duration = bookingForm.value.duration;

  if (!room || !type || !duration) return 0;

  const isHalfDay =
    duration === "half_morning" || duration === "half_afternoon";

  if (type === "internal")
    return isHalfDay ? room.priceHalfDayInternal : room.priceFullDayInternal;
  if (type === "mixed")
    return isHalfDay ? room.priceHalfDayMixed : room.priceFullDayMixed;
  if (type === "external")
    return isHalfDay ? room.priceHalfDayExternal : room.priceFullDayExternal;
};

const submitBooking = () => {
  const data = bookingForm.value;
  const price = calculateEstimatedPrice();
  let durationText = data.duration === "full" ? "เต็มวัน" : "ครึ่งวัน";

  alert(
    `✅ ยืนยันการจองสำเร็จ!\n\nห้อง: ${data.roomName}\nผู้จอง: ${data.userName}\nวันที่: ${data.date} (${durationText})\nยอดชำระ: ${price.toLocaleString()} บาท`,
  );
  closeBookingModal();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <nav class="bg-[#ba0b2f] shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a href="#" class="text-xl font-bold text-white tracking-wide">
            <span class="text-[#d4af37]">MFU</span> Property
          </a>
          <div class="hidden md:flex space-x-6">
            <a
              href="#"
              class="text-white hover:text-[#d4af37] font-medium transition-colors"
              >หน้าแรก</a
            >
            <a
              href="#"
              class="text-gray-200 hover:text-[#d4af37] transition-colors"
              >ประวัติการจอง</a
            >
          </div>
        </div>
      </div>
    </nav>

    <header
      class="relative py-24 text-center bg-cover bg-center"
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
        <p class="text-lg md:text-xl text-white opacity-90">
          ส่วนจัดการทรัพย์สิน มหาวิทยาลัยแม่ฟ้าหลวง
        </p>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div
        class="bg-white rounded-xl p-4 sm:p-6 shadow-lg -mt-10 relative z-20 mb-12 border border-gray-100"
      >
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div class="md:col-span-3">
            <select
              v-model="selectedType"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            >
              <option value="">ประเภทห้อง (ทั้งหมด)</option>
              <option value="ห้องประชุม">ห้องประชุม</option>
              <option value="ห้องบรรยาย">ห้องบรรยาย</option>
              <option value="ห้องปฏิบัติการ">ห้องปฏิบัติการ</option>
              <option value="ลานกิจกรรม">ลานกิจกรรม</option>
              <option value="พื้นที่ทำงานร่วม">พื้นที่ทำงานร่วม</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <select
              v-model="selectedCapacity"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            >
              <option value="">ความจุ (ทั้งหมด)</option>
              <option value="small">1 - 50 ท่าน</option>
              <option value="medium">51 - 150 ท่าน</option>
              <option value="large">150 ท่านขึ้นไป</option>
            </select>
          </div>

          <div class="md:col-span-3">
            <select
              v-model="sortBy"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            >
              <option value="default">เรียงตามความเหมาะสม</option>
              <option value="capacity_asc">ความจุน้อย -> มาก</option>
              <option value="capacity_desc">ความจุมาก -> น้อย</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="ค้นหาชื่อห้อง..."
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
            />
          </div>

          <div class="md:col-span-2">
            <button
              class="w-full bg-[#ba0b2f] hover:bg-[#8c0823] text-white text-base font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
            >
              🔍 ค้นหา
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="room in filteredRooms"
          :key="room.id"
          class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 relative"
        >
          <span
            :class="room.isAvailable ? 'bg-green-500' : 'bg-gray-500'"
            class="absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md z-10"
          >
            {{ room.isAvailable ? "ว่าง" : "ไม่ว่าง" }}
          </span>

          <div class="overflow-hidden h-52">
            <img
              :src="room.image"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Room Image"
            />
          </div>

          <div class="p-6 flex flex-col grow">
            <h5 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {{ room.name }}
            </h5>

            <p class="text-sm text-gray-600 mb-3 flex items-center">
              <span class="mr-2">🔹</span> {{ room.type }} | 👥 รองรับ
              {{ room.capacity }} ท่าน
            </p>

            <p class="text-[#ba0b2f] font-semibold text-sm mb-3">
              💰 เริ่มต้น {{ room.priceHalfDayInternal.toLocaleString() }} บาท /
              ครึ่งวัน
            </p>

            <p class="text-xs text-gray-500 mb-6 grow flex items-end">
              📍 {{ room.location }}
            </p>

            <button
              :disabled="!room.isAvailable"
              @click="openBookingModal(room)"
              class="w-full py-3 rounded-xl font-bold text-white transition-colors"
              :class="
                room.isAvailable
                  ? 'bg-[#ba0b2f] hover:bg-[#8c0823] shadow-md hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              "
            >
              {{ room.isAvailable ? "ทำรายการจอง" : "เต็มแล้ว" }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredRooms.length === 0" class="text-center py-20">
        <p class="text-xl text-gray-500">ไม่พบห้องที่ตรงกับเงื่อนไขการค้นหา</p>
      </div>
    </main>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up"
      >
        <div
          class="bg-[#ba0b2f] text-white px-6 py-4 flex justify-between items-center"
        >
          <h3 class="text-xl font-bold">จองห้อง: {{ bookingForm.roomName }}</h3>
          <button
            @click="closeBookingModal"
            class="text-white hover:text-[#d4af37] text-3xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <div class="p-6 md:p-8 overflow-y-auto">
          <form @submit.prevent="submitBooking" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >ชื่อหน่วยงาน / ผู้จอง
                <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                v-model="bookingForm.userName"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all"
                placeholder="ระบุชื่อผู้จอง"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >ประเภทหน่วยงาน <span class="text-red-500">*</span></label
              >
              <select
                v-model="bookingForm.userType"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all text-gray-700"
              >
                <option value="" disabled>เลือกประเภท...</option>
                <option value="internal">หน่วยงานภายในมหาวิทยาลัย</option>
                <option value="mixed">หน่วยงานภายในร่วมกับภายนอก</option>
                <option value="external">หน่วยงานภายนอก</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >วันที่ต้องการจอง <span class="text-red-500">*</span></label
                >
                <input
                  type="date"
                  v-model="bookingForm.date"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all text-gray-700"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1"
                  >ระยะเวลา <span class="text-red-500">*</span></label
                >
                <select
                  v-model="bookingForm.duration"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ba0b2f] focus:border-[#ba0b2f] outline-none transition-all text-gray-700"
                >
                  <option value="" disabled>เลือกช่วงเวลา...</option>
                  <option value="half_morning">
                    ครึ่งวันเช้า (08:00 - 12:00)
                  </option>
                  <option value="half_afternoon">
                    ครึ่งวันบ่าย (13:00 - 17:00)
                  </option>
                  <option value="full">เต็มวัน (08:00 - 17:00)</option>
                </select>
              </div>
            </div>

            <div
              v-if="bookingForm.userType && bookingForm.duration"
              class="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center"
            >
              <span class="text-xl mr-3">💡</span>
              <div>
                <span class="block text-sm text-blue-600 mb-1"
                  >ยอดชำระโดยประมาณ</span
                >
                <strong class="text-2xl font-bold"
                  >{{ calculateEstimatedPrice().toLocaleString() }} บาท</strong
                >
              </div>
            </div>

            <div
              class="pt-6 mt-6 border-t border-gray-100 flex justify-end space-x-3"
            >
              <button
                type="button"
                @click="closeBookingModal"
                class="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition-colors flex items-center"
              >
                <span>✅ ยืนยันการจอง</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Niramit:wght@300;400;500;600;700&display=swap");

* {
  font-family: "Niramit", sans-serif;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
</style>
