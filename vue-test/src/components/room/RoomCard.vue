<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";

interface RoomData {
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

const props = defineProps<{
  room: RoomData;
}>();

/**
 * Determine which AVIF/WebP fallback source to use based on the current room.image.
 * If the image is from the API (external URL), return null so no <source> is rendered.
 */
const fallbackAvif = computed(() => {
  if (!props.room.image) return "/images/room-placeholder.avif";
  if (props.room.image === "/images/room1.jpg") return "/images/room1.avif";
  return null; // API image — no known fallback source
});

const fallbackWebp = computed(() => {
  if (!props.room.image) return "/images/room-placeholder.webp";
  if (props.room.image === "/images/room1.jpg") return "/images/room1.webp";
  return null; // API image — no known fallback source
});

const goToRoom = () => {
  router.push(`/rooms/${props.room.id}`);
};
</script>

<template>
  <div
    class="group bg-white rounded-4xl shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer transform hover:-translate-y-2"
  >
    <div class="relative h-56 md:h-64 overflow-hidden bg-gray-100">
      <picture>
        <source v-if="fallbackAvif" :srcset="fallbackAvif" type="image/avif">
        <source v-if="fallbackWebp" :srcset="fallbackWebp" type="image/webp">
        <img
          :src="
            room.image ||
            '/images/room-placeholder.jpg'
          "
          :alt="room.name"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </picture>

      <div
        class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"
      ></div>

      <div
        class="absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg backdrop-blur-md border"
        :class="
          room.isAvailable
            ? 'bg-white/90 text-green-600 border-white/50'
            : 'bg-red-500/90 text-white border-red-400'
        "
      >
        <span v-if="room.isAvailable"
          ><FontAwesomeIcon :icon="['fas', 'circle']" class="text-[8px] mr-1.5 animate-pulse" />
          ว่าง</span
        >
        <span v-else
          ><FontAwesomeIcon :icon="['fas', 'times-circle']" class="mr-1" /> มีคิวจองแล้ว</span
        >
      </div>

      <div
        class="absolute bottom-4 left-4 px-4 py-1.5 bg-[#ba0b2f] text-white rounded-lg text-xs font-bold shadow-lg transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
      >
        {{ room.type || "ห้องประชุม" }}
      </div>
    </div>

    <div class="p-6 lg:p-8 flex-1 flex flex-col relative">
      <div
        class="absolute top-0 left-8 right-8 h-0.5 bg-linear-to-r from-[#ba0b2f] to-[#d4af37] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>

      <h3
        class="text-xl font-extrabold text-gray-900 mb-4 line-clamp-2 group-hover:text-[#ba0b2f] transition-colors duration-300 leading-snug"
      >
        {{ room.name }}
      </h3>

      <div class="space-y-3 mb-6 mt-auto">
        <div class="flex items-start text-sm text-gray-500 font-medium">
          <div class="w-6 flex justify-center text-gray-400 mt-0.5">
            <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" />
          </div>
          <span class="flex-1 leading-relaxed">{{
            room.location || "มหาวิทยาลัยแม่ฟ้าหลวง"
          }}</span>
        </div>
        <div class="flex items-center text-sm text-gray-500 font-medium">
          <div class="w-6 flex justify-center text-gray-400">
            <FontAwesomeIcon :icon="['fas', 'users']" />
          </div>
          <span
            >รองรับผู้เข้าร่วม
            <strong class="text-gray-900">{{ room.capacity || "-" }}</strong>
            ท่าน</span
          >
        </div>
      </div>

      <div
        class="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between"
      >
        <div>
          <p
            class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5"
          >
            ราคาเริ่มต้น
          </p>
          <p class="text-lg font-black text-[#ba0b2f]">
            ฿{{ room.priceHalfDayInternal?.toLocaleString() || "0" }}
          </p>
        </div>

        <button
          @click="goToRoom"
          class="w-12 h-12 bg-red-50 hover:bg-[#ba0b2f] text-[#ba0b2f] hover:text-white rounded-full transition-all duration-300 flex justify-center items-center group/btn shadow-sm hover:shadow-md hover:-translate-y-1"
          title="ดูรายละเอียด"
        >
          <FontAwesomeIcon
            :icon="['fas', 'arrow-right']" class="transform group-hover/btn:translate-x-1 transition-transform duration-300"
          />
        </button>
      </div>
    </div>
  </div>
</template>
