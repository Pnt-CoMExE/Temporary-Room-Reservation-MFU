<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import api from "@/services/api";

interface RoomItem {
  id: number;
  name: string;
  type: string;
  capacity: number | string;
  isActive: boolean;
  image: string;
  price_half_day_internal: number;
  price_full_day_internal: number;
  price_half_day_co_organizer: number;
  price_full_day_co_organizer: number;
  price_half_day_external: number;
  price_full_day_external: number;
}

// ฟังก์ชันบันทึก Log
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

const roomsList = ref<RoomItem[]>([]);
const loading = ref(true);

const fetchRooms = async () => {
  loading.value = true;
  try {
    const response = await api.get("/api/admin/rooms");
    roomsList.value = response.data.map((r: any) => ({
      ...r,
      isActive: r.is_active,
      priceInternal: r.price_half_day_internal,
      image: r.image_url
    }));
  } catch (err) {
    console.error("Error fetching rooms:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchRooms());

// ==========================================
// ➕ ฟังก์ชันเพิ่มห้องใหม่ (Import Excel)
// ==========================================
const handleAddNewRoom = () => {
  Swal.fire({
    title: "นำเข้าข้อมูลห้องและพื้นที่",
    text: "เลือกไฟล์ Excel (.xlsx) เพื่ออัปเดตหรือเพิ่มห้องใหม่",
    icon: "info",
    input: "file",
    inputAttributes: {
      accept: ".xlsx, .xls",
    },
    showCancelButton: true,
    confirmButtonText: "อัปโหลดและประมวลผล",
    cancelButtonText: "ยกเลิก",
    showLoaderOnConfirm: true,
    preConfirm: async (file) => {
      if (!file) {
        Swal.showValidationMessage("กรุณาเลือกไฟล์");
        return;
      }
      
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post("/api/admin/import-rooms", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
      } catch (error) {
        Swal.showValidationMessage(`เกิดข้อผิดพลาด: ${error.response?.data?.message || error.message}`);
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
    customClass: {
      popup: "rounded-[2rem] p-8",
      confirmButton: "bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold",
      cancelButton: "bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-bold",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      saveLog(
        "นำเข้าข้อมูลห้องและพื้นที่ (Import)",
        `นำเข้าสำเร็จ ${result.value.count} รายการ`,
      );
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: result.value.message,
        confirmButtonColor: "#ba0b2f",
      });
      fetchRooms(); // รีโหลดข้อมูลใหม่
    }
  });
};

// ==========================================
// 🛡️ ระบบเปิด/ปิดการให้บริการ
// ==========================================
const openStatusConfirm = async (room) => {
  const isEnable = !room.isActive;
  const result = await Swal.fire({
    title: isEnable ? "เปิดการให้บริการ" : "ปิดการให้บริการ",
    text: `คุณต้องการ${isEnable ? "เปิด" : "ปิด"}การใช้งาน "${room.name}" ใช่หรือไม่?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: isEnable ? "#16a34a" : "#ba0b2f",
  });

  if (result.isConfirmed) {
    try {
      await api.put(`/api/admin/rooms/${room.id}/status`, {
        isActive: isEnable
      });
      room.isActive = isEnable;
      saveLog("เปลี่ยนสถานะห้อง", `เปลี่ยน "${room.name}" เป็น ${isEnable ? 'เปิด' : 'ปิด'}`);
      Swal.fire({ icon: "success", title: "อัปเดตสำเร็จ", showConfirmButton: false, timer: 1000 });
    } catch (err) {
      Swal.fire({ icon: "error", title: "ผิดพลาด", text: "ไม่สามารถอัปเดตสถานะได้" });
    }
  }
};

// ==========================================
// 🖼️ ฟังก์ชันจัดการรูปภาพห้องและพื้นที่
// ==========================================
const handleManageImages = (room) => {
  Swal.fire({
    title: `<h3 class="text-2xl font-black text-gray-900 mb-2">รูปภาพ: ${room.name}</h3>`,
    html: `
      <div class="space-y-4">
        <div class="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center group shadow-inner">
          <img id="room-preview" src="${room.image || '/images/no-image.svg'}" class="w-full h-full object-cover" />
        </div>
        <div class="text-left">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">อัปโหลดไฟล์ภาพใหม่ (.jpg, .png)</label>
          <input type="file" id="room-image-input" accept="image/*" class="w-full text-sm text-gray-500 cursor-pointer" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "บันทึกรูปภาพ",
    cancelButtonText: "ยกเลิก",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const file = document.getElementById("room-image-input").files[0];
      if (!file) {
        Swal.showValidationMessage("กรุณาเลือกรูปภาพ");
        return;
      }
      
      const formData = new FormData();
      formData.append("roomImage", file);
      formData.append("roomId", room.id);

      try {
        const response = await api.post("/api/admin/rooms/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
      } catch (error) {
        Swal.showValidationMessage(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    },
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      confirmButton: "bg-[#ba0b2f] text-white rounded-2xl px-6 py-3.5 font-bold",
      cancelButton: "bg-gray-100 text-gray-600 rounded-2xl px-6 py-3.5 font-bold",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      room.image = result.value.imageUrl;
      saveLog("อัปเดตรูปภาพห้อง", `อัปเดตรูปภาพใหม่สำหรับห้อง: ${room.name}`);
      Swal.fire({ icon: "success", title: "สำเร็จ!", showConfirmButton: false, timer: 1500 });
      fetchRooms();
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
          <font-awesome-icon icon="building" class="text-[#ba0b2f]" /> จัดการข้อมูลห้องและพื้นที่
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          เพิ่มหรืออัปเดตข้อมูลห้องและราคาผ่านการนำเข้าไฟล์ Excel เท่านั้น
        </p>
      </div>
      <button
        @click="handleAddNewRoom"
        class="w-full sm:w-auto px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <font-awesome-icon icon="file-import" /> นำเข้าไฟล์ข้อมูลใหม่
      </button>
    </div>

    <!-- Table -->
    <div
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr
              class="bg-gray-50/80 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <th class="px-2 py-4 text-center">ID</th>
              <th class="px-4 py-4">ชื่อห้อง / พื้นที่</th>
              <th class="px-2 py-4 text-center">ความจุ</th>
              <th class="px-4 py-4 text-center border-l border-gray-200">บุคคลภายใน<br/><span class="text-[9px] text-gray-400 normal-case font-normal">(ครึ่งวัน / เต็มวัน)</span></th>
              <th class="px-4 py-4 text-center border-l border-gray-200">หน่วยงานร่วมจัด<br/><span class="text-[9px] text-gray-400 normal-case font-normal">(ครึ่งวัน / เต็มวัน)</span></th>
              <th class="px-4 py-4 text-center border-l border-gray-200">บุคคลภายนอก<br/><span class="text-[9px] text-gray-400 normal-case font-normal">(ครึ่งวัน / เต็มวัน)</span></th>
              <th class="px-4 py-4 text-center border-l border-gray-200">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="room in roomsList"
              :key="room.id"
              class="hover:bg-gray-50 transition-colors"
              :class="!room.isActive ? 'opacity-60 bg-gray-50/50' : ''"
            >
              <td class="px-2 py-4 font-bold text-gray-500 text-sm text-center">
                #{{ room.id.toString().padStart(3, "0") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <!-- ✨ ปุ่มจัดการรูปภาพแบบมี Preview -->
                  <button
                    @click="handleManageImages(room)"
                    class="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group/img cursor-pointer shrink-0"
                  >
                    <img
                      v-if="room.image"
                      :src="room.image"
                      loading="lazy"
                      class="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-gray-400"
                    >
                      <font-awesome-icon icon="image" class="text-sm" />
                    </div>
                    <div
                      class="absolute inset-0 bg-[#ba0b2f]/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      รูป
                    </div>
                  </button>

                  <div class="flex-1">
                    <p class="font-bold text-gray-900 text-sm mb-0.5" :title="room.name">
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
                class="px-2 py-4 text-center text-xs font-black text-gray-700"
              >
                {{ room.capacity }}
              </td>
              
              <!-- ภายใน -->
              <td class="px-4 py-4 text-center border-l border-gray-100">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-sm font-bold text-[#ba0b2f]">฿{{ Number(room.price_half_day_internal || 0).toLocaleString() }}</span>
                  <span class="text-[10px] text-gray-400 font-bold">/ ฿{{ Number(room.price_full_day_internal || 0).toLocaleString() }}</span>
                </div>
              </td>

              <!-- ร่วมจัด -->
              <td class="px-4 py-4 text-center border-l border-gray-100">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-sm font-bold text-[#ba0b2f]">฿{{ Number(room.price_half_day_co_organizer || 0).toLocaleString() }}</span>
                  <span class="text-[10px] text-gray-400 font-bold">/ ฿{{ Number(room.price_full_day_co_organizer || 0).toLocaleString() }}</span>
                </div>
              </td>

              <!-- ภายนอก -->
              <td class="px-4 py-4 text-center border-l border-gray-100">
                <div class="flex flex-col items-center justify-center">
                  <span class="text-sm font-bold text-[#ba0b2f]">฿{{ Number(room.price_half_day_external || 0).toLocaleString() }}</span>
                  <span class="text-[10px] text-gray-400 font-bold">/ ฿{{ Number(room.price_full_day_external || 0).toLocaleString() }}</span>
                </div>
              </td>

              <td class="px-4 py-4 text-center border-l border-gray-100">
                <button
                  @click="openStatusConfirm(room)"
                  class="text-2xl transition-colors outline-none cursor-pointer"
                  :class="
                    room.isActive
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-gray-300 hover:text-gray-400'
                  "
                  :title="room.isActive ? 'เปิดให้บริการ' : 'ปิดให้บริการ'"
                >
                  <font-awesome-icon
                    :icon="room.isActive ? 'toggle-on' : 'toggle-off'"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
