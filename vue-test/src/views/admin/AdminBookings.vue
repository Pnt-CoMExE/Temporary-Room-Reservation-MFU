<script setup lang="ts">
import { ref, computed, watch, type PropType } from "vue";
import Swal from "sweetalert2";
import api, { getCookie } from "@/services/api";

interface BookingItem {
  id: string;
  dbId: number;
  userName: string;
  roomName: string;
  date: string;
  duration: string;
  totalPrice: number;
  status: string;
  hasFeedback: boolean;
  feedbackData?: { rating: number; comment: string };
  actionBy?: string;
  hasDoc?: boolean;
  tempDocFile?: File;
  memoDocumentUrl?: string;
}

// Helper: decode JWT เพื่อดึง userId ของ admin ที่ login อยู่
const getAdminId = (): number | null => {
  const token = getCookie("mfu_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch { return null; }
};

const props = defineProps({
  initialBookings: {
    type: Array as PropType<BookingItem[]>,
    default: () => []
  }
});
const bookings = ref<BookingItem[]>([]);

// Sync with props
watch(() => props.initialBookings, (newVal) => {
  bookings.value = [...newVal];
}, { immediate: true });

const updateBookingStatus = async (id, status, remark = "") => {
  const item = bookings.value.find(b => b.id === id);
  if (!item) return;

  try {
    const formData = new FormData();
    formData.append("status", status);
    formData.append("remarks", remark);
    formData.append("adminId", getAdminId() || ""); // ✅ ดึง adminId จาก token จริง
    
    if (item.tempDocFile) {
      formData.append("approvalDocument", item.tempDocFile);
    }

    await api.put(`/api/admin/bookings/${item.dbId}/status`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    item.status = status;
    item.actionBy = localStorage.getItem("userName") || "เจ้าหน้าที่ จัดการทรัพย์สิน";
    
    Swal.fire({
      icon: "success",
      title: "ดำเนินการสำเร็จ!",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถอัปเดตสถานะได้",
    });
  }
};

const saveLog = async (action, details) => {
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

const searchQuery = ref("");
const filterStartDate = ref("");
const filterEndDate = ref("");

// เลือกเฉพาะรายการที่ต้องการ
const selectedIds = ref<Set<string>>(new Set());
const selectableCount = computed(() =>
  filteredBookings.value.filter(b => b.memoDocumentUrl || b.hasDoc).length
);
const selectedCount = computed(() => selectedIds.value.size);
const hasSelection = computed(() => selectedIds.value.size > 0);
const isAllSelected = computed(() =>
  selectableCount.value > 0 && selectedIds.value.size === selectableCount.value
);

const toggleSelect = (id: string) => {
  const newSet = new Set(selectedIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  selectedIds.value = newSet;
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = new Set();
  } else {
    const ids = new Set<string>();
    filteredBookings.value
      .filter(b => b.memoDocumentUrl || b.hasDoc)
      .forEach(b => ids.add(b.id));
    selectedIds.value = ids;
  }
};

const clearSelection = () => {
  selectedIds.value = new Set();
};

const filteredBookings = computed(() => {
  return bookings.value.filter((booking) => {
    const matchSearch =
      booking.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      booking.roomName
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchQuery.value.toLowerCase());

    let matchDate = true;
    if (filterStartDate.value && filterEndDate.value) {
      matchDate =
        booking.date >= filterStartDate.value &&
        booking.date <= filterEndDate.value;
    } else if (filterStartDate.value) {
      matchDate = booking.date >= filterStartDate.value;
    } else if (filterEndDate.value) {
      matchDate = booking.date <= filterEndDate.value;
    }
    return matchSearch && matchDate;
  });
});

const isDownloading = ref(false);

const downloadZip = async () => {
  if (isDownloading.value) return;

  const selectedItems = filteredBookings.value.filter(b =>
    selectedIds.value.has(b.id)
  );

  if (selectedItems.length === 0) {
    Swal.fire({
      icon: "info",
      title: "ไม่ได้เลือกรายการ",
      text: "กรุณาเลือกอย่างน้อย 1 รายการที่มีเอกสารแนบก่อนดาวน์โหลด",
      confirmButtonText: "ตกลง",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "bg-[#ba0b2f] text-white rounded-xl px-6 py-3 font-bold cursor-pointer",
      },
    });
    return;
  }

  const ids = selectedItems.map(b => b.dbId);

  isDownloading.value = true;

  // แสดง loading spinner
  Swal.fire({
    title: "กำลังสร้างไฟล์ ZIP",
    html: `
      <div class="flex flex-col items-center gap-4 py-4">
        <div class="w-14 h-14 border-4 border-[#ba0b2f] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500 font-medium">กำลังดาวน์โหลดเอกสาร ${ids.length} รายการ...</p>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "rounded-3xl",
    },
  });

  try {
    const response = await api.post(
      "/api/admin/bookings/export-zip",
      { ids },
      { responseType: "blob" }
    );

    // ปิด loading spinner
    Swal.close();

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `booking-documents-${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    saveLog("ดาวน์โหลดเอกสาร ZIP", `ดาวน์โหลดเอกสาร ${ids.length} รายการ`);

    Swal.fire({
      icon: "success",
      title: "ดาวน์โหลดสำเร็จ!",
      text: `เอกสาร ${ids.length} รายการถูกรวมเป็นไฟล์ ZIP แล้ว`,
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "rounded-3xl",
      },
    });
  } catch (err) {
    // ปิด loading spinner
    Swal.close();

    console.error("Error downloading ZIP:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถดาวน์โหลดเอกสารได้",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "bg-[#ba0b2f] text-white rounded-xl px-6 py-3 font-bold cursor-pointer",
      },
    });
  } finally {
    isDownloading.value = false;
  }
};

const exportPermission = (id) => {
  const item = bookings.value.find((b) => b.id === id);
  if (item && item.dbId) {
    const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.open(`${apiBaseURL}/api/admin/bookings/${item.dbId}/template`, '_blank');
    saveLog("โหลดใบขออนุญาต", `ดาวน์โหลดเอกสารของรายการ: ${id}`);
    openConfirm(id, "manage_pending");
  } else {
    Swal.fire("ข้อผิดพลาด", "ไม่พบข้อมูลอ้างอิงของระบบ", "error");
  }
};

const importPermission = (id) => {
  Swal.fire({
    title: "แนบใบอนุมัติ",
    text: `อัปโหลดไฟล์ที่เซ็นอนุมัติแล้วสำหรับรายการ ${id} (PDF, Word, รูปภาพ)`,
    icon: "info",
    input: "file",
    inputAttributes: { accept: ".pdf, .doc, .docx, image/*" },
    showCancelButton: true,
    confirmButtonText: "อัปโหลดเอกสาร",
    cancelButtonText: "ยกเลิก",
    reverseButtons: false,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl p-8",
      actions: "flex gap-3 mt-6 w-full justify-center",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-xl px-4 py-3 font-bold hover:bg-[#8c0823] shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
    },
  }).then((result) => {
    if (result.value) {
      const item = bookings.value.find((b) => b.id === id);
      if (item) {
        item.hasDoc = true;
        item.tempDocFile = result.value;
      }

      saveLog("แนบใบอนุมัติ", `เตรียมเอกสารอนุมัติสำหรับรายการ: ${id} แล้ว`);
      Swal.fire({
        icon: "success",
        title: "แนบไฟล์แล้ว!",
        text: "กรุณากด 'อนุมัติ' เพื่อส่งข้อมูลเข้าสู่ระบบ",
        showConfirmButton: true,
        confirmButtonText: "ดำเนินการต่อ",
        confirmButtonColor: "#16a34a"
      }).then(() => {
        openConfirm(id, "manage_pending");
      });
    } else {
      openConfirm(id, "manage_pending");
    }
  });
};

const openConfirm = (id, type) => {
  const item = bookings.value.find((b) => b.id === id);

  if (type === "manage_pending") {
    Swal.fire({
      title: "จัดการคำขอจองพื้นที่",
      html: `
        <p class="mb-5 text-gray-500 text-sm font-medium">จัดการเอกสาร หรือเลือกว่าจะ "อนุมัติ" หรือ "ปฏิเสธ" คำขอรหัส <b>${id}</b></p>
        <div class="flex flex-col sm:flex-row justify-center gap-3 mb-4 border-b border-gray-100 pb-6">
          <button id="btn-export-doc" class="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-1/2">
            <font-awesome-icon icon="file-download" /> ใบขออนุญาต
          </button>
          <button id="btn-import-doc" class="bg-purple-50 text-purple-600 px-4 py-3 rounded-xl text-xs font-bold border border-purple-100 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-1/2 ${item.hasDoc ? "ring-2 ring-purple-400 bg-purple-100" : ""}">
            <font-awesome-icon icon="file-upload" /> ${item.hasDoc ? "แนบใบอนุมัติ ✓" : "แนบใบอนุมัติ"}
          </button>
        </div>
        ${!item.hasDoc ? '<p class="text-xs text-red-500 mb-2 font-bold"><font-awesome-icon icon="exclamation-circle" /> บังคับแนบใบอนุมัติก่อน จึงจะสามารถกดอนุมัติได้</p>' : ""}
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      denyButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: false,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2rem] p-6 max-w-md",
        actions: "flex flex-wrap gap-3 mt-4 w-full justify-center",
        confirmButton:
          "bg-green-600 text-white rounded-xl px-6 py-3 font-bold hover:bg-green-700 shadow-md transition-all cursor-pointer",
        denyButton:
          "bg-[#ba0b2f] text-white rounded-xl px-6 py-3 font-bold hover:bg-[#8c0823] shadow-md transition-all cursor-pointer",
        cancelButton:
          "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-6 py-3 font-bold hover:bg-gray-200 transition-all cursor-pointer",
      },
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        if (!item.hasDoc) {
          confirmBtn.disabled = true;
          confirmBtn.style.opacity = "0.4";
          confirmBtn.style.cursor = "not-allowed";
        }
        Swal.getPopup()
          .querySelector("#btn-export-doc")
          .addEventListener("click", () => {
            Swal.close();
            exportPermission(id);
          });
        Swal.getPopup()
          .querySelector("#btn-import-doc")
          .addEventListener("click", () => {
            Swal.close();
            importPermission(id);
          });
      },
    }).then((result) => {
      if (item) {
        if (result.isConfirmed) {
          updateBookingStatus(id, "approved_pending_payment");
          saveLog(
            "อนุมัติคำขอจอง",
            `อนุมัติรายการจอง: ${id} ของ ${item.userName} แล้ว`,
          );
        } else if (result.isDenied) {
          // ✨ เพิ่มส่วนให้แอดมินกรอกเหตุผลที่ปฏิเสธ ✨
          Swal.fire({
            title: "ระบุเหตุผลที่ไม่อนุมัติ",
            input: "textarea",
            inputPlaceholder: "เช่น เอกสารไม่ครบถ้วน...",
            showCancelButton: true,
            confirmButtonText: "ยืนยันการปฏิเสธ",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#ba0b2f",
            customClass: {
              popup: "rounded-3xl",
              confirmButton: "rounded-xl px-6 py-3 font-bold",
            },
            preConfirm: (remark) => {
              if (!remark) {
                Swal.showValidationMessage("กรุณาระบุเหตุผล");
              }
              return remark;
            },
          }).then((remarkResult) => {
            if (remarkResult.isConfirmed) {
              updateBookingStatus(id, "disapproved", remarkResult.value);
              saveLog(
                "ปฏิเสธคำขอจอง",
                `ปฏิเสธรายการจอง: ${id} ของ ${item.userName} (เหตุผล: ${remarkResult.value})`,
              );
            }
          });
        }
      }
    });
  } else if (type === "payment") {
    Swal.fire({
      title: "ยืนยันการรับชำระเงิน",
      text: `คุณยืนยันว่าได้รับเงินสำหรับรายการ ${id} ครบถ้วนแล้วใช่หรือไม่?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      reverseButtons: false,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2rem] p-8",
        actions: "flex gap-3 mt-6 w-full justify-center",
        confirmButton:
          "bg-[#2563eb] text-white rounded-xl px-4 py-3 font-bold hover:bg-blue-700 shadow-md transition-all flex-1 whitespace-nowrap cursor-pointer",
        cancelButton:
          "bg-gray-100 text-gray-700 border border-gray-200 rounded-xl px-4 py-3 font-bold hover:bg-gray-200 transition-all flex-1 whitespace-nowrap cursor-pointer",
      },
    }).then((result) => {
      if (result.isConfirmed && item) {
        updateBookingStatus(id, "approved_paid");
        saveLog("ยืนยันการชำระเงิน", `ยืนยันรับชำระเงินของรายการ: ${id}`);
      }
    });
  }
};

// ✨ ฟังก์ชันสำหรับให้แอดมินดูรีวิว ✨
const viewFeedback = (booking) => {
  if (booking.hasFeedback && booking.feedbackData) {
    const stars = "⭐".repeat(booking.feedbackData.rating);
    Swal.fire({
      title: "รีวิวจากผู้ใช้งาน",
      html: `
        <div class="text-center mb-4">
          <p class="text-3xl mb-2">${stars}</p>
          <p class="text-sm font-bold text-gray-500">(${booking.feedbackData.rating} ดาว)</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ความคิดเห็น</p>
          <p class="text-gray-800 font-medium">"${booking.feedbackData.comment || "ไม่ได้ระบุความคิดเห็น"}"</p>
        </div>
      `,
      confirmButtonText: "ปิดหน้าต่าง",
      confirmButtonColor: "#ba0b2f",
      customClass: {
        popup: "rounded-3xl p-6",
        confirmButton: "rounded-xl w-full mt-4 font-bold cursor-pointer",
      },
    });
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "pending":
    case "รออนุมัติ":
      return "⏳ รออนุมัติ";
    case "approved_pending_payment":
    case "รอชำระเงิน":
      return "💳 รอชำระเงิน";
    case "approved_paid":
    case "สำเร็จแล้ว":
      return "✅ สำเร็จแล้ว";
    case "disapproved":
    case "ไม่อนุมัติ":
      return "❌ ไม่อนุมัติ";
    case "ยกเลิกแล้ว":
      return "⛔ ยกเลิกแล้ว";
    default:
      return status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
    case "รออนุมัติ":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "approved_pending_payment":
    case "รอชำระเงิน":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "approved_paid":
    case "สำเร็จแล้ว":
      return "bg-green-50 text-green-700 border-green-200";
    case "disapproved":
    case "ไม่อนุมัติ":
      return "bg-red-50 text-red-700 border-red-200";
    case "ยกเลิกแล้ว":
      return "bg-gray-100 text-gray-500 border-gray-200 line-through opacity-70";
    default:
      return "bg-gray-50 text-gray-500 border-gray-200";
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div
      class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between gap-6"
    >
      <div>
        <h2
          class="text-2xl font-extrabold text-gray-900 flex items-center gap-3"
        >
          <font-awesome-icon icon="clipboard-list" class="text-[#ba0b2f]" />
          จัดการคำขอจองพื้นที่
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          ตรวจสอบสถานะ จัดการเอกสารขออนุญาต และอนุมัติการจอง
        </p>
      </div>
    </div>

    <div          class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4"
    >
      <div class="flex-1 flex items-start gap-3">
        <button
          @click="downloadZip"
          :disabled="isDownloading || !hasSelection"
          class="text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          :class="isDownloading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : !hasSelection ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#ba0b2f] text-white hover:bg-[#8c0823]'"
        >
          <font-awesome-icon v-if="isDownloading" icon="spinner" spin />
          <font-awesome-icon v-else-if="hasSelection" icon="file-archive" />
          <font-awesome-icon v-else icon="file-archive" class="text-gray-300" />
          {{ isDownloading ? 'กำลังสร้าง ZIP...' : hasSelection ? `ดาวน์โหลด ZIP (${selectedCount})` : 'ดาวน์โหลด ZIP' }}
        </button>
        <!-- ปุ่มล้างการเลือก -->
        <button
          v-if="hasSelection"
          @click="clearSelection"
          class="text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 shrink-0 cursor-pointer"
        >
          <font-awesome-icon icon="times" />
          ล้าง
        </button>
        <!-- ข้อความแสดงจำนวนที่เลือก -->
        <div class="flex-1">
        <label
          class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
          >ค้นหา (ID, ชื่อผู้จอง, ห้อง)</label
        >
        <div class="relative"><font-awesome-icon icon="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="พิมพ์คำค้นหา..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
          />
        </div>
      </div>
    </div>
      <div class="w-full lg:w-auto flex gap-4">
        <div class="w-1/2 lg:w-auto">
          <label
            class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
            >วันที่เริ่มต้น</label
          >
          <input
            v-model="filterStartDate"
            type="date"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
          />
        </div>
        <div class="w-1/2 lg:w-auto">
          <label
            class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
            >ถึงวันที่</label
          >
          <input
            v-model="filterEndDate"
            type="date"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
          />
        </div>
      </div>
    </div>

    <div
      class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-225">
          <thead>
            <tr
              class="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <th class="px-4 py-5 w-12">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="!isAllSelected && hasSelection"
                  @change="toggleSelectAll"
                  class="w-4 h-4 rounded accent-[#ba0b2f] cursor-pointer"
                  :disabled="selectableCount === 0"
                />
              </th>
              <th class="px-6 py-5">Booking ID</th>
              <th class="px-6 py-5">ผู้จอง</th>
              <th class="px-6 py-5">ห้องที่จอง</th>
              <th class="px-6 py-5 text-right">ยอดชำระ</th>
              <th class="px-6 py-5 text-center">สถานะ / จัดการคำขอ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="hover:bg-gray-50/80 transition-colors"
              :class="
                booking.status === 'ยกเลิกแล้ว'
                  ? 'bg-gray-50/50 grayscale-20'
                  : ''
              "
            >
              <td class="px-4 py-6 w-12">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(booking.id)"
                  @change="toggleSelect(booking.id)"
                  class="w-4 h-4 rounded accent-[#ba0b2f] cursor-pointer"
                  :disabled="!(booking.memoDocumentUrl || booking.hasDoc)"
                />
              </td>
              <td class="px-6 py-6 font-bold text-gray-900 text-sm">
                {{ booking.id }}
              </td>
              <td class="px-6 py-6">
                <p
                  class="font-bold text-gray-800 text-base"
                  :class="
                    booking.status === 'ยกเลิกแล้ว' ? 'text-gray-400' : ''
                  "
                >
                  {{ booking.userName }}
                </p>
              </td>
              <td class="px-6 py-6 text-sm font-medium text-gray-700">
                <p
                  class="font-bold"
                  :class="
                    booking.status === 'ยกเลิกแล้ว' ? 'text-gray-400' : ''
                  "
                >
                  {{ booking.roomName }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" /> {{ booking.date }} |
                  <font-awesome-icon :icon="['far', 'clock']" /> {{ booking.duration }}
                </p>
                <!-- ปุ่มดู memo document -->
                <a
                  v-if="booking.memoDocumentUrl"
                  :href="booking.memoDocumentUrl"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 mt-1.5 transition-all"
                >
                  <font-awesome-icon icon="file-pdf" />
                  หนังสือบันทึกข้อความ
                </a>
              </td>
              <td
                class="px-6 py-6 text-right font-black text-lg"
                :class="
                  booking.status === 'ยกเลิกแล้ว'
                    ? 'text-gray-400'
                    : 'text-[#ba0b2f]'
                "
              >
                ฿{{ booking.totalPrice.toLocaleString() }}
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center justify-center gap-1.5">
                  <button
                    v-if="
                      booking.status === 'pending' ||
                      booking.status === 'รออนุมัติ'
                    "
                    @click="openConfirm(booking.id, 'manage_pending')"
                    :class="getStatusClass(booking.status)"
                    class="px-4 py-2 rounded-xl text-sm font-bold border shadow-sm flex items-center gap-2 hover:shadow-md hover:opacity-80 transition-all cursor-pointer"
                  >
                    {{ getStatusText(booking.status) }}
                    <font-awesome-icon icon="mouse-pointer" class="text-[10px] opacity-50" />
                  </button>
                  <button
                    v-else-if="
                      booking.status === 'approved_pending_payment' ||
                      booking.status === 'รอชำระเงิน'
                    "
                    @click="openConfirm(booking.id, 'payment')"
                    :class="getStatusClass(booking.status)"
                    class="px-4 py-2 rounded-xl text-sm font-bold border shadow-sm flex items-center gap-2 hover:shadow-md hover:opacity-80 transition-all cursor-pointer"
                  >
                    {{ getStatusText(booking.status) }}
                    <font-awesome-icon icon="mouse-pointer" class="text-[10px] opacity-50" />
                  </button>

                  <div v-else class="flex flex-col items-center gap-2">
                    <span
                      :class="getStatusClass(booking.status)"
                      class="px-4 py-2 rounded-xl text-sm font-bold border shadow-sm inline-flex items-center gap-2"
                    >
                      {{ getStatusText(booking.status) }}
                    </span>

                    <!-- ✨ เพิ่มปุ่มดูรีวิว สำหรับสถานะสำเร็จแล้ว ✨ -->
                    <button
                      v-if="
                        (booking.status === 'approved_paid' ||
                          booking.status === 'สำเร็จแล้ว') &&
                        booking.hasFeedback
                      "
                      @click="viewFeedback(booking)"
                      class="bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-yellow-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <font-awesome-icon icon="star" /> ดูรีวิว
                    </button>
                    <!-- โชว์ข้อความว่าไม่มีรีวิว ถ้าสำเร็จแล้วแต่ยังไม่รีวิว -->
                    <span
                      v-else-if="
                        (booking.status === 'approved_paid' ||
                          booking.status === 'สำเร็จแล้ว') &&
                        !booking.hasFeedback
                      "
                      class="text-[10px] text-gray-400 font-bold"
                    >
                      (ไม่มีรีวิว)
                    </span>
                  </div>

                  <div
                    v-if="
                      booking.actionBy &&
                      booking.status !== 'pending' &&
                      booking.status !== 'รออนุมัติ'
                    "
                    class="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1 mt-1"
                  >
                    <font-awesome-icon
                      v-if="booking.status === 'ยกเลิกแล้ว'"
                      icon="user-times"
                      class="text-gray-400"
                    />
                    <font-awesome-icon
                      v-else
                      icon="user-edit"
                      class="text-[#ba0b2f]"
                    />
                    โดย: {{ booking.actionBy }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="filteredBookings.length === 0"
          class="text-center py-10 text-gray-400 font-bold"
        >
          <font-awesome-icon icon="search-minus" class="text-4xl mb-3 opacity-50" />
          <p>ไม่พบคำขอจองที่ตรงกับเงื่อนไข</p>
        </div>
      </div>
    </div>
  </div>
</template>
