<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import api, { getCookie } from "@/services/api";

interface RoomData {
  id: number;
  name: string;
  type: string;
  capacity: number;
  location: string;
  image: string;
  priceHalfDayInternal: number;
  priceFullDayInternal: number;
  priceHalfDayCoop: number;
  priceFullDayCoop: number;
  priceHalfDayExternal: number;
  priceFullDayExternal: number;
}

interface BookingRecord {
  date: string;
  duration: string;
}

interface AddonItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  iconName: string;
}

const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;

const loading = ref(true);
const room = ref<RoomData | null>(null);

// วันปัจจุบันในรูปแบบ YYYY-MM-DD สำหรับล็อก input min
const today = new Date().toISOString().split("T")[0];

const existingBookings = ref<BookingRecord[]>([]);

const bookingForm = ref({
  userName: "",
  userType: "",
  objective: "",
  date: "",
  duration: "",
  promoCode: "",
  acceptTerms: false,
});

const memoFile = ref<File | null>(null);
const memoFileName = ref("");
const memoInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  memoInput.value?.click();
};

const clearMemoFile = () => {
  memoFile.value = null;
  memoFileName.value = "";
  if (memoInput.value) {
    memoInput.value.value = "";
  }
};

const handleMemoFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "ไฟล์ไม่ถูกต้อง",
        text: "กรุณาเลือกไฟล์ PDF เท่านั้น",
      });
      clearMemoFile();
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "ไฟล์มีขนาดใหญ่เกินไป",
        text: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10 MB",
      });
      clearMemoFile();
      return;
    }
    memoFile.value = file;
    memoFileName.value = file.name;
  }
};

const addOns = ref<AddonItem[]>([]);

// ✨ ตัวแปรระบบส่วนลด
const discountPercent = ref(0);
const discountAmount = ref(0);
const isPromoApplied = ref(false);
const promoMessage = ref("");
const promoLoading = ref(false);

// ดึงข้อมูลห้อง
const fetchRoomData = async () => {
  try {
    const response = await api.get(`/api/rooms/${roomId}`);
    const r = response.data;
    room.value = {
      ...r,
      location: r.type,
      image: r.image_url,
      priceHalfDayInternal: parseFloat(r.price_half_day_internal) || 0,
      priceFullDayInternal: parseFloat(r.price_full_day_internal) || 0,
      priceHalfDayCoop: parseFloat(r.price_half_day_co_organizer) || 0,
      priceFullDayCoop: parseFloat(r.price_full_day_co_organizer) || 0,
      priceHalfDayExternal: parseFloat(r.price_half_day_external) || 0,
      priceFullDayExternal: parseFloat(r.price_full_day_external) || 0,
    };
    
    // ดึงข้อมูลอุปกรณ์เสริมด้วย
    const addonsResponse = await api.get("/api/addons");
    addOns.value = addonsResponse.data.map((a: any) => ({
      id: a.id,
      name: a.name,
      price: parseFloat(a.price_per_unit) || 0,
      unit: a.name.includes('โต๊ะ') || a.name.includes('เก้าอี้') ? 'ตัว' : 'ชุด',
      quantity: 0,
      iconName: a.name.includes('โต๊ะ') ? 'table' : a.name.includes('เก้าอี้') ? 'chair' : 'microphone'
    }));

    // ดึงคิวการจองที่มีอยู่แล้วของห้องนี้เพื่อล็อควันที่
    const bookingsResponse = await api.get(`/api/rooms/${roomId}/bookings`);
    existingBookings.value = bookingsResponse.data.map((b: any) => ({
      date: b.booking_date.split('T')[0],
      duration: b.time_slot
    }));
    
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchRoomData());

const dateStatus = computed(() => {
  if (!bookingForm.value.date) return null;
  const bookingsForDate = existingBookings.value.filter(
    (b) => b.date === bookingForm.value.date,
  );
  
  if (bookingsForDate.length === 0) return "available";
  
  // หากมีคนจองเต็มวันไปแล้ว -> เต็ม
  if (bookingsForDate.some(b => b.duration === 'full')) return 'full';
  
  // หากจองครึ่งวันไปแล้วทั้งสองช่วง -> เต็ม
  const hasMorning = bookingsForDate.some(b => b.duration === 'half_morning');
  const hasAfternoon = bookingsForDate.some(b => b.duration === 'half_afternoon');
  
  if (hasMorning && hasAfternoon) return 'full';
  if (hasMorning) return 'half_morning';
  if (hasAfternoon) return 'half_afternoon';

  return "available";
});

watch(
  () => bookingForm.value.date,
  () => {
    bookingForm.value.duration = "";
  },
);

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

// ✨ คำนวณราคาแบบยังไม่หักส่วนลด (Subtotal)
const subTotalPrice = computed(() => {
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

// ✨ คำนวณราคาสุทธิ (หักส่วนลดแล้ว)
const finalPrice = computed(() => {
  return Math.max(0, subTotalPrice.value - discountAmount.value);
});

// ✨ ฟังก์ชันตรวจสอบโค้ดโปรโมชั่น → ดึงจาก API จริง
const applyPromoCode = async () => {
  const code = bookingForm.value.promoCode.trim();
  if (!code) return;

  if (subTotalPrice.value === 0) {
    promoMessage.value = "กรุณาเลือกประเภทหน่วยงานและช่วงเวลาก่อนใช้ส่วนลด";
    isPromoApplied.value = false;
    discountAmount.value = 0;
    return;
  }

  promoLoading.value = true;
  try {
    const res = await api.post("/api/promo-codes/validate", { code });
    const promo = res.data;
    discountPercent.value = promo.discount;
    discountAmount.value = Math.round(subTotalPrice.value * (promo.discount / 100));
    isPromoApplied.value = true;
    promoMessage.value = `✅ ${promo.message}`;
  } catch (err: any) {
    discountAmount.value = 0;
    discountPercent.value = 0;
    isPromoApplied.value = false;
    promoMessage.value = err.response?.data?.message || "รหัสโปรโมชั่นไม่ถูกต้อง";
  } finally {
    promoLoading.value = false;
  }
};

const submitting = ref(false);

const submitBooking = async () => {
  if (!bookingForm.value.acceptTerms) {
    Swal.fire({
      icon: "warning",
      title: "คำเตือน",
      text: "กรุณายอมรับเงื่อนไขการใช้บริการ",
      confirmButtonColor: "#ba0b2f",
    });
    return;
  }

  // เตรียมข้อมูล Add-ons
  const selectedAddons = addOns.value
    .filter((a: AddonItem) => a.quantity > 0)
    .map((a: AddonItem) => ({
      addon_id: a.id,
      quantity: a.quantity,
      unit_price: a.price,
      total_price: a.price * a.quantity
    }));

  const token = getCookie("mfu_token");
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId;
    } catch(e) {}
  }

  if (!memoFile.value) {
    Swal.fire({
      icon: "warning",
      title: "กรุณาแนบเอกสาร",
      text: "ต้องแนบหนังสือบันทึกข้อความ (ไฟล์ PDF) ก่อนส่งคำขอจอง",
      confirmButtonColor: "#ba0b2f",
    });
    return;
  }

  const formData = new FormData();
  formData.append("memoDocument", memoFile.value);
  formData.append("userId", String(userId));
  formData.append("roomId", roomId);
  formData.append("userType", bookingForm.value.userType);
  formData.append("partnerName", bookingForm.value.userName);
  formData.append("bookingDate", bookingForm.value.date);
  formData.append("timeSlot", bookingForm.value.duration);
  formData.append("objective", bookingForm.value.objective || "การจัดกิจกรรม/ประชุม");
  formData.append("roomPrice", String(bookingForm.value.duration === 'full' ? currentPriceFullDay.value : currentPriceHalfDay.value));
  formData.append("addonsPrice", String(addOns.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)));
  formData.append("totalPrice", String(finalPrice.value));
  formData.append("addons", JSON.stringify(selectedAddons));
  if (isPromoApplied.value && bookingForm.value.promoCode) {
    formData.append("promoCode", bookingForm.value.promoCode.trim().toUpperCase());
  }

  submitting.value = true;
  try {
    await api.post("/api/bookings", formData);
    
    Swal.fire({
      title: '<h2 class="text-2xl font-black text-gray-900 mt-2">ส่งคำขอสำเร็จ!</h2>',
      html: '<p class="text-gray-500 font-medium leading-relaxed">กรุณารอการอนุมัติและสแกน QR Code<br />ในขั้นตอนถัดไป</p>',
      icon: "success",
      confirmButtonText: "ไปยังแดชบอร์ด",
      customClass: {
        popup: "rounded-[2rem] p-10 border-t-8 border-green-500",
        confirmButton: "bg-[#ba0b2f] text-white font-bold rounded-xl px-10 py-4 mt-4 cursor-pointer w-full",
      },
    }).then(() => router.push("/dashboard"));
  } catch (err: any) {
    console.error("Booking error:", err);
    const errorMsg = err.response?.data?.message || "ไม่สามารถส่งคำขอจองได้ในขณะนี้";
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: errorMsg,
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen relative font-sans">
    <!-- Header -->
    <div class="relative pt-20 pb-32 flex items-center overflow-hidden">
      <div class="absolute inset-0 z-0">
        <picture>
          <source srcset="/images/mfu-bg.avif" type="image/avif">
          <source srcset="/images/mfu-bg.webp" type="image/webp">
          <img
            src="/images/mfu-bg.jpg"
            class="w-full h-full object-cover filter brightness-[0.4]"
          />
        </picture>
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
          <font-awesome-icon icon="arrow-left" /> ย้อนกลับ
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
              <img :src="room?.image" loading="lazy" class="w-full h-full object-cover" />
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
                {{ room?.name }}
              </h3>
              <p class="text-sm text-gray-500 mb-6 flex items-start gap-2">
                <font-awesome-icon icon="map-marker-alt" class="text-[#d4af37]" />
                {{ room?.location }}
              </p>

              <div
                v-if="subTotalPrice > 0"
                class="p-6 bg-red-50 rounded-2xl border border-red-100 relative overflow-hidden"
              >
                <p
                  class="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 text-center"
                >
                  ยอดชำระโดยประมาณ
                </p>

                <!-- ✨ แสดงราคาก่อนหักส่วนลด -->
                <div
                  class="flex justify-between items-center mb-1 text-sm font-medium text-gray-600"
                >
                  <span>ค่าบริการสุทธิ</span>
                  <span>฿{{ subTotalPrice.toLocaleString() }}</span>
                </div>

                <!-- ✨ แสดงส่วนลด (ถ้ามี) -->
                <div
                  v-if="discountAmount > 0"
                  class="flex justify-between items-center mb-3 text-sm font-bold text-green-600 border-b border-red-200/50 pb-3"
                >
                  <span>ส่วนลดโปรโมชั่น</span>
                  <span>- ฿{{ discountAmount.toLocaleString() }}</span>
                </div>

                <!-- ✨ แสดงราคาสุทธิ -->
                <div class="text-center mt-2">
                  <p class="text-4xl font-black text-[#ba0b2f]">
                    ฿{{ finalPrice.toLocaleString() }}
                  </p>
                </div>
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
                  <p
                    v-if="dateStatus === 'full'"
                    class="text-red-500 text-[10px] font-bold mt-1 animate-pulse"
                  >
                    <font-awesome-icon icon="exclamation-triangle" />
                    วันนี้ถูกจองเต็มวันแล้ว กรุณาเลือกวันอื่น
                  </p>
                </div>

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

                <!-- ✅ ฟิลด์วัตถุประสงค์ -->
                <div class="md:col-span-2">
                  <label
                    class="block text-xs font-bold text-gray-500 mb-2 uppercase"
                    >วัตถุประสงค์การใช้งาน *</label
                  >
                  <textarea
                    v-model="bookingForm.objective"
                    required
                    rows="3"
                    placeholder="ระบุวัตถุประสงค์การใช้งาน เช่น ประชุมโครงการ, จัดงานสัมมนา..."
                    class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- ✅ ฟิลด์แนบหนังสือบันทึกข้อความ -->
              <div class="md:col-span-2">
                <label
                  class="block text-xs font-bold text-gray-500 mb-2 uppercase"
                >
                  แนบหนังสือบันทึกข้อความ *
                </label>
                <div
                  class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-[#ba0b2f] hover:bg-red-50/30"
                  :class="
                    memoFileName
                      ? 'border-green-400 bg-green-50/50'
                      : 'border-gray-300 bg-gray-50'
                  "
                  @click="triggerFileInput"
                >
                  <input
                    ref="memoInput"
                    type="file"
                    accept=".pdf"
                    class="hidden"
                    @change="handleMemoFile"
                  />
                  <template v-if="memoFileName">
                    <font-awesome-icon icon="file-pdf" class="text-3xl text-green-600 mb-2" />
                    <p class="font-bold text-gray-900 text-sm">
                      {{ memoFileName }}
                    </p>
                    <p
                      class="text-[10px] text-gray-400 mt-1 font-medium"
                    >
                      ไฟล์ PDF พร้อมแนบ
                    </p>
                    <button
                      type="button"
                      @click.stop="clearMemoFile"
                      class="mt-2 text-xs text-red-500 font-bold hover:text-red-700"
                    >
                      <font-awesome-icon icon="times" class="mr-1" />เปลี่ยนไฟล์
                    </button>
                  </template>
                  <template v-else><font-awesome-icon icon="cloud-upload-alt" class="text-3xl text-gray-300 mb-2" />
                    <p class="font-bold text-gray-600 text-sm">
                      คลิกเพื่อเลือกไฟล์ PDF
                    </p>
                    <p class="text-[10px] text-gray-400 mt-1 font-medium">
                      เฉพาะไฟล์ PDF ขนาดไม่เกิน 10 MB เท่านั้น
                    </p>
                  </template>
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
                      <font-awesome-icon :icon="item.iconName" />
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

              <!-- ✨ โปรโมชั่นโค้ด (ตาม Requirement) ✨ -->
              <div class="pt-4">
                <h2
                  class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4 border-b border-gray-100 pb-4"
                >
                  <span
                    class="w-10 h-10 bg-[#d4af37] text-white rounded-full flex items-center justify-center text-lg"
                    >3</span
                  >
                  รหัสโปรโมชั่น / ส่วนลด
                </h2>
                <div
                  class="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  <div class="flex-1 w-full">
                    <input
                      type="text"
                      v-model="bookingForm.promoCode"
                      placeholder="ระบุโค้ดส่วนลด (เช่น MFU2026)"
                      class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none uppercase shadow-sm"
                      :disabled="isPromoApplied"
                    />
                  </div>
                  <button
                    type="button"
                    @click="
                      isPromoApplied
                        ? ((isPromoApplied = false),
                          (discountAmount = 0),
                          (discountPercent = 0),
                          (bookingForm.promoCode = ''),
                          (promoMessage = ''))
                        : applyPromoCode()
                    "
                    :disabled="promoLoading"
                    class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
                    :class="
                      isPromoApplied
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-900 text-white hover:bg-black'
                    "
                  >
                    <span v-if="promoLoading"><font-awesome-icon icon="spinner" spin class="mr-1" />กำลังตรวจสอบ...</span>
                    <span v-else>{{ isPromoApplied ? "ยกเลิกโค้ด" : "ใช้ส่วนลด" }}</span>
                  </button>
                </div>
                <p
                  v-if="promoMessage"
                  class="text-xs font-bold mt-2"
                  :class="isPromoApplied ? 'text-green-600' : 'text-red-500'"
                >
                  <font-awesome-icon v-if="isPromoApplied" icon="check-circle" />
                  <font-awesome-icon v-else icon="exclamation-circle" />
                  {{ promoMessage }}
                </p>
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
                :disabled="!bookingForm.acceptTerms || dateStatus === 'full' || submitting"
                class="w-full py-5 bg-[#ba0b2f] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl hover:bg-[#8c0823] transition-all uppercase tracking-widest text-lg cursor-pointer transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <template v-if="submitting">
                  <font-awesome-icon icon="spinner" spin /> กำลังส่งข้อมูลคำขอ...
                </template>
                <template v-else>
                  ยืนยันการส่งคำขอจอง <font-awesome-icon icon="paper-plane" />
                </template>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
