<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import api, { deleteCookie } from "@/services/api";
import QRCode from "qrcode";
import { generatePromptPayPayload } from "@/services/promptpay";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  role: string;
}

interface BookingItem {
  id: string;
  dbId: number;
  roomName: string;
  bookingDate: string;
  durationText: string;
  totalPrice: number;
  status: string;
  hasFeedback: boolean;
  feedbackData?: { rating: number; comment: string };
  addons: any[];
  adminName?: string;
  remark?: string;
  memoDocumentUrl?: string;
}

import { useI18n } from "vue-i18n";
import {
  translateRoomName,
  translateDuration,
  translateStatus,
} from "@/utils/translator";

const { t, locale } = useI18n();
const router = useRouter();
const activeTab = ref("bookings");

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

onMounted(async () => {
  const storedEmail = localStorage.getItem("userEmail");
  const storedName = localStorage.getItem("userName");
  // token อยู่ใน cookie แล้ว api.js จัดการให้อัตโนมัติ แต่ต้อง decode เพื่อดึง userId
  const { getCookie } = await import("@/services/api");
  const token = getCookie("mfu_token");

  // 1. ใส่ข้อมูลตั้งต้นจากตอน Login ก่อน
  if (storedEmail) userProfile.value.email = storedEmail;
  if (storedName) userProfile.value.fullName = storedName;

  try {
    // 2. ดึงข้อมูลโปรไฟล์
    const profileRes = await api.get(`/api/user/profile?email=${storedEmail}`);
    if (profileRes.data) {
      userProfile.value.fullName = `${profileRes.data.firstname} ${profileRes.data.lastname}`;
      userProfile.value.phone = profileRes.data.phone_number || "";
      userProfile.value.profileImage = profileRes.data.profile_picture || null;
    }

    // 3. ดึงประวัติการจอง
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      
      const bookingsRes = await api.get(`/api/user/bookings/${userId}`);
      myBookings.value = bookingsRes.data.map((b: any) => ({
        ...b,
        id: b.booking_no,
        dbId: b.id,
        roomName: b.room_name,
        bookingDate: b.booking_date,
        durationText: b.time_slot === 'full' ? 'เต็มวัน' : b.time_slot === 'half_morning' ? 'ครึ่งวันเช้า' : 'ครึ่งวันบ่าย',
        totalPrice: parseFloat(b.total_price),
        status: b.status === 'pending' ? 'รออนุมัติ' : 
                b.status === 'approved_pending_payment' ? 'รอชำระเงิน' :
                b.status === 'approved_paid' ? 'สำเร็จแล้ว' :
                b.status === 'disapproved' ? 'ไม่อนุมัติ' : b.status,
        hasFeedback: b.has_feedback,
        memoDocumentUrl: b.memo_document_url || null,
        addons: [] // Phase 2.5: could fetch booking addons if needed
      }));
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
    // แยก firstname, lastname จาก fullName ง่ายๆ
    const parts = userProfile.value.fullName.split(' ');
    const firstname = parts[0];
    const lastname = parts.slice(1).join(' ');

    await api.put("/api/user/profile", {
      email: userProfile.value.email,
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
  // สร้าง QR Code แบบ PromptPay EMVCo ด้วย qrcode library
  let qrDataUrl = "/images/qr-fallback.svg";
  try {
    const payload = generatePromptPayPayload("0994000165789", booking.totalPrice);
    qrDataUrl = await QRCode.toDataURL(payload, {
      width: 250,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    });
  } catch (err: any) {
    console.error("QR generation failed:", err);
  }

  Swal.fire({
    title:
      `<span class="font-extrabold text-2xl text-gray-900">${t('dashboard.scan_to_pay')}</span>`,
    html: `
      <p class="text-sm text-gray-500 mb-4 font-medium">${t('dashboard.net_total')}: <span class="text-[#ba0b2f] font-black text-2xl ml-1">฿${booking.totalPrice.toLocaleString()}</span></p>
      
      <!-- โซน QR Code -->
      <div class="bg-white p-4 rounded-3xl border border-gray-200 mb-4 inline-block mx-auto shadow-sm">
        <img src="${qrDataUrl}" class="w-52 h-52 mx-auto" alt="Payment QR Code" />
      </div>
      
      <div class="bg-blue-50 p-4 rounded-xl text-left flex gap-3 border border-blue-100 text-xs text-blue-800 font-medium mb-4">
        ℹ️ <p>${t('dashboard.scan_instruction')}</p>
      </div>

      <!-- ✨ เพิ่มเครดิต Opn Payments ตาม Requirement ✨ -->
      <div class="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-100 pt-4">
        🛡️ Secure Payment Processing by <span class="text-gray-800 font-black tracking-normal">Opn Payments</span>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: t('dashboard.close_window'),
    confirmButtonColor: "#111827",
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      confirmButton:
        "rounded-xl w-full py-3.5 font-bold tracking-widest cursor-pointer mt-2 hover:bg-black transition-colors",
    },
  });
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
        "bg-gradient-to-r from-[#ba0b2f] to-[#8c0823] text-white rounded-2xl px-5 py-3.5 font-bold shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-50 text-gray-600 rounded-2xl px-5 py-3.5 font-bold hover:bg-gray-100 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      deleteCookie("mfu_token");
      router.push("/");
    }
  });
};

// --- ส่วนที่ 3: รายการจอง ---

const searchQuery = ref("");
const filterStartDate = ref("");
const filterEndDate = ref("");

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
    return matchSearch && matchDate;
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

const getStatusText = (status: string) => translateStatus(status, locale.value);
const getStatusClass = (status: string) => {
  switch (status) {
    case "รออนุมัติ":
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "รอชำระเงิน":
    case "approved_pending_payment":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "สำเร็จแล้ว":
    case "approved_paid":
      return "bg-green-50 text-green-700 border-green-200";
    case "ไม่อนุมัติ":
    case "disapproved":
      return "bg-red-50 text-red-700 border-red-200";
    case "ยกเลิกแล้ว":
      return "bg-gray-100 text-gray-500 border-gray-200 line-through";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(locale.value === "en" ? "en-US" : "th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
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
            class="bg-white rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24"
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
                  class="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-gray-500 hover:bg-red-50 transition-all font-bold text-sm cursor-pointer"
                >
                  <font-awesome-icon icon="sign-out-alt" /> {{ $t('nav.logout') }}
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
              class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6"
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
              class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
              :class="
                booking.status === 'ยกเลิกแล้ว' ? 'opacity-60 grayscale-50' : ''
              "
            >
              <div
                class="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center"
              >
                <span
                  class="text-xs font-black text-gray-500 uppercase tracking-widest"
                  >Booking ID:
                  <span class="text-gray-900">{{ booking.id }}</span></span
                >
                <span
                  :class="getStatusClass(booking.status)"
                  class="px-4 py-1.5 rounded-xl text-xs font-bold border shadow-sm"
                  >{{ getStatusText(booking.status) }}</span
                >
              </div>
              <div
                class="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div class="grow">
                  <h3
                    class="text-xl font-black text-gray-800 mb-2 group-hover:text-[#ba0b2f] transition-colors"
                  >
                    {{ translateRoomName(booking.roomName, locale) }}
                  </h3>
                  <div
                    class="flex flex-wrap gap-4 text-sm text-gray-500 font-medium mb-4"
                  >
                    <span class="flex items-center gap-2"
                      ><font-awesome-icon :icon="['far', 'calendar']" class="text-[#d4af37]" />
                      {{ formatDate(booking.bookingDate) }}</span
                    >
                    <span class="flex items-center gap-2"
                      ><font-awesome-icon :icon="['far', 'clock']" class="text-[#d4af37]" />
                      {{ translateDuration(booking.durationText, locale) }}</span
                    >
                  </div>
                  <div
                    v-if="booking.addons.length > 0"
                    class="flex flex-wrap gap-2 pt-2 border-t border-gray-50"
                  >
                    <span
                      v-for="addon in booking.addons"
                      :key="addon.name"
                      class="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold"
                      >+ {{ addon.name }} ({{ addon.qty }})</span
                    >
                  </div>

                  <!-- ปุ่มดูเอกสารแนบ -->
                  <div
                    v-if="booking.memoDocumentUrl"
                    class="mt-3"
                  >
                    <a
                      :href="booking.memoDocumentUrl"
                      target="_blank"
                      class="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-all"
                    >
                      <font-awesome-icon icon="file-pdf" />
                      PDF Document
                      <font-awesome-icon icon="external-link-alt" class="text-[10px] opacity-50" />
                    </a>
                  </div>

                  <div
                    v-if="['สำเร็จแล้ว', 'ไม่อนุมัติ', 'approved_paid', 'disapproved'].includes(booking.status)"
                    class="mt-4 pt-4 border-t border-gray-100"
                  >
                    <p
                      class="text-xs text-gray-600 font-medium flex items-center gap-2"
                    >
                      <font-awesome-icon icon="user-tie" class="text-gray-400" />
                      {{ $t('dashboard.updated_by') }}
                      <span class="text-gray-900 font-bold">{{
                        booking.adminName || $t('dashboard.admin_user')
                      }}</span>
                    </p>
                    <div
                      v-if="(booking.status === 'ไม่อนุมัติ' || booking.status === 'disapproved') && booking.remark"
                      class="mt-2 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2"
                    >
                      <font-awesome-icon icon="info-circle" class="text-red-500 mt-0.5" />
                      <p
                        class="text-xs text-red-700 font-medium leading-relaxed"
                      >
                        Remark: {{ booking.remark }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="w-full md:w-auto text-left md:text-right flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 gap-2"
                >
                  <p class="text-2xl font-black text-[#ba0b2f]">
                    ฿{{ booking.totalPrice.toLocaleString() }}
                  </p>

                  <button
                    v-if="booking.status === 'รอชำระเงิน' || booking.status === 'approved_pending_payment'"
                    @click="openPayment(booking)"
                    class="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <font-awesome-icon icon="qrcode" /> {{ $t('dashboard.scan_pay') }}
                  </button>

                  <button
                    v-if="booking.status === 'รออนุมัติ' || booking.status === 'pending'"
                    @click="cancelBooking(booking)"
                    class="bg-white text-gray-500 border border-gray-200 px-5 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-gray-50 hover:text-red-600 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <font-awesome-icon icon="times" /> {{ $t('dashboard.cancel_request') }}
                  </button>

                  <button
                    v-if="
                      (booking.status === 'สำเร็จแล้ว' || booking.status === 'approved_paid') && !booking.hasFeedback
                    "
                    @click="giveFeedback(booking)"
                    class="bg-yellow-50 text-yellow-600 border border-yellow-200 px-5 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-yellow-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <font-awesome-icon icon="star" /> {{ $t('dashboard.give_review') }}
                  </button>

                  <div
                    v-if="
                      (booking.status === 'สำเร็จแล้ว' || booking.status === 'approved_paid') && booking.hasFeedback
                    "
                    class="bg-green-50 text-green-600 border border-green-200 px-4 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 mt-1"
                  >
                    <font-awesome-icon icon="check-circle" /> {{ $t('dashboard.review_submitted') }}
                  </div>
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
            class="bg-white rounded-3xl shadow-xl border border-white/50 p-8 md:p-10 animate-fade-up"
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
                      >{{ $t('dashboard.phone_number') }}</label
                    >
                    <input
                      type="tel"
                      v-model="userProfile.phone"
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
