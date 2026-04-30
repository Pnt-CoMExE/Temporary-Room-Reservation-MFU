<script setup>
import { ref, computed, defineProps } from "vue";
import Swal from "sweetalert2";

const props = defineProps(["initialBookings"]);

// จำลองว่ามีคิวนึงถูกผู้ใช้กดยกเลิกไปเอง และเพิ่มข้อมูลจำลองสำหรับ Feedback
const bookings = ref([
  ...props.initialBookings.map((b) => {
    let mockAdmin = "";
    if (b.status === "approved_pending_payment") mockAdmin = "แอดมิน สมปอง";
    if (b.status === "disapproved") mockAdmin = "เจ้าหน้าที่ จัดการทรัพย์สิน";
    if (b.status === "approved_paid") mockAdmin = "หัวหน้าแอดมิน สมศรี";
    return { ...b, hasDoc: false, actionBy: mockAdmin };
  }),
  {
    id: "BK-202603019",
    userName: "นายทดสอบ ยกเลิกเอง",
    roomName: "ห้องประชุม ท่าสุด",
    date: "2026-05-10",
    duration: "เต็มวัน",
    totalPrice: 3600,
    status: "ยกเลิกแล้ว",
    hasDoc: false,
    actionBy: "ผู้ใช้งานยกเลิกเอง",
  },
  // ✨ เพิ่มข้อมูลจำลองสำหรับทดสอบ Feedback ✨
  {
    id: "BK-202603020",
    userName: "บริษัท ใจดี จำกัด",
    roomName: "ห้องประชุมคำมอกหลวง",
    date: "2026-04-15",
    duration: "เต็มวัน",
    totalPrice: 12000,
    status: "approved_paid", // สำเร็จแล้ว
    hasDoc: true,
    actionBy: "แอดมิน สมปอง",
    hasFeedback: true,
    feedbackData: {
      rating: 5,
      comment:
        "ห้องประชุมสะอาด อุปกรณ์ครบครัน แอร์เย็นมากครับ การบริการของเจ้าหน้าที่ก็ดีเยี่ยม!",
    },
  },
  {
    id: "BK-202603021",
    userName: "นายสมชาย เรียนดี",
    roomName: "ลานกิจกรรม ลานประดู่แดง",
    date: "2026-04-18",
    duration: "ครึ่งวันเช้า",
    totalPrice: 3000,
    status: "approved_paid", // สำเร็จแล้ว
    hasDoc: true,
    actionBy: "เจ้าหน้าที่ จัดการทรัพย์สิน",
    hasFeedback: false, // ยังไม่ได้ให้คะแนน
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
  Swal.fire({
    title: "โหลดไฟล์สำเร็จ!",
    text: `ดาวน์โหลดใบขออนุญาตการจอง (PDF) ของ ${id} เรียบร้อยแล้ว`,
    icon: "success",
    confirmButtonText: "กลับไปหน้าจัดการ",
    confirmButtonColor: "#16a34a",
    customClass: {
      popup: "rounded-3xl",
      confirmButton: "rounded-xl px-6 py-3 font-bold",
    },
  }).then(() => {
    saveLog("โหลดใบขออนุญาต", `ดาวน์โหลดเอกสารของรายการ: ${id}`);
    openConfirm(id, "manage_pending");
  });
};

const importPermission = (id) => {
  Swal.fire({
    title: "แนบใบอนุมัติ",
    text: `อัปโหลดไฟล์ที่เซ็นอนุมัติแล้วสำหรับรายการ ${id} (PDF, Word)`,
    icon: "info",
    input: "file",
    inputAttributes: { accept: ".pdf, .doc, .docx" },
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
      if (item) item.hasDoc = true;

      saveLog("แนบใบอนุมัติ", `อัปโหลดเอกสารอนุมัติสำหรับรายการ: ${id}`);
      Swal.fire({
        icon: "success",
        title: "แนบเอกสารสำเร็จ!",
        showConfirmButton: false,
        timer: 1500,
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
            <i class="fas fa-file-download"></i> ใบขออนุญาต
          </button>
          <button id="btn-import-doc" class="bg-purple-50 text-purple-600 px-4 py-3 rounded-xl text-xs font-bold border border-purple-100 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm w-full sm:w-1/2 ${item.hasDoc ? "ring-2 ring-purple-400 bg-purple-100" : ""}">
            <i class="fas fa-file-upload"></i> ${item.hasDoc ? "แนบใบอนุมัติ ✓" : "แนบใบอนุมัติ"}
          </button>
        </div>
        ${!item.hasDoc ? '<p class="text-xs text-red-500 mb-2 font-bold"><i class="fas fa-exclamation-circle"></i> บังคับแนบใบอนุมัติก่อน จึงจะสามารถกดอนุมัติได้</p>' : ""}
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
          item.status = "approved_pending_payment";
          item.actionBy = "เจ้าหน้าที่ จัดการทรัพย์สิน";
          saveLog(
            "อนุมัติคำขอจอง",
            `อนุมัติรายการจอง: ${id} ของ ${item.userName} แล้ว`,
          );
          Swal.fire({
            icon: "success",
            title: "อนุมัติสำเร็จ!",
            showConfirmButton: false,
            timer: 1500,
          });
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
              item.status = "disapproved";
              item.actionBy = "เจ้าหน้าที่ จัดการทรัพย์สิน";
              item.remark = remarkResult.value; // เก็บเหตุผลลงใน booking
              saveLog(
                "ปฏิเสธคำขอจอง",
                `ปฏิเสธรายการจอง: ${id} ของ ${item.userName} (เหตุผล: ${remarkResult.value})`,
              );
              Swal.fire({
                icon: "error",
                title: "ปฏิเสธคำขอแล้ว",
                showConfirmButton: false,
                timer: 1500,
              });
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
        item.status = "approved_paid";
        item.actionBy = "เจ้าหน้าที่ จัดการทรัพย์สิน";
        saveLog("ยืนยันการชำระเงิน", `ยืนยันรับชำระเงินของรายการ: ${id}`);
        Swal.fire({
          icon: "success",
          title: "ยืนยันการชำระเงินแล้ว!",
          showConfirmButton: false,
          timer: 1500,
        });
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
          <i class="fas fa-clipboard-list text-[#ba0b2f]"></i>
          จัดการคำขอจองพื้นที่
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          ตรวจสอบสถานะ จัดการเอกสารขออนุญาต และอนุมัติการจอง
        </p>
      </div>
    </div>

    <div
      class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4"
    >
      <div class="flex-1">
        <label
          class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1"
          >ค้นหา (ID, ชื่อผู้จอง, ห้อง)</label
        >
        <div class="relative">
          <i
            class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="พิมพ์คำค้นหา..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
          />
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
                  <i class="far fa-calendar-alt"></i> {{ booking.date }} |
                  <i class="far fa-clock"></i> {{ booking.duration }}
                </p>
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
                    <i class="fas fa-mouse-pointer text-[10px] opacity-50"></i>
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
                    <i class="fas fa-mouse-pointer text-[10px] opacity-50"></i>
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
                      <i class="fas fa-star"></i> ดูรีวิว
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
                    <i
                      class="fas"
                      :class="
                        booking.status === 'ยกเลิกแล้ว'
                          ? 'fa-user-times text-gray-400'
                          : 'fa-user-edit text-[#ba0b2f]'
                      "
                    ></i>
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
          <i class="fas fa-search-minus text-4xl mb-3 opacity-50"></i>
          <p>ไม่พบคำขอจองที่ตรงกับเงื่อนไข</p>
        </div>
      </div>
    </div>
  </div>
</template>
