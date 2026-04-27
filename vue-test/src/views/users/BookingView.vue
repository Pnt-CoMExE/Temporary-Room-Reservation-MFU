<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
// ดึงพารามิเตอร์ id จาก URL
const roomId = route.params.id;

const loading = ref(true);
const room = ref(null);

// ข้อมูลอุปกรณ์เสริม (Add-ons)
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

const bookingForm = ref({
  userName: "",
  userType: "",
  date: "",
  duration: "",
  acceptTerms: false,
});

const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref("");

// ✨ ปรับโครงสร้างเป็นจำลองฐานข้อมูล ให้รองรับ /booking/1, /booking/2,... ได้ถูกต้อง
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
        priceHalfDayExternal: 6000,
        priceFullDayExternal: 10000,
      },
    };

    // เช็คว่า ID ที่ส่งมาตรงกับห้องไหน ถ้าไม่ตรงให้ดีฟอลต์เป็นห้อง 1
    if (roomsDatabase[roomId]) {
      room.value = roomsDatabase[roomId];
    } else {
      room.value = roomsDatabase["1"];
    }

    loading.value = false;
  }, 400);
};

onMounted(() => fetchRoomData());

// คำนวณราคาสุทธิ (ค่าห้อง + อุปกรณ์เสริม)
const estimatedPrice = computed(() => {
  if (!room.value || !bookingForm.value.userType || !bookingForm.value.duration)
    return 0;

  const isHalfDay =
    bookingForm.value.duration === "half_morning" ||
    bookingForm.value.duration === "half_afternoon";
  let basePrice = 0;

  if (bookingForm.value.userType === "internal") {
    basePrice = isHalfDay
      ? room.value.priceHalfDayInternal
      : room.value.priceFullDayInternal;
  } else {
    basePrice = isHalfDay
      ? room.value.priceHalfDayExternal
      : room.value.priceFullDayExternal;
  }

  const addOnTotal = addOns.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return basePrice + addOnTotal;
});

const submitBooking = () => {
  if (!bookingForm.value.acceptTerms) {
    errorMessage.value = "กรุณายอมรับเงื่อนไขการใช้บริการก่อนทำการจอง";
    showErrorModal.value = true;
    return;
  }
  showSuccessModal.value = true;
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  router.push("/dashboard");
};
const goBack = () => router.push(`/rooms/${roomId}`);

// ฟังก์ชันจัดการกรณีรูปโหลดไม่ขึ้น
const onImageError = (e) => {
  e.target.src = "https://via.placeholder.com/800x450?text=MFU+Meeting+Room";
};
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen relative font-sans">
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
        class="max-w-7xl mx-auto px-4 w-full relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-10"
      >
        <div>
          <h1
            class="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2"
          >
            ยืนยันการจองห้อง
          </h1>
          <p class="text-gray-200 text-lg font-medium">
            กรอกข้อมูล เลือกอุปกรณ์เสริม และตรวจสอบรายละเอียด
          </p>
        </div>
        <button
          @click="goBack"
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
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden sticky top-24"
          >
            <div class="relative h-48 bg-gray-200">
              <img
                :src="room.image"
                :alt="room.name"
                @error="onImageError"
                class="w-full h-full object-cover"
              />
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
              <h3 class="text-xl font-bold text-gray-900 leading-snug mb-4">
                {{ room.name }}
              </h3>
              <div class="space-y-4 pt-4 border-t border-gray-100">
                <div class="flex items-start text-gray-600 gap-3">
                  <i class="fas fa-map-marker-alt text-[#d4af37] mt-1"></i>
                  <span class="text-sm font-medium leading-relaxed">{{
                    room.location
                  }}</span>
                </div>
              </div>
              <div
                v-if="estimatedPrice > 0"
                class="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100 text-center relative overflow-hidden"
              >
                <p
                  class="text-xs font-bold text-red-700 uppercase tracking-widest mb-2 relative z-10"
                >
                  ยอดชำระโดยประมาณ
                </p>
                <p class="text-4xl font-black text-[#ba0b2f] relative z-10">
                  ฿{{ estimatedPrice.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                    class="block text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase"
                    >ชื่อผู้จอง / หน่วยงาน
                    <span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    v-model="bookingForm.userName"
                    required
                    placeholder="ชื่อ-นามสกุล หรือชื่อหน่วยงาน"
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase"
                    >ประเภทหน่วยงาน <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="bookingForm.userType"
                    required
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  >
                    <option value="" disabled>-- เลือกประเภท --</option>
                    <option value="internal">หน่วยงานภายใน (มฟล.)</option>
                    <option value="external">
                      หน่วยงานภายนอก (บุคคลทั่วไป/บริษัท)
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase"
                    >วันที่ใช้งาน <span class="text-red-500">*</span></label
                  >
                  <input
                    type="date"
                    v-model="bookingForm.date"
                    required
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  />
                </div>
                <div class="md:col-span-2">
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase"
                    >ระยะเวลา <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="bookingForm.duration"
                    required
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                  >
                    <option value="" disabled>-- เลือกช่วงเวลา --</option>
                    <option value="half_morning">
                      ครึ่งวันเช้า (08:00 - 12:00 น.)
                    </option>
                    <option value="half_afternoon">
                      ครึ่งวันบ่าย (13:00 - 17:00 น.)
                    </option>
                    <option value="full">เต็มวัน (08:00 - 17:00 น.)</option>
                  </select>
                </div>
              </div>

              <div class="pt-4">
                <h2
                  class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4 border-b border-gray-100 pb-4"
                >
                  <span
                    class="w-10 h-10 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-lg shadow-md"
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
                      class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#ba0b2f] mx-auto mb-2 shadow-sm border border-gray-100"
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
                        class="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span class="text-sm font-black text-gray-900">{{
                        item.quantity
                      }}</span>
                      <button
                        type="button"
                        @click="item.quantity++"
                        class="w-8 h-8 rounded-lg bg-gray-900 text-white hover:bg-[#ba0b2f] transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="estimatedPrice > 0" class="pt-4">
                <h2
                  class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4 border-b border-gray-100 pb-4"
                >
                  <span
                    class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg shadow-md"
                    >3</span
                  >
                  ช่องทางการชำระเงิน
                </h2>
                <div
                  class="p-6 bg-linear-to-br from-green-50 to-white border border-green-100 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm"
                >
                  <div
                    class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-md text-3xl border-2 border-dashed border-green-200"
                  >
                    <i class="fas fa-qrcode"></i>
                  </div>
                  <div class="text-center sm:text-left">
                    <h3 class="text-lg font-bold text-gray-900 mb-1">
                      ชำระผ่านระบบ QR Code
                    </h3>
                    <p class="text-gray-600 text-sm leading-relaxed">
                      แอดมินอนุมัติแล้ว
                      ท่านสามารถสแกนจ่ายได้ทันทีผ่านหน้าแดชบอร์ด
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="flex items-start p-5 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <input
                  type="checkbox"
                  v-model="bookingForm.acceptTerms"
                  class="mt-1 w-5 h-5 text-[#ba0b2f] rounded border-gray-300 focus:ring-[#ba0b2f] cursor-pointer shadow-sm"
                />
                <label
                  class="ml-4 text-sm text-gray-600 leading-relaxed font-medium cursor-pointer"
                >
                  ยอมรับ
                  <a
                    href="#"
                    class="text-[#ba0b2f] font-bold underline hover:text-red-700"
                    >เงื่อนไขและข้อตกลง</a
                  >
                  การขอใช้พื้นที่และยืนยันข้อมูลเป็นความจริง
                </label>
              </div>

              <button
                type="submit"
                :disabled="!bookingForm.acceptTerms"
                class="w-full py-5 bg-[#ba0b2f] disabled:bg-gray-300 text-white font-black rounded-2xl shadow-xl hover:bg-[#8c0823] transition-all uppercase tracking-widest text-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                ยืนยันการส่งคำขอจอง <i class="fas fa-paper-plane ml-2"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div
        class="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center animate-fade-up border-t-8 border-green-500"
      >
        <div
          class="w-20 h-20 rounded-full bg-green-100 text-green-600 mx-auto mb-6 flex items-center justify-center text-4xl shadow-inner border-4 border-white"
        >
          <i class="fas fa-check"></i>
        </div>
        <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          ส่งคำขอสำเร็จ!
        </h3>
        <p class="text-gray-500 mb-8 font-medium">
          กรุณารอการอนุมัติและสแกน QR Code
          <br />ชำระเงินผ่านแดชบอร์ดในขั้นตอนถัดไป
        </p>
        <button
          @click="closeSuccessModal"
          class="w-full py-4 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg text-lg"
        >
          ไปยังแดชบอร์ด
        </button>
      </div>
    </div>
  </div>
</template>
