<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import api from "@/services/api";
import { getStoredUserId } from "@/utils/auth";
import { resolveRoomImage } from "@/utils/roomImage";
import { resolveAddonImage } from "@/utils/addonImage";
import { toDateKey } from "@/utils/dateKey";
import { withSwalTheme, swalConfirmBtnClass } from "@/utils/swalTheme";
import DateField from "@/components/common/DateField.vue";

const { t, locale } = useI18n();

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
  imageUrl: string;
}

import {
  translateRoomName,
  translateLocation,
  translateAddonName,
  translateAddonUnit,
} from "@/utils/translator";

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
  phone: "",
  objective: "",
  date: "",
  duration: "",
  promoCode: "",
  acceptTerms: false,
});

/** Map JWT/DB role → pricing tier used by booking form */
const toPricingUserType = (role: string | null | undefined): string => {
  if (role === "co_op" || role === "co_organizer") return "co_op";
  if (role === "external") return "external";
  // admin + internal (+ unknown) → internal rates
  return "internal";
};

const orgTypeLabel = computed(() => {
  const key = bookingForm.value.userType;
  if (key === "co_op") return "booking.org_coop";
  if (key === "external") return "booking.org_external";
  return "booking.org_internal";
});

const loadProfileIntoForm = async () => {
  try {
    const storedName = localStorage.getItem("userName") || "";
    const storedRole = localStorage.getItem("userRole") || "external";
    bookingForm.value.userName = storedName;
    bookingForm.value.userType = toPricingUserType(storedRole);

    const profileRes = await api.get("/api/user/profile");
    const p = profileRes.data;
    if (p) {
      const fullName = [p.firstname, p.lastname].filter(Boolean).join(" ").trim();
      if (fullName) bookingForm.value.userName = fullName;
      bookingForm.value.phone = p.phone_number || "";
      if (p.user_type) bookingForm.value.userType = toPricingUserType(p.user_type);
    }
  } catch (err) {
    console.error("Error loading profile for booking:", err);
  }
};

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
      Swal.fire(
        withSwalTheme({
          icon: "error",
          title: t("booking.invalid_file_title"),
          text: t("booking.invalid_file_text"),
        })
      );
      clearMemoFile();
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire(
        withSwalTheme({
          icon: "error",
          title: t("booking.file_too_large_title"),
          text: t("booking.file_too_large_text"),
        })
      );
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
      image: resolveRoomImage(r.image_url, r.id ?? r.name, r.type),
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
      unit: a.unit_name || (a.name.includes("โต๊ะ") || a.name.includes("เก้าอี้") ? "ตัว" : "ชุด"),
      quantity: 0,
      imageUrl: resolveAddonImage(a.name, a.image_url),
    }));

    // ดึงคิวการจองที่มีอยู่แล้วของห้องนี้เพื่อล็อควันที่
    const bookingsResponse = await api.get(`/api/rooms/${roomId}/bookings`);
    existingBookings.value = bookingsResponse.data.map((b: any) => ({
      date: toDateKey(b.booking_date),
      duration: b.time_slot
    }));
    
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchRoomData(), loadProfileIntoForm()]);
});

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

const roomOnlyPrice = computed(() => {
  if (!room.value || !bookingForm.value.userType || !bookingForm.value.duration)
    return 0;
  const isHalfDay =
    bookingForm.value.duration === "half_morning" ||
    bookingForm.value.duration === "half_afternoon";
  return isHalfDay ? currentPriceHalfDay.value : currentPriceFullDay.value;
});

const selectedAddOnLines = computed(() =>
  addOns.value.filter((a) => a.quantity > 0),
);

const addOnsTotalPrice = computed(() =>
  selectedAddOnLines.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  ),
);

// ✨ คำนวณราคาแบบยังไม่หักส่วนลด (Subtotal)
const subTotalPrice = computed(
  () => roomOnlyPrice.value + addOnsTotalPrice.value,
);

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
    discountPercent.value = Math.min(
      100,
      parseFloat(String(promo.discount ?? 0).toString().replace(/%/g, "")) || 0
    );
    discountAmount.value = Math.round(subTotalPrice.value * (discountPercent.value / 100));
    isPromoApplied.value = true;
    promoMessage.value = `✅ ใช้ส่วนลด ${discountPercent.value}% สำเร็จ!`;
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
    Swal.fire(
      withSwalTheme({
        icon: "warning",
        title: t("booking.terms_required_title"),
        text: t("booking.terms_required_text"),
      })
    );
    return;
  }

  const phone = bookingForm.value.phone.trim();
  if (!phone || !/^[0-9\- ]{9,15}$/.test(phone)) {
    Swal.fire(
      withSwalTheme({
        icon: "warning",
        title: t("booking.phone_required_title"),
        text: t("booking.phone_required_text"),
      })
    );
    return;
  }

  if (!bookingForm.value.objective.trim()) {
    Swal.fire(
      withSwalTheme({
        icon: "warning",
        title: t("booking.required_fields_title"),
        text: t("booking.objective_required_text"),
      })
    );
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

  const userId = getStoredUserId();

  if (!memoFile.value) {
    Swal.fire(
      withSwalTheme({
        icon: "warning",
        title: t("booking.memo_required_title"),
        text: t("booking.memo_required_text"),
      })
    );
    return;
  }

  // Sync phone to profile so Dashboard stays consistent
  try {
    const profileRes = await api.get("/api/user/profile");
    const p = profileRes.data || {};
    const firstname = (p.firstname || "").trim() || bookingForm.value.userName.split(" ")[0] || "-";
    const lastname =
      (p.lastname || "").trim() ||
      bookingForm.value.userName.split(" ").slice(1).join(" ") ||
      "-";
    await api.put("/api/user/profile", {
      firstname,
      lastname,
      phone_number: phone,
    });
  } catch (err) {
    console.warn("Could not sync phone to profile before booking:", err);
  }

  const formData = new FormData();
  formData.append("memoDocument", memoFile.value);
  formData.append("userId", String(userId));
  formData.append("roomId", roomId);
  formData.append("userType", bookingForm.value.userType);
  formData.append("partnerName", bookingForm.value.userName);
  formData.append("phoneNumber", phone);
  formData.append("bookingDate", bookingForm.value.date);
  formData.append("timeSlot", bookingForm.value.duration);
  formData.append("objective", bookingForm.value.objective.trim());
  formData.append("roomPrice", String(bookingForm.value.duration === 'full' ? currentPriceFullDay.value : currentPriceHalfDay.value));
  formData.append("addonsPrice", String(addOnsTotalPrice.value));
  formData.append("totalPrice", String(finalPrice.value));
  formData.append("addons", JSON.stringify(selectedAddons));
  if (isPromoApplied.value && bookingForm.value.promoCode) {
    formData.append("promoCode", bookingForm.value.promoCode.trim().toUpperCase());
  }

  submitting.value = true;
  try {
    await api.post("/api/bookings", formData);
    
    Swal.fire(
      withSwalTheme({
        title: `<h2 class="text-2xl font-black text-gray-900 mt-2">${t("booking.submit_success_title")}</h2>`,
        html: `<p class="text-gray-500 font-medium leading-relaxed">${t("booking.submit_success_desc")}</p>`,
        icon: "success",
        confirmButtonText: t("booking.go_to_dashboard"),
        customClass: {
          popup: "rounded-[2rem] p-10 border-t-8 border-green-500 max-w-sm shadow-2xl",
          confirmButton: `${swalConfirmBtnClass} w-full`,
        },
      })
    ).then(() => router.push("/dashboard"));
  } catch (err: any) {
    console.error("Booking error:", err);
    const errorMsg =
      err?.message || err.response?.data?.message || t("booking.submit_error_fallback");
    Swal.fire(
      withSwalTheme({
        icon: "error",
        title: t("booking.submit_error_title"),
        text: errorMsg,
      })
    );
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="bg-canvas min-h-screen relative font-sans">
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
          class="absolute inset-0 bg-linear-to-b from-black/80 via-mfu-red/40 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="max-w-7xl mx-auto px-4 w-full relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-10 text-white text-center md:text-left"
      >
        <div>
          <h1
            class="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg mb-2"
          >
            {{ $t('booking.title') }}
          </h1>
          <p class="text-gray-200 text-lg font-medium">
            {{ $t('booking.subtitle') }}
          </p>
        </div>
        <button
          @click="router.push('/rooms')"
          class="bg-white/10 backdrop-blur-md hover:bg-white hover:text-mfu-red text-white px-6 py-2.5 rounded-full font-bold transition-all border border-white/30 flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <font-awesome-icon icon="arrow-left" /> {{ $t('booking.back_to_rooms') }}
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-t-mfu-red border-gray-200"
        ></div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-16 relative z-20"
      >
        <!-- Sidebar Summary -->
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-3xl shadow-card-lg border border-gray-200 overflow-hidden sticky top-24"
          >
            <div class="relative h-48 bg-gray-200">
              <img :src="room?.image" loading="lazy" class="w-full h-full object-cover" />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
              ></div>
              <div class="absolute bottom-4 left-4 text-white">
                <span
                  class="bg-mfu-red px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-2 inline-block"
                  >Booking Summary</span
                >
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ translateRoomName(room?.name, locale) }}
              </h3>
              <p class="text-sm text-gray-500 mb-6 flex items-start gap-2">
                <font-awesome-icon icon="map-marker-alt" class="text-mfu-gold" />
                {{ translateLocation(room?.location, locale) }}
              </p>

              <div
                v-if="subTotalPrice > 0"
                class="p-6 bg-red-50 rounded-2xl border border-red-100 relative overflow-hidden"
              >
                <p
                  class="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 text-center"
                >
                  {{ $t('booking.estimated_payment') }}
                </p>

                <!-- แยกบิล: ค่าห้อง / ค่าอุปกรณ์ -->
                <div
                  class="flex justify-between items-center mb-1 text-sm font-medium text-gray-600"
                >
                  <span>{{ $t('booking.room_fee') }}</span>
                  <span>฿{{ roomOnlyPrice.toLocaleString() }}</span>
                </div>
                <div
                  v-for="item in selectedAddOnLines"
                  :key="item.id"
                  class="flex justify-between items-start gap-3 mb-1 text-sm font-medium text-gray-600"
                >
                  <span class="min-w-0 leading-snug">
                    {{ translateAddonName(item.name, locale) }}
                    <span class="text-gray-400 font-normal">× {{ item.quantity }}</span>
                  </span>
                  <span class="shrink-0 tabular-nums">฿{{ (item.price * item.quantity).toLocaleString() }}</span>
                </div>
                <div
                  class="flex justify-between items-center mb-1 text-sm font-bold text-gray-800 border-t border-red-200/40 pt-2"
                >
                  <span>{{ $t('booking.net_service_fee') }}</span>
                  <span>฿{{ subTotalPrice.toLocaleString() }}</span>
                </div>

                <!-- ✨ แสดงส่วนลด (ถ้ามี) -->
                <div
                  v-if="discountAmount > 0"
                  class="flex justify-between items-center mb-3 text-sm font-bold text-green-600 border-b border-red-200/50 pb-3"
                >
                  <span>{{ $t('booking.promo_discount') }}</span>
                  <span>- ฿{{ discountAmount.toLocaleString() }}</span>
                </div>

                <!-- ✨ แสดงราคาสุทธิ -->
                <div class="text-center mt-2">
                  <p class="text-4xl font-black text-mfu-red">
                    ฿{{ finalPrice.toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-8">
          <div class="ui-card-elevated p-8 md:p-10">
            <p class="text-xs font-semibold text-gray-500 mb-8">
              <span class="ui-req">*</span> {{ $t("booking.required_legend") }}
            </p>

            <form @submit.prevent="submitBooking" class="space-y-10">
              <!-- 1. Schedule -->
              <section class="space-y-5 pb-8 border-b border-gray-100">
                <div>
                  <h2 class="ui-step-title">
                    <span class="ui-step-num-red">1</span>
                    {{ $t("booking.step_schedule") }}
                  </h2>
                  <p class="ui-muted pl-14">{{ $t("booking.step_schedule_hint") }}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="ui-label"
                      >{{ $t("booking.booking_date") }} <span class="ui-req">*</span></label
                    >
                    <DateField
                      v-model="bookingForm.date"
                      :min="today"
                      required
                    />
                    <p
                      v-if="dateStatus === 'full'"
                      class="text-red-600 text-sm font-bold mt-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2"
                    >
                      <font-awesome-icon icon="exclamation-triangle" class="text-base shrink-0" />
                      {{ $t("booking.date_full_notice") }}
                    </p>
                  </div>
                  <div>
                    <label class="ui-label"
                      >{{ $t("booking.duration") }} <span class="ui-req">*</span></label
                    >
                    <select
                      v-model="bookingForm.duration"
                      :disabled="dateStatus === 'full'"
                      required
                      class="ui-input py-3.5 shadow-sm disabled:opacity-50"
                    >
                      <option value="" disabled>{{ $t("booking.select_duration") }}</option>
                      <option value="half_morning" :disabled="dateStatus === 'half_morning'">
                        {{ $t("booking.slot_morning") }}
                        {{ dateStatus === "half_morning" ? $t("booking.slot_unavailable") : "" }}
                      </option>
                      <option value="half_afternoon" :disabled="dateStatus === 'half_afternoon'">
                        {{ $t("booking.slot_afternoon") }}
                        {{ dateStatus === "half_afternoon" ? $t("booking.slot_unavailable") : "" }}
                      </option>
                      <option value="full" :disabled="dateStatus !== 'available'">
                        {{ $t("booking.slot_fullday") }}
                        {{
                          dateStatus !== "available" && dateStatus !== null
                            ? $t("booking.slot_unavailable")
                            : ""
                        }}
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              <!-- 2. Applicant -->
              <section class="space-y-5 pb-8 border-b border-gray-100">
                <div>
                  <h2 class="ui-step-title">
                    <span class="ui-step-num-red">2</span>
                    {{ $t("booking.step_applicant") }}
                  </h2>
                  <p class="ui-muted pl-14">{{ $t("booking.step_applicant_hint") }}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2">
                    <label class="ui-label"
                      >{{ $t("booking.applicant_name") }} <span class="ui-req">*</span></label
                    >
                    <input
                      type="text"
                      v-model="bookingForm.userName"
                      readonly
                      required
                      :placeholder="$t('booking.applicant_name')"
                      class="ui-input py-3.5 bg-gray-100 shadow-sm cursor-not-allowed"
                    />
                    <p class="text-[11px] text-gray-400 mt-1.5 font-medium">
                      {{ $t("booking.name_from_profile_hint") }}
                    </p>
                  </div>
                  <div>
                    <label class="ui-label"
                      >{{ $t("booking.organization_type") }} <span class="ui-req">*</span></label
                    >
                    <input
                      type="text"
                      :value="$t(orgTypeLabel)"
                      readonly
                      class="ui-input py-3.5 bg-gray-100 shadow-sm cursor-not-allowed"
                    />
                    <p class="text-[11px] text-gray-400 mt-1.5 font-medium">
                      {{ $t("booking.org_from_auth_hint") }}
                    </p>
                  </div>
                  <div>
                    <label class="ui-label"
                      >{{ $t("booking.phone_number") }} <span class="ui-req">*</span></label
                    >
                    <input
                      type="tel"
                      v-model="bookingForm.phone"
                      required
                      inputmode="tel"
                      :placeholder="$t('booking.phone_placeholder')"
                      class="ui-input py-3.5 shadow-sm"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="ui-label"
                      >{{ $t("booking.objective") }} <span class="ui-req">*</span></label
                    >
                    <textarea
                      v-model="bookingForm.objective"
                      required
                      rows="3"
                      :placeholder="$t('booking.objective_placeholder')"
                      class="ui-input py-3.5 shadow-sm resize-none"
                    ></textarea>
                  </div>
                </div>
              </section>

              <!-- 3. Documents -->
              <section class="space-y-5 pb-8 border-b border-gray-100">
                <div>
                  <h2 class="ui-step-title">
                    <span class="ui-step-num-red">3</span>
                    {{ $t("booking.step_documents") }}
                  </h2>
                  <p class="ui-muted pl-14">{{ $t("booking.step_documents_hint") }}</p>
                </div>
                <div>
                  <label class="ui-label"
                    >{{ $t("booking.memo_title") }} <span class="ui-req">*</span></label
                  >
                  <div
                    class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-mfu-red hover:bg-red-50/30"
                    :class="
                      memoFileName
                        ? 'border-green-400 bg-green-50/50'
                        : 'border-gray-200 bg-gray-50'
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
                      <p class="font-bold text-gray-900 text-sm">{{ memoFileName }}</p>
                      <p class="text-[10px] text-gray-400 mt-1 font-medium">PDF</p>
                      <button
                        type="button"
                        @click.stop="clearMemoFile"
                        class="mt-2 text-xs text-red-500 font-bold hover:text-red-700"
                      >
                        <font-awesome-icon icon="times" class="mr-1" />{{ $t("booking.change_file") }}
                      </button>
                    </template>
                    <template v-else>
                      <font-awesome-icon
                        icon="cloud-upload-alt"
                        class="text-3xl text-mfu-red/50 mb-2"
                      />
                      <p class="font-bold text-gray-700 text-sm">{{ $t("booking.memo_hint") }}</p>
                    </template>
                  </div>
                </div>
              </section>

              <!-- 4. Extras (optional) -->
              <section class="space-y-6">
                <div>
                  <h2 class="ui-step-title">
                    <span class="ui-step-num-gold">4</span>
                    {{ $t("booking.step_extras") }}
                  </h2>
                  <p class="ui-muted pl-14">{{ $t("booking.step_2_hint") }}</p>
                </div>

                <div>
                  <h3 class="text-sm font-bold text-gray-700 mb-3">{{ $t("booking.step_2") }}</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      v-for="item in addOns"
                      :key="item.id"
                      class="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center transition-all hover:shadow-card"
                    >
                      <img
                        :src="item.imageUrl"
                        :alt="translateAddonName(item.name, locale)"
                        class="w-full h-24 object-cover rounded-xl mb-3 border border-gray-200 bg-white"
                      />
                      <p class="font-bold text-gray-800 text-sm mb-1 leading-snug">
                        {{ translateAddonName(item.name, locale) }}
                      </p>
                      <p class="text-xs text-gray-500 mb-3 font-medium">
                        ฿{{ item.price }} / {{ translateAddonUnit(item.unit, locale) }}
                      </p>
                      <div class="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          @click="item.quantity > 0 ? item.quantity-- : 0"
                          class="w-8 h-8 rounded-lg bg-white border border-gray-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span class="text-sm font-black text-gray-900">{{ item.quantity }}</span>
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

                <div class="rounded-2xl border border-mfu-gold/30 bg-amber-50/40 p-5">
                  <h3 class="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                    <font-awesome-icon icon="ticket-alt" class="text-mfu-gold" />
                    {{ $t("booking.step_3") }}
                  </h3>
                  <p class="text-xs text-amber-800/80 font-medium mb-4">
                    {{ $t("booking.step_3_hint") }}
                  </p>
                  <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div class="flex-1 w-full">
                      <input
                        type="text"
                        v-model="bookingForm.promoCode"
                        :placeholder="$t('booking.promo_placeholder')"
                        class="ui-input py-3.5 shadow-sm font-bold uppercase focus:ring-mfu-gold/35 focus:border-mfu-gold/40"
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
                          : 'bg-mfu-gold text-white hover:bg-yellow-600'
                      "
                    >
                      <span v-if="promoLoading"
                        ><font-awesome-icon icon="spinner" spin class="mr-1" />{{
                          $t("booking.checking")
                        }}</span
                      >
                      <span v-else>{{
                        isPromoApplied ? $t("booking.cancel_code") : $t("booking.apply_code")
                      }}</span>
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
              </section>

              <div
                class="flex items-start p-5 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <input
                  type="checkbox"
                  v-model="bookingForm.acceptTerms"
                  id="terms"
                  class="mt-1 w-5 h-5 text-mfu-red rounded border-gray-300 focus:ring-mfu-red cursor-pointer"
                />
                <label for="terms" class="ml-4 text-sm text-gray-600 leading-relaxed cursor-pointer">
                  {{ $t("booking.accept_terms") }}
                </label>
              </div>

              <button
                type="submit"
                :disabled="!bookingForm.acceptTerms || dateStatus === 'full' || submitting"
                class="ui-btn-primary w-full py-5 rounded-2xl shadow-xl uppercase tracking-widest text-lg transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
              >
                <template v-if="submitting">
                  <font-awesome-icon icon="spinner" spin /> {{ $t("booking.submitting") }}
                </template>
                <template v-else>
                  {{ $t("booking.submit_btn") }} <font-awesome-icon icon="paper-plane" />
                </template>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
