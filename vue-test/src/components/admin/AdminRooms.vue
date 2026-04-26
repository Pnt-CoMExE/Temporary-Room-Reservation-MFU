<script setup>
import { ref } from "vue";

const roomsList = ref([
  {
    id: 1,
    name: "ห้องประชุม ท่าสุด",
    type: "ห้องประชุม",
    capacity: 15,
    priceInternal: 2400,
    isActive: true,
  },
  {
    id: 2,
    name: "ห้องประชุมคำมอกหลวง",
    type: "ห้องประชุม",
    capacity: 200,
    priceInternal: 6000,
    isActive: true,
  },
  {
    id: 3,
    name: "ลานกิจกรรม ลานประดู่แดง",
    type: "ลานกิจกรรม",
    capacity: 100,
    priceInternal: 3000,
    isActive: true,
  },
  {
    id: 4,
    name: "ห้องปฏิบัติการคอมพิวเตอร์ S1",
    type: "ห้องปฏิบัติการ",
    capacity: 60,
    priceInternal: 4000,
    isActive: false,
  },
]);

// ==========================================
// 📝 ระบบจัดการ Modal แก้ไขข้อมูลห้องพัก
// ==========================================
const showEditModal = ref(false);
const editForm = ref({
  id: null,
  name: "",
  capacity: 0,
  priceInternal: 0,
});

const openEditModal = (room) => {
  editForm.value = { ...room }; // คัดลอกข้อมูลห้องที่เลือกเข้าสู่ฟอร์ม
  showEditModal.value = true;
};

const saveEdit = () => {
  const index = roomsList.value.findIndex((r) => r.id === editForm.value.id);
  if (index !== -1) {
    roomsList.value[index] = { ...editForm.value }; // อัปเดตข้อมูลใน List หลัก
    alert(`อัปเดตข้อมูล ${editForm.value.name} เรียบร้อยแล้ว!`);
    showEditModal.value = false;
  }
};

// ==========================================
// 🛡️ ระบบจัดการ Modal แจ้งเตือนเปิด/ปิดห้อง (เดิม)
// ==========================================
const showStatusModal = ref(false);
const modalData = ref({ room: null, title: "", message: "", type: "" });

const openStatusConfirm = (room) => {
  modalData.value.room = room;
  modalData.value.type = room.isActive ? "disable" : "enable";
  modalData.value.title = room.isActive
    ? "ปิดการให้บริการ"
    : "เปิดการให้บริการ";
  modalData.value.message = room.isActive
    ? `คุณต้องการปิดการใช้งาน "${room.name}" ใช่หรือไม่? ผู้ใช้จะไม่สามารถจองห้องนี้ได้`
    : `คุณต้องการเปิดการใช้งาน "${room.name}" ใช่หรือไม่?`;
  showStatusModal.value = true;
};

const executeToggleStatus = () => {
  if (modalData.value.room) {
    modalData.value.room.isActive = !modalData.value.room.isActive;
  }
  showStatusModal.value = false;
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <div>
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <i class="fas fa-building text-[#ba0b2f]"></i> จัดการข้อมูลห้องพัก
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          แก้ไขความจุและราคาสำหรับการให้บริการพื้นที่
        </p>
      </div>
      <button
        class="w-full sm:w-auto px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <i class="fas fa-plus"></i> เพิ่มห้องใหม่
      </button>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-200">
          <thead>
            <tr
              class="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <th class="px-6 py-5">ID</th>
              <th class="px-6 py-5">ชื่อห้อง / พื้นที่</th>
              <th class="px-6 py-5 text-center">ความจุ</th>
              <th class="px-6 py-5 text-right">ราคาเริ่มต้น</th>
              <th class="px-6 py-5 text-center">สถานะ</th>
              <th class="px-6 py-5 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="room in roomsList"
              :key="room.id"
              class="hover:bg-gray-50 transition-colors"
              :class="!room.isActive ? 'opacity-60 bg-gray-50/50' : ''"
            >
              <td class="px-6 py-5 font-bold text-gray-500 text-sm">
                #{{ room.id.toString().padStart(3, "0") }}
              </td>
              <td class="px-6 py-5">
                <p class="font-bold text-gray-900 text-sm mb-1">
                  {{ room.name }}
                </p>
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"
                  >{{ room.type }}</span
                >
              </td>
              <td
                class="px-6 py-5 text-center text-sm font-black text-gray-700"
              >
                {{ room.capacity }} ท่าน
              </td>
              <td class="px-6 py-5 text-right font-black text-[#ba0b2f]">
                ฿{{ room.priceInternal.toLocaleString() }}
              </td>
              <td class="px-6 py-5 text-center">
                <button
                  @click="openStatusConfirm(room)"
                  class="text-3xl transition-colors outline-none cursor-pointer"
                  :class="
                    room.isActive
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-gray-300 hover:text-gray-400'
                  "
                >
                  <i
                    :class="
                      room.isActive ? 'fas fa-toggle-on' : 'fas fa-toggle-off'
                    "
                  ></i>
                </button>
              </td>
              <td class="px-6 py-5 text-center">
                <button
                  @click="openEditModal(room)"
                  class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors mx-auto shadow-sm border border-blue-100 hover:border-transparent"
                >
                  <i class="fas fa-pen"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div
        class="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-fade-up relative overflow-hidden"
      >
        <div class="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>

        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-black text-gray-900 tracking-tight">
            แก้ไขข้อมูลห้องพัก
          </h3>
          <button
            @click="showEditModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-5">
          <div>
            <label
              class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"
              >ชื่อห้อง / พื้นที่</label
            >
            <input
              type="text"
              :value="editForm.name"
              disabled
              class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-bold cursor-not-allowed"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"
                >ความจุ (ท่าน)</label
              >
              <div class="relative">
                <i
                  class="fas fa-users absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                ></i>
                <input
                  type="number"
                  v-model="editForm.capacity"
                  class="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>

            <div>
              <label
                class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"
                >ราคา (บาท)</label
              >
              <div class="relative">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm"
                  >฿</span
                >
                <input
                  type="number"
                  v-model="editForm.priceInternal"
                  class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-[#ba0b2f]"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 mt-10">
          <button
            @click="showEditModal = false"
            class="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-widest"
          >
            ยกเลิก
          </button>
          <button
            @click="saveEdit"
            class="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-sm uppercase tracking-widest transform hover:-translate-y-1"
          >
            บันทึกข้อมูล
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showStatusModal"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div
        class="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center animate-fade-up relative overflow-hidden"
      >
        <div
          :class="modalData.type === 'enable' ? 'bg-green-500' : 'bg-red-500'"
          class="absolute top-0 left-0 w-full h-2"
        ></div>
        <h3 class="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          {{ modalData.title }}
        </h3>
        <p class="text-gray-500 mb-8 font-medium leading-relaxed">
          {{ modalData.message }}
        </p>
        <div class="flex gap-4">
          <button
            @click="showStatusModal = false"
            class="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 text-sm uppercase tracking-widest"
          >
            ยกเลิก
          </button>
          <button
            @click="executeToggleStatus"
            :class="
              modalData.type === 'enable'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            "
            class="flex-1 py-4 text-white font-bold rounded-2xl shadow-lg text-sm uppercase tracking-widest transform hover:-translate-y-1"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
