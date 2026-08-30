<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";

interface RoomDetail {
  id: number;
  name: string;
  type: string;
  capacity: number | string;
  location: string;
  description: string;
  image_url: string;
  price_half_day_internal: number;
  price_full_day_internal: number;
  price_half_day_co_organizer: number;
  price_full_day_co_organizer: number;
  price_half_day_external: number;
  price_full_day_external: number;
  is_active: boolean;
}

interface BookedSlot {
  date: string;
  time: string;
  status: string;
  memoDocumentUrl?: string;
}

const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;

const room = ref<RoomDetail | null>(null);
const loading = ref(true);
const fetchError = ref(false);
const userRole = ref(localStorage.getItem("userRole") || "external");

const bookedSlots = ref<BookedSlot[]>([]);

const fetchRoomDetail = async () => {
  loading.value = true;
  fetchError.value = false;
  try {
    const response = await api.get(`/api/rooms/${roomId}`);
    room.value = response.data;

    // Fetch real bookings
    const bookingsRes = await api.get(`/api/rooms/${roomId}/bookings`);
    bookedSlots.value = bookingsRes.data.map((b: any) => ({
      date: b.booking_date.split('T')[0],
      time: b.time_slot === 'full' ? 'เต็มวัน' : b.time_slot === 'half_morning' ? 'ครึ่งวันเช้า' : 'ครึ่งวันบ่าย',
      status: b.status === 'pending' ? 'รออนุมัติ' : 'จองแล้ว',
      memoDocumentUrl: b.memo_document_url || undefined
    }));
  } catch (err: any) {
    console.error("Error fetching room details:", err);
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchRoomDetail());

const displayPrices = computed(() => {
  if (!room.value) return { half: 0, full: 0 };
  
  if (userRole.value === "admin") { // Admin usually sees internal or full range, default to internal
    return { half: room.value.price_half_day_internal, full: room.value.price_full_day_internal };
  } else if (userRole.value === "internal") {
    return { half: room.value.price_half_day_internal, full: room.value.price_full_day_internal };
  } else if (userRole.value === "co_organizer") {
    return { half: room.value.price_half_day_co_organizer, full: room.value.price_full_day_co_organizer };
  } else {
    return { half: room.value.price_half_day_external, full: room.value.price_full_day_external };
  }
});

import { useI18n } from "vue-i18n";
import {
  translateRoomName,
  translateRoomType,
  translateLocation,
  translateDuration,
  translateStatus,
} from "@/utils/translator";

const { locale } = useI18n();

const displayRoomName = computed(() => translateRoomName(room.value?.name, locale.value));
const displayRoomType = computed(() => translateRoomType(room.value?.type, locale.value));
const displayRoomLocation = computed(() => translateLocation(room.value?.location, locale.value));

const goBack = () => router.push("/rooms");
const goToBooking = () => router.push(`/booking/${roomId}`);
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(locale.value === "en" ? "en-US" : "th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const amenities = [
  "โปรเจคเตอร์ / จอทีวี",
  "กระดานไวท์บอร์ด",
  "เครื่องปรับอากาศ",
  "อินเทอร์เน็ต Wi-Fi",
  "จุดเสียบปลั๊กไฟ",
  "โต๊ะ-เก้าอี้ปรับเปลี่ยนรูปแบบได้",
];
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

    <!-- Error / Not Found State -->
    <div
      v-else-if="fetchError || !room"
      class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-[#ba0b2f] text-4xl mb-6 border border-red-100">
        <font-awesome-icon icon="exclamation-triangle" />
      </div>
      <h2 class="text-2xl font-extrabold text-gray-900 mb-3">{{ $t('room.room_not_found_title') }}</h2>
      <p class="text-gray-500 font-medium mb-8 max-w-sm">{{ $t('room.room_not_found_desc') }}</p>
      <button
        @click="goBack"
        class="px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all cursor-pointer"
      >
        <font-awesome-icon icon="arrow-left" class="mr-2" />{{ $t('room.back_to_all_rooms') }}
      </button>
    </div>

    <div v-else-if="room" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        @click="goBack"
        class="mb-8 flex items-center text-gray-500 hover:text-[#ba0b2f] font-bold transition-all group cursor-pointer"
      >
        <div
          class="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform"
        >
          <font-awesome-icon icon="arrow-left" />
        </div>
        {{ $t('booking.back_to_rooms') }}
      </button>

      <div
        class="w-full h-100 md:h-125 rounded-3xl overflow-hidden mb-10 shadow-2xl relative"
      >
        <img
          :src="room.image_url"
          :alt="room.name"
          loading="lazy"
          class="w-full h-full object-cover"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
        ></div>
        <div class="absolute bottom-0 left-0 p-8 md:p-12 text-white">
          <span
            class="inline-block px-3 py-1 bg-[#ba0b2f] text-xs font-bold uppercase tracking-wider rounded-lg mb-4"
            >{{ displayRoomType }}</span
          >
          <h1
            class="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight"
          >
            {{ displayRoomName }}
          </h1>
          <div class="flex flex-wrap gap-4 text-sm font-medium">
            <span class="flex items-center gap-2"
              ><font-awesome-icon icon="map-marker-alt" class="text-[#d4af37]" />
              {{ displayRoomLocation }}</span
            >
            <span class="text-gray-400">|</span>
            <span class="flex items-center gap-2"
              ><font-awesome-icon icon="users" class="text-[#d4af37]" /> {{ $t('room.capacity') }}
              {{ room.capacity }} {{ $t('room.people') }}</span
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
              <font-awesome-icon icon="info-circle" class="text-[#ba0b2f]" /> {{ $t('room.details') }}
            </h3>
            <p
              class="text-gray-600 leading-relaxed text-lg bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              {{ room.description || 'Modern multi-purpose facility equipped with full audiovisual systems.' }}
            </p>
          </section>

          <section>
            <h3
              class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"
            >
              <font-awesome-icon :icon="['far', 'calendar-check']" class="text-[#ba0b2f]" />
              {{ $t('room.status_unavailable') }}
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
                    <font-awesome-icon :icon="['far', 'clock']" />
                  </div>
                  <div>
                    <span class="block font-bold text-gray-900">{{
                      formatDate(slot.date)
                    }}</span>
                    <span class="text-sm text-gray-500">{{ translateDuration(slot.time, locale) }}</span>
                  </div>
                </div>
                <span
                  class="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full uppercase tracking-wider"
                  >{{ translateStatus(slot.status, locale) }}</span
                >
              </div>
            </div>
            <div
              v-else
              class="bg-green-50/50 p-6 rounded-2xl border border-green-100 flex items-center gap-4 text-green-700"
            >
              <font-awesome-icon icon="check-circle" class="text-2xl" />
              <div>
                <p class="font-bold text-lg">{{ $t('room.status_available') }}</p>
              </div>
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
              {{ $t('room.pricing_title') }}
            </h3>

            <div class="space-y-4 mb-8">
              <div
                class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span class="text-gray-600 font-medium"
                  >{{ $t('room.half_day') }}</span
                >
                <span class="text-xl font-black text-[#ba0b2f]"
                  >฿{{ (displayPrices.half || 0).toLocaleString() }}</span
                >
              </div>
              <div
                class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span class="text-gray-600 font-medium">{{ $t('room.full_day') }}</span>
                <span class="text-xl font-black text-[#ba0b2f]"
                  >฿{{ (displayPrices.full || 0).toLocaleString() }}</span
                >
              </div>
            </div>

            <button
              @click="goToBooking"
              class="w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg shadow-red-200 bg-[#ba0b2f] hover:bg-[#8c0823] transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              {{ $t('room.book_now') }} <font-awesome-icon icon="arrow-right" class="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
