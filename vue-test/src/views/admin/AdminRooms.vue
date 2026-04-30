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
  {
    id: 1,
    name: "ห้องประชุม ท่าสุด",
    type: "ห้องประชุม",
    capacity: 15,
    priceInternal: 2400,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1000",
  },
  {
    id: 2,
    name: "ห้องประชุมคำมอกหลวง",
    type: "ห้องประชุม",
    capacity: 200,
    priceInternal: 6000,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000",
  },
  {
    id: 3,
    name: "ลานกิจกรรม ลานประดู่แดง",
    type: "ลานกิจกรรม",
    capacity: 100,
    priceInternal: 3000,
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000",
  },
  {
    id: 4,
    name: "ห้องปฏิบัติการคอมพิวเตอร์ S1",
    type: "ห้องปฏิบัติการ",
    capacity: 60,
    priceInternal: 4000,
    isActive: false,
    image: "",
  },
]);

// ==========================================
// ➕ ฟังก์ชันเพิ่มห้องใหม่
// ==========================================
const handleAddNewRoom = () => {
  Swal.fire({
    title: "เพิ่มห้องใหม่",
    text: "นำเข้าข้อมูลห้องพักผ่านไฟล์ (CSV/Excel)",
    icon: "info",
    input: "file",
    inputAttributes: {
      accept:
        ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
    },
    showCancelButton: true,
    confirmButtonText: "อัปโหลด",
    cancelButtonText: "ยกเลิก",
    reverseButtons: false,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8",
      actions: "flex gap-3 mt-6 w-full justify-center",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold hover:bg-[#8c0823] shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.value) {
      saveLog(
        "เพิ่มข้อมูลห้องพัก (Import)",
        "นำเข้าข้อมูลห้องพักใหม่ผ่านไฟล์ Excel/CSV",
      );
      Swal.fire({
        icon: "success",
        title: "เพิ่มข้อมูลห้องพักสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
      });
    }
  });
};

// ==========================================
// 🖼️ ฟังก์ชันจัดการรูปภาพห้องพัก
// ==========================================
const handleManageImages = (room) => {
  Swal.fire({
    title: `<h3 class="text-2xl font-black text-gray-900 mb-2">รูปภาพ: ${room.name}</h3>`,
    html: `
      <div class="space-y-4">
        <div class="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center group shadow-inner">
          <!-- แสดงรูปปัจจุบัน -->
          <img id="room-preview" src="${room.image || "https://via.placeholder.com/400x250?text=No+Image"}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <p class="text-white text-xs font-bold"><i class="fas fa-camera mr-1"></i> เปลี่ยนรูปภาพ</p>
          </div>
        </div>
        <div class="text-left">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">อัปโหลดไฟล์ภาพใหม่ (.jpg, .png)</label>
          <input type="file" id="room-image-input" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-[#ba0b2f] hover:file:bg-red-100 cursor-pointer" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "บันทึกรูปภาพ",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-red-200 hover:-translate-y-0.5 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-600 border border-gray-200 rounded-2xl px-6 py-3.5 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
    didOpen: () => {
      const input = document.getElementById("room-image-input");
      const preview = document.getElementById("room-preview");
      input.onchange = (evt) => {
        const [file] = input.files;
        if (file) {
          preview.src = URL.createObjectURL(file);
        }
      };
    },
    preConfirm: () => {
      const file = document.getElementById("room-image-input").files[0];
      if (!file && !room.image) {
        Swal.showValidationMessage("กรุณาเลือกรูปภาพ");
      }
      return { file };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      saveLog("อัปเดตรูปภาพห้อง", `อัปเดตรูปภาพใหม่สำหรับห้อง: ${room.name}`);
      Swal.fire({
        icon: "success",
        title: "อัปเดตรูปภาพสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
      });
    }
  });
};

// ==========================================
// 🛡️ ระบบเปิด/ปิดการให้บริการ
// ==========================================
const openStatusConfirm = (room) => {
  const isEnable = !room.isActive;
  Swal.fire({
    html: `
      <div class="absolute top-0 left-0 w-full h-2 ${isEnable ? "bg-green-600" : "bg-[#e60000]"}"></div>
      <h3 class="text-2xl font-black text-gray-900 mb-3 mt-4 tracking-tight">
        ${isEnable ? "เปิดการให้บริการ" : "ปิดการให้บริการ"}
      </h3>
      <p class="text-gray-500 mb-4 font-medium leading-relaxed px-4">
        ${
          isEnable
            ? `คุณต้องการเปิดการใช้งาน "${room.name}" ใช่หรือไม่?`
            : `คุณต้องการปิดการใช้งาน "${room.name}" ใช่หรือไม่? ผู้ใช้จะไม่สามารถจองห้องนี้ได้`
        }
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    reverseButtons: false,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8 max-w-md relative overflow-hidden",
      actions: "flex gap-3 mt-6 w-full justify-center",
      confirmButton: `${isEnable ? "bg-green-600 hover:bg-green-700" : "bg-[#ba0b2f] hover:bg-[#8c0823]"} text-white rounded-xl px-4 py-3 font-bold shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer`,
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      room.isActive = isEnable;
      const actionText = isEnable ? "เปิดการให้บริการ" : "ปิดการให้บริการ";
      saveLog(
        "เปิด/ปิดการให้บริการ",
        `เปลี่ยนสถานะห้อง "${room.name}" เป็น ${actionText}`,
      );
      Swal.fire({
        icon: "success",
        title: "อัปเดตสถานะสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
      });
    }
  });
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header -->
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
        @click="handleAddNewRoom"
        class="w-full sm:w-auto px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <i class="fas fa-plus"></i> เพิ่มห้องใหม่
      </button>
    </div>

    <!-- Table -->
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
                <div class="flex items-center gap-4">
                  <!-- ✨ ปุ่มจัดการรูปภาพแบบมี Preview -->
                  <button
                    @click="handleManageImages(room)"
                    class="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group/img cursor-pointer shrink-0"
                  >
                    <img
                      v-if="room.image"
                      :src="room.image"
                      class="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-gray-400"
                    >
                      <i class="fas fa-image text-lg"></i>
                    </div>
                    <div
                      class="absolute inset-0 bg-[#ba0b2f]/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      แก้ไข
                    </div>
                  </button>

                  <div>
                    <p class="font-bold text-gray-900 text-sm mb-0.5">
                      {{ room.name }}
                    </p>
                    <span
                      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider"
                      >{{ room.type }}</span
                    >
                  </div>
                </div>
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
