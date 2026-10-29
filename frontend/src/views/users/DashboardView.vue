<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import api from "@/services/api";
import { clearAuthSession, getStoredUserId } from "@/utils/auth";
import { formatDateKey, toDateKey } from "@/utils/dateKey";
import QRCode from "qrcode";
import { generatePromptPayPayload } from "@/services/promptpay";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  role: string;
}

interface BookingAddonLine {
  name: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

interface RateAdjustment {
  fromOrg: string | null;
  toOrg: string | null;
  fromRoom: number | null;
  toRoom: number | null;
  roomDelta: number | null;
  fromTotal: number | null;
  toTotal: number | null;
  totalDelta: number | null;
}

interface BookingItem {
  id: string;
  dbId: number;
  roomName: string;
  bookingDate: string;
  durationText: string;
  totalPrice: number;
  roomPrice: number;
  addonsPrice: number;
  organizationType?: string;
  promoCode?: string;
  discountAmount: number;
  promoDiscountPercent: number;
  rateAdjustment?: RateAdjustment | null;
  status: string;
  hasFeedback: boolean;
  feedbackData?: { rating: number; comment: string };
  addons: BookingAddonLine[];
  adminName?: string;
  remark?: string;
  memoDocumentUrl?: string;
  transactionId?: string;
}

import { useI18n } from "vue-i18n";
import {
  translateRoomName,
  translateAddonName,
  translateDuration,
} from "@/utils/translator";
import {
  getAwaitingReviewLabel,
  getBookingStatusBadgeClass,
  getBookingStatusIcon,
  getBookingStatusLabel,
  getReviewedBadgeClass,
  getReviewedLabel,
  isBookingStatus,
  canLeaveReview,
  type BookingStatusKey,
} from "@/utils/bookingStatus";

const { t, locale } = useI18n();
const router = useRouter();
const activeTab = ref("bookings");

const ORG_LABEL_TH: Record<string, string> = {
  internal: "บุคคลภายใน",
  co_op: "หน่วยงานร่วมจัด",
  co_organizer: "หน่วยงานร่วมจัด",
  coop: "หน่วยงานร่วมจัด",
  external: "บุคคลภายนอก",
};
const ORG_LABEL_EN: Record<string, string> = {
  internal: "Internal",
  co_op: "Co-organizer",
  co_organizer: "Co-organizer",
  coop: "Co-organizer",
  external: "External",
};

const orgLabel = (org: string | null | undefined) => {
  if (!org) return "—";
  const key = String(org).toLowerCase();
  return locale.value === "en"
    ? ORG_LABEL_EN[key] || org
    : ORG_LABEL_TH[key] || org;
};

const formatSignedBaht = (n: number) => {
  const abs = Math.abs(n).toLocaleString();
  if (n > 0) return `+฿${abs}`;
  if (n < 0) return `-฿${abs}`;
  return `฿${abs}`;
};

// --- ส่วนที่ 1: ข้อมูล Profile ---
const userProfile = ref<UserProfile>({
  fullName: "กำลังโหลด...",
  email: "กำลังโหลด...",
  phone: "",
  profileImage: null,
  role: localStorage.getItem("userRole") || "external",
});

const myBookings = ref<BookingItem[]>([]);
const loadingBookings = ref(true);
const activePaymentProvider = ref("promptpay_manual");
const expandedPriceId = ref<string | null>(null);

const togglePriceBreakdown = (bookingId: string) => {
  expandedPriceId.value =
    expandedPriceId.value === bookingId ? null : bookingId;
};

const fetchBookings = async () => {
  const userId = getStoredUserId();
  if (!userId) return;

  const bookingsRes = await api.get(`/api/user/bookings/${userId}`);
  myBookings.value = bookingsRes.data.map((b: any) => ({
    ...b,
    id: b.booking_no,
    dbId: b.id,
    roomName: b.room_name,
    bookingDate: toDateKey(b.booking_date),
    durationText:
      b.time_slot === "full"
        ? "เต็มวัน"
        : b.time_slot === "half_morning"
          ? "ครึ่งวันเช้า"
          : "ครึ่งวันบ่าย",
    totalPrice: parseFloat(b.total_price) || 0,
    roomPrice: parseFloat(b.room_price) || 0,
    addonsPrice: parseFloat(b.addons_price) || 0,
    organizationType: b.organization_type || undefined,
    rateAdjustment: b.rate_adjustment || null,
    promoCode: (b.promo_code || "").trim() || undefined,
    discountAmount: Math.max(
      0,
      (parseFloat(b.room_price) || 0) +
        (parseFloat(b.addons_price) || 0) -
        (parseFloat(b.total_price) || 0)
    ),
    promoDiscountPercent: (() => {
      const fromDb = Number(b.promo_discount_percent);
      if (Number.isFinite(fromDb) && fromDb > 0) return Math.min(100, fromDb);
      const sub =
        (parseFloat(b.room_price) || 0) + (parseFloat(b.addons_price) || 0);
      const disc = Math.max(
        0,
        sub - (parseFloat(b.total_price) || 0)
      );
      if (sub <= 0 || disc <= 0) return 0;
      return Math.min(100, Math.round((disc / sub) * 100));
    })(),
    status: b.status,
    hasFeedback: b.has_feedback,
    memoDocumentUrl: b.memo_document_url || null,
    adminName: (b.admin_name || "").trim() || undefined,
    remark: b.remarks || b.remark || undefined,
    transactionId: b.transaction_id || undefined,
    addons: Array.isArray(b.addons)
      ? b.addons.map((a: any) => ({
          name: a.name,
          qty: Number(a.quantity ?? a.qty ?? 1) || 1,
          unitPrice: Number(a.unitPrice ?? a.unit_price ?? 0) || 0,
          totalPrice:
            Number(a.totalPrice ?? a.total_price ?? 0) ||
            (Number(a.unitPrice ?? a.unit_price ?? 0) || 0) *
              (Number(a.quantity ?? a.qty ?? 1) || 1),
        }))
      : [],
  }));
};

onMounted(async () => {
  const storedEmail = localStorage.getItem("userEmail");
  const storedName = localStorage.getItem("userName");

  if (storedEmail) userProfile.value.email = storedEmail;
  if (storedName) userProfile.value.fullName = storedName;

  try {
    // Profile identity comes from JWT cookie — do not pass email as authority
    const profileRes = await api.get("/api/user/profile");
    if (profileRes.data) {
      userProfile.value.fullName = `${profileRes.data.firstname} ${profileRes.data.lastname}`;
      userProfile.value.phone = profileRes.data.phone_number || "";
      userProfile.value.profileImage = profileRes.data.profile_picture || null;
      if (profileRes.data.email) userProfile.value.email = profileRes.data.email;
    }

    try {
      const providersRes = await api.get("/api/payment/providers");
      activePaymentProvider.value =
        providersRes.data?.activeProvider?.id || "promptpay_manual";
    } catch {
      activePaymentProvider.value = "promptpay_manual";
    }

    await fetchBookings();

    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "success") {
      const sessionId = params.get("session_id") || "";
      const tx = params.get("tx") || sessionId || "";
      let displayTx = tx;
      let confirmed = !sessionId.startsWith("cs_");

      if (sessionId.startsWith("cs_")) {
        try {
          const { data } = await api.post("/api/payment/stripe/confirm", { sessionId });
          displayTx = data?.transactionId || sessionId;
          confirmed = true;
          await fetchBookings();
        } catch (err: any) {
          console.error("stripe confirm failed", err);
          confirmed = false;
          Swal.fire({
            icon: "warning",
            title: t("dashboard.stripe_pay_error"),
            text: err.response?.data?.message || err.message || "",
            confirmButtonColor: "#ba0b2f",
          });
        }
      }

      if (confirmed) {
        Swal.fire({
          icon: "success",
          title: t("dashboard.stripe_pay_success"),
          html: `<p class="text-sm text-gray-600">${t("dashboard.stripe_pay_success_sub")}</p>
            ${displayTx ? `<p class="mt-2 text-xs font-mono break-all">Transaction ID: ${displayTx}</p>` : ""}`,
          confirmButtonColor: "#ba0b2f",
          customClass: { popup: "rounded-[2rem]" },
        });
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("stripe");
      url.searchParams.delete("tx");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.pathname + url.search);
    } else if (params.get("stripe") === "cancel") {
      Swal.fire({
        icon: "info",
        title: t("dashboard.stripe_pay_cancel") || "ยกเลิกการชำระเงิน",
        confirmButtonColor: "#ba0b2f",
        customClass: { popup: "rounded-[2rem]" },
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("stripe");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loadingBookings.value = false;
  }
});

const handleFileUpload = async (_event: Event) => {
  Swal.fire({
    icon: "info",
    title: "โหมดทดสอบ",
    text: "การอัปโหลดรูปภาพถูกปิดใช้งานชั่วคราว",
    confirmButtonColor: "#ba0b2f",
    customClass: { popup: "rounded-[2rem]" },
  });
};

const saveProfile = async () => {
  try {
    if (!userProfile.value.phone?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกเบอร์โทรศัพท์",
        text: "เบอร์โทรใช้สำหรับติดต่อประสานงานการจอง",
        confirmButtonColor: "#ba0b2f",
      });
      return;
    }
    // แยก firstname, lastname จาก fullName ง่ายๆ
    const parts = userProfile.value.fullName.split(' ');
    const firstname = parts[0];
    const lastname = parts.slice(1).join(' ');

    await api.put("/api/user/profile", {
      firstname,
      lastname,
      phone_number: userProfile.value.phone
    });

    Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลสำเร็จ",
      showConfirmButton: false,
      timer: 1500,
      customClass: { popup: "rounded-[2rem]" },
    });
  } catch (err: any) {
    console.error("Error saving profile:", err);
    Swal.fire("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
  }
};

const openPayment = async (booking: BookingItem) => {
  if (activePaymentProvider.value === "mock_sandbox") {
    return openMockPayment(booking);
  }
  if (activePaymentProvider.value === "stripe") {
    return openStripePayment(booking);
  }
  return openPromptPayPayment(booking);
};

const openStripePayment = async (booking: BookingItem) => {
  const result = await Swal.fire({
    title: `<span class="font-extrabold text-xl text-gray-900">${t("dashboard.stripe_pay_title")}</span>`,
    html: `
      <p class="text-sm text-gray-500 mb-2 font-medium">${t("dashboard.net_total")}: <span class="text-[#ba0b2f] font-black text-2xl ml-1">฿${booking.totalPrice.toLocaleString()}</span></p>
      <div class="bg-indigo-50 p-4 rounded-xl text-left border border-indigo-100 text-xs text-indigo-800 font-medium mb-4">
        ${t("dashboard.stripe_pay_desc")}
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: t("dashboard.stripe_pay_btn"),
    cancelButtonText: t("dashboard.close_window"),
    confirmButtonColor: "#635bff",
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      confirmButton: "rounded-xl px-6 py-3 font-bold cursor-pointer",
      cancelButton: "rounded-xl px-6 py-3 font-bold cursor-pointer",
    },
  });

  if (!result.isConfirmed) return;

  try {
    const { data } = await api.post("/api/payment/checkout", { bookingId: booking.dbId });
    if (!data?.success || !data?.checkoutUrl) {
      throw new Error(data?.message || "checkout failed");
    }
    window.location.href = data.checkoutUrl;
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: t("dashboard.stripe_pay_error"),
      text: err.response?.data?.message || err.message || "",
      confirmButtonColor: "#ba0b2f",
    });
  }
};

const openMockPayment = async (booking: BookingItem) => {
  const result = await Swal.fire({
    title: `<span class="font-extrabold text-xl text-gray-900">${t("dashboard.mock_pay_title")}</span>`,
    html: `
      <p class="text-sm text-gray-500 mb-2 font-medium">${t("dashboard.net_total")}: <span class="text-[#ba0b2f] font-black text-2xl ml-1">฿${booking.totalPrice.toLocaleString()}</span></p>
      <div class="bg-amber-50 p-4 rounded-xl text-left border border-amber-100 text-xs text-amber-800 font-medium mb-4">
        🧪 ${t("dashboard.mock_pay_desc")}
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: t("dashboard.mock_pay_btn"),
    cancelButtonText: t("dashboard.close_window"),
    confirmButtonColor: "#2563eb",
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      confirmButton: "rounded-xl px-6 py-3 font-bold cursor-pointer",
      cancelButton: "rounded-xl px-6 py-3 font-bold cursor-pointer",
    },
  });

  if (!result.isConfirmed) return;

  try {
    await api.post("/api/payment/mock/simulate", { bookingId: booking.dbId });
    await fetchBookings();
    Swal.fire({
      icon: "success",
      title: `<div class="px-2 leading-relaxed">
        <p class="text-xl font-extrabold text-gray-900 mb-2">${t("dashboard.mock_pay_success")}</p>
        <p class="text-base font-semibold text-gray-500">${t("dashboard.mock_pay_success_sub")}</p>
      </div>`,
      confirmButtonColor: "#ba0b2f",
      customClass: { popup: "rounded-[2rem] max-w-md", title: "w-full" },
    });
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: t("booking.submit_error_title"),
      text: err.response?.data?.message || "เกิดข้อผิดพลาด",
      confirmButtonColor: "#ba0b2f",
    });
  }
};

const openPromptPayPayment = async (booking: BookingItem) => {
  let qrDataUrl = "/images/qr-fallback.svg";
  try {
    const { data } = await api.post("/api/payment/promptpay/generate", {
      bookingId: booking.dbId,
    });
    const payload = data.qrPayload || generatePromptPayPayload("0575532000100", booking.totalPrice);
    qrDataUrl = await QRCode.toDataURL(payload, {
      width: 250,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" },
    });
  } catch (err: any) {
    console.error("QR generation failed:", err);
    try {
      const payload = generatePromptPayPayload("0575532000100", booking.totalPrice);
      qrDataUrl = await QRCode.toDataURL(payload, { width: 250, margin: 1 });
    } catch {
      /* use fallback image */
    }
  }

  const { value: slipFile } = await Swal.fire({
    title: `<span class="font-extrabold text-2xl text-gray-900">${t("dashboard.scan_to_pay")}</span>`,
    html: `
      <p class="text-sm text-gray-500 mb-4 font-medium">${t("dashboard.net_total")}: <span class="text-[#ba0b2f] font-black text-2xl ml-1">฿${booking.totalPrice.toLocaleString()}</span></p>
      <div class="bg-white p-4 rounded-3xl border border-gray-200 mb-4 inline-block mx-auto shadow-sm">
        <img src="${qrDataUrl}" class="w-52 h-52 mx-auto" alt="Payment QR Code" />
      </div>
      <div class="bg-blue-50 p-4 rounded-xl text-left flex gap-3 border border-blue-100 text-xs text-blue-800 font-medium mb-4">
        ℹ️ <p>${t("dashboard.scan_instruction")}</p>
      </div>
      <label class="block text-left text-xs font-bold text-gray-500 mb-2">${t("payment.upload_slip")}</label>
      <input type="file" id="slip-upload-input" accept="image/*,.pdf" class="w-full text-xs" />
      <p class="text-[10px] text-gray-400 mt-1 text-left">${t("payment.slip_hint")}</p>
    `,
    showCancelButton: true,
    confirmButtonText: t("payment.submit_slip_btn"),
    cancelButtonText: t("dashboard.close_window"),
    confirmButtonColor: "#2563eb",
    preConfirm: () => {
      const input = document.getElementById("slip-upload-input") as HTMLInputElement;
      if (!input?.files?.length) {
        Swal.showValidationMessage("กรุณาแนบไฟล์สลิปการชำระเงิน");
        return false;
      }
      return input.files[0];
    },
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      confirmButton: "rounded-xl w-full py-3.5 font-bold cursor-pointer mt-2",
      cancelButton: "rounded-xl w-full py-3 font-bold cursor-pointer mt-2",
    },
  });

  if (!slipFile) return;

  try {
    const formData = new FormData();
    formData.append("bookingId", String(booking.dbId));
    formData.append("slipImage", slipFile);
    await api.post("/api/payment/slip/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchBookings();
    Swal.fire({
      icon: "success",
      title: t("payment.verify_pending"),
      confirmButtonColor: "#ba0b2f",
      customClass: { popup: "rounded-[2rem]" },
    });
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: t("booking.submit_error_title"),
      text: err.response?.data?.message || "อัปโหลดสลิปไม่สำเร็จ",
      confirmButtonColor: "#ba0b2f",
    });
  }
};

const confirmLogout = () => {
  Swal.fire({
    html: `
      <div class="relative w-24 h-24 mx-auto mb-6">
        <div class="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
        <div class="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm border-[4px] border-red-50 text-[#ba0b2f] text-4xl">
          🚪
        </div>
      </div>
      <h3 class="text-2xl font-black text-gray-900 tracking-tight mb-2">${t('nav.logout_confirm_title')}</h3>
      <p class="text-sm text-gray-500 font-medium px-2">${t('nav.logout_confirm_text')}</p>
    `,
    showCancelButton: true,
    confirmButtonText: t('nav.logout'),
    cancelButtonText: t('common.cancel'),
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-sm border border-gray-100 shadow-2xl",
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      confirmButton:
        "bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.post("/api/auth/logout");
      } catch {
        /* cookie cleared best-effort */
      }
      clearAuthSession();
      localStorage.clear();
      router.push("/");
    }
  });
};

// --- ส่วนที่ 3: รายการจอง ---

const searchQuery = ref("");
const filterStartDate = ref("");
const filterEndDate = ref("");
const filterStatus = ref<Exclude<BookingStatusKey, "unknown"> | "">("");

const filteredBookings = computed(() => {
  return myBookings.value.filter((booking) => {
    const matchSearch =
      booking.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.roomName.toLowerCase().includes(searchQuery.value.toLowerCase());
    let matchDate = true;
    if (filterStartDate.value && filterEndDate.value)
      matchDate =
        booking.bookingDate >= filterStartDate.value &&
        booking.bookingDate <= filterEndDate.value;
    else if (filterStartDate.value)
      matchDate = booking.bookingDate >= filterStartDate.value;
    else if (filterEndDate.value)
      matchDate = booking.bookingDate <= filterEndDate.value;
    const matchStatus =
      !filterStatus.value || isBookingStatus(booking.status, filterStatus.value);
    return matchSearch && matchDate && matchStatus;
  });
});

const cancelBooking = (booking: BookingItem) => {
  Swal.fire({
    title: t('dashboard.cancel_booking_title'),
    text: `${t('dashboard.cancel_booking_text')} ${booking.id} ${t('dashboard.cancel_booking_text_suffix')}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ba0b2f",
    cancelButtonColor: "#f3f4f6",
    confirmButtonText: t('dashboard.cancel_booking_confirm'),
    cancelButtonText: `<span class="text-gray-700 font-bold">${t('dashboard.close_window')}</span>`,
    customClass: {
      popup: "rounded-[2rem]",
      confirmButton: "rounded-xl px-6 py-3 font-bold",
      cancelButton: "rounded-xl px-6 py-3 border border-gray-200",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // ✅ เรียก API ยกเลิกจริง บันทึกลง Database
        await api.put(`/api/user/bookings/${booking.dbId}/cancel`);
        booking.status = "ยกเลิกแล้ว";
        Swal.fire({
          icon: "success",
          title: t('dashboard.cancel_booking_success'),
          showConfirmButton: false,
          timer: 1500,
          customClass: { popup: "rounded-[2rem]" },
        });
      } catch (err: any) {
        Swal.fire(t('common.error') || "Error", err.response?.data?.message || "ไม่สามารถยกเลิกการจองได้", "error");
      }
    }
  });
};

const giveFeedback = (booking: BookingItem) => {
  Swal.fire({
    title:
      `<h2 class="text-2xl font-extrabold text-gray-900">${t('dashboard.review_title')}</h2>`,
    html: `
      <div class="mb-8 mt-2">
        <p class="text-sm font-bold text-gray-700 mb-4 text-left">${t('dashboard.review_satisfaction')} <span class="text-red-500">*</span></p>
        
        <div id="star-rating-container" class="flex items-center justify-center gap-2 mb-3 text-4xl cursor-pointer">
          <span class="star-icon text-yellow-400 text-3xl drop-shadow-sm transition-transform cursor-pointer" data-value="1">★</span>
          <span class="star-icon text-yellow-400 text-3xl drop-shadow-sm transition-transform cursor-pointer" data-value="2">★</span>
          <span class="star-icon text-yellow-400 text-3xl drop-shadow-sm transition-transform cursor-pointer" data-value="3">★</span>
          <span class="star-icon text-yellow-400 text-3xl drop-shadow-sm transition-transform cursor-pointer" data-value="4">★</span>
          <span class="star-icon text-yellow-400 text-3xl drop-shadow-sm transition-transform cursor-pointer" data-value="5">★</span>
        </div>
        
        <p id="rating-text" class="text-sm font-black text-[#ba0b2f]">${t('dashboard.review_star_5')}</p>
        <input type="hidden" id="feedback-rating" value="5">
      </div>

      <div class="text-left border-t border-gray-100 pt-6">
        <label class="block text-sm font-bold text-gray-700 mb-2">${t('dashboard.review_comment_label')}</label>
        <textarea id="feedback-comment" rows="3" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 font-medium rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner" placeholder="${t('dashboard.review_comment_placeholder')}"></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: t('dashboard.review_submit'),
    cancelButtonText: t('common.cancel'),
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      actions: "flex flex-row gap-3 mt-6 w-full justify-center",
      confirmButton:
        "bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-red-200 hover:-translate-y-0.5 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl px-6 py-3.5 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
    didOpen: () => {
      const stars = document.querySelectorAll(".star-icon");
      const ratingInput = document.getElementById("feedback-rating") as HTMLInputElement | null;
      const ratingText = document.getElementById("rating-text");

      const texts: Record<number, string> = {
        1: t('dashboard.review_star_1'),
        2: t('dashboard.review_star_2'),
        3: t('dashboard.review_star_3'),
        4: t('dashboard.review_star_4'),
        5: t('dashboard.review_star_5'),
      };

      const updateStars = (value: number) => {
        stars.forEach((star) => {
          const starVal = parseInt(star.getAttribute("data-value") || "0");
          if (starVal <= value) {
            star.classList.remove("text-gray-200");
            star.classList.add("text-yellow-400", "drop-shadow-sm");
          } else {
            star.classList.remove("text-yellow-400", "drop-shadow-sm");
            star.classList.add("text-gray-200");
          }
        });
        if (ratingText) {
          ratingText.innerText = texts[value] || "";
          ratingText.className =
            value <= 2
              ? "text-sm font-black text-gray-500"
              : "text-sm font-black text-[#ba0b2f]";
        }
      };

      stars.forEach((star) => {
        star.addEventListener("mouseover", function (this: Element) {
          updateStars(parseInt(this.getAttribute("data-value") || "0"));
        });
        star.addEventListener("click", function (this: Element) {
          const val = this.getAttribute("data-value") || "5";
          if (ratingInput) ratingInput.value = val;
          this.classList.add("scale-125");
          setTimeout(() => this.classList.remove("scale-125"), 150);
        });
      });

      document
        .getElementById("star-rating-container")
        ?.addEventListener("mouseleave", () => {
          const currentVal = parseInt(ratingInput?.value || "5");
          updateStars(currentVal);
        });
    },
    preConfirm: () => {
      const ratingInput = document.getElementById("feedback-rating") as HTMLInputElement | null;
      const commentInput = document.getElementById("feedback-comment") as HTMLTextAreaElement | null;
      const rating = ratingInput ? parseInt(ratingInput.value) : 5;
      const comment = commentInput ? commentInput.value : "";
      return { rating, comment };
    },
  }).then(async (result) => {
    if (result.isConfirmed && result.value) {
      try {
        await api.post("/api/user/feedback", {
          bookingId: booking.dbId,
          rating: result.value.rating,
          comment: result.value.comment
        });

        booking.hasFeedback = true;
        booking.feedbackData = result.value;
        Swal.fire({
          icon: "success",
          title: t('dashboard.review_thanks_title'),
          text: t('dashboard.review_thanks_text'),
          showConfirmButton: false,
          timer: 2500,
          customClass: { popup: "rounded-3xl" },
        });
      } catch (err: any) {
        Swal.fire(t('booking.submit_error_title'), "ไม่สามารถส่งรีวิวได้ในขณะนี้", "error");
      }
    }
  });
};

const getStatusText = (status: string) =>
  getBookingStatusLabel(status, locale.value);
const getStatusClass = (status: string) => getBookingStatusBadgeClass(status);

const formatDate = (dateString: string) =>
  formatDateKey(dateString, locale.value === "en" ? "en-US" : "th-TH");
</script>

<template>
  <div class="bg-canvas min-h-screen pb-20 font-sans">
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
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center w-full mt-10 text-white"
      >
        <div>
          <h1
            class="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg mb-2"
          >
            My Dashboard
          </h1>
          <p class="text-gray-200 text-lg font-medium text-center md:text-left">
            จัดการข้อมูลส่วนตัวและติดตามการจองพื้นที่
          </p>
        </div>
        <RouterLink
          to="/rooms"
          class="mt-6 md:mt-0 bg-white text-[#ba0b2f] px-8 py-3.5 rounded-full font-black hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
        >
          <font-awesome-icon icon="plus" /> {{ $t('dashboard.new_booking') }}
        </RouterLink>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar Menu -->
        <div class="w-full md:w-1/3 lg:w-1/4">
          <div
            class="bg-white rounded-3xl shadow-card-lg border border-gray-200 p-6 sticky top-24"
          >
            <div class="relative w-32 h-32 mx-auto mb-6">
              <div
                class="w-full h-full bg-gray-50 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-gray-300 text-5xl overflow-hidden"
              >
                <img
                  v-if="userProfile.profileImage"
                  :src="userProfile.profileImage"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-cover"
                />
                <font-awesome-icon v-else icon="user" />
              </div>
            </div>
            <div class="text-center mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-1">
                {{ userProfile.fullName }}
              </h3>
              <p class="text-sm text-gray-500 font-medium">
                {{ userProfile.email }}
              </p>
            </div>
            <nav class="space-y-2">
              <button
                @click="activeTab = 'bookings'"
                :class="
                  activeTab === 'bookings'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <font-awesome-icon icon="ticket-alt" class="w-5" /> {{ $t('dashboard.title') }}
              </button>
              <button
                @click="activeTab = 'profile'"
                :class="
                  activeTab === 'profile'
                    ? 'bg-red-50 text-[#ba0b2f]'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer"
              >
                <font-awesome-icon icon="user-cog" class="w-5" /> {{ $t('dashboard.profile_tab') }}
              </button>
              <div class="pt-6 mt-6 border-t border-gray-100">
                <button
                  @click="confirmLogout"
                  class="group w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-gray-600 bg-white border border-gray-200 hover:bg-red-50 hover:text-[#ba0b2f] hover:border-red-100 transition-all duration-300 font-bold text-sm shadow-sm hover:shadow-md cursor-pointer"
                >
                  <font-awesome-icon icon="sign-out-alt" class="text-gray-400 group-hover:text-[#ba0b2f] transition-colors" />
                  {{ $t('nav.logout') }}
                </button>
              </div>
            </nav>
          </div>
        </div>

        <!-- Content Area -->
        <div class="w-full md:w-2/3 lg:w-3/4">
          <!-- Tab 1: Bookings -->
          <div v-if="activeTab === 'bookings'" class="space-y-6">
            <div
              class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
            >
              <h2
                class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
              >
                <font-awesome-icon icon="history" class="text-[#ba0b2f]" />
                {{ $t('dashboard.my_bookings_title') }}
              </h2>
            </div>

            <div
              class="bg-white p-5 rounded-2xl shadow-card border border-gray-200 flex flex-col md:flex-row gap-4 mb-6"
            >
              <div class="flex-1">
                <label
                  class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
                  >{{ $t('dashboard.search_label') }}</label
                >
                <div class="relative">
                  <font-awesome-icon icon="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="$t('dashboard.search_placeholder')"
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  />
                </div>
              </div>
              <div class="w-full md:w-52">
                <label
                  class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
                  >{{ $t('dashboard.status_filter') }}</label
                >
                <select
                  v-model="filterStatus"
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                >
                  <option value="">{{ $t('dashboard.tab_all') }}</option>
                  <option value="pending">{{ $t('dashboard.status_pending') }}</option>
                  <option value="approved_pending_payment">{{ $t('dashboard.status_awaiting_payment') }}</option>
                  <option value="approved_paid">{{ $t('dashboard.status_paid') }}</option>
                  <option value="completed">{{ $t('dashboard.status_completed') }}</option>
                  <option value="disapproved">{{ $t('dashboard.status_disapproved') }}</option>
                  <option value="cancelled">{{ $t('dashboard.status_cancelled') }}</option>
                </select>
              </div>
              <div class="w-full md:w-auto flex gap-4">
                <div class="w-1/2 md:w-auto">
                  <label
                    class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
                    >{{ $t('dashboard.start_date') }}</label
                  >
                  <input
                    v-model="filterStartDate"
                    type="date"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  />
                </div>
                <div class="w-1/2 md:w-auto">
                  <label
                    class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
                    >{{ $t('dashboard.end_date') }}</label
                  >
                  <input
                    v-model="filterEndDate"
                    type="date"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="bg-white rounded-3xl shadow-card border border-gray-200 overflow-hidden hover:shadow-card-hover transition-all duration-300"
              :class="
                isBookingStatus(booking.status, 'cancelled') ? 'opacity-60 grayscale-50' : ''
              "
            >
              <!-- Header -->
              <div
                class="px-5 md:px-6 py-3.5 border-b border-gray-100 bg-slate-50/80 flex justify-between items-start gap-3 flex-wrap"
              >
                <div class="min-w-0">
                  <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Booking ID
                  </p>
                  <p class="text-sm font-black text-gray-800 font-mono tracking-tight">
                    {{ booking.id }}
                  </p>
                  <p
                    v-if="booking.transactionId"
                    class="mt-1 text-[11px] font-mono text-gray-500"
                  >
                    {{ $t("dashboard.transaction_id") }}:
                    <span class="text-gray-700">{{ booking.transactionId }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <span
                    :class="getStatusClass(booking.status)"
                    class="px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm inline-flex items-center gap-1.5"
                  >
                    <font-awesome-icon
                      :icon="getBookingStatusIcon(booking.status)"
                      class="text-[11px]"
                    />
                    {{ getStatusText(booking.status) }}
                  </span>
                  <span
                    v-if="canLeaveReview(booking.status) && booking.hasFeedback"
                    :class="getReviewedBadgeClass()"
                    class="px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm"
                  >
                    {{ getReviewedLabel(locale) }}
                  </span>
                </div>
              </div>

              <!-- Body -->
              <div class="p-5 md:p-6">
                <div class="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
                  <div class="grow min-w-0">
                    <h3 class="text-xl font-black text-gray-900 leading-snug">
                      {{ translateRoomName(booking.roomName, locale) }}
                    </h3>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <span
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-100 text-xs font-bold"
                      >
                        <font-awesome-icon :icon="['far', 'calendar']" class="text-[#d4af37]" />
                        {{ formatDate(booking.bookingDate) }}
                      </span>
                      <span
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold"
                      >
                        <font-awesome-icon :icon="['far', 'clock']" class="text-slate-400" />
                        {{ translateDuration(booking.durationText, locale) }}
                      </span>
                      <span
                        v-if="booking.addons.length > 0"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-100 text-xs font-bold"
                      >
                        <font-awesome-icon icon="box-open" class="text-sky-500" />
                        {{ $t("dashboard.addons_count", { n: booking.addons.length }) }}
                      </span>
                      <span
                        v-if="booking.promoCode"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold"
                      >
                        <font-awesome-icon icon="ticket-alt" class="text-emerald-500" />
                        {{ booking.promoCode }}
                        <template v-if="booking.promoDiscountPercent > 0">
                          · {{ booking.promoDiscountPercent }}%
                        </template>
                      </span>
                      <span
                        v-if="booking.rateAdjustment"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-800 border border-violet-100 text-xs font-bold"
                      >
                        <font-awesome-icon icon="exchange-alt" class="text-violet-500" />
                        {{ $t("dashboard.rate_adjusted") }}
                        <template v-if="booking.rateAdjustment.totalDelta != null">
                          · {{ formatSignedBaht(booking.rateAdjustment.totalDelta) }}
                        </template>
                      </span>
                    </div>

                    <div
                      v-if="
                        isBookingStatus(booking.status, 'approved_paid') ||
                        isBookingStatus(booking.status, 'disapproved')
                      "
                      class="mt-4"
                    >
                      <p class="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <font-awesome-icon icon="user-tie" class="text-gray-400" />
                        {{ $t("dashboard.updated_by") }}
                        <span class="text-gray-800 font-bold">{{
                          booking.adminName || $t("dashboard.admin_user")
                        }}</span>
                      </p>
                      <div
                        v-if="
                          isBookingStatus(booking.status, 'disapproved') && booking.remark
                        "
                        class="mt-2 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2"
                      >
                        <font-awesome-icon icon="info-circle" class="text-red-500 mt-0.5" />
                        <p class="text-xs text-red-700 font-medium leading-relaxed">
                          {{ $t("dashboard.disapproval_reason") }}: {{ booking.remark }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Price summary (compact) -->
                  <div class="w-full lg:w-64 shrink-0">
                    <button
                      type="button"
                      class="w-full text-left rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-red-50/40 p-4 hover:border-[#ba0b2f]/30 hover:shadow-sm transition-all cursor-pointer"
                      @click="togglePriceBreakdown(booking.id)"
                    >
                      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {{ $t("dashboard.total_due") }}
                      </p>
                      <p class="mt-1 text-3xl font-black text-[#ba0b2f] tabular-nums leading-none">
                        ฿{{ booking.totalPrice.toLocaleString() }}
                      </p>
                      <span
                        class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#ba0b2f]"
                      >
                        {{
                          expandedPriceId === booking.id
                            ? $t("dashboard.hide_price_detail")
                            : $t("dashboard.view_price_detail")
                        }}
                        <font-awesome-icon
                          :icon="
                            expandedPriceId === booking.id ? 'chevron-up' : 'chevron-down'
                          "
                          class="text-[10px]"
                        />
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Full-width price breakdown -->
                <div
                  v-if="expandedPriceId === booking.id"
                  class="mt-5 rounded-2xl border border-gray-200 bg-slate-50/80 overflow-hidden"
                >
                  <div class="px-4 py-3 border-b border-gray-200 bg-white/70">
                    <p class="text-sm font-extrabold text-gray-800">
                      {{ $t("dashboard.view_price_detail") }}
                    </p>
                  </div>
                  <div class="p-4 space-y-2">
                    <div class="flex justify-between gap-4 text-sm text-gray-700">
                      <span class="font-semibold">
                        {{ $t("dashboard.room_fee") }}
                        <span
                          v-if="booking.organizationType"
                          class="ml-1 text-[11px] font-medium text-gray-400"
                        >
                          ({{ orgLabel(booking.organizationType) }})
                        </span>
                      </span>
                      <span class="font-bold tabular-nums"
                        >฿{{ booking.roomPrice.toLocaleString() }}</span
                      >
                    </div>

                    <div
                      v-if="booking.rateAdjustment"
                      class="rounded-xl border border-violet-100 bg-violet-50/80 px-3 py-2.5 space-y-1"
                    >
                      <p class="text-xs font-extrabold text-violet-900">
                        {{ $t("dashboard.admin_rate_change") }}
                      </p>
                      <p
                        v-if="booking.rateAdjustment.fromOrg && booking.rateAdjustment.toOrg"
                        class="text-xs font-semibold text-violet-800"
                      >
                        {{ orgLabel(booking.rateAdjustment.fromOrg) }}
                        →
                        {{ orgLabel(booking.rateAdjustment.toOrg) }}
                      </p>
                      <div
                        v-if="
                          booking.rateAdjustment.fromRoom != null &&
                          booking.rateAdjustment.toRoom != null
                        "
                        class="flex justify-between gap-3 text-xs text-violet-800"
                      >
                        <span>{{ $t("dashboard.room_fee") }}</span>
                        <span class="tabular-nums font-bold">
                          ฿{{ Number(booking.rateAdjustment.fromRoom).toLocaleString() }}
                          → ฿{{ Number(booking.rateAdjustment.toRoom).toLocaleString() }}
                          <span
                            v-if="booking.rateAdjustment.roomDelta != null"
                            class="ml-1"
                            :class="
                              booking.rateAdjustment.roomDelta > 0
                                ? 'text-rose-600'
                                : booking.rateAdjustment.roomDelta < 0
                                  ? 'text-emerald-700'
                                  : ''
                            "
                          >
                            ({{ formatSignedBaht(booking.rateAdjustment.roomDelta) }})
                          </span>
                        </span>
                      </div>
                      <div
                        v-if="
                          booking.rateAdjustment.fromTotal != null &&
                          booking.rateAdjustment.toTotal != null
                        "
                        class="flex justify-between gap-3 text-xs text-violet-900 font-bold"
                      >
                        <span>{{ $t("dashboard.total_due") }}</span>
                        <span class="tabular-nums">
                          ฿{{ Number(booking.rateAdjustment.fromTotal).toLocaleString() }}
                          → ฿{{ Number(booking.rateAdjustment.toTotal).toLocaleString() }}
                          <span
                            v-if="booking.rateAdjustment.totalDelta != null"
                            class="ml-1"
                            :class="
                              booking.rateAdjustment.totalDelta > 0
                                ? 'text-rose-600'
                                : booking.rateAdjustment.totalDelta < 0
                                  ? 'text-emerald-700'
                                  : ''
                            "
                          >
                            ({{ formatSignedBaht(booking.rateAdjustment.totalDelta) }})
                          </span>
                        </span>
                      </div>
                    </div>

                    <div v-if="booking.addons.length > 0" class="pt-1">
                      <p class="text-xs font-bold text-gray-500 mb-2">
                        {{ $t("dashboard.addons_fee") }}
                      </p>
                      <div class="space-y-1.5">
                        <div
                          v-for="addon in booking.addons"
                          :key="addon.name"
                          class="flex justify-between gap-4 text-sm text-gray-600 bg-white rounded-xl px-3 py-2 border border-gray-100"
                        >
                          <span class="min-w-0 leading-snug">
                            {{ translateAddonName(addon.name, locale) }}
                            <span class="text-gray-400 font-medium">× {{ addon.qty }}</span>
                          </span>
                          <span class="shrink-0 font-bold tabular-nums text-gray-800"
                            >฿{{ addon.totalPrice.toLocaleString() }}</span
                          >
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="booking.addonsPrice > 0"
                      class="flex justify-between gap-4 text-sm text-gray-700"
                    >
                      <span class="font-semibold">{{ $t("dashboard.addons_fee") }}</span>
                      <span class="font-bold tabular-nums"
                        >฿{{ booking.addonsPrice.toLocaleString() }}</span
                      >
                    </div>

                    <div
                      v-if="booking.discountAmount > 0 || booking.promoCode"
                      class="flex justify-between gap-3 text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5"
                    >
                      <span class="min-w-0">
                        {{ $t("dashboard.promo_discount") }}
                        <span v-if="booking.promoDiscountPercent > 0" class="font-extrabold">
                          {{ booking.promoDiscountPercent }}%
                        </span>
                        <span
                          v-if="booking.promoCode"
                          class="ml-1 font-mono text-xs text-emerald-700"
                          >{{ booking.promoCode }}</span
                        >
                      </span>
                      <span class="shrink-0 tabular-nums"
                        >- ฿{{ booking.discountAmount.toLocaleString() }}</span
                      >
                    </div>

                    <div
                      class="flex justify-between gap-4 text-base font-black text-[#ba0b2f] border-t border-gray-200 pt-3 mt-2"
                    >
                      <span>{{ $t("dashboard.total_due") }}</span>
                      <span class="tabular-nums"
                        >฿{{ booking.totalPrice.toLocaleString() }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions footer -->
              <div
                class="px-5 md:px-6 py-3.5 border-t border-gray-100 bg-white flex flex-wrap items-center gap-2 justify-between"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <a
                    v-if="booking.memoDocumentUrl"
                    :href="booking.memoDocumentUrl"
                    target="_blank"
                    class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    <font-awesome-icon icon="file-pdf" class="text-red-500" />
                    {{ $t("dashboard.memo_document") }}
                    <font-awesome-icon icon="external-link-alt" class="text-[10px] opacity-50" />
                  </a>
                </div>

                <div class="flex flex-wrap items-center gap-2 ml-auto">
                  <button
                    v-if="isBookingStatus(booking.status, 'approved_pending_payment')"
                    type="button"
                    @click="openPayment(booking)"
                    class="bg-sky-600 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-md shadow-sky-200/60 hover:bg-sky-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <font-awesome-icon
                      :icon="
                        activePaymentProvider === 'mock_sandbox'
                          ? 'flask'
                          : activePaymentProvider === 'stripe'
                            ? 'wallet'
                            : 'qrcode'
                      "
                    />
                    {{
                      activePaymentProvider === "mock_sandbox"
                        ? $t("dashboard.mock_pay")
                        : activePaymentProvider === "stripe"
                          ? $t("dashboard.stripe_pay")
                          : $t("dashboard.scan_pay")
                    }}
                  </button>

                  <button
                    v-if="isBookingStatus(booking.status, 'pending')"
                    type="button"
                    @click="cancelBooking(booking)"
                    class="bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-xl font-bold text-xs hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <font-awesome-icon icon="times" />
                    {{ $t("dashboard.cancel_request") }}
                  </button>

                  <button
                    v-if="canLeaveReview(booking.status) && !booking.hasFeedback"
                    type="button"
                    @click="giveFeedback(booking)"
                    class="bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-violet-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <font-awesome-icon icon="star" />
                    {{ $t("dashboard.give_review") }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="filteredBookings.length === 0"
              class="text-center py-10 text-gray-400 font-bold"
            >
              <font-awesome-icon icon="search-minus" class="text-4xl mb-3 opacity-50" />
              <p>{{ $t('dashboard.no_search_results') }}</p>
            </div>
          </div>

          <!-- Tab 2: Profile -->
          <div
            v-if="activeTab === 'profile'"
            class="bg-white rounded-3xl shadow-card-lg border border-gray-200 p-8 md:p-10 animate-fade-up"
          >
            <h2
              class="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-4"
            >
              <font-awesome-icon icon="user-edit" class="text-[#ba0b2f]" /> {{ $t('dashboard.profile_tab') }}
            </h2>
            <form @submit.prevent="saveProfile" class="space-y-8">
              <div
                class="bg-red-50/50 p-6 rounded-2xl border border-red-100 relative overflow-hidden"
              >
                <div
                  class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ba0b2f]"
                ></div>
                <h4
                  class="text-sm font-bold text-[#ba0b2f] mb-4 flex items-center gap-2"
                >
                  <font-awesome-icon icon="lock" /> {{ $t('dashboard.system_info_title') }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
                      >{{ $t('dashboard.account_email') }}</label
                    >
                    <p
                      class="text-gray-700 font-semibold bg-white px-4 py-3 rounded-xl border border-gray-200 opacity-70 cursor-not-allowed"
                    >
                      {{ userProfile.email }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
                      >{{ $t('dashboard.user_role') }}</label
                    >
                    <p
                      class="text-gray-700 font-semibold bg-white px-4 py-3 rounded-xl border border-gray-200 opacity-70 cursor-not-allowed"
                    >
                      {{
                        userProfile.role === 'admin' ? $t('dashboard.role_admin') :
                        userProfile.role === 'internal' ? $t('dashboard.role_internal') :
                        userProfile.role === 'co_organizer' ? $t('dashboard.role_coop') :
                        $t('dashboard.role_external')
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"
                >
                  <font-awesome-icon icon="pencil-alt" class="text-gray-400" />
                  {{ $t('dashboard.editable_info_title') }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                      >{{ $t('dashboard.full_name') }} <span class="text-red-500">*</span></label
                    >
                    <input
                      type="text"
                      v-model="userProfile.fullName"
                      required
                      class="w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                      :placeholder="$t('dashboard.name_placeholder')"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                      >{{ $t('dashboard.phone_number') }} <span class="text-red-500">*</span></label
                    >
                    <input
                      type="tel"
                      v-model="userProfile.phone"
                      required
                      class="w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-sm"
                      :placeholder="$t('dashboard.phone_placeholder')"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  class="bg-[#ba0b2f] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#8c0823] shadow-lg shadow-red-200 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  {{ $t('dashboard.save_profile') }} <font-awesome-icon icon="save" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
