<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import api from "@/services/api";

interface Banner {
  id: number;
  title: string;
  image: string;
  isActive: boolean;
  link?: string;
}

const banners = ref<Banner[]>([]);

onMounted(async () => {
  await loadBanners();
});

const loadBanners = async () => {
  try {
    const res = await api.get("/api/admin/banners");
    banners.value = (res.data || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      image: b.image,
      isActive: !!b.isActive,
      link: b.link || "/rooms",
    }));
  } catch (err) {
    console.error("Error fetching banners:", err);
    Swal.fire({
      icon: "error",
      title: "โหลดแบนเนอร์ไม่สำเร็จ",
      text: "ไม่สามารถดึงรายการแบนเนอร์ได้",
      customClass: { popup: "rounded-3xl" },
    });
  }
};

const saveLog = async (action: string, details: string) => {
  try {
    await api.post("/api/admin/logs", {
      adminName: localStorage.getItem("userName") || "เจ้าหน้าที่ จัดการทรัพย์สิน",
      action,
      details
    });
  } catch (err) {
    console.error("Failed to save log", err);
  }
};

const handleAddBanner = () => {
  Swal.fire({
    title:
      '<h3 class="text-2xl font-black text-gray-900 mb-2">เพิ่มแบนเนอร์ใหม่</h3>',
    html: `
      <div class="text-left">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หัวข้อแบนเนอร์</label>
        <input id="swal-input-title" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-medium mb-4" placeholder="เช่น โปรโมชั่นต้อนรับเปิดเทอม">
        
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ลิงก์เมื่อคลิก (ไม่บังคับ)</label>
        <input id="swal-input-link" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all font-medium mb-4" placeholder="/rooms" value="/rooms">

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
      const titleEl = document.getElementById("swal-input-title") as HTMLInputElement | null;
      const linkEl = document.getElementById("swal-input-link") as HTMLInputElement | null;
      const title = titleEl?.value?.trim() || "";
      const link = linkEl?.value?.trim() || "/rooms";
      if (!title || !file) {
        Swal.showValidationMessage("กรุณากรอกหัวข้อและเลือกรูปภาพ");
        return false;
      }
      return { title, link, file };
    },
  }).then(async (result) => {
    if (!result.isConfirmed || !result.value) return;

    const { title, link, file } = result.value;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("link", link);
    formData.append("bannerImage", file);

    try {
      const res = await api.post("/api/admin/banners", formData);
      banners.value = [res.data, ...banners.value];
      saveLog("เพิ่มแบนเนอร์", `อัปโหลดแบนเนอร์ใหม่หัวข้อ: ${title}`);
      Swal.fire({
        icon: "success",
        title: "อัปโหลดสำเร็จ!",
        text: "แบนเนอร์จะแสดงบนหน้าแรกทันที",
        showConfirmButton: false,
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "อัปโหลดไม่สำเร็จ",
        text: err?.message || "ไม่สามารถอัปโหลดแบนเนอร์ได้",
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
      <p class="text-sm text-gray-500 mb-6 font-medium">ส่งข้อความแจ้งเตือนในแอปไปยังผู้ใช้งานที่เปิดใช้งานทุกคน (กระดิ่งแจ้งเตือน)</p>
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
    confirmButtonText: '📨 ส่งประกาศเลย',
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
  }).then(async (result) => {
    if (!result.isConfirmed) return;
    const titleEl = document.getElementById("swal-b-title") as HTMLInputElement | null;
    const descEl = document.getElementById("swal-b-desc") as HTMLTextAreaElement | null;
    const title = titleEl?.value?.trim() || "";
    const body = descEl?.value?.trim() || "";
    if (!title || !body) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบ",
        customClass: { popup: "rounded-3xl" },
      });
      return;
    }
    try {
      const res = await api.post("/api/admin/broadcast", { title, body, link: "/home" });
      const count = res.data?.recipientCount ?? 0;
      Swal.fire({
        icon: "success",
        title: "ส่งแจ้งเตือนเรียบร้อย",
        text: `ส่งถึงผู้ใช้ ${count} คน — แสดงที่กระดิ่งแจ้งเตือน`,
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: "rounded-3xl" },
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ส่งไม่สำเร็จ",
        text: err?.message || "ไม่สามารถส่งประกาศได้",
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
  }).then(async (result) => {
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/admin/banners/${id}`);
      banners.value = banners.value.filter((b) => b.id !== id);
      saveLog("ลบแบนเนอร์", `ลบแบนเนอร์หัวข้อ: ${title}`);
      Swal.fire({
        icon: "success",
        title: "ลบเรียบร้อย",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: err?.message || "ไม่สามารถลบแบนเนอร์ได้",
        customClass: { popup: "rounded-3xl" },
      });
    }
  });
};

const toggleBannerStatus = async (banner) => {
  const nextActive = !banner.isActive;
  try {
    await api.put(`/api/admin/banners/${banner.id}/status`, {
      isActive: nextActive,
    });
    banner.isActive = nextActive;
    saveLog(
      "เปิด/ปิดแบนเนอร์",
      `เปลี่ยนสถานะแบนเนอร์ "${banner.title}" เป็น ${nextActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}`,
    );
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "อัปเดตไม่สำเร็จ",
      text: err?.message || "ไม่สามารถเปลี่ยนสถานะแบนเนอร์ได้",
      customClass: { popup: "rounded-3xl" },
    });
  }
};

</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header ภาพรวม -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-card border border-gray-200"
    >
      <div>
        <!-- ✨ เปลี่ยนหัวข้อเป็น การประกาศและโปรโมชั่น -->
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <font-awesome-icon icon="bullhorn" class="text-[#ba0b2f]" />           การประกาศ
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          ควบคุมแบนเนอร์หน้าแรก และส่งการแจ้งเตือน (Broadcast)
        </p>
      </div>
      <button
        @click="handleBroadcast"
        class="w-full sm:w-auto px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <font-awesome-icon icon="paper-plane" /> ส่งประกาศ (Broadcast)
      </button>
    </div>

    <!-- โซน 1: แบนเนอร์ -->
    <div
      class="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-card"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-900">
          <font-awesome-icon icon="images" class="text-gray-400 mr-2" /> ภาพแบนเนอร์ (Banners)
        </h3>
        <button
          @click="handleAddBanner"
          class="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors cursor-pointer"
        >
          <font-awesome-icon icon="plus" class="mr-1" /> อัปโหลด
        </button>
      </div>

      <div
        v-if="banners.length === 0"
        class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center"
      >
        <p class="text-sm font-semibold text-gray-500">ยังไม่มีแบนเนอร์</p>
        <p class="text-xs text-gray-400 mt-1">กด “อัปโหลด” เพื่อเพิ่มภาพที่แสดงบนหน้าแรก</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden group shadow-sm"
        >
          <div
            class="relative h-40 overflow-hidden bg-gray-200"
            :class="!banner.isActive ? 'grayscale opacity-60' : ''"
          >
            <img
              :src="banner.image"
              loading="lazy"
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
                <font-awesome-icon
                  :icon="banner.isActive ? 'eye-slash' : 'eye'"
                />
                {{ banner.isActive ? "ซ่อน" : "แสดงผล" }}
              </button>
              <button
                @click="deleteBanner(banner.id, banner.title)"
                class="w-8 h-8 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <font-awesome-icon icon="trash-alt" class="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
