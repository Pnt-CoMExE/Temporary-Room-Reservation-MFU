<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";

// ข้อมูลจำลอง
const banners = ref([
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop",
    title: "ต้อนรับเปิดเทอมใหม่ ลดราคาพื้นที่กิจกรรม 20%",
    isActive: true,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop",
    title: "เปิดให้บริการแล้ว! MFU Co-Working Space",
    isActive: true,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
    title: "จองลานกิจกรรมประดู่แดงล่วงหน้า รับฟรีอุปกรณ์เสริม",
    isActive: true,
  },
]);

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

const handleAddBanner = () => {
  Swal.fire({
    title: "เพิ่ม Banner ใหม่",
    html: `
      <input id="swal-input-title" class="swal2-input" placeholder="หัวข้อ Banner (เช่น โปรโมชั่น)">
    `,
    input: "file",
    inputAttributes: { accept: "image/*" },
    showCancelButton: true,
    confirmButtonText: "อัปโหลด",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8",
      actions: "flex gap-3 mt-6 w-full justify-center",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold hover:bg-[#8c0823] transition-all flex-1 cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 cursor-pointer",
    },
    preConfirm: (file) => {
      const title = document.getElementById("swal-input-title").value;
      if (!title || !file)
        Swal.showValidationMessage("กรุณากรอกหัวข้อและเลือกรูปภาพ");
      return { title, file };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      saveLog(
        "เพิ่มแบนเนอร์",
        `อัปโหลดแบนเนอร์ใหม่หัวข้อ: ${result.value.title}`,
      );
      Swal.fire({
        icon: "success",
        title: "อัปโหลดสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
};

const deleteBanner = (id, title) => {
  Swal.fire({
    title: "ลบแบนเนอร์?",
    text: `คุณต้องการลบแบนเนอร์ "${title}" ใช่หรือไม่?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ลบทิ้ง",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2rem] p-8",
      actions: "flex gap-3 mt-6 w-full justify-center",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold hover:bg-[#8c0823] transition-all flex-1 cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      banners.value = banners.value.filter((b) => b.id !== id);
      saveLog("ลบแบนเนอร์", `ลบแบนเนอร์หัวข้อ: ${title}`);
      Swal.fire({
        icon: "success",
        title: "ลบเรียบร้อย",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
};

const toggleStatus = (banner) => {
  banner.isActive = !banner.isActive;
  saveLog(
    "เปิด/ปิดแบนเนอร์",
    `เปลี่ยนสถานะแบนเนอร์ "${banner.title}" เป็น ${banner.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}`,
  );
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
          <i class="fas fa-images text-[#ba0b2f]"></i> จัดการแบนเนอร์ (Banners)
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          จัดการรูปภาพสไลด์โชว์ โปรโมชั่น และข่าวสารในหน้าแรก
        </p>
      </div>
      <button
        @click="handleAddBanner"
        class="w-full sm:w-auto px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <i class="fas fa-plus"></i> อัปโหลดแบนเนอร์
      </button>
    </div>

    <!-- Banner Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="banner in banners"
        :key="banner.id"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group"
      >
        <div
          class="relative h-48 overflow-hidden bg-gray-100"
          :class="!banner.isActive ? 'grayscale opacity-60' : ''"
        >
          <img
            :src="banner.image"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute top-3 left-3">
            <span
              v-if="banner.isActive"
              class="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md uppercase"
              >แสดงผลอยู่</span
            >
            <span
              v-else
              class="bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md uppercase"
              >ซ่อน</span
            >
          </div>
        </div>
        <div class="p-5">
          <h3 class="font-bold text-gray-900 mb-4 line-clamp-2">
            {{ banner.title }}
          </h3>
          <div class="flex gap-2">
            <button
              @click="toggleStatus(banner)"
              class="flex-1 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer"
              :class="
                banner.isActive
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              "
            >
              <i
                :class="banner.isActive ? 'fas fa-eye-slash' : 'fas fa-eye'"
              ></i>
              {{ banner.isActive ? "ซ่อน" : "แสดงผล" }}
            </button>
            <button
              @click="deleteBanner(banner.id, banner.title)"
              class="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
