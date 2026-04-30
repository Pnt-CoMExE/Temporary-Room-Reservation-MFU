<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";

// ข้อมูลจำลองแบนเนอร์
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
]);

// ✨ ข้อมูลจำลองโค้ดส่วนลด (เปลี่ยน status ให้เป็น boolean isActive)
const promoCodes = ref([
  {
    id: 1,
    code: "MFU2026",
    discount: "20%",
    limit: 50,
    used: 12,
    isActive: true,
  },
  {
    id: 2,
    code: "FREEMIC",
    discount: "฿200",
    limit: 100,
    used: 89,
    isActive: true,
  },
  {
    id: 3,
    code: "NEWYEAR26",
    discount: "50%",
    limit: 20,
    used: 20,
    isActive: false,
  }, // จำลองว่าหมดอายุ/ปิดใช้งาน
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
    title:
      '<h3 class="text-2xl font-black text-gray-900 mb-2">เพิ่มแบนเนอร์ใหม่</h3>',
    html: `
      <div class="text-left">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หัวข้อแบนเนอร์</label>
        <input id="swal-input-title" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-medium mb-4" placeholder="เช่น โปรโมชั่นต้อนรับเปิดเทอม">
        
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">อัปโหลดรูปภาพ</label>
      </div>
    `,
    input: "file",
    inputAttributes: {
      accept: "image/*",
      class:
        "w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#ba0b2f] hover:file:bg-red-100 cursor-pointer",
    },
    showCancelButton: true,
    confirmButtonText: "อัปโหลดแบนเนอร์",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-red-200 hover:-translate-y-0.5 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl px-6 py-3.5 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
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
        customClass: { popup: "rounded-3xl" },
      });
    }
  });
};

const handleAddPromoCode = () => {
  Swal.fire({
    title:
      '<h3 class="text-2xl font-black text-gray-900 mb-2">สร้างรหัสส่วนลด</h3>',
    html: `
      <div class="text-left mt-4 space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">รหัสโปรโมชั่น (Code)</label>
          <input id="swal-code" class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-black tracking-widest uppercase text-lg" placeholder="เช่น SAVE50">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">มูลค่าส่วนลด</label>
          <input id="swal-discount" class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-[#ba0b2f] rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-bold" placeholder="เช่น 20% หรือ ฿500">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "บันทึกรหัส",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-sm",
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      confirmButton:
        "bg-[#d4af37] text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-yellow-200 hover:-translate-y-0.5 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl px-6 py-3.5 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
    preConfirm: () => {
      const code = document.getElementById("swal-code").value.toUpperCase();
      const discount = document.getElementById("swal-discount").value;
      if (!code || !discount)
        Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return { code, discount };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      promoCodes.value.unshift({
        id: Date.now(),
        code: result.value.code,
        discount: result.value.discount,
        limit: 100,
        used: 0,
        isActive: true,
      });
      saveLog(
        "สร้างรหัสส่วนลด",
        `สร้างรหัสโปรโมชั่นใหม่: ${result.value.code}`,
      );
      Swal.fire({
        icon: "success",
        title: "สร้างรหัสสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
      });
    }
  });
};

const handleBroadcast = () => {
  Swal.fire({
    title:
      '<h3 class="text-2xl font-black text-gray-900 mb-1">ส่งประกาศแจ้งเตือน</h3>',
    html: `
      <p class="text-sm text-gray-500 mb-6 font-medium">ส่งข้อความแจ้งเตือน (Push Notification) ไปยังผู้ใช้งานทุกคน</p>
      <div class="text-left space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หัวข้อประกาศ</label>
          <input id="swal-b-title" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" placeholder="เช่น แจ้งปิดปรับปรุงระบบชั่วคราว">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">รายละเอียดข้อความ</label>
          <textarea id="swal-b-desc" rows="4" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-none" placeholder="พิมพ์ข้อความที่ต้องการแจ้งให้ผู้ใช้ทราบ..."></textarea>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-paper-plane mr-2"></i> ส่งประกาศเลย',
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      actions: "flex flex-row gap-3 mt-8 w-full justify-center",
      confirmButton:
        "bg-blue-600 text-white rounded-2xl px-6 py-3.5 font-bold shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl px-6 py-3.5 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const title = document.getElementById("swal-b-title").value;
      saveLog("ส่งประกาศ (Broadcast)", `ส่งแจ้งเตือนหัวข้อ: ${title}`);
      Swal.fire({
        icon: "success",
        title: "ส่งแจ้งเตือนเรียบร้อย",
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
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

const toggleBannerStatus = (banner) => {
  banner.isActive = !banner.isActive;
  saveLog(
    "เปิด/ปิดแบนเนอร์",
    `เปลี่ยนสถานะแบนเนอร์ "${banner.title}" เป็น ${banner.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}`,
  );
};

// ✨ ฟังก์ชันสลับสถานะ Promo Code ผ่าน SweetAlert2
const togglePromoStatus = (promo) => {
  const isEnable = !promo.isActive;

  Swal.fire({
    html: `
      <div class="absolute top-0 left-0 w-full h-2 ${isEnable ? "bg-green-600" : "bg-gray-400"}"></div>
      <h3 class="text-2xl font-black text-gray-900 mb-3 mt-4 tracking-tight">
        ${isEnable ? "เปิดใช้งานโค้ด" : "ปิดใช้งานโค้ด"}
      </h3>
      <p class="text-gray-500 mb-4 font-medium leading-relaxed px-4">
        ${
          isEnable
            ? `คุณต้องการเปิดใช้งานโค้ด <span class="font-bold text-gray-900">${promo.code}</span> กลับมาใช่หรือไม่?`
            : `คุณต้องการระงับการใช้งานโค้ด <span class="font-bold text-gray-900">${promo.code}</span> ชั่วคราวใช่หรือไม่?`
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
      confirmButton: `${isEnable ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-900"} text-white rounded-xl px-4 py-3 font-bold shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer`,
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      promo.isActive = isEnable;
      const actionText = isEnable ? "เปิดใช้งาน" : "ระงับการใช้งาน";
      saveLog(
        "เปิด/ปิดโค้ดส่วนลด",
        `เปลี่ยนสถานะโค้ด "${promo.code}" เป็น ${actionText}`,
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
    <!-- Header ภาพรวม -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <div>
        <!-- ✨ เปลี่ยนหัวข้อเป็น การประกาศและโปรโมชั่น -->
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <i class="fas fa-bullhorn text-[#ba0b2f]"></i> การประกาศและโปรโมชั่น
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          ควบคุมแบนเนอร์หน้าแรก รหัสส่วนลด และส่งการแจ้งเตือน (Broadcast)
        </p>
      </div>
      <button
        @click="handleBroadcast"
        class="w-full sm:w-auto px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <i class="fas fa-paper-plane"></i> ส่งประกาศ (Broadcast)
      </button>
    </div>

    <!-- โซน 1: แบนเนอร์ -->
    <div
      class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-900">
          <i class="fas fa-images text-gray-400 mr-2"></i> ภาพแบนเนอร์ (Banners)
        </h3>
        <button
          @click="handleAddBanner"
          class="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors cursor-pointer"
        >
          <i class="fas fa-plus mr-1"></i> อัปโหลด
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden group"
        >
          <div
            class="relative h-40 overflow-hidden bg-gray-200"
            :class="!banner.isActive ? 'grayscale opacity-60' : ''"
          >
            <img
              :src="banner.image"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute top-3 left-3">
              <span
                v-if="banner.isActive"
                class="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                >แสดงผลอยู่</span
              >
              <span
                v-else
                class="bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                >ซ่อน</span
              >
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-900 mb-4 line-clamp-1 text-sm">
              {{ banner.title }}
            </h3>
            <div class="flex gap-2">
              <button
                @click="toggleBannerStatus(banner)"
                class="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer"
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
                class="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <i class="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- โซน 2: รหัสส่วนลด (Promo Codes) -->
    <div
      class="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-900">
          <i class="fas fa-ticket-alt text-[#d4af37] mr-2"></i> รหัสส่วนลด
          (Promo Codes)
        </h3>
        <button
          @click="handleAddPromoCode"
          class="text-xs font-bold bg-[#d4af37] text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
        >
          <i class="fas fa-plus mr-1"></i> สร้างรหัส
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              <th class="px-6 py-5 rounded-tl-xl">Code</th>
              <th class="px-6 py-5 text-center">ส่วนลด</th>
              <th class="px-6 py-5 text-center w-1/3">การใช้งาน</th>
              <th class="px-6 py-5 text-center rounded-tr-xl">
                สถานะ (เปิด/ปิด)
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- ✨ เพิ่มลูกเล่น grayscale ถ้าโค้ดปิดใช้งานอยู่ -->
            <tr
              v-for="promo in promoCodes"
              :key="promo.id"
              class="hover:bg-gray-50 transition-colors"
              :class="
                !promo.isActive ? 'opacity-50 grayscale bg-gray-50/50' : ''
              "
            >
              <td
                class="px-6 py-5 font-black text-gray-900 tracking-widest text-lg"
              >
                {{ promo.code }}
              </td>
              <td class="px-6 py-5 text-center font-bold text-[#ba0b2f]">
                {{ promo.discount }}
              </td>
              <td class="px-6 py-5 text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <!-- ✨ ถ้าใช้เต็มโควตาแล้ว ให้หลอดเป็นสีแดง -->
                  <div
                    :class="
                      promo.used >= promo.limit ? 'bg-red-500' : 'bg-blue-500'
                    "
                    class="h-2 rounded-full transition-all"
                    :style="`width: ${(promo.used / promo.limit) * 100}%`"
                  ></div>
                </div>
                <span
                  class="text-[10px] text-gray-500 font-bold uppercase tracking-wider"
                  >ใช้งานแล้ว {{ promo.used }} / {{ promo.limit }} สิทธิ์</span
                >
              </td>
              <td class="px-6 py-5 text-center">
                <!-- ✨ เพิ่มสวิตช์เปิด-ปิด ตรงนี้ -->
                <button
                  @click="togglePromoStatus(promo)"
                  class="text-3xl transition-colors outline-none cursor-pointer"
                  :class="
                    promo.isActive
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-gray-300 hover:text-gray-400'
                  "
                >
                  <i
                    :class="
                      promo.isActive ? 'fas fa-toggle-on' : 'fas fa-toggle-off'
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
