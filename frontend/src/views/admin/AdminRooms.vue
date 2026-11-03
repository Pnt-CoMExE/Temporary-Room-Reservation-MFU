<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import api from "@/services/api";
import { resolveRoomImage } from "@/utils/roomImage";
import { withSwalTheme } from "@/utils/swalTheme";

const { t } = useI18n();

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
      image: resolveRoomImage(r.image_url, r.id ?? r.name, r.type)
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
  Swal.fire(withSwalTheme({
    title: t("admin.swal_import_title"),
    text: t("admin.swal_import_hint"),
    icon: "info",
    input: "file",
    inputAttributes: {
      accept: ".xlsx, .xls",
    },
    showCancelButton: true,
    confirmButtonText: t("admin.confirm"),
    cancelButtonText: t("admin.cancel"),
    showLoaderOnConfirm: true,
    preConfirm: async (file) => {
      if (!file) {
        Swal.showValidationMessage(t("admin.swal_import_hint"));
        return;
      }
      
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post("/api/admin/rooms/import", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
      } catch (error) {
        Swal.showValidationMessage(
          `${t("admin.swal_import_fail")}: ${error.response?.data?.message || error.message}`,
        );
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
    customClass: {
      popup: "rounded-[2rem] p-8",
      confirmButton: "bg-mfu-red text-white rounded-xl px-4 py-3 font-bold",
      cancelButton: "bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-bold",
    },
  })).then((result) => {
    if (result.isConfirmed) {
      saveLog(
        "นำเข้าข้อมูลห้องและพื้นที่ (Import)",
        `นำเข้าสำเร็จ ${result.value.count} รายการ`,
      );
      Swal.fire(withSwalTheme({
        icon: "success",
        title: t("admin.swal_import_ok"),
        text: result.value.message,
        confirmButtonColor: "#ba0b2f",
      }));
      fetchRooms(); // รีโหลดข้อมูลใหม่
    }
  });
};

// ==========================================
// 🛡️ ระบบเปิด/ปิดการให้บริการ
// ==========================================
const openStatusConfirm = async (room) => {
  const isEnable = !room.isActive;
  const result = await Swal.fire(withSwalTheme({
    title: t("admin.swal_toggle_room"),
    text: t("admin.swal_toggle_room_text", {
      name: room.name,
      action: t(isEnable ? "admin.swal_toggle_on" : "admin.swal_toggle_off"),
    }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: t("admin.confirm"),
    cancelButtonText: t("admin.cancel"),
    confirmButtonColor: isEnable ? "#16a34a" : "#ba0b2f",
  }));

  if (result.isConfirmed) {
    try {
      await api.put(`/api/admin/rooms/${room.id}/status`, {
        isActive: isEnable
      });
      room.isActive = isEnable;
      saveLog("เปลี่ยนสถานะห้อง", `เปลี่ยน "${room.name}" เป็น ${isEnable ? 'เปิด' : 'ปิด'}`);
      Swal.fire(withSwalTheme({ icon: "success", title: t("admin.updated"), showConfirmButton: false, timer: 1000 }));
    } catch (err) {
      Swal.fire(withSwalTheme({ icon: "error", title: t("admin.error"), text: t("admin.swal_status_fail") }));
    }
  }
};

// ==========================================
// 🖼️ ฟังก์ชันจัดการรูปภาพห้องและพื้นที่
// ==========================================
const handleManageImages = (room) => {
  Swal.fire(withSwalTheme({
    title: `<h3 class="text-2xl font-black text-gray-900 mb-2">${t("admin.swal_upload_image")}: ${room.name}</h3>`,
    html: `
      <div class="space-y-4">
        <div class="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center group shadow-inner">
          <img id="room-preview" src="${resolveRoomImage(room.image, room.id ?? room.name, room.type)}" class="w-full h-full object-cover" />
        </div>
        <div class="text-left">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">${t("admin.swal_upload_image")} (.jpg, .png)</label>
          <input type="file" id="room-image-input" accept="image/*" class="w-full text-sm text-gray-500 cursor-pointer" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: t("admin.save"),
    cancelButtonText: t("admin.cancel"),
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const file = document.getElementById("room-image-input").files[0];
      if (!file) {
        Swal.showValidationMessage(t("admin.swal_upload_image"));
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
        Swal.showValidationMessage(`${t("admin.error")}: ${error.message}`);
      }
    },
    customClass: {
      popup: "rounded-[2.5rem] p-8 max-w-md",
      confirmButton: "bg-mfu-red text-white rounded-2xl px-6 py-3.5 font-bold",
      cancelButton: "bg-gray-100 text-gray-600 rounded-2xl px-6 py-3.5 font-bold",
    },
  })).then((result) => {
    if (result.isConfirmed) {
      room.image = result.value.imageUrl;
      saveLog("อัปเดตรูปภาพห้อง", `อัปเดตรูปภาพใหม่สำหรับห้อง: ${room.name}`);
      Swal.fire(withSwalTheme({ icon: "success", title: t("admin.success"), showConfirmButton: false, timer: 1500 }));
      fetchRooms();
    }
  });
};

const handleEditRoom = (room: RoomItem) => {
  Swal.fire(withSwalTheme({
    title: `<h3 class="text-xl font-black text-gray-900">${t("admin.swal_edit_room")} #${room.id}</h3>`,
    html: `
      <div class="text-left space-y-4 mt-2">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">${t("admin.swal_room_name")}</label>
          <input id="edit-name" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold" value="${String(room.name).replace(/"/g, "&quot;")}">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">${t("admin.col_type")}</label>
            <input id="edit-type" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold" value="${String(room.type).replace(/"/g, "&quot;")}">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">${t("admin.swal_room_capacity")}</label>
            <input id="edit-cap" type="number" min="1" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold" value="${Number(room.capacity) || 1}">
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 overflow-hidden">
          <div class="px-3 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-2">
            <p class="text-sm font-extrabold text-gray-800">${t("admin.col_rates")} ${t("admin.baht")}</p>
            <div class="grid grid-cols-2 gap-2 w-[58%] text-[11px] font-bold text-gray-500 text-center">
              <span>${t("admin.half_day")}</span>
              <span>${t("admin.full_day")}</span>
            </div>
          </div>

          <div class="divide-y divide-gray-100">
            <div class="px-3 py-2.5 flex items-center gap-2 bg-red-50/40">
              <div class="w-[42%] min-w-0">
                <p class="text-xs font-extrabold text-mfu-red-dark">${t("admin.swal_rates_internal")}</p>
                <p class="text-[10px] font-medium text-red-700/70">${t("admin.org_internal")}</p>
              </div>
              <div class="grid grid-cols-2 gap-2 w-[58%]">
                <input id="edit-hi" type="number" min="0" class="w-full px-2.5 py-2 bg-white border border-red-100 rounded-lg text-sm font-bold text-mfu-red tabular-nums" value="${Number(room.price_half_day_internal || 0)}">
                <input id="edit-fi" type="number" min="0" class="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 tabular-nums" value="${Number(room.price_full_day_internal || 0)}">
              </div>
            </div>

            <div class="px-3 py-2.5 flex items-center gap-2 bg-amber-50/50">
              <div class="w-[42%] min-w-0">
                <p class="text-xs font-extrabold text-amber-900">${t("admin.swal_rates_coop")}</p>
                <p class="text-[10px] font-medium text-amber-800/70">${t("admin.org_coop")}</p>
              </div>
              <div class="grid grid-cols-2 gap-2 w-[58%]">
                <input id="edit-hc" type="number" min="0" class="w-full px-2.5 py-2 bg-white border border-amber-100 rounded-lg text-sm font-bold text-amber-800 tabular-nums" value="${Number(room.price_half_day_co_organizer || 0)}">
                <input id="edit-fc" type="number" min="0" class="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 tabular-nums" value="${Number(room.price_full_day_co_organizer || 0)}">
              </div>
            </div>

            <div class="px-3 py-2.5 flex items-center gap-2 bg-sky-50/50">
              <div class="w-[42%] min-w-0">
                <p class="text-xs font-extrabold text-sky-900">${t("admin.swal_rates_external")}</p>
                <p class="text-[10px] font-medium text-sky-800/70">${t("admin.org_external")}</p>
              </div>
              <div class="grid grid-cols-2 gap-2 w-[58%]">
                <input id="edit-he" type="number" min="0" class="w-full px-2.5 py-2 bg-white border border-sky-100 rounded-lg text-sm font-bold text-sky-800 tabular-nums" value="${Number(room.price_half_day_external || 0)}">
                <input id="edit-fe" type="number" min="0" class="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 tabular-nums" value="${Number(room.price_full_day_external || 0)}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: t("admin.save"),
    cancelButtonText: t("admin.cancel"),
    showLoaderOnConfirm: true,
    width: "36rem",
    customClass: {
      popup: "rounded-[2rem] p-6",
      confirmButton: "bg-mfu-red text-white rounded-xl px-5 py-3 font-bold cursor-pointer",
      cancelButton: "bg-gray-100 text-gray-700 rounded-xl px-5 py-3 font-bold cursor-pointer",
    },
    preConfirm: async () => {
      const name = (document.getElementById("edit-name") as HTMLInputElement)?.value?.trim();
      const type = (document.getElementById("edit-type") as HTMLInputElement)?.value?.trim();
      const capacity = Number((document.getElementById("edit-cap") as HTMLInputElement)?.value);
      if (!name || !type || !capacity) {
        Swal.showValidationMessage(t("admin.error"));
        return false;
      }
      const prices = {
        halfInternal: Number((document.getElementById("edit-hi") as HTMLInputElement)?.value) || 0,
        fullInternal: Number((document.getElementById("edit-fi") as HTMLInputElement)?.value) || 0,
        halfCoop: Number((document.getElementById("edit-hc") as HTMLInputElement)?.value) || 0,
        fullCoop: Number((document.getElementById("edit-fc") as HTMLInputElement)?.value) || 0,
        halfExternal: Number((document.getElementById("edit-he") as HTMLInputElement)?.value) || 0,
        fullExternal: Number((document.getElementById("edit-fe") as HTMLInputElement)?.value) || 0,
      };
      try {
        await api.put(`/api/admin/rooms/${room.id}`, { name, type, capacity, prices });
        return { name, type, capacity, prices };
      } catch (err: any) {
        Swal.showValidationMessage(err?.message || t("admin.error"));
        return false;
      }
    },
  })).then((result) => {
    if (!result.isConfirmed || !result.value) return;
    const { name, type, capacity, prices } = result.value;
    room.name = name;
    room.type = type;
    room.capacity = capacity;
    room.price_half_day_internal = prices.halfInternal;
    room.price_full_day_internal = prices.fullInternal;
    room.price_half_day_co_organizer = prices.halfCoop;
    room.price_full_day_co_organizer = prices.fullCoop;
    room.price_half_day_external = prices.halfExternal;
    room.price_full_day_external = prices.fullExternal;
    saveLog("แก้ไขห้อง", `อัปเดตห้อง: ${name}`);
    Swal.fire(withSwalTheme({ icon: "success", title: t("admin.updated"), showConfirmButton: false, timer: 1200 }));
  });
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <!-- Header -->
    <div class="ui-card ui-admin-header p-6">
      <div>
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <font-awesome-icon icon="building" class="text-mfu-red" /> {{ $t("admin.rooms_title") }}
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          {{ $t("admin.rooms_subtitle") }}
        </p>
      </div>
      <button
        @click="handleAddNewRoom"
        class="ui-btn-primary w-full sm:w-auto"
      >
        <font-awesome-icon icon="file-import" /> {{ $t("admin.import_rooms") }}
      </button>
    </div>

    <!-- Table -->
    <div class="ui-table-card">
      <div
        class="px-5 py-3 border-b border-gray-100 bg-gray-50/70 flex flex-wrap items-center justify-between gap-2"
      >
        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600">
          <span class="text-gray-500">{{ $t("admin.price_key") }}</span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200">
            <span class="w-1.5 h-1.5 rounded-full bg-mfu-red"></span>
            {{ $t("admin.half_day") }}
          </span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200">
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            {{ $t("admin.full_day") }}
          </span>
          <span class="text-gray-400 font-medium">{{ $t("admin.baht") }}</span>
        </div>
        <p class="text-xs text-gray-500 font-bold">
          {{ $t("admin.rooms_count", { n: roomsList.length }) }}
        </p>
      </div>
      <div class="ui-table-wrap max-h-[70vh] rounded-none border-0 shadow-none">
        <table class="w-full text-left border-collapse min-w-[980px] table-fixed">
          <colgroup>
            <col class="w-[4.5rem]" />
            <col />
            <col class="w-[5.5rem]" />
            <col class="w-[11rem]" />
            <col class="w-[11rem]" />
            <col class="w-[11rem]" />
            <col class="w-[5.5rem]" />
          </colgroup>
          <thead>
            <tr class="bg-white border-b border-gray-200">
              <th class="px-3 py-4 text-center text-sm font-extrabold text-gray-500">ID</th>
              <th class="px-4 py-4 text-left text-sm font-extrabold text-gray-700">{{ $t("admin.col_room") }}</th>
              <th class="px-2 py-4 text-center text-sm font-extrabold text-gray-700">{{ $t("admin.col_capacity") }}</th>
              <th class="px-3 py-4 text-center bg-red-50/60">
                <p class="text-sm font-extrabold text-mfu-red-dark">{{ $t("admin.swal_rates_internal") }}</p>
                <p class="text-[11px] font-semibold text-red-700/70 mt-0.5 normal-case">{{ $t("admin.half_day") }} · {{ $t("admin.full_day") }}</p>
              </th>
              <th class="px-3 py-4 text-center bg-amber-50/70">
                <p class="text-sm font-extrabold text-amber-900">{{ $t("admin.swal_rates_coop") }}</p>
                <p class="text-[11px] font-semibold text-amber-800/70 mt-0.5 normal-case">{{ $t("admin.half_day") }} · {{ $t("admin.full_day") }}</p>
              </th>
              <th class="px-3 py-4 text-center bg-sky-50/70">
                <p class="text-sm font-extrabold text-sky-900">{{ $t("admin.swal_rates_external") }}</p>
                <p class="text-[11px] font-semibold text-sky-800/70 mt-0.5 normal-case">{{ $t("admin.half_day") }} · {{ $t("admin.full_day") }}</p>
              </th>
              <th class="px-3 py-4 text-center text-sm font-extrabold text-gray-700">{{ $t("admin.col_status") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(room, idx) in roomsList"
              :key="room.id"
              class="transition-colors"
              :class="[
                !room.isActive ? 'opacity-55 bg-gray-50/80' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                'hover:bg-amber-50/50',
              ]"
            >
              <td class="px-3 py-4 font-bold text-gray-400 text-xs text-center tabular-nums">
                #{{ room.id.toString().padStart(3, "0") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    @click="handleManageImages(room)"
                    class="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group/img cursor-pointer shrink-0 shadow-sm"
                  >
                    <img
                      :src="room.image || '/images/room-placeholder.jpg'"
                      loading="lazy"
                      class="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                    />
                    <div
                      class="absolute inset-0 bg-mfu-red/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      {{ $t("admin.btn_image") }}
                    </div>
                  </button>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start gap-2 mb-1">
                      <p
                        class="font-bold text-gray-900 text-sm leading-snug line-clamp-2"
                        :title="room.name"
                      >
                        {{ room.name }}
                      </p>
                      <button
                        type="button"
                        @click="handleEditRoom(room)"
                        class="shrink-0 text-[10px] font-bold text-mfu-red bg-red-50 border border-red-100 px-2 py-0.5 rounded-md hover:bg-red-100 cursor-pointer"
                      >
                        {{ $t("admin.btn_edit") }}
                      </button>
                    </div>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200"
                    >{{ room.type }}</span>
                  </div>
                </div>
              </td>
              <td class="px-2 py-4 text-center">
                <span class="inline-flex min-w-[2.5rem] justify-center px-2 py-1 rounded-lg bg-gray-100 text-xs font-black text-gray-700 tabular-nums">
                  {{ room.capacity }}
                </span>
              </td>

              <td class="px-3 py-4 bg-red-50/25">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/80 border border-red-100 px-2 py-1">
                    <span class="text-[10px] font-bold text-red-700/80 shrink-0">{{ $t("admin.tag_half") }}</span>
                    <span class="text-sm font-black text-mfu-red tabular-nums">฿{{ Number(room.price_half_day_internal || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/60 border border-gray-100 px-2 py-1">
                    <span class="text-[10px] font-bold text-gray-500 shrink-0">{{ $t("admin.tag_full") }}</span>
                    <span class="text-sm font-bold text-gray-700 tabular-nums">฿{{ Number(room.price_full_day_internal || 0).toLocaleString() }}</span>
                  </div>
                </div>
              </td>

              <td class="px-3 py-4 bg-amber-50/30">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/80 border border-amber-100 px-2 py-1">
                    <span class="text-[10px] font-bold text-amber-800/80 shrink-0">{{ $t("admin.tag_half") }}</span>
                    <span class="text-sm font-black text-amber-800 tabular-nums">฿{{ Number(room.price_half_day_co_organizer || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/60 border border-gray-100 px-2 py-1">
                    <span class="text-[10px] font-bold text-gray-500 shrink-0">{{ $t("admin.tag_full") }}</span>
                    <span class="text-sm font-bold text-gray-700 tabular-nums">฿{{ Number(room.price_full_day_co_organizer || 0).toLocaleString() }}</span>
                  </div>
                </div>
              </td>

              <td class="px-3 py-4 bg-sky-50/30">
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/80 border border-sky-100 px-2 py-1">
                    <span class="text-[10px] font-bold text-sky-800/80 shrink-0">{{ $t("admin.tag_half") }}</span>
                    <span class="text-sm font-black text-sky-800 tabular-nums">฿{{ Number(room.price_half_day_external || 0).toLocaleString() }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-2 rounded-lg bg-white/60 border border-gray-100 px-2 py-1">
                    <span class="text-[10px] font-bold text-gray-500 shrink-0">{{ $t("admin.tag_full") }}</span>
                    <span class="text-sm font-bold text-gray-700 tabular-nums">฿{{ Number(room.price_full_day_external || 0).toLocaleString() }}</span>
                  </div>
                </div>
              </td>

              <td class="px-3 py-4 text-center">
                <button
                  type="button"
                  @click="openStatusConfirm(room)"
                  class="text-2xl transition-colors outline-none cursor-pointer"
                  :class="
                    room.isActive
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-gray-300 hover:text-gray-400'
                  "
                  :title="$t(room.isActive ? 'admin.active' : 'admin.inactive')"
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
