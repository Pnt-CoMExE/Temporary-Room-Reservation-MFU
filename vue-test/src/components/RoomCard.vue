<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

// เรียกใช้งาน Router
const router = useRouter();

// รับข้อมูล room ที่ส่งมาจากหน้า Home หรือ RoomList
const props = defineProps({
  room: {
    type: Object,
    required: true
  }
});

// ฟังก์ชันเมื่อกดปุ่ม ให้เปลี่ยนหน้าไปที่รายละเอียดของห้องนั้นๆ
const goToRoom = () => {
  router.push(`/rooms/${props.room.id}`);
};
</script>

<template>
  <div class="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer transform hover:-translate-y-2">
    
    <div class="relative h-56 md:h-64 overflow-hidden bg-gray-200">
      <img 
        :src="room.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" 
        :alt="room.name" 
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
      />
      
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div 
        class="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg backdrop-blur-md border"
        :class="room.isAvailable ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'"
      >
        <span v-if="room.isAvailable"><i class="fas fa-check-circle mr-1"></i> ว่าง</span>
        <span v-else><i class="fas fa-times-circle mr-1"></i> มีคิวจองแล้ว</span>
      </div>

      <div class="absolute bottom-4 left-4 px-4 py-1.5 bg-white/95 text-[#ba0b2f] rounded-full text-xs font-bold shadow-lg backdrop-blur-sm transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        {{ room.type || 'ห้องประชุม' }}
      </div>
    </div>

    <div class="p-6 flex-1 flex flex-col">
      <h3 class="text-xl font-extrabold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#ba0b2f] transition-colors duration-300 leading-snug">
        {{ room.name }}
      </h3>

      <div class="w-12 h-1 bg-gradient-to-r from-[#ba0b2f] to-[#d4af37] rounded-full mb-5 mt-2"></div>

      <div class="space-y-3 mb-6 mt-auto">
        <div class="flex items-start text-sm text-gray-600">
          <div class="w-6 flex justify-center text-[#d4af37] mt-0.5"><i class="fas fa-map-marker-alt"></i></div>
          <span class="flex-1 leading-relaxed">{{ room.location || 'มหาวิทยาลัยแม่ฟ้าหลวง' }}</span>
        </div>
        <div class="flex items-center text-sm text-gray-600">
          <div class="w-6 flex justify-center text-[#d4af37]"><i class="fas fa-users"></i></div>
          <span>รองรับผู้เข้าร่วม <strong class="text-gray-900">{{ room.capacity || '-' }}</strong> ท่าน</span>
        </div>
      </div>

      <button 
        @click="goToRoom" 
        class="mt-auto w-full bg-gray-200 hover:bg-[#ba0b2f] text-gray-700 hover:text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 group/btn border border-gray-100 hover:border-[#ba0b2f]"
      >
        <span>ดูรายละเอียดและจอง</span> 
        <i class="fas fa-arrow-right transform group-hover/btn:translate-x-1.5 transition-transform duration-300"></i>
      </button>
    </div>

  </div>
</template>