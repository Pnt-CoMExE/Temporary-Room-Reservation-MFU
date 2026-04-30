<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;

const loading = ref(true);
const room = ref(null);

// ✨ วันปัจจุบันในรูปแบบ YYYY-MM-DD สำหรับล็อก input min
const today = new Date().toISOString().split("T")[0];

// ✨ จำลองข้อมูลการจองที่มีอยู่แล้ว (สำหรับตรวจสอบคิวว่างใน 1 สัปดาห์ข้างหน้า)
const existingBookings = ref([
  { date: "2026-05-01", duration: "full" }, // วันพรุ่งนี้เต็มวัน
  { date: "2026-05-03", duration: "half_morning" }, // วันที่ 3 จองเช้าแล้ว
  { date: "2026-05-04", duration: "half_afternoon" }, // วันที่ 4 จองบ่ายแล้ว
]);

const bookingForm = ref({
  userName: "",
  userType: "",
  date: "",
  duration: "",
  acceptTerms: false,
});

const addOns = ref([
  {
    id: 1,
    name: "โต๊ะเอนกประสงค์",
    price: 50,
    unit: "ตัว",
    quantity: 0,
    icon: "fas fa-table",
  },
  {
    id: 2,
    name: "เก้าอี้เบาะนวม",
    price: 10,
    unit: "ตัว",
    quantity: 0,
    icon: "fas fa-chair",
  },
  {
    id: 3,
    name: "ไมโครโฟนไร้สาย",
    price: 200,
    unit: "ชุด",
    quantity: 0,
    icon: "fas fa-microphone",
  },
]);

// ดึงข้อมูลห้อง (เหมือนเดิม)
const fetchRoomData = () => {
  setTimeout(() => {
    const roomsDatabase = {
      1: {
        id: 1,
        name: "ห้องประชุม ท่าสุด, นางแล, แม่ข้าวต้ม, ริมกก (AD)",
        location: "อาคารบริหาร (AD) ชั้น 1",
        image:
          "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1000&auto=format&fit=crop",
        priceHalfDayInternal: 2400,
        priceFullDayInternal: 3600,
        priceHalfDayCoop: 3600,
        priceFullDayCoop: 5400,
        priceHalfDayExternal: 4800,
        priceFullDayExternal: 7200,
      },
      2: {
        id: 2,
        name: "ห้องประชุมคำมอกหลวง",
        location: "อาคาร M-Square",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000&auto=format&fit=crop",
        priceHalfDayInternal: 6000,
        priceFullDayInternal: 10000,
        priceHalfDayCoop: 9000,
        priceFullDayCoop: 15000,
        priceHalfDayExternal: 12000,
        priceFullDayExternal: 20000,
      },
      3: {
        id: 3,
        name: "ลานกิจกรรม ลานประดู่แดง",
        location: "ลานกิจกรรมกลางแจ้ง",
        image:
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000&auto=format&fit=crop",
        priceHalfDayInternal: 3000,
        priceFullDayInternal: 5000,
        priceHalfDayCoop: 4500,
        priceFullDayCoop: 7500,
        priceHalfDayExternal: 6000,
        priceFullDayExternal: 10000,
      },
    };
    room.value = roomsDatabase[roomId] || roomsDatabase["1"];
    loading.value = false;
  }, 400);
};

onMounted(() => fetchRoomData());

// ✨ ตรวจสอบสถานะความว่างของวันที่เลือก
const dateStatus = computed(() => {
  if (!bookingForm.value.date) return null;
  const booking = existingBookings.value.find(
    (b) => b.date === bookingForm.value.date,
  );
  if (!booking) return "available"; // ว่างทั้งวัน
  return booking.duration; // 'full', 'half_morning', หรือ 'half_afternoon'
});

// ✨ ล้างค่าช่วงเวลาถ้าเปลี่ยนวันที่แล้วชนกับคิวเดิม
watch(
  () => bookingForm.value.date,
  () => {
    bookingForm.value.duration = "";
  },
);

// การคำนวณราคา
const currentPriceHalfDay = computed(() => {
  if (!room.value || !bookingForm.value.userType) return 0;
  if (bookingForm.value.userType === "external")
    return room.value.priceHalfDayExternal;
  if (bookingForm.value.userType === "co_op")
    return room.value.priceHalfDayCoop;
  return room.value.priceHalfDayInternal;
});

const currentPriceFullDay = computed(() => {
  if (!room.value || !bookingForm.value.userType) return 0;
  if (bookingForm.value.userType === "external")
    return room.value.priceFullDayExternal;
  if (bookingForm.value.userType === "co_op")
    return room.value.priceFullDayCoop;
  return room.value.priceFullDayInternal;
});

const estimatedPrice = computed(() => {
  if (!room.value || !bookingForm.value.userType || !bookingForm.value.duration)
    return 0;
  const isHalfDay =
    bookingForm.value.duration === "half_morning" ||
    bookingForm.value.duration === "half_afternoon";
  const basePrice = isHalfDay
    ? currentPriceHalfDay.value
    : currentPriceFullDay.value;
  const addOnTotal = addOns.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return basePrice + addOnTotal;
});

const submitBooking = () => {
  if (!bookingForm.value.acceptTerms) {
    Swal.fire({
      icon: "warning",
      title: "คำเตือน",
      text: "กรุณายอมรับเงื่อนไขการใช้บริการ",
      confirmButtonColor: "#ba0b2f",
    });
    return;
  }
  Swal.fire({
    title:
      '<h2 class="text-2xl font-black text-gray-900 mt-2">ส่งคำขอสำเร็จ!</h2>',
    html: '<p class="text-gray-500 font-medium leading-relaxed">กรุณารอการอนุมัติและสแกน QR Code<br />ในขั้นตอนถัดไป</p>',
    icon: "success",
    confirmButtonText: "ไปยังแดชบอร์ด",
    customClass: {
      popup: "rounded-[2rem] p-10 border-t-8 border-green-500",
      confirmButton:
        "bg-[#ba0b2f] text-white font-bold rounded-xl px-10 py-4 mt-4 cursor-pointer w-full",
    },
  }).then(() => router.push("/dashboard"));
};
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen relative font-sans">
    <!-- Header -->
    <div class="relative pt-20 pb-32 flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          src="https://static.thairath.co.th/media/dFQROr7oWzulq5Fa5KTT15OVLSTQhWtkEWq8KGIaO0aDoI1BaMC9XRYanYRgyuBbONE.webp"
          class="w-full h-full object-cover filter brightness-[0.4]"
        />
        <div
          class="absolute inset-0 bg-linear-to-b from-black/80 via-[#ba0b2f]/40 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="max-w-7xl mx-auto px-4 w-full relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-10 text-white text-center md:text-left"
      >
        <div>
          <h1
            class="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg mb-2"
          >
            ยืนยันการจองห้อง
          </h1>
          <p class="text-gray-200 text-lg font-medium">
            ตรวจสอบวันว่างและกรอกข้อมูลการใช้งาน
          </p>
        </div>
        <button
          @click="router.push('/rooms')"
          class="bg-white/10 backdrop-blur-md hover:bg-white hover:text-[#ba0b2f] text-white px-6 py-2.5 rounded-full font-bold transition-all border border-white/30 flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <i class="fas fa-arrow-left"></i> ย้อนกลับ
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-t-[#ba0b2f] border-gray-200"
        ></div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-16 relative z-20"
      >
        <!-- Sidebar Summary -->
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden sticky top-24"
          >
            <div class="relative h-48 bg-gray-200">
              <img :src="room.image" class="w-full h-full object-cover" />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
              ></div>
              <div class="absolute bottom-4 left-4 text-white">
                <span
                  class="bg-[#ba0b2f] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-2 inline-block"
                  >Booking Summary</span
                >
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ room.name }}
              </h3>
              <p class="text-sm text-gray-500 mb-6 flex items-start gap-2">
                <i class="fas fa-map-marker-alt text-[#d4af37]"></i>
                {{ room.location }}
              </p>

              <div
                v-if="estimatedPrice > 0"
                class="p-6 bg-red-50 rounded-2xl border border-red-100 text-center relative overflow-hidden"
              >
                <p
                  class="text-xs font-bold text-red-700 uppercase tracking-widest mb-1"
                >
                  ยอดชำระโดยประมาณ
                </p>
                <p class="text-4xl font-black text-[#ba0b2f]">
                  ฿{{ estimatedPrice.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-8">
          <div
            class="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-white/50"
          >
            <h2
              class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-4 border-b border-gray-100 pb-4"
            >
              <span
                class="w-10 h-10 bg-[#ba0b2f] text-white rounded-full flex items-center justify-center text-lg"
                >1</span
              >
              กรอกข้อมูลการใช้งาน
            </h2>

            <form @submit.prevent="submitBooking" class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 uppercase"
                    >ชื่อผู้จอง / หน่วยงาน *</label
                  >
                  <input
                    type="text"
                    v-model="bookingForm.userName"
                    required
                    placeholder="ระบุชื่อ-นามสกุล หรือชื่อหน่วยงาน"
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 uppercase"
                    >ประเภทหน่วยงาน *</label
                  >
                  <select
                    v-model="bookingForm.userType"
                    required
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  >
                    <option value="" disabled>-- เลือกประเภท --</option>
                    <option value="internal">หน่วยงานภายใน (มฟล.)</option>
                    <option value="co_op">หน่วยงานร่วมจัด (Co-op)</option>
                    <option value="external">
                      หน่วยงานภายนอก (บุคคลทั่วไป/บริษัท)
                    </option>
                  </select>
                </div>

                <!-- ✨ ช่องเลือกวันที่ (ล็อกวันย้อนหลัง) -->
                <div>
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 uppercase"
                    >วันที่ใช้งาน *</label
                  >
                  <input
                    type="date"
                    v-model="bookingForm.date"
                    :min="today"
                    required
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  />
                  <!-- แจ้งเตือนกรณีจองเต็มวัน -->
                  <p
                    v-if="dateStatus === 'full'"
                    class="text-red-500 text-[10px] font-bold mt-1 animate-pulse"
                  >
                    <i class="fas fa-exclamation-triangle"></i>
                    วันนี้ถูกจองเต็มวันแล้ว กรุณาเลือกวันอื่น
                  </p>
                </div>

                <!-- ✨ ช่องเลือกช่วงเวลา (ปรับตามคิวที่มีอยู่) -->
                <div class="md:col-span-2">
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 uppercase"
                    >ระยะเวลา *</label
                  >
                  <select
                    v-model="bookingForm.duration"
                    :disabled="dateStatus === 'full'"
                    required
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>-- เลือกช่วงเวลา --</option>

                    <option
                      value="half_morning"
                      :disabled="dateStatus === 'half_morning'"
                    >
                      ครึ่งวันเช้า (08:00 - 12:00 น.)
                      {{ dateStatus === "half_morning" ? "[ไม่ว่าง]" : "" }}
                    </option>

                    <option
                      value="half_afternoon"
                      :disabled="dateStatus === 'half_afternoon'"
                    >
                      ครึ่งวันบ่าย (13:00 - 17:00 น.)
                      {{ dateStatus === "half_afternoon" ? "[ไม่ว่าง]" : "" }}
                    </option>

                    <option value="full" :disabled="dateStatus !== 'available'">
                      เต็มวัน (08:00 - 17:00 น.)
                      {{
                        dateStatus !== "available" && dateStatus !== null
                          ? "[ไม่ว่าง]"
                          : ""
                      }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- อุปกรณ์เสริม -->
              <div class="pt-4">
                <h2
                  class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4 border-b border-gray-100 pb-4"
                >
                  <span
                    class="w-10 h-10 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-lg"
                    >2</span
                  >
                  อุปกรณ์เสริม (Optional)
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    v-for="item in addOns"
                    :key="item.id"
                    class="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center transition-all hover:shadow-md"
                  >
                    <div
                      class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#ba0b2f] mx-auto mb-2 border border-gray-100 shadow-sm"
                    >
                      <i :class="item.icon"></i>
                    </div>
                    <p class="font-bold text-gray-800 text-xs mb-1">
                      {{ item.name }}
                    </p>
                    <p class="text-[10px] text-gray-400 mb-3">
                      ฿{{ item.price }} / {{ item.unit }}
                    </p>
                    <div class="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        @click="item.quantity > 0 ? item.quantity-- : 0"
                        class="w-8 h-8 rounded-lg bg-white border border-gray-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span class="text-sm font-black text-gray-900">{{
                        item.quantity
                      }}</span>
                      <button
                        type="button"
                        @click="item.quantity++"
                        class="w-8 h-8 rounded-lg bg-gray-900 text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex items-start p-5 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <input
                  type="checkbox"
                  v-model="bookingForm.acceptTerms"
                  id="terms"
                  class="mt-1 w-5 h-5 text-[#ba0b2f] rounded border-gray-300 focus:ring-[#ba0b2f] cursor-pointer"
                />
                <label
                  for="terms"
                  class="ml-4 text-sm text-gray-600 leading-relaxed cursor-pointer"
                >
                  ยอมรับ
                  <span class="text-[#ba0b2f] font-bold underline"
                    >เงื่อนไขและข้อตกลง</span
                  >
                  การขอใช้พื้นที่และยืนยันข้อมูลเป็นความจริง
                </label>
              </div>

              <button
                type="submit"
                :disabled="!bookingForm.acceptTerms || dateStatus === 'full'"
                class="w-full py-5 bg-[#ba0b2f] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl hover:bg-[#8c0823] transition-all uppercase tracking-widest text-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                ยืนยันการส่งคำขอจอง <i class="fas fa-paper-plane ml-2"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
