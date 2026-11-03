<script setup lang="ts">
import { ref, computed, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import api from "@/services/api";
import { getStoredUserId } from "@/utils/auth";
import { withSwalTheme } from "@/utils/swalTheme";

const { t, locale } = useI18n();
import {
  getAwaitingReviewLabel,
  getBookingStatusBadgeClass,
  getBookingStatusLabel,
  getReviewedLabel,
  humanizeStatusInText,
  isBookingStatus,
  statusActionBtn,
} from "@/utils/bookingStatus";
import BookingStatusBadge from "@/components/common/BookingStatusBadge.vue";
import DateField from "@/components/common/DateField.vue";
import { formatDateDMY } from "@/utils/dateKey";

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

const getOrgLabel = (org: string) =>
  ({
    internal: t("admin.org_internal"),
    co_op: t("admin.org_coop"),
    external: t("admin.org_external"),
  })[org] || org;

const getDurationLabel = (duration: string) => {
  const normalized = String(duration || "").toLowerCase();
  if (normalized === "full" || normalized.includes("เต็มวัน") || normalized.includes("full")) {
    return t("admin.duration_full");
  }
  if (normalized.includes("morning") || normalized.includes("เช้า")) {
    return t("admin.duration_half_am");
  }
  if (normalized.includes("afternoon") || normalized.includes("บ่าย")) {
    return t("admin.duration_half_pm");
  }
  return duration;
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

/** Prefer same-origin `/uploads/...` so Vite proxy + PDF iframe work (avoid :3000 cross-origin / X-Frame-Options). */
const resolveUploadUrl = (url?: string) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
};

const isPreviewableImage = (url: string, mime?: string) =>
  (mime || "").startsWith("image/") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);

const isPreviewablePdf = (url: string, mime?: string) =>
  mime === "application/pdf" ||
  /\.pdf(\?|$)/i.test(url) ||
  (url.includes("/uploads/") && !isPreviewableImage(url, mime));

const previewHtmlForUrl = (
  url: string,
  title: string,
  opts?: { mime?: string; accent?: "blue" | "emerald" | "slate" }
) => {
  if (!url) {
    return `
      <div class="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
        <p class="text-xs font-bold text-gray-400">${title}</p>
        <p class="text-[11px] text-gray-400 mt-1">${t("admin.no_attachment")}</p>
      </div>`;
  }

  const accent = opts?.accent || "slate";
  const accentMap = {
    blue: {
      chip: "bg-blue-50 text-blue-700 border-blue-100",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
      ring: "border-blue-100",
    },
    emerald: {
      chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      ring: "border-emerald-100",
    },
    slate: {
      chip: "bg-slate-50 text-slate-700 border-slate-200",
      btn: "bg-slate-800 hover:bg-slate-900 text-white",
      ring: "border-slate-200",
    },
  }[accent];

  const openBtn = `
    <a href="${url}" target="_blank" rel="noopener noreferrer"
       class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${accentMap.btn} transition-colors">
      ${t("admin.open_fullscreen")}
    </a>`;

  if (isPreviewableImage(url, opts?.mime)) {
    return `
      <div class="rounded-2xl border ${accentMap.ring} bg-white overflow-hidden">
        <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between gap-2 bg-gray-50/80">
          <span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold border ${accentMap.chip}">${title}</span>
          ${openBtn}
        </div>
        <div class="bg-slate-100/60 p-3 flex items-center justify-center min-h-[12rem]">
          <img src="${url}" alt="${title}" class="max-h-56 w-auto max-w-full rounded-lg object-contain shadow-sm bg-white" />
        </div>
      </div>`;
  }

  if (isPreviewablePdf(url, opts?.mime)) {
    const viewerSrc = `${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
    return `
      <div class="rounded-2xl border ${accentMap.ring} bg-white overflow-hidden">
        <div class="px-3 py-2 border-b border-gray-100 flex items-center justify-between gap-2 bg-gray-50/80">
          <span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold border ${accentMap.chip}">${title}</span>
          ${openBtn}
        </div>
        <div class="relative bg-slate-100">
          <object data="${viewerSrc}" type="application/pdf" class="w-full h-64 block">
            <iframe src="${viewerSrc}" title="${title}" class="w-full h-64 border-0 bg-white"></iframe>
          </object>
          <noscript>
            <div class="p-6 text-center text-sm text-gray-500">${t("admin.open_with_button_above")}</div>
          </noscript>
        </div>
      </div>`;
  }

  return `
    <div class="rounded-2xl border ${accentMap.ring} bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p class="text-xs font-extrabold text-gray-800">${title}</p>
        <p class="text-[11px] text-gray-500 mt-0.5">${t("admin.preview_unsupported")}</p>
      </div>
      ${openBtn}
    </div>`;
};

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
    item.actionBy = localStorage.getItem("userName") || t("admin.property_staff");
    if (organizationType) item.organizationType = organizationType;
    if (data?.totalPrice != null) item.totalPrice = Number(data.totalPrice);
    if (data?.roomPrice != null) item.roomPrice = Number(data.roomPrice);
    if (data?.documentUrl) {
      item.approvalDocumentUrl = data.documentUrl;
      item.hasDoc = true;
      item.tempDocFile = undefined;
    }

    Swal.fire(withSwalTheme({
      icon: "success",
      title: t("admin.updated"),
      showConfirmButton: false,
      timer: 1500,
    }));
  } catch (err: any) {
    console.error("Error updating status:", err);
    const msg =
      err?.response?.data?.message || t("admin.swal_update_fail");
    Swal.fire(withSwalTheme({
      icon: "error",
      title: t("admin.error"),
      text: msg,
    }));
  }
};

const saveLog = async (action, details) => {
  try {
    await api.post("/api/admin/logs", {
      adminName: localStorage.getItem("userName") || t("admin.property_staff"),
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

const exportPermission = (id) => {
  const item = bookings.value.find((b) => b.id === id);
  if (item && item.dbId) {
    const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.open(`${apiBaseURL}/api/admin/bookings/${item.dbId}/template`, '_blank');
    saveLog("โหลดใบขออนุญาต", `ดาวน์โหลดเอกสารของรายการ: ${id}`);
    openConfirm(id, "manage_pending");
  } else {
    Swal.fire(withSwalTheme({
      icon: "error",
      title: t("admin.error"),
      text: t("admin.swal_reference_missing"),
    }));
  }
};

const importPermission = (id) => {
  Swal.fire(withSwalTheme({
    title: t("admin.swal_attach_approval"),
    text: t("admin.swal_attach_hint", { id }),
    icon: "info",
    input: "file",
    inputAttributes: { accept: ".pdf, .doc, .docx, image/*" },
    showCancelButton: true,
    confirmButtonText: t("admin.upload_document"),
    cancelButtonText: t("admin.cancel"),
    reverseButtons: false,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-3xl p-8",
      actions: "flex gap-3 mt-6 w-full justify-center",
      confirmButton: statusActionBtn.primary,
      cancelButton: statusActionBtn.secondary,
    },
  })).then((result) => {
    if (result.value) {
      const item = bookings.value.find((b) => b.id === id);
      if (item) {
        item.hasDoc = true;
        item.tempDocFile = result.value;
      }

      saveLog("แนบใบอนุมัติ", `เตรียมเอกสารอนุมัติสำหรับรายการ: ${id} แล้ว`);
      Swal.fire(withSwalTheme({
        icon: "success",
        title: t("admin.swal_attach_success"),
        text: t("admin.swal_attach_success_hint"),
        showConfirmButton: true,
        confirmButtonText: t("admin.continue"),
        confirmButtonColor: "#059669"
      })).then(() => {
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
    Swal.fire(withSwalTheme({
      title: t("admin.swal_manage_request"),
      html: `
        <p class="mb-5 text-gray-500 text-sm font-medium">${t("admin.swal_manage_hint", { id })}</p>
        <div class="flex flex-col sm:flex-row justify-center gap-3 mb-4 border-b border-gray-100 pb-6">
          <button id="btn-export-doc" class="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-1/2">
            <font-awesome-icon icon="file-download" /> ${t("admin.btn_docs")}
          </button>
          <button id="btn-import-doc" class="bg-purple-50 text-purple-600 px-4 py-3 rounded-xl text-xs font-bold border border-purple-100 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-1/2 ${hasApprovalDoc(item) ? "ring-2 ring-purple-400 bg-purple-100" : ""}">
            <font-awesome-icon icon="file-upload" /> ${hasApprovalDoc(item) ? `${t("admin.swal_attach_approval")} ✓` : t("admin.swal_attach_approval")}
          </button>
        </div>
        ${!hasApprovalDoc(item) ? `<p class="text-xs text-red-500 mb-2 font-bold"><font-awesome-icon icon="exclamation-circle" /> ${t("admin.approval_required_hint")}</p>` : ""}
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: t("admin.approve_btn"),
      denyButtonText: t("admin.disapprove_btn"),
      cancelButtonText: t("admin.cancel"),
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
    })).then((result) => {
      if (item) {
        if (result.isConfirmed) {
          if (!hasApprovalDoc(item)) {
            Swal.fire(withSwalTheme({
              icon: "warning",
              title: t("admin.approval_required_title"),
              text: t("admin.approval_required_text"),
              confirmButtonText: t("common.confirm"),
            })).then(() => openConfirm(id, "manage_pending"));
            return;
          }
          openApproveConfirm(id);
        } else if (result.isDenied) {
          // ✨ เพิ่มส่วนให้แอดมินกรอกเหตุผลที่ปฏิเสธ ✨
          Swal.fire(withSwalTheme({
            title: t("admin.swal_deny_reason"),
            input: "textarea",
            inputPlaceholder: t("admin.deny_reason_placeholder"),
            showCancelButton: true,
            confirmButtonText: t("admin.confirm_denial"),
            cancelButtonText: t("admin.cancel"),
            confirmButtonColor: "#ba0b2f",
            customClass: {
              popup: "rounded-3xl",
              confirmButton: "rounded-xl px-6 py-3 font-bold",
            },
            preConfirm: (remark) => {
              if (!remark) {
                Swal.showValidationMessage(t("admin.deny_reason_required"));
              }
              return remark;
            },
          })).then((remarkResult) => {
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
    Swal.fire(withSwalTheme({
      title: t("admin.awaiting_stripe_title"),
      text: t("admin.awaiting_stripe_hint"),
      icon: "info",
      confirmButtonText: t("common.confirm"),
      buttonsStyling: false,
      customClass: {
        popup: "rounded-[2rem] p-8",
        confirmButton: statusActionBtn.secondary,
      },
    }));
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
  let approvalMime = "";
  if (item.tempDocFile) {
    approvalPreviewUrl = URL.createObjectURL(item.tempDocFile);
    approvalMime = item.tempDocFile.type || "";
  } else if (item.approvalDocumentUrl) {
    approvalPreviewUrl = resolveUploadUrl(item.approvalDocumentUrl);
  }

  const estimateTotal = (org: string) => {
    const room = pickTierPrice(item, org);
    return oldTotal - oldRoom + room;
  };

  const rateCard = (value: string, label: string, roomPrice: number, checked: boolean) => `
    <label class="flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-colors has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50/70 border-gray-200 bg-white hover:border-gray-300">
      <input type="radio" name="org-rate" value="${value}" class="mt-1 accent-emerald-600" ${checked ? "checked" : ""} />
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-extrabold text-gray-900">${label}</span>
        <span class="block text-xs text-gray-500 mt-0.5">${t("admin.room_fee_value", { amount: roomPrice.toLocaleString() })}</span>
        <span class="block text-sm font-black text-emerald-700 mt-1 tabular-nums">${t("admin.estimated_total", { amount: estimateTotal(value).toLocaleString() })}</span>
      </span>
    </label>`;

  Swal.fire(withSwalTheme({
    title: `<div class="text-left">
      <p class="text-xl font-black text-gray-900">${t("admin.swal_approve_confirm")}</p>
      <p class="text-xs font-medium text-gray-500 mt-1">${t("admin.swal_approve_subtitle")}</p>
    </div>`,
    width: 640,
    html: `
      <div class="text-left space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
        <div class="rounded-2xl border border-gray-200 bg-slate-50/80 p-4">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">${t("admin.booking_details")}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
            <div>
              <p class="text-[10px] font-bold text-gray-400">${t("admin.col_booking")}</p>
              <p class="font-mono text-sm font-black text-gray-900">${item.id}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400">${t("admin.col_renter")}</p>
              <p class="text-sm font-bold text-gray-900">${item.userName}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-[10px] font-bold text-gray-400">${t("admin.room_space")}</p>
              <p class="text-sm font-bold text-gray-900">${item.roomName}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400">${t("admin.col_date_slot")}</p>
              <p class="text-sm font-semibold text-gray-800">${formatDateDMY(item.date)} · ${getDurationLabel(item.duration)}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400">${t("admin.current_rate_total")}</p>
              <p class="text-sm font-semibold text-gray-800">${getOrgLabel(currentOrg)}</p>
              <p class="text-xs text-gray-500">${t("admin.room_total_value", { room: oldRoom.toLocaleString(), total: oldTotal.toLocaleString() })}</p>
            </div>
            ${
              item.objective
                ? `<div class="sm:col-span-2">
                    <p class="text-[10px] font-bold text-gray-400">${t("admin.purpose")}</p>
                    <p class="text-sm text-gray-700 leading-snug">${item.objective}</p>
                  </div>`
                : ""
            }
          </div>
        </div>

        <div>
          <p class="text-sm font-extrabold text-gray-800 mb-2">${t("admin.select_rate")} <span class="text-xs font-medium text-gray-400">(${t("admin.according_to_approval")})</span></p>
          <div class="grid grid-cols-1 gap-2">
            ${rateCard("internal", t("admin.org_internal"), priceInternal, currentOrg === "internal")}
            ${rateCard("co_op", t("admin.org_coop"), priceCoop, currentOrg === "co_op")}
            ${rateCard("external", t("admin.org_external"), priceExternal, currentOrg === "external")}
          </div>
          <p class="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2 font-medium">
            ${t("admin.rate_once_hint")}
          </p>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-extrabold text-gray-800">${t("admin.attachments")}</p>
          ${previewHtmlForUrl(memoUrl, t("admin.memo_document"), { accent: "blue" })}
          ${previewHtmlForUrl(approvalPreviewUrl, t("admin.approval_document"), {
            mime: approvalMime,
            accent: "emerald",
          })}
          ${
            !approvalPreviewUrl
              ? `<div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                   ${t("admin.approval_missing_hint")}
                 </div>`
              : ""
          }
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: t("admin.confirm_approval"),
    cancelButtonText: t("common.back"),
    confirmButtonColor: "#059669",
    focusConfirm: false,
    customClass: {
      popup: "rounded-[1.75rem] p-5 md:p-6",
      title: "w-full p-0 mb-3",
      htmlContainer: "m-0 overflow-visible",
      confirmButton:
        "rounded-xl px-6 py-3 font-bold bg-emerald-600 hover:bg-emerald-700 cursor-pointer",
      cancelButton:
        "rounded-xl px-6 py-3 font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer",
      actions: "gap-2 mt-4",
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
        Swal.showValidationMessage(t("admin.approval_required_before_confirm"));
        return false;
      }
      const selected = (
        Swal.getPopup()?.querySelector(
          'input[name="org-rate"]:checked'
        ) as HTMLInputElement | null
      )?.value;
      if (!selected) {
        Swal.showValidationMessage(t("admin.rate_required"));
        return false;
      }
      return selected;
    },
  })).then((result) => {
    if (approvalPreviewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(approvalPreviewUrl);
      } catch {
        /* ignore */
      }
    }
    if (!result.isConfirmed || !result.value) return;
    const org = String(result.value);
    // Backend บันทึก activity log เดียว (สถานะ + เรท) — ไม่ยิง saveLog ซ้ำจาก frontend
    updateBookingStatus(id, "approved_pending_payment", "", org);
  });
};

// ✨ ฟังก์ชันสำหรับให้แอดมินดูรีวิว ✨
const viewFeedback = (booking) => {
  if (booking.hasFeedback && booking.feedbackData) {
    const stars = "⭐".repeat(booking.feedbackData.rating);
    Swal.fire(withSwalTheme({
      title: t("admin.swal_feedback_title"),
      html: `
        <div class="text-center mb-4">
          <p class="text-3xl mb-2">${stars}</p>
          <p class="text-sm font-bold text-gray-500">${t("admin.feedback_rating", { rating: booking.feedbackData.rating })}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">${t("admin.feedback_comment")}</p>
          <p class="text-gray-800 font-medium">"${booking.feedbackData.comment || t("admin.feedback_empty")}"</p>
        </div>
      `,
      confirmButtonText: t("admin.close_window"),
      confirmButtonColor: "#ba0b2f",
      customClass: {
        popup: "rounded-3xl p-6",
        confirmButton: "rounded-xl w-full mt-4 font-bold cursor-pointer",
      },
    }));
  }
};

const viewBookingHistory = async (booking: BookingItem) => {
  try {
    const res = await api.get("/api/admin/logs", {
      params: { bookingId: booking.dbId },
    });
    const rows = [...(res.data || [])];
    if (!rows.length) {
      Swal.fire(withSwalTheme({
        icon: "info",
        title: t("admin.no_history"),
        text: t("admin.no_history_text", { id: booking.id }),
        confirmButtonColor: "#ba0b2f",
      }));
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
        const fromLabel = getBookingStatusLabel(from, locale.value);
        const toLabel = getBookingStatusLabel(to, locale.value);
        const extra = (fromTo[3] || "").trim();
        return `
          <div class="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span class="inline-flex justify-center px-3 py-1.5 rounded-xl text-sm font-black border ${getBookingStatusBadgeClass(from)}">${fromLabel}</span>
            <span class="text-mfu-red font-black text-lg sm:text-xl px-1">→</span>
            <span class="inline-flex justify-center px-3 py-1.5 rounded-xl text-sm font-black border ${getBookingStatusBadgeClass(to)}">${toLabel}</span>
          </div>
          ${extra ? `<p class="text-sm text-gray-700 font-semibold mt-3 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100"><span class="text-rose-700 font-black">${t("admin.reason")}:</span> ${extra.replace(/^\|\s*(?:เหตุผล|หมายเหตุ):\s*/, "")}</p>` : ""}
        `;
      }
      const setOnly = details.match(/ตั้งสถานะเป็น「([^」]+)」(.*)$/);
      if (setOnly) {
        const statusLabel = getBookingStatusLabel(setOnly[1], locale.value);
        return `
          <div class="mt-3">
            <span class="inline-flex px-3 py-1.5 rounded-xl text-sm font-black border ${getBookingStatusBadgeClass(setOnly[1])}">${statusLabel}</span>
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
          <span class="inline-flex items-center gap-1.5"><span class="text-gray-400 font-semibold">${t("admin.by")}</span> ${l.admin_name || t("admin.system")}</span>
          <span>${l.created_at ? new Date(l.created_at).toLocaleString(locale.value === "en" ? "en-GB" : "th-TH") : ""}</span>
        </div>
      </div>`
      )
      .join("");

    Swal.fire(withSwalTheme({
      title: `<span class="text-xl font-black text-gray-900 tracking-tight">${t("admin.history_for", { id: booking.id })}</span>`,
      html: `<div class="max-h-[28rem] overflow-y-auto px-1 py-1 text-left bg-[#f1f3f5] rounded-2xl p-3">${html}</div>`,
      width: 560,
      confirmButtonText: t("admin.close_window"),
      confirmButtonColor: "#ba0b2f",
      customClass: {
        popup: "rounded-3xl p-7",
        title: "w-full mb-3",
        confirmButton:
          "rounded-xl w-full mt-3 py-3 text-base font-black cursor-pointer",
      },
    }));
  } catch (err) {
    Swal.fire(withSwalTheme({
      icon: "error",
      title: t("admin.history_load_fail"),
      confirmButtonColor: "#ba0b2f",
    }));
  }
};

</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="ui-card ui-admin-header p-6">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="clipboard-list" class="text-mfu-red" />
          {{ $t("admin.bookings_title") }}
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          {{ $t("admin.bookings_subtitle") }}
        </p>
      </div>
    </div>

    <div
      class="bg-white p-5 rounded-2xl shadow-card border border-gray-200 flex flex-col lg:flex-row gap-4"
    >
      <div class="flex-1">
        <label
          class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
          >{{ $t("admin.search_bookings") }}</label
        >
        <div class="relative">
          <font-awesome-icon
            icon="search"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('admin.search_placeholder')"
            class="ui-input pl-10"
          />
        </div>
      </div>
      <div class="w-full lg:w-auto flex gap-4">
        <div class="w-1/2 lg:w-auto">
          <label
            class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
            >{{ $t("admin.date_from") }}</label
          >
          <DateField v-model="filterStartDate" input-class="ui-input" />
        </div>
        <div class="w-1/2 lg:w-auto">
          <label
            class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
            >{{ $t("admin.date_to") }}</label
          >
          <DateField v-model="filterEndDate" input-class="ui-input" />
        </div>
      </div>
    </div>

    <div class="ui-table-card">
      <div class="ui-table-wrap max-h-[70vh] rounded-none border-0 shadow-none">
        <table class="w-full text-left border-collapse min-w-225">
          <thead>
            <tr
              class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <th class="px-6 py-5">{{ $t("admin.col_booking") }}</th>
              <th class="px-6 py-5">{{ $t("admin.col_renter") }}</th>
              <th class="px-6 py-5">{{ $t("admin.col_date_slot") }}</th>
              <th class="px-6 py-5 text-right">{{ $t("admin.col_amount") }}</th>
              <th class="px-6 py-5 text-center">{{ $t("admin.col_status") }} / {{ $t("admin.col_actions") }}</th>
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
                  <font-awesome-icon :icon="['far', 'calendar-alt']" /> {{ formatDateDMY(booking.date) }} |
                  <font-awesome-icon :icon="['far', 'clock']" /> {{ getDurationLabel(booking.duration) }}
                </p>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <a
                    v-if="booking.memoDocumentUrl"
                    :href="resolveUploadUrl(booking.memoDocumentUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all"
                  >
                    <font-awesome-icon icon="file-pdf" />
                    {{ $t("admin.memo_document") }}
                  </a>
                  <a
                    v-if="booking.approvalDocumentUrl"
                    :href="resolveUploadUrl(booking.approvalDocumentUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all"
                  >
                    <font-awesome-icon icon="file-signature" />
                    {{ $t("admin.approval_document") }}
                  </a>
                </div>
              </td>
              <td
                class="px-6 py-6 text-right font-black text-lg"
                :class="
                  isBookingStatus(booking.status, 'cancelled')
                    ? 'text-gray-400'
                    : 'text-mfu-red'
                "
              >
                ฿{{ booking.totalPrice.toLocaleString() }}
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center justify-center gap-1.5">
                  <BookingStatusBadge
                    v-if="isBookingStatus(booking.status, 'pending')"
                    :status="booking.status"
                    as="button"
                    size="md"
                    show-pointer
                    @click="openConfirm(booking.id, 'manage_pending')"
                  />
                  <!-- Awaiting Stripe — display only; admin cannot mark paid -->
                  <div
                    v-else-if="isBookingStatus(booking.status, 'approved_pending_payment')"
                    class="flex flex-col items-center gap-1"
                  >
                    <BookingStatusBadge
                      :status="booking.status"
                      size="md"
                      :title="t('admin.awaiting_stripe_hint')"
                    />
                    <span class="text-[10px] text-sky-600 font-semibold">{{ t("admin.awaiting_stripe_hint_short") }}</span>
                  </div>

                  <div v-else class="flex flex-col items-center gap-2">
                    <BookingStatusBadge :status="booking.status" size="md" />

                    <template v-if="isBookingStatus(booking.status, 'approved_paid') || isBookingStatus(booking.status, 'completed')">
                      <button
                        v-if="booking.hasFeedback"
                        type="button"
                        @click="viewFeedback(booking)"
                        class="mt-0.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                        :title="getReviewedLabel(locale)"
                      >
                        <font-awesome-icon icon="star" class="text-[10px]" />
                        {{ $t("admin.btn_review") }}
                      </button>
                      <span
                        v-else
                        class="text-[10px] text-slate-400 font-semibold"
                      >
                        {{ getAwaitingReviewLabel(locale) }}
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
                      class="text-mfu-red"
                    />
                    {{ $t("admin.by") }}: {{ booking.actionBy }}
                  </div>

                  <button
                    type="button"
                    @click="viewBookingHistory(booking)"
                    class="mt-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <font-awesome-icon icon="history" class="mr-1" />{{ $t("admin.btn_history") }}
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
          <p>{{ $t("admin.empty_bookings") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
