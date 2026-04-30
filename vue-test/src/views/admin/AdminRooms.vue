<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";

// ฟังก์ชันบันทึก Log ลง LocalStorage
const saveLog = (action, details) => {
  const logs = JSON.parse(localStorage.getItem("adminActivityLogs") || "[]");
  logs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleString("th-TH"),
    adminName: "เจ้าหน้าที่ จัดการทรัพย์สิน",
    action,
    details,
  });
  localStorage.setItem("adminActivityLogs", JSON.stringify(logs));
};

const roomsList = ref([
  { id: 1, name: "ห้องประชุม ท่าสุด", type: "ห้องประชุม", capacity: 15, priceInternal: 2400, isActive: true },
  { id: 2, name: "ห้องประชุมคำมอกหลวง", type: "ห้องประชุม", capacity: 200, priceInternal: 6000, isActive: true },
  { id: 3, name: "ลานกิจกรรม ลานประดู่แดง", type: "ลานกิจกรรม", capacity: 100, priceInternal: 3000, isActive: true },
  { id: 4, name: "ห้องปฏิบัติการคอมพิวเตอร์ S1", type: "ห้องปฏิบัติการ", capacity: 60, priceInternal: 4000, isActive: false },
]);

// ==========================================
// ➕ ฟังก์ชันเพิ่มห้องใหม่ (อัปโหลดไฟล์)
// ==========================================
const handleAddNewRoom = () => {
  Swal.fire({
    title: 'เพิ่มห้องใหม่',
    text: 'นำเข้าข้อมูลห้องพักผ่านไฟล์ (CSV/Excel)',
    icon: 'info',
    input: 'file',
    inputAttributes: { accept: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' },
    showCancelButton: true,
    confirmButtonText: 'อัปโหลด',
    cancelButtonText: 'ยกเลิก',
    reverseButtons: false, 
    buttonsStyling: false,
    customClass: { 
      popup: 'rounded-[2rem] p-8', 
      actions: 'flex gap-3 mt-6 w-full justify-center',
      confirmButton: 'bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold hover:bg-[#8c0823] shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer', 
      cancelButton: 'bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer' 
    }
  }).then((result) => {
    if (result.value) {
      saveLog("เพิ่มข้อมูลห้องพัก (Import)", "นำเข้าข้อมูลห้องพักใหม่ผ่านไฟล์ Excel/CSV"); 
      Swal.fire({ icon: 'success', title: 'เพิ่มข้อมูลห้องพักสำเร็จ!', showConfirmButton: false, timer: 1500 });
    }
  });
};

// ==========================================
// 🛡️ ระบบเปิด/ปิดการให้บริการ (ผ่าน SweetAlert2)
// ==========================================
const openStatusConfirm = (room) => {
  const isEnable = !room.isActive;
  
  Swal.fire({
    html: `
      <div class="absolute top-0 left-0 w-full h-2 ${isEnable ? 'bg-green-600' : 'bg-[#e60000]'}"></div>
      <h3 class="text-2xl font-black text-gray-900 mb-3 mt-4 tracking-tight">
        ${isEnable ? 'เปิดการให้บริการ' : 'ปิดการให้บริการ'}
      </h3>
      <p class="text-gray-500 mb-4 font-medium leading-relaxed px-4">
        ${isEnable 
          ? `คุณต้องการเปิดการใช้งาน "${room.name}" ใช่หรือไม่?` 
          : `คุณต้องการปิดการใช้งาน "${room.name}" ใช่หรือไม่? ผู้ใช้จะไม่สามารถจองห้องนี้ได้`}
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    reverseButtons: false, // สลับให้ปุ่มยืนยันอยู่ด้านซ้าย
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-md relative overflow-hidden",
      actions: "flex gap-3 mt-6 w-full justify-center",
      // ปรับให้เป็นสีแดงเข้มกรณีปิด สีเขียวกรณีเปิด
      confirmButton: `${isEnable ? 'bg-green-600 hover:bg-green-700' : 'bg-[#ba0b2f] hover:bg-[#8c0823]'} text-white rounded-xl px-4 py-3 font-bold shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer`,
      cancelButton: "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    }
  }).then((result) => {
    if (result.isConfirmed) {
      room.isActive = isEnable;
      const actionText = isEnable ? "เปิดการให้บริการ" : "ปิดการให้บริการ";
      saveLog("เปิด/ปิดการให้บริการ", `เปลี่ยนสถานะห้อง "${room.name}" เป็น ${actionText}`);
      
      Swal.fire({ icon: 'success', title: 'อัปเดตสถานะสำเร็จ!', showConfirmButton: false, timer: 1500 });
    }
  });
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <i class="fas fa-building text-[#ba0b2f]"></i> จัดการข้อมูลห้องพัก
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">แก้ไขความจุและราคาสำหรับการให้บริการพื้นที่</p>
      </div>
      <button @click="handleAddNewRoom" class="w-full sm:w-auto px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
        <i class="fas fa-plus"></i> เพิ่มห้องใหม่
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-200">
          <thead>
            <tr class="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th class="px-6 py-5">ID</th>
              <th class="px-6 py-5">ชื่อห้อง / พื้นที่</th>
              <th class="px-6 py-5 text-center">ความจุ</th>
              <th class="px-6 py-5 text-right">ราคาเริ่มต้น</th>
              <th class="px-6 py-5 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="room in roomsList" :key="room.id" class="hover:bg-gray-50 transition-colors" :class="!room.isActive ? 'opacity-60 bg-gray-50/50' : ''">
              <td class="px-6 py-5 font-bold text-gray-500 text-sm">#{{ room.id.toString().padStart(3, "0") }}</td>
              <td class="px-6 py-5">
                <p class="font-bold text-gray-900 text-sm mb-1">{{ room.name }}</p>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">{{ room.type }}</span>
              </td>
              <td class="px-6 py-5 text-center text-sm font-black text-gray-700">{{ room.capacity }} ท่าน</td>
              <td class="px-6 py-5 text-right font-black text-[#ba0b2f]">฿{{ room.priceInternal.toLocaleString() }}</td>
              <td class="px-6 py-5 text-center">
                <button @click="openStatusConfirm(room)" class="text-3xl transition-colors outline-none cursor-pointer" :class="room.isActive ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'">
                  <i :class="room.isActive ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>