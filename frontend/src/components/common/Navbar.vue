<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import api from "@/services/api";
import { clearAuthSession, getStoredUserEmail } from "@/utils/auth";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";

interface Notification {
  id: number;
  type: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

import { useI18n } from "vue-i18n";
const { t } = useI18n();
const router = useRouter();
const isMenuOpen = ref(false);
const isNotifOpen = ref(false);
const userName = ref(localStorage.getItem("userName") || "ผู้ใช้งาน");
const profileImage = ref<string | null>(null);

// โหลดรูปโปรไฟล์จาก Google (profile_picture ใน DB)
const loadProfileImage = async () => {
  const email = getStoredUserEmail();
  if (!email) return;
  try {
    const res = await api.get("/api/user/profile", { params: { email } });
    if (res.data?.profile_picture) {
      profileImage.value = res.data.profile_picture;
    }
  } catch {
    // Silently fail — fallback icon will be shown
  }
};

onMounted(loadProfileImage);

// ✨ ข้อมูลแจ้งเตือนจำลอง
const notifications = ref<Notification[]>([
  {
    id: 1,
    type: "promo",
    title: "โปรโมชั่นใหม่!",
    desc: "รับส่วนลด 20% ทันทีเมื่อกรอกโค้ด MFU2026",
    time: "10 นาทีที่แล้ว",
    read: false,
  },
  {
    id: 2,
    type: "status",
    title: "การจองสำเร็จ",
    desc: "การจองห้องประชุมคำมอกหลวง ได้รับการอนุมัติแล้ว",
    time: "2 ชั่วโมงที่แล้ว",
    read: true,
  },
]);

const closeMenu = () => {
  isMenuOpen.value = false;
};
const toggleNotif = () => {
  isNotifOpen.value = !isNotifOpen.value;
};
const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.read = true));
};

const confirmLogout = () => {
  isMenuOpen.value = false;
  Swal.fire({
    html: `
      <div class="relative w-24 h-24 mx-auto mb-6">
        <div class="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
        <div class="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-sm border-[4px] border-red-50 text-[#ba0b2f] text-4xl">
          <FontAwesomeIcon :icon="['fas', 'sign-out-alt']" class="ml-1 translate-x-0.5" />
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
</script>

<template>
  <div>
    <nav
      class="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-gray-100 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <RouterLink to="/home" class="flex items-center group">
              <img
                src="/images/mfu-logo.png"
                alt="MFU Logo"
                class="h-9 md:h-12 w-auto mr-2 md:mr-3 object-contain drop-shadow-sm"
              />
              <div
                class="flex flex-col transform group-hover:scale-105 transition-transform duration-300"
              >
                <span
                  class="text-2xl font-extrabold text-[#ba0b2f] leading-none tracking-tight"
                  >MFU</span
                >
                <span
                  class="text-[10px] font-bold text-[#d4af37] tracking-[0.2em] mt-0.5"
                  >PROPERTY</span
                >
              </div>
            </RouterLink>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <RouterLink
              to="/home"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              {{ $t('nav.home') }}<span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>
            <RouterLink
              to="/rooms"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              {{ $t('nav.rooms') }}<span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>
            <RouterLink
              to="/dashboard"
              class="text-sm font-bold text-gray-600 hover:text-[#ba0b2f] transition-colors relative group"
            >
              {{ $t('nav.dashboard') }}<span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ba0b2f] transition-all duration-300 group-hover:w-full"
              ></span>
            </RouterLink>

            <div class="flex items-center gap-4 pl-4 border-l border-gray-200">
              <!-- ✨ ปุ่มสลับภาษา (TH / EN) -->
              <LanguageSwitcher />

              <!-- ✨ ชื่อผู้ใช้งาน และ รูปโปรไฟล์ Google -->
              <div class="hidden lg:flex items-center gap-3">
                <img v-if="profileImage" :src="profileImage" referrerpolicy="no-referrer" class="w-8 h-8 rounded-full shadow-sm object-cover border border-gray-200" />
                <div v-else class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"><FontAwesomeIcon :icon="['fas', 'user']" class="text-xs" /></div>
                <span class="text-xs font-bold text-gray-500">
                  {{ $t('nav.welcome') }} <span class="text-[#ba0b2f]">{{ userName }}</span>
                </span>
              </div>

              <!-- ✨ ไอคอนกระดิ่งแจ้งเตือน -->
              <div class="relative">
                <button
                  @click="toggleNotif"
                  class="w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-[#ba0b2f] flex items-center justify-center transition-colors relative cursor-pointer outline-none"
                >
                  <FontAwesomeIcon :icon="['fas', 'bell']" />
                  <span
                    v-if="notifications.some((n) => !n.read)"
                    class="absolute top-2 right-2.5 w-2 h-2 bg-[#ba0b2f] rounded-full border border-white"
                  ></span>
                </button>

                <!-- กล่อง Popup แจ้งเตือน -->
                <div
                  v-if="isNotifOpen"
                  class="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-down z-50"
                >
                  <div
                    class="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50"
                  >
                    <h3 class="font-bold text-gray-900">{{ $t('nav.notifications') }}</h3>
                    <button
                      @click="markAllAsRead"
                      class="text-[10px] font-bold text-[#ba0b2f] hover:underline cursor-pointer"
                    >
                      {{ $t('nav.mark_all_read') }}
                    </button>
                  </div>
                  <div class="max-h-80 overflow-y-auto">
                    <div
                      v-for="notif in notifications"
                      :key="notif.id"
                      class="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      :class="!notif.read ? 'bg-red-50/30' : ''"
                    >
                      <div class="flex gap-3">
                        <div
                          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          :class="
                            notif.type === 'promo'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-green-50 text-green-600'
                          "
                        >
                          <FontAwesomeIcon
                            :icon="
                              notif.type === 'promo'
                                ? ['fas', 'tags']
                                : ['fas', 'check-circle']
                            "
                          />
                        </div>
                        <div>
                          <p class="text-sm font-bold text-gray-900 mb-0.5">
                            {{ notif.title }}
                          </p>
                          <p class="text-xs text-gray-500 leading-relaxed">
                            {{ notif.desc }}
                          </p>
                          <p class="text-[10px] font-bold text-gray-400 mt-2">
                            <FontAwesomeIcon :icon="['far', 'clock']" class="mr-1" /> {{ notif.time }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                @click="confirmLogout"
                class="group bg-white text-gray-600 px-5 py-2.5 rounded-full font-bold hover:bg-red-50 hover:text-[#ba0b2f] transition-all duration-300 border border-gray-200 hover:border-red-100 text-sm flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"                  >
                  <FontAwesomeIcon
                    :icon="['fas', 'sign-out-alt']" class="text-gray-400 group-hover:text-[#ba0b2f] transition-colors"
                  />
                {{ $t('nav.logout') }}
              </button>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              @click="toggleNotif"
              class="relative w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer"
            >
              <FontAwesomeIcon :icon="['fas', 'bell']" />
              <span
                v-if="notifications.some((n) => !n.read)"
                class="absolute top-2 right-2.5 w-2 h-2 bg-[#ba0b2f] rounded-full border border-white"
              ></span>
            </button>
            <button
              @click="isMenuOpen = !isMenuOpen"
              class="text-gray-600 hover:text-[#ba0b2f] focus:outline-none p-2 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <FontAwesomeIcon v-if="!isMenuOpen" :icon="['fas', 'bars']" class="text-lg" />
              <FontAwesomeIcon v-else :icon="['fas', 'times']" class="text-lg" />
            </button>
          </div>
        </div>
      </div>

      <!-- เมนูมือถือ -->
      <div
        v-if="isMenuOpen"
        class="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl absolute w-full left-0 animate-fade-down z-50"
      >
        <div class="px-4 pt-4 pb-6 space-y-2">
          <RouterLink
            to="/home"
            @click="closeMenu"
            class="block px-4 py-3.5 text-gray-700 hover:bg-red-50 hover:text-[#ba0b2f] rounded-xl font-bold transition-colors"
            >{{ $t('nav.home') }}</RouterLink
          >
          <RouterLink
            to="/rooms"
            @click="closeMenu"
            class="block px-4 py-3.5 text-gray-700 hover:bg-red-50 hover:text-[#ba0b2f] rounded-xl font-bold transition-colors"
            >{{ $t('nav.rooms') }}</RouterLink
          >
          <RouterLink
            to="/dashboard"
            @click="closeMenu"
            class="block px-4 py-3.5 text-gray-700 hover:bg-red-50 hover:text-[#ba0b2f] rounded-xl font-bold transition-colors"
            >{{ $t('nav.dashboard') }}</RouterLink
          >
          <div class="pt-4 border-t border-gray-100 mt-2">
            <button
              @click="confirmLogout"
              class="w-full bg-linear-to-r from-[#ba0b2f] to-[#8c0823] text-white py-4 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <FontAwesomeIcon :icon="['fas', 'sign-out-alt']" class="mr-2" /> {{ $t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
