<script setup lang="ts">
import { ref, computed, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import api from "@/services/api";
import { getStoredUserId } from "@/utils/auth";

const { t } = useI18n();
import {
  getAwaitingReviewLabel,
  getBookingStatusBadgeClass,
  getBookingStatusIcon,
  getBookingStatusLabel,
  getReviewedBadgeClass,
  getReviewedLabel,
  humanizeStatusInText,
  isBookingStatus,
  statusActionBtn,
} from "@/utils/bookingStatus";

interface BookingItem {
  id: string;
  dbId: number;
  userName: string;
  roomName: string;
  date: string;
  duration: string;
  totalPrice: number;
  roomPrice?: number;
  addonsPrice?: number;
  status: string;
  hasFeedback: boolean;
  feedbackData?: { rating: number; comment: string };
  actionBy?: string;
  hasDoc?: boolean;
  tempDocFile?: File;
  memoDocumentUrl?: string;
  approvalDocumentUrl?: string;
  organizationType?: string;
  objective?: string;
  timeSlot?: string;
  priceHalfInternal?: number;
  priceFullInternal?: number;
  priceHalfCoop?: number;
  priceFullCoop?: number;
  priceHalfExternal?: number;
  priceFullExternal?: number;
}

const ORG_LABEL: Record<string, string> = {
  internal: "ภายใน (Internal)",
  co_op: "ร่วมจัด / Coop",
  external: "ภายนอก (External)",
};

const pickTierPrice = (item: BookingItem, org: string): number => {
  const isFull = item.timeSlot === "full";
  if (org === "external") {
    return Number(isFull ? item.priceFullExternal : item.priceHalfExternal) || 0;
  }
  if (org === "co_op") {
    return Number(isFull ? item.priceFullCoop : item.priceHalfCoop) || 0;
  }
  return Number(isFull ? item.priceFullInternal : item.priceHalfInternal) || 0;
};

const resolveUploadUrl = (url?: string) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;
  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${apiBase}${url.startsWith("/") ? url : `/${url}`}`;
};

const previewHtmlForUrl = (url: string, title: string) => {
  if (!url) {
    return `<p class="text-xs text-gray-400">${title}: ไม่มีไฟล์</p>`;
  }
  const lower = url.toLowerCase();
  const isPdf = lower.includes(".pdf") || lower.includes("application/pdf");
  if (isPdf || lower.includes("/uploads/")) {
    // Prefer iframe for pdf; images still work in iframe often — also offer open link
    const isImg = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
    if (isImg) {
      return `<div class="mb-2"><p class="text-[11px] font-bold text-gray-500 mb-1">${title}</p>
        <img src="${url}" alt="${title}" class="max-h-40 mx-auto rounded-lg border border-gray-200 object-contain bg-white" />
        <a href="${url}" target="_blank" class="text-[10px] text-blue-600 underline">เปิดเต็มจอ</a></div>`;
    }
    return `<div class="mb-2"><p class="text-[11px] font-bold text-gray-500 mb-1">${title}</p>
      <iframe src="${url}" class="w-full h-40 rounded-lg border border-gray-200 bg-white"></iframe>
      <a href="${url}" target="_blank" class="text-[10px] text-blue-600 underline">เปิดเต็มจอ</a></div>`;
  }
  return `<div class="mb-2"><p class="text-[11px] font-bold text-gray-500 mb-1">${title}</p>
    <a href="${url}" target="_blank" class="text-xs text-blue-600 underline">เปิดไฟล์</a></div>`;
};

const hasDownloadableDoc = (b: BookingItem) =>
  !!(b.memoDocumentUrl || b.approvalDocumentUrl || b.hasDoc);

/** ใบอนุมัติที่เซ็นแล้วเท่านั้น (ไม่นับ memo ของผู้จอง) */
const hasApprovalDoc = (b: BookingItem) =>
  !!(b.tempDocFile || b.approvalDocumentUrl || b.hasDoc);

const getAdminId = (): number | null => getStoredUserId();

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

const updateBookingStatus = async (id, status, remark = "", organizationType?: string) => {
  const item = bookings.value.find(b => b.id === id);
  if (!item) return;

  try {
    const formData = new FormData();
    formData.append("status", status);
    formData.append("remarks", remark);
    formData.append("adminId", getAdminId() || "");
    if (organizationType) {
      formData.append("organizationType", organizationType);
    }

    if (item.tempDocFile) {
      formData.append("approvalDocument", item.tempDocFile);
    }

    const { data } = await api.put(`/api/admin/bookings/${item.dbId}/status`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    item.status = status;
    item.actionBy = localStorage.getItem("userName") || "เจ้าหน้าที่ จัดการทรัพย์สิน";
    if (organizationType) item.organizationType = organizationType;
    if (data?.totalPrice != null) item.totalPrice = Number(data.totalPrice);
    if (data?.roomPrice != null) item.roomPrice = Number(data.roomPrice);
    if (data?.documentUrl) {
      item.approvalDocumentUrl = data.documentUrl;
      item.hasDoc = true;
      item.tempDocFile = undefined;
    }

    Swal.fire({
      icon: "success",
      title: "ดำเนินการสำเร็จ!",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (err: any) {
    console.error("Error updating status:", err);
    const msg =
      err?.response?.data?.message || "ไม่สามารถอัปเดตสถานะได้";
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: msg,
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
  filteredBookings.value.filter(hasDownloadableDoc).length
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
      .filter(hasDownloadableDoc)
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
      confirmButton: statusActionBtn.primary,
      cancelButton: statusActionBtn.secondary,
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
        confirmButtonColor: "#059669"
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
          <button id="btn-import-doc" class="bg-purple-50 text-purple-600 px-4 py-3 rounded-xl text-xs font-bold border border-purple-100 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-1/2 ${hasApprovalDoc(item) ? "ring-2 ring-purple-400 bg-purple-100" : ""}">
            <font-awesome-icon icon="file-upload" /> ${hasApprovalDoc(item) ? "แนบใบอนุมัติ ✓" : "แนบใบอนุมัติ"}
          </button>
        </div>
        ${!hasApprovalDoc(item) ? '<p class="text-xs text-red-500 mb-2 font-bold"><font-awesome-icon icon="exclamation-circle" /> บังคับแนบใบอนุมัติก่อน จึงจะสามารถกดอนุมัติได้</p>' : ""}
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
        confirmButton: statusActionBtn.approve,
        denyButton: statusActionBtn.reject,
        cancelButton: statusActionBtn.cancel,
      },
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        if (!hasApprovalDoc(item)) {
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
          if (!hasApprovalDoc(item)) {
            Swal.fire({
              icon: "warning",
              title: "ต้องแนบใบอนุมัติ",
              text: "กรุณาแนบใบอนุมัติก่อนกดอนุมัติ",
              confirmButtonText: "ตกลง",
            }).then(() => openConfirm(id, "manage_pending"));
            return;
          }
          openApproveConfirm(id);
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
      title: t("admin.awaiting_stripe_title"),
      text: t("admin.awaiting_stripe_hint"),
      icon: "info",
      confirmButtonText: t("common.confirm"),
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2rem] p-8",
        confirmButton: statusActionBtn.secondary,
      },
    });
  }
};

/** Confirm approve: summary + rate tier + document preview (Recording 4) */
const openApproveConfirm = (id: string) => {
  const item = bookings.value.find((b) => b.id === id);
  if (!item) return;

  const currentOrg =
    item.organizationType === "co_organizer" || item.organizationType === "coop"
      ? "co_op"
      : item.organizationType === "external"
        ? "external"
        : item.organizationType === "co_op"
          ? "co_op"
          : "internal";

  const priceInternal = pickTierPrice(item, "internal");
  const priceCoop = pickTierPrice(item, "co_op");
  const priceExternal = pickTierPrice(item, "external");
  const oldRoom = Number(item.roomPrice ?? pickTierPrice(item, currentOrg));
  const oldTotal = Number(item.totalPrice || 0);

  const memoUrl = resolveUploadUrl(item.memoDocumentUrl);
  let approvalPreviewUrl = "";
  if (item.tempDocFile) {
    approvalPreviewUrl = URL.createObjectURL(item.tempDocFile);
  } else if (item.approvalDocumentUrl) {
    approvalPreviewUrl = resolveUploadUrl(item.approvalDocumentUrl);
  }

  const estimateTotal = (org: string) => {
    const room = pickTierPrice(item, org);
    return oldTotal - oldRoom + room;
  };

  Swal.fire({
    title: "ยืนยันการอนุมัติ",
    width: 560,
    html: `
      <div class="text-left space-y-3 text-sm">
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <p class="text-xs font-bold text-gray-400 uppercase mb-2">รายละเอียดการจอง</p>
          <p><span class="text-gray-500">รหัส:</span> <b>${item.id}</b></p>
          <p><span class="text-gray-500">ผู้จอง:</span> <b>${item.userName}</b></p>
          <p><span class="text-gray-500">ห้อง:</span> <b>${item.roomName}</b></p>
          <p><span class="text-gray-500">วันที่ / ช่วง:</span> <b>${item.date} · ${item.duration}</b></p>
          ${item.objective ? `<p><span class="text-gray-500">วัตถุประสงค์:</span> ${item.objective}</p>` : ""}
          <p><span class="text-gray-500">เรทเดิม:</span> <b>${ORG_LABEL[currentOrg] || currentOrg}</b>
            · ห้อง ฿${oldRoom.toLocaleString()} · รวม ฿${oldTotal.toLocaleString()}</p>
        </div>
        <div>
          <p class="text-xs font-bold text-gray-500 mb-2">เลือกเรทราคา (ตามหนังสืออนุมัติ)</p>
          <label class="flex items-center gap-2 mb-1.5 cursor-pointer">
            <input type="radio" name="org-rate" value="internal" ${currentOrg === "internal" ? "checked" : ""} />
            <span>ภายใน — ฿${priceInternal.toLocaleString()} <span class="text-gray-400 text-xs">(ประมาณรวม ฿${estimateTotal("internal").toLocaleString()})</span></span>
          </label>
          <label class="flex items-center gap-2 mb-1.5 cursor-pointer">
            <input type="radio" name="org-rate" value="co_op" ${currentOrg === "co_op" ? "checked" : ""} />
            <span>ร่วมจัด / Coop — ฿${priceCoop.toLocaleString()} <span class="text-gray-400 text-xs">(ประมาณรวม ฿${estimateTotal("co_op").toLocaleString()})</span></span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="org-rate" value="external" ${currentOrg === "external" ? "checked" : ""} />
            <span>ภายนอก — ฿${priceExternal.toLocaleString()} <span class="text-gray-400 text-xs">(ประมาณรวม ฿${estimateTotal("external").toLocaleString()})</span></span>
          </label>
          <p class="text-[10px] text-amber-700 mt-2">เลือกเรทได้เฉพาะตอนยืนยันอนุมัตินี้ครั้งเดียว · บันทึกใน Activity Log</p>
        </div>
        <div class="border-t border-gray-100 pt-3">
          <p class="text-xs font-bold text-gray-500 mb-2">Preview เอกสารแนบ</p>
          ${previewHtmlForUrl(memoUrl, "หนังสือบันทึกข้อความ")}
          ${previewHtmlForUrl(approvalPreviewUrl, "ใบอนุมัติ")}
          ${!approvalPreviewUrl ? '<p class="text-xs text-red-500 font-bold">ยังไม่มีใบอนุมัติ — ย้อนกลับไปแนบไฟล์ก่อน</p>' : ""}
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "ยืนยันอนุมัติ",
    cancelButtonText: "ย้อนกลับ",
    confirmButtonColor: "#059669",
    customClass: {
      popup: "rounded-[1.5rem] p-5",
      confirmButton: "rounded-xl px-6 py-3 font-bold",
      cancelButton: "rounded-xl px-6 py-3 font-bold",
    },
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      if (!hasApprovalDoc(item) || !approvalPreviewUrl) {
        if (confirmBtn) {
          confirmBtn.disabled = true;
          confirmBtn.style.opacity = "0.4";
          confirmBtn.style.cursor = "not-allowed";
        }
      }
    },
    preConfirm: () => {
      if (!hasApprovalDoc(item)) {
        Swal.showValidationMessage("ต้องแนบใบอนุมัติก่อนยืนยัน");
        return false;
      }
      const selected = (
        Swal.getPopup()?.querySelector('input[name="org-rate"]:checked') as HTMLInputElement | null
      )?.value;
      if (!selected) {
        Swal.showValidationMessage("กรุณาเลือกเรทราคา");
        return false;
      }
      return selected;
    },
  }).then((result) => {
    if (approvalPreviewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(approvalPreviewUrl);
      } catch {
        /* ignore */
      }
    }
    if (!result.isConfirmed || !result.value) return;
    const org = String(result.value);
    updateBookingStatus(id, "approved_pending_payment", "", org);
    saveLog(
      "อนุมัติคำขอจอง",
      `อนุมัติรายการจอง: ${id} ของ ${item.userName} | เรท: ${ORG_LABEL[org] || org} | รวมประมาณ ฿${estimateTotal(org).toLocaleString()}`,
    );
  });
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

const viewBookingHistory = async (booking: BookingItem) => {
  try {
    const res = await api.get("/api/admin/logs", {
      params: { bookingId: booking.dbId },
    });
    const rows = [...(res.data || [])];
    if (!rows.length) {
      Swal.fire({
        icon: "info",
        title: "ยังไม่มีประวัติ",
        text: `รายการ ${booking.id} ยังไม่มี activity log`,
        confirmButtonColor: "#ba0b2f",
      });
      return;
    }

    // เรียงเก่า → ใหม่ เพื่อเดาสถานะก่อนหน้าจาก log เก่าได้
    const chronological = rows
      .slice()
      .sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    const extractStatusLabel = (details: string): string | null => {
      const text = humanizeStatusInText(details || "", "th");
      const fromTo = text.match(/เปลี่ยนจาก「([^」]+)」เป็น「([^」]+)」/);
      if (fromTo) return fromTo[2];
      const single = text.match(/สถานะ:\s*(.+?)(?:\s*\||$)/);
      return single ? single[1].trim() : null;
    };

    let previousStatusLabel: string | null = null;
    /** เมื่อ log แรกไม่มีสถานะก่อนหน้า — เดาจาก flow ปกติของระบบ */
    const defaultPreviousFor = (toLabel: string): string | null => {
      const map: Record<string, string> = {
        รอชำระเงิน: "รออนุมัติ",
        ชำระเงินแล้ว: "รอชำระเงิน",
        สำเร็จแล้ว: "ชำระเงินแล้ว",
        ไม่อนุมัติ: "รออนุมัติ",
        ยกเลิกแล้ว: "รออนุมัติ",
      };
      return map[toLabel] || null;
    };

    const enriched = chronological.map((l: any) => {
      const rawDetails = humanizeStatusInText(l.details || "", "th");
      const alreadyTransition = /เปลี่ยนจาก「/.test(rawDetails);
      const currentLabel = extractStatusLabel(rawDetails);
      let displayDetails = rawDetails;

      if (!alreadyTransition && currentLabel) {
        const fromLabel = previousStatusLabel || defaultPreviousFor(currentLabel);
        const remarkMatch = rawDetails.match(/\|\s*(?:เหตุผล|หมายเหตุ):\s*(.+)$/);
        const remark = remarkMatch ? ` | เหตุผล: ${remarkMatch[1]}` : "";
        if (fromLabel && fromLabel !== currentLabel) {
          displayDetails = `เปลี่ยนจาก「${fromLabel}」เป็น「${currentLabel}」${remark}`;
        } else if (!fromLabel) {
          displayDetails = `ตั้งสถานะเป็น「${currentLabel}」${remark}`;
        }
      }

      if (currentLabel) previousStatusLabel = currentLabel;

      return { ...l, displayDetails };
    });

    const renderTransitionHtml = (details: string): string => {
      const fromTo = details.match(/เปลี่ยนจาก「([^」]+)」เป็น「([^」]+)」(.*)$/);
      if (fromTo) {
        const from = fromTo[1];
        const to = fromTo[2];
        const extra = (fromTo[3] || "").trim();
        return `
          <div class="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span class="inline-flex justify-center px-3 py-1.5 rounded-xl text-sm font-black border ${getBookingStatusBadgeClass(from)}">${from}</span>
            <span class="text-[#ba0b2f] font-black text-lg sm:text-xl px-1">→</span>
            <span class="inline-flex justify-center px-3 py-1.5 rounded-xl text-sm font-black border ${getBookingStatusBadgeClass(to)}">${to}</span>
          </div>
          ${extra ? `<p class="text-sm text-gray-700 font-semibold mt-3 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100"><span class="text-rose-700 font-black">เหตุผล:</span> ${extra.replace(/^\|\s*(?:เหตุผล|หมายเหตุ):\s*/, "")}</p>` : ""}
        `;
      }
      const setOnly = details.match(/ตั้งสถานะเป็น「([^」]+)」(.*)$/);
      if (setOnly) {
        return `
          <div class="mt-3">
            <span class="inline-flex px-3 py-1.5 rounded-xl text-sm font-black border ${getBookingStatusBadgeClass(setOnly[1])}">${setOnly[1]}</span>
          </div>
        `;
      }
      return `<p class="text-base text-gray-800 mt-3 leading-relaxed font-bold">${details || "-"}</p>`;
    };

    // แสดงใหม่สุดบนสุด
    const html = enriched
      .slice()
      .reverse()
      .map(
        (l: any) => `
      <div class="text-left rounded-2xl p-5 mb-4 bg-white border-2 border-gray-300 shadow-[0_4px_16px_rgba(17,24,39,0.08)]">
        <p class="text-base font-black text-gray-900 leading-snug">${l.action || "-"}</p>
        ${renderTransitionHtml(l.displayDetails || "")}
        <div class="mt-4 pt-3 border-t-2 border-gray-200 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-gray-600">
          <span class="inline-flex items-center gap-1.5"><span class="text-gray-400 font-semibold">โดย</span> ${l.admin_name || "ระบบ"}</span>
          <span>${l.created_at ? new Date(l.created_at).toLocaleString("th-TH") : ""}</span>
        </div>
      </div>`
      )
      .join("");

    Swal.fire({
      title: `<span class="text-xl font-black text-gray-900 tracking-tight">ประวัติรายการ ${booking.id}</span>`,
      html: `<div class="max-h-[28rem] overflow-y-auto px-1 py-1 text-left bg-[#f1f3f5] rounded-2xl p-3">${html}</div>`,
      width: 560,
      confirmButtonText: "ปิด",
      confirmButtonColor: "#ba0b2f",
      customClass: {
        popup: "rounded-3xl p-7",
        title: "w-full mb-3",
        confirmButton:
          "rounded-xl w-full mt-3 py-3 text-base font-black cursor-pointer",
      },
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "โหลดประวัติไม่สำเร็จ",
      confirmButtonColor: "#ba0b2f",
    });
  }
};

const getStatusText = (status: string) => getBookingStatusLabel(status, "th");
const getStatusClass = (status: string) => getBookingStatusBadgeClass(status);
const getStatusIcon = (status: string) => getBookingStatusIcon(status);
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div
      class="bg-white p-6 rounded-3xl shadow-card border border-gray-200 flex flex-col justify-between gap-6"
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

    <div          class="bg-white p-5 rounded-2xl shadow-card border border-gray-200 flex flex-col lg:flex-row gap-4"
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
      class="bg-white rounded-3xl shadow-card border border-gray-200 overflow-hidden"
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
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(booking, rowIndex) in filteredBookings"
              :key="booking.id"
              class="transition-colors duration-150"
              :class="[
                isBookingStatus(booking.status, 'cancelled')
                  ? 'bg-slate-50/80 grayscale-[0.25]'
                  : rowIndex % 2 === 0
                    ? 'bg-white'
                    : 'bg-slate-50/60',
                !isBookingStatus(booking.status, 'cancelled')
                  ? 'hover:bg-amber-50/90'
                  : 'hover:bg-slate-100',
              ]"
            >
              <td class="px-4 py-6 w-12">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(booking.id)"
                  @change="toggleSelect(booking.id)"
                  class="w-4 h-4 rounded accent-[#ba0b2f] cursor-pointer"
                  :disabled="!hasDownloadableDoc(booking)"
                />
              </td>
              <td class="px-6 py-6 font-bold text-gray-900 text-sm">
                {{ booking.id }}
              </td>
              <td class="px-6 py-6">
                <p
                  class="font-bold text-gray-800 text-base"
                  :class="
                    isBookingStatus(booking.status, 'cancelled') ? 'text-gray-400' : ''
                  "
                >
                  {{ booking.userName }}
                </p>
              </td>
              <td class="px-6 py-6 text-sm font-medium text-gray-700">
                <p
                  class="font-bold"
                  :class="
                    isBookingStatus(booking.status, 'cancelled') ? 'text-gray-400' : ''
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
                  isBookingStatus(booking.status, 'cancelled')
                    ? 'text-gray-400'
                    : 'text-[#ba0b2f]'
                "
              >
                ฿{{ booking.totalPrice.toLocaleString() }}
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center justify-center gap-1.5">
                  <button
                    v-if="isBookingStatus(booking.status, 'pending')"
                    @click="openConfirm(booking.id, 'manage_pending')"
                    :class="getStatusClass(booking.status)"
                    class="px-4 py-2 rounded-xl text-sm font-bold border shadow-sm flex items-center gap-2 hover:shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    <font-awesome-icon :icon="getStatusIcon(booking.status)" class="text-[11px] opacity-80" />
                    {{ getStatusText(booking.status) }}
                    <font-awesome-icon icon="mouse-pointer" class="text-[10px] opacity-50" />
                  </button>
                  <!-- Awaiting Stripe — display only; admin cannot mark paid -->
                  <div
                    v-else-if="isBookingStatus(booking.status, 'approved_pending_payment')"
                    class="flex flex-col items-center gap-1"
                  >
                    <span
                      :class="getStatusClass(booking.status)"
                      class="min-w-[7.5rem] px-4 py-2.5 rounded-xl text-sm font-black border-2 shadow-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-default"
                      :title="t('admin.awaiting_stripe_hint')"
                    >
                      <font-awesome-icon :icon="getStatusIcon(booking.status)" class="text-[11px] opacity-80" />
                      {{ getStatusText(booking.status) }}
                    </span>
                    <span class="text-[10px] text-sky-600 font-semibold">{{ t("admin.awaiting_stripe_hint_short") }}</span>
                  </div>

                  <div v-else class="flex flex-col items-center gap-2">
                    <span
                      :class="getStatusClass(booking.status)"
                      class="px-4 py-2 rounded-xl text-sm font-bold border shadow-sm inline-flex items-center gap-2"
                    >
                      <font-awesome-icon :icon="getStatusIcon(booking.status)" class="text-[11px] opacity-80" />
                      {{ getStatusText(booking.status) }}
                    </span>

                    <template v-if="isBookingStatus(booking.status, 'approved_paid') || isBookingStatus(booking.status, 'completed')">
                      <span
                        v-if="booking.hasFeedback"
                        :class="getReviewedBadgeClass()"
                        class="px-3 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1.5"
                      >
                        <font-awesome-icon icon="star" />
                        {{ getReviewedLabel("th") }}
                      </span>
                      <button
                        v-if="booking.hasFeedback"
                        @click="viewFeedback(booking)"
                        class="bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-violet-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <font-awesome-icon icon="eye" /> ดูรีวิว
                      </button>
                      <span
                        v-else
                        class="text-[10px] text-slate-400 font-bold"
                      >
                        ({{ getAwaitingReviewLabel("th") }})
                      </span>
                    </template>
                  </div>

                  <div
                    v-if="
                      booking.actionBy &&
                      !isBookingStatus(booking.status, 'pending')
                    "
                    class="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1 mt-1"
                  >
                    <font-awesome-icon
                      v-if="isBookingStatus(booking.status, 'cancelled')"
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

                  <button
                    type="button"
                    @click="viewBookingHistory(booking)"
                    class="mt-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <font-awesome-icon icon="history" class="mr-1" />ดูประวัติ
                  </button>
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
