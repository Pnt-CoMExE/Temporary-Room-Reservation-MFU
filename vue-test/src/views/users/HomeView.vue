<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import RoomCard from "@/components/room/RoomCard.vue";
import api from "@/services/api";

interface Banner {
  id: number;
  title: string;
  image: string;
  link: string;
}

interface RoomItem {
  id: number;
  name: string;
  type: string;
  capacity: number | string;
  location: string;
  image: string;
  isAvailable: boolean;
  priceHalfDayInternal: number;
}

const router = useRouter();

const searchParams = ref({
  query: "",
  date: "",
  location: "",
});

const handleSearch = () => {
  router.push({
    name: "room-list",
    query: {
      q: searchParams.value.query,
      date: searchParams.value.date,
      loc: searchParams.value.location,
    },
  });
};

const banners = ref<Banner[]>([]);

const currentBanner = ref(0);
let bannerInterval: ReturnType<typeof setInterval> | null = null;

const nextBanner = () => {
  if (banners.value.length === 0) return;
  currentBanner.value = (currentBanner.value + 1) % banners.value.length;
};

const prevBanner = () => {
  if (banners.value.length === 0) return;
  currentBanner.value =
    (currentBanner.value - 1 + banners.value.length) % banners.value.length;
};

const setBanner = (index: number) => {
  currentBanner.value = index;
};

const featuredRooms = ref<RoomItem[]>([]);

onMounted(async () => {
  // ดึงข้อมูล Banner
  try {
    const bannerRes = await api.get("/api/banners");
    if (bannerRes.data && bannerRes.data.length > 0) {
      banners.value = bannerRes.data;
      bannerInterval = setInterval(nextBanner, 5000);
    }
  } catch (err) {
    console.error("Error fetching banners:", err);
  }

  // ดึงข้อมูลห้องจาก Database จริง
  try {
    const res = await api.get("/api/featured-rooms");
    if (res.data && res.data.length > 0) {
      // ดึงห้องแนะนำตามหมวดหมู่
      featuredRooms.value = res.data.map((room: any) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        location: room.type, // ใช้ type เป็น location ชั่วคราว หรือเพิ่ม location ใน DB
        image: room.image_url || "/images/room1.jpg",
        isAvailable: room.is_active,
        priceHalfDayInternal: parseFloat(room.price_half_day_internal) || 0
      }));
    }
  } catch (err) {
    console.error("Error fetching featured rooms:", err);
  }
});

// ✅ แก้ memory leak: ล้าง interval เมื่อออกจากหน้า
onUnmounted(() => {
  if (bannerInterval) clearInterval(bannerInterval);
});
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
    <!-- Hero Section -->
    <div
      class="relative pt-32 pb-48 lg:pt-40 lg:pb-56 flex items-center justify-center overflow-hidden"
    >
      <div class="absolute inset-0 z-0">
        <picture>
          <source srcset="/images/mfu-bg.avif" type="image/avif">
          <source srcset="/images/mfu-bg.webp" type="image/webp">
          <img
            src="/images/mfu-bg.jpg"
            alt="MFU Background"
            class="w-full h-full object-cover object-center filter brightness-[0.6]"
          />
        </picture>
        <div
          class="absolute inset-0 bg-linear-to-b from-black/40 via-[#ba0b2f]/20 to-[#f8f9fa]"
        ></div>
      </div>

      <div
        class="relative z-10 text-center px-4 w-full max-w-5xl mx-auto animate-fade-up"
      >
        <!-- MFU Logo in Hero -->
        <div class="flex justify-center mb-6">
          <img
            src="/images/mfu-logo.png"
            alt="Mae Fah Luang University"
            class="h-24 md:h-32 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]"
          />
        </div>
        <span
          class="inline-block py-1.5 px-4 rounded-full bg-black/30 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/50 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg"
        >
          {{ $t('hero.badge') }}
        </span>
        <h1
          class="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl leading-tight"
        >
          {{ $t('hero.title') }}
        </h1>
        <p
          class="text-lg md:text-xl text-gray-100 mb-12 font-medium max-w-2xl mx-auto drop-shadow-md"
        >
          {{ $t('hero.subtitle') }}
        </p>

        <div
          class="bg-white/90 backdrop-blur-xl p-3 md:rounded-full rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto transform translate-y-12"
        >
          <form
            @submit.prevent="handleSearch"
            class="w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200/60"
          >
            <div
              class="flex-1 px-6 py-4 md:py-3 flex items-center hover:bg-gray-50/50 rounded-t-3xl md:rounded-l-full md:rounded-tr-none cursor-text transition-colors group"
            >
              <div
                class="text-[#ba0b2f] mr-4 text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <font-awesome-icon icon="search" />
              </div>
              <div class="w-full text-left">
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                  >{{ $t('hero.search_btn') }}</label
                >
                <input
                  type="text"
                  v-model="searchParams.query"
                  :placeholder="$t('hero.search_placeholder')"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-800 font-semibold placeholder-gray-400 outline-none"
                />
              </div>
            </div>
            <div
              class="flex-1 px-6 py-4 md:py-3 flex items-center hover:bg-gray-50/50 cursor-text transition-colors group"
            >
              <div
                class="text-[#ba0b2f] mr-4 text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <div class="w-full text-left">
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                  >{{ $t('booking.booking_date') }}</label
                >
                <input
                  type="date"
                  v-model="searchParams.date"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-800 font-semibold outline-none"
                />
              </div>
            </div>
            <div
              class="flex-1 px-6 py-4 md:py-3 flex items-center hover:bg-gray-50/50 cursor-pointer transition-colors group relative"
            >
              <div
                class="text-[#ba0b2f] mr-4 text-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <font-awesome-icon icon="layer-group" />
              </div>
              <div class="w-full text-left pr-6">
                <label
                  class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1"
                  >{{ $t('room.type') }}</label
                >
                <select
                  v-model="searchParams.location"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 text-base text-gray-800 font-semibold outline-none cursor-pointer appearance-none relative z-10"
                >
                  <option value="">{{ $t('hero.all_types') }}</option>
                  <option value="ห้องประชุม">{{ $t('room.filter_meeting') }}</option>
                  <option value="ห้องบรรยาย">{{ $t('room.filter_lecture') }}</option>
                  <option value="ห้องสัมมนา">{{ $t('room.filter_seminar') }}</option>
                  <option value="หอประชุม">{{ $t('room.filter_auditorium') }}</option>
                  <option value="ห้องปฏิบัติการ">{{ $t('room.filter_lab') }}</option>
                  <option value="ศูนย์กีฬา">{{ $t('room.filter_sports') }}</option>
                  <option value="ลานกิจกรรม">{{ $t('room.filter_plaza') }}</option>
                  <option value="อาคารสถานที่">{{ $t('room.filter_building') }}</option>
                </select><font-awesome-icon icon="chevron-down" class="absolute right-6 top-1/2 transform -translate-y-1 text-gray-400 text-xs z-0" />
              </div>
            </div>
            <div class="p-2 w-full md:w-auto mt-2 md:mt-0">
              <button
                type="submit"
                class="w-full md:w-auto bg-[#ba0b2f] hover:bg-[#8c0823] text-white text-base font-bold py-4 px-8 rounded-2xl md:rounded-full transition-all duration-300 shadow-md hover:shadow-xl flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>{{ $t('hero.search_btn') }}</span>
                <font-awesome-icon icon="arrow-right" class="ml-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <!-- ✨ ส่วนของ Banner Slider -->
      <div
        v-if="banners.length > 0"
        class="mb-16 relative rounded-3xl overflow-hidden shadow-2xl group animate-fade-up"
      >
        <div
          class="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full overflow-hidden"
        >
          <div
            class="flex h-full transition-transform duration-700 ease-in-out"
            :style="{ transform: `translateX(-${currentBanner * 100}%)` }"
          >
            <div
              v-for="banner in banners"
              :key="banner.id"
              class="w-full h-full shrink-0 relative cursor-pointer"
              @click="router.push(banner.link)"
            >
              <img
                :src="banner.image"
                :alt="banner.title"
                loading="lazy"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
              ></div>
              <div class="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                <span
                  class="inline-block px-3 py-1 bg-[#ba0b2f] text-white text-[10px] font-bold uppercase tracking-wider rounded-md mb-3"
                  >Announcement</span
                >
                <h2
                  class="text-white text-xl md:text-3xl font-extrabold drop-shadow-md truncate"
                >
                  {{ banner.title }}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <!-- ปุ่มเลื่อนซ้าย/ขวา -->
        <button
          @click="prevBanner"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ba0b2f] cursor-pointer"
        >
          <font-awesome-icon icon="chevron-left" />
        </button>
        <button
          @click="nextBanner"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ba0b2f] cursor-pointer"
        >
          <font-awesome-icon icon="chevron-right" />
        </button>

        <!-- จุด Indicators -->
        <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          <button
            v-for="(_, index) in banners"
            :key="index"
            @click="setBanner(index)"
            class="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
            :class="
              currentBanner === index
                ? 'bg-[#d4af37] w-8'
                : 'bg-white/50 hover:bg-white/80'
            "
          ></button>
        </div>
      </div>

      <!-- พื้นที่แนะนำ -->
      <div
        class="mb-12 flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-5 mt-10"
      >
        <div>
          <h2
            class="text-3xl font-extrabold text-gray-900 flex items-center gap-3"
          >
            {{ $t('home.featured_title') }}
            <span class="text-[#d4af37] text-2xl">
              <font-awesome-icon icon="star" />
            </span>
          </h2>
          <p class="text-gray-500 mt-2 text-base">
            {{ $t('home.featured_subtitle') }}
          </p>
        </div>
        <router-link
          to="/rooms"
          class="group text-sm font-bold text-[#ba0b2f] hover:text-[#8c0823] transition-all flex items-center gap-2 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-full"
        >
          {{ $t('home.view_all') }}
          <font-awesome-icon icon="arrow-right" class="transform group-hover:translate-x-1 transition-transform" />
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RoomCard v-for="room in featuredRooms" :key="room.id" :room="room" />
      </div>
    </div>

    <!-- ✨ ขั้นตอนการทำงาน (How it works) ✨ -->
    <div class="bg-white py-24 border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          class="text-[#ba0b2f] font-bold tracking-wider text-sm uppercase mb-2 block"
          >{{ $t('home.how_it_works_badge') }}</span
        >
        <h2 class="text-3xl font-extrabold text-gray-900 mb-4">
          {{ $t('home.how_it_works_title') }}
        </h2>
        <p class="text-gray-500 mb-16 max-w-2xl mx-auto text-base">
          {{ $t('home.how_it_works_subtitle') }}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div
            class="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-transparent via-gray-200 to-transparent"
          ></div>

          <div class="flex flex-col items-center relative z-10 group">
            <div
              class="w-24 h-24 bg-white border-4 border-gray-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-red-100 group-hover:bg-red-50"
            >
              <font-awesome-icon icon="search" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              {{ $t('home.step_1_title') }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-62.5">
              {{ $t('home.step_1_desc') }}
            </p>
          </div>

          <div class="flex flex-col items-center relative z-10 group">
            <div
              class="w-24 h-24 bg-white border-4 border-gray-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-red-100 group-hover:bg-red-50"
            >
              <font-awesome-icon icon="file-signature" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              {{ $t('home.step_2_title') }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-62.5">
              {{ $t('home.step_2_desc') }}
            </p>
          </div>

          <div class="flex flex-col items-center relative z-10 group">
            <div
              class="w-24 h-24 bg-white border-4 border-gray-50 text-[#ba0b2f] rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:border-red-100 group-hover:bg-red-50"
            >
              <font-awesome-icon icon="qrcode" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              {{ $t('home.step_3_title') }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-62.5">
              {{ $t('home.step_3_desc') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ✨ Big Footer ✨ -->
    <footer
      class="bg-[#111827] text-white py-16 mt-auto border-t-[6px] border-[#ba0b2f]"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12"
      >
        <div>
          <h3 class="text-2xl font-extrabold tracking-wider mb-4">
            <span class="text-[#d4af37]">MFU</span> PROPERTY
          </h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-6 whitespace-pre-line">
            {{ $t('home.footer_desc') }}
          </p>
          <div class="flex gap-4">
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ba0b2f] transition-colors"
              ><font-awesome-icon :icon="['fab', 'facebook-f']" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ba0b2f] transition-colors"
              ><font-awesome-icon icon="globe" />
            </a>
          </div>
        </div>

        <div>
          <h4
            class="text-base font-bold text-white mb-6 uppercase tracking-wider"
          >
            {{ $t('home.footer_contact_title') }}
          </h4>
          <ul class="text-gray-400 text-sm space-y-4">
            <li class="flex items-start gap-3">
              <font-awesome-icon icon="phone" class="mt-1 text-[#d4af37]" />
              <span>053-916-000</span>
            </li>
            <li class="flex items-start gap-3">
              <font-awesome-icon icon="envelope" class="mt-1 text-[#d4af37]" />
              <span>property@mfu.ac.th</span>
            </li>
            <li class="flex items-start gap-3">
              <font-awesome-icon icon="map-marker-alt" class="mt-1 text-[#d4af37]" />
              <span class="leading-relaxed whitespace-pre-line"
                >{{ $t('home.footer_contact_address') }}</span
              >
            </li>
          </ul>
        </div>

        <div>
          <h4
            class="text-base font-bold text-white mb-6 uppercase tracking-wider"
          >
            {{ $t('home.footer_menu_title') }}
          </h4>
          <ul class="text-gray-400 text-sm space-y-3">
            <li>
              <router-link
                to="/rooms"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><font-awesome-icon icon="angle-right" class="text-xs" />
                {{ $t('home.footer_menu_search') }}</router-link
              >
            </li>
            <li>
              <a
                href="#"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><font-awesome-icon icon="angle-right" class="text-xs" />
                {{ $t('home.footer_menu_manual') }}</a
              >
            </li>
            <li>
              <a
                href="#"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><font-awesome-icon icon="angle-right" class="text-xs" />
                {{ $t('home.footer_menu_rates') }}</a
              >
            </li>
            <li>
              <a
                href="#"
                class="hover:text-[#d4af37] transition-colors flex items-center gap-2"
                ><font-awesome-icon icon="angle-right" class="text-xs" />
                {{ $t('home.footer_menu_privacy') }}</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs"
      >
        <p>{{ $t('home.footer_copyright') }}</p>
        <p>{{ $t('home.footer_dev_team') }}</p>
      </div>
    </footer>
  </div>
</template>
