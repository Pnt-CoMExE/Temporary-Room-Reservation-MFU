<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/services/api";
import RoomCard from "@/components/room/RoomCard.vue";

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

const route = useRoute();
const searchQuery = ref("");
const selectedDate = ref("");
const selectedType = ref("");
const selectedCapacity = ref("");
const sortBy = ref("default");

const rooms = ref<RoomItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchRooms = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get("/api/rooms", {
      params: {
        type: selectedType.value,
        capacity: selectedCapacity.value,
      }
    });
    rooms.value = response.data.map(room => ({
        id: room.id,
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        location: room.type,
        image: room.image_url,
        isAvailable: room.is_active,
        priceHalfDayInternal: parseFloat(room.price_half_day_internal) || 0
    }));
  } catch (err) {
    console.error("Error fetching rooms:", err);
    error.value = "ไม่สามารถโหลดข้อมูลห้องได้ กรุณาลองใหม่อีกครั้ง";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.q) searchQuery.value = route.query.q;
  if (route.query.date) selectedDate.value = route.query.date;
  if (route.query.loc) selectedType.value = route.query.loc;
  fetchRooms();
});

// Watch for filter changes to re-fetch
watch([selectedType, selectedCapacity], () => {
  fetchRooms();
});

const filteredRooms = computed(() => {
  let result = rooms.value;

  if (searchQuery.value)
    result = result.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );

  // Note: Date filtering will be implemented in Phase 2 with real booking data
  if (selectedDate.value) {
    // result = result.filter(...)
  }

  if (sortBy.value === "capacity_asc")
    result = result.slice().sort((a, b) => a.capacity - b.capacity);
  else if (sortBy.value === "capacity_desc")
    result = result.slice().sort((a, b) => b.capacity - a.capacity);
  else if (sortBy.value === "price_asc")
    result = result
      .slice()
      .sort((a, b) => a.priceHalfDayInternal - b.priceHalfDayInternal);

  return result;
});
</script>

<template>
  <div class="bg-[#f8f9fa] min-h-screen font-sans flex flex-col">
    <div
      class="relative pt-24 pb-40 lg:pt-32 lg:pb-48 flex items-center justify-center overflow-hidden"
    >
      <div class="absolute inset-0 z-0">
        <picture>
          <source srcset="/images/mfu-bg.avif" type="image/avif">
          <source srcset="/images/mfu-bg.webp" type="image/webp">
          <img
            src="/images/mfu-bg.jpg"
            class="w-full h-full object-cover filter brightness-[0.6]"
          />
        </picture>
        <div
          class="absolute inset-0 bg-linear-to-b from-black/60 via-[#ba0b2f]/30 to-[#f8f9fa]"
        ></div>
      </div>
      <div
        class="relative z-10 text-center px-4 w-full max-w-5xl mx-auto animate-fade-up"
      >
        <h1
          class="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg"
        >
          ค้นหาพื้นที่และห้องประชุม
        </h1>
        <p
          class="text-lg text-gray-200 font-medium max-w-2xl mx-auto drop-shadow"
        >
          เลือกพื้นที่ที่เหมาะกับกิจกรรมของคุณจากรายการทั้งหมดในมหาวิทยาลัย
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full grow">
      <div
        class="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 mb-12 -mt-24 relative z-20"
      >
        <!-- ✨ เปลี่ยนเป็น Grid 5 คอลัมน์สำหรับเพิ่มช่องวันที่ -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><font-awesome-icon icon="search" class="text-[#ba0b2f] mr-1" /> ค้นหา</label
            >
            <input
              type="text"
              v-model="searchQuery"
              placeholder="ชื่อห้อง/อาคาร..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold"
            />
          </div>

          <!-- ✨ ช่องเลือกวันที่ -->
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><font-awesome-icon :icon="['far', 'calendar-alt']" class="text-[#ba0b2f] mr-1" />
              วันที่ต้องการ</label
            >
            <input
              type="date"
              v-model="selectedDate"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold"
            />
          </div>

          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><font-awesome-icon icon="building" class="text-[#ba0b2f] mr-1" />
              ประเภทห้อง</label
            >
            <select
              v-model="selectedType"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold appearance-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="ห้องประชุม">ห้องประชุม</option>
              <option value="ห้องบรรยาย">ห้องบรรยาย</option>
              <option value="ลานกิจกรรม">ลานกิจกรรม</option>
            </select>
          </div>
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><font-awesome-icon icon="users" class="text-[#ba0b2f] mr-1" /> ความจุ
              (ท่าน)</label
            >
            <select
              v-model="selectedCapacity"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold appearance-none"
            >
              <option value="">ทั้งหมด</option>
              <option value="small">1 - 50 ท่าน</option>
              <option value="medium">51 - 150 ท่าน</option>
              <option value="large">150 ท่านขึ้นไป</option>
            </select>
          </div>
          <div>
            <label
              class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              ><font-awesome-icon icon="sort-amount-down" class="text-[#ba0b2f] mr-1" />
              จัดเรียงตาม</label
            >
            <select
              v-model="sortBy"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-semibold appearance-none"
            >
              <option value="default">แนะนำ</option>
              <option value="price_asc">ราคา: ต่ำไปสูง</option>
              <option value="capacity_asc">ความจุ: น้อยไปมาก</option>
              <option value="capacity_desc">ความจุ: มากไปน้อย</option>
            </select>
          </div>
        </div>
      </div>

      <div
        v-if="loading"
        class="flex flex-col justify-center items-center py-24"
      >
        <div
          class="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#ba0b2f] mb-4"
        ></div>
        <p class="text-gray-500 font-bold">กำลังโหลดข้อมูลห้อง...</p>
      </div>

      <div v-else-if="error" class="text-center py-24">
        <font-awesome-icon icon="exclamation-circle" class="text-red-500 text-5xl mb-4" />
        <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ error }}</h3>
        <button
          @click="fetchRooms"
          class="mt-4 px-6 py-2 bg-[#ba0b2f] text-white rounded-full font-bold hover:bg-[#8c0823] transition-colors"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <template v-else>
        <div
          class="mb-8 flex items-center justify-between border-b border-gray-200 pb-4"
        >
          <p class="text-gray-600 font-medium text-lg">
            พบห้องว่าง
            <span class="text-[#ba0b2f] text-2xl font-black mx-1">{{
              filteredRooms.length
            }}</span>
            ห้อง
          </p>
          <!-- ✨ อัปเดตปุ่มล้างตัวกรองให้เคลียร์ค่า selectedDate ด้วย -->
          <button
            v-if="
              searchQuery ||
              selectedDate ||
              selectedType ||
              selectedCapacity ||
              sortBy !== 'default'
            "
            @click="
              searchQuery = '';
              selectedDate = '';
              selectedType = '';
              selectedCapacity = '';
              sortBy = 'default';
            "
            class="text-sm font-bold text-[#ba0b2f] hover:text-[#8c0823] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            <font-awesome-icon icon="times-circle" /> ล้างตัวกรอง
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <RoomCard v-for="room in filteredRooms" :key="room.id" :room="room" />
        </div>

        <div
          v-if="filteredRooms.length === 0"
          class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 mt-8 shadow-sm"
        >
          <div
            class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl text-gray-300 mx-auto mb-6"
          >
            <font-awesome-icon icon="search-minus" />
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">
            ไม่พบห้องว่างในวันที่หรือเงื่อนไขที่เลือก
          </h3>
          <p class="text-gray-500 max-w-sm mx-auto leading-relaxed">
            ลองเปลี่ยนวันเวลา หรือรีเซ็ตตัวกรองเพื่อดูรายการอื่น          </p>
        </div>
      </template>
    </div>
  </div>
</template>

