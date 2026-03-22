<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

// รับข้อมูลห้องพักที่ถูกส่งมาจากหน้าหลัก
const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// ฟังก์ชันสำหรับกดดูรายละเอียดห้อง
const goToDetail = () => {
  router.push(`/rooms/${props.room.id}`)
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 relative">
    <span 
      :class="room.isAvailable ? 'bg-green-500' : 'bg-gray-500'" 
      class="absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md z-10"
    >
      {{ room.isAvailable ? 'ว่าง' : 'ไม่ว่าง' }}
    </span>
    
    <div class="overflow-hidden h-52 relative">
      <img :src="room.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" :alt="room.name" />
    </div>
    
    <div class="p-6 flex flex-col grow">
      <h5 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{{ room.name }}</h5>
      
      <p class="text-sm text-gray-600 mb-3 flex items-center">
        <span class="mr-2">🔹</span> {{ room.type }} | 👥 {{ room.capacity }} ท่าน
      </p>
      
      <p class="text-[#ba0b2f] font-semibold text-sm mb-3">
        💰 เริ่มต้น {{ room.priceHalfDayInternal.toLocaleString() }} บาท / ครึ่งวัน
      </p>
      
      <p class="text-xs text-gray-500 mb-6 grow flex items-end">
        📍 {{ room.location }}
      </p>

      <button 
        @click="goToDetail"
        class="w-full py-3 rounded-xl font-bold text-[#ba0b2f] bg-red-50 hover:bg-[#ba0b2f] hover:text-white transition-colors border border-[#ba0b2f]"
      >
        ดูรายละเอียด
      </button>
    </div>
  </div>
</template>