<script setup>
import { ref, defineProps, watch } from "vue";

const props = defineProps(["initialBookings"]);
const bookings = ref(props.initialBookings);

watch(
  () => props.initialBookings,
  (newVal) => {
    bookings.value = newVal;
  },
  { deep: true },
);

const showActionModal = ref(false);
const modalData = ref({
  id: null,
  title: "",
  message: "",
  type: "",
  action: null,
});

const openConfirm = (id, type) => {
  modalData.value.id = id;
  modalData.value.type = type;

  if (type === "approve") {
    modalData.value.title = "ยืนยันการอนุมัติจอง";
    modalData.value.message = `คุณต้องการอนุมัติคำขอ ${id} และเปลี่ยนสถานะเป็น "รอชำระเงิน" ใช่หรือไม่?`;
    modalData.value.action = executeApprove;
  } else if (type === "payment") {
    modalData.value.title = "ยืนยันการรับชำระเงิน";
    modalData.value.message = `คุณยืนยันว่าได้รับเงินสำหรับรายการ ${id} ครบถ้วนแล้วใช่หรือไม่?`;
    modalData.value.action = executePayment;
  } else if (type === "reject") {
    modalData.value.title = "ปฏิเสธคำขอจอง";
    modalData.value.message = `คุณต้องการ "ไม่อนุมัติ" คำขอ ${id} ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`;
    modalData.value.action = executeReject;
  }
  showActionModal.value = true;
};

const executeApprove = () => {
  const item = bookings.value.find((b) => b.id === modalData.value.id);
  if (item) item.status = "approved_pending_payment";
  closeModal();
};

const executePayment = () => {
  const item = bookings.value.find((b) => b.id === modalData.value.id);
  if (item) item.status = "approved_paid";
  closeModal();
};

const executeReject = () => {
  const item = bookings.value.find((b) => b.id === modalData.value.id);
  if (item) item.status = "disapproved";
  closeModal();
};

const closeModal = () => {
  showActionModal.value = false;
};

// ✨ อัปเดตข้อความให้ตรงกับที่คุณต้องการ
const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "⏳ รออนุมัติ";
    case "approved_pending_payment":
      return "💳 รอชำระเงิน";
    case "approved_paid":
      return "✅ ชำระเงินแล้ว";
    case "disapproved":
      return "❌ ไม่อนุมัติ";
    default:
      return status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "approved_pending_payment":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "approved_paid":
      return "bg-green-50 text-green-700 border-green-200";
    case "disapproved":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-500 border-gray-200";
  }
};
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
        <i class="fas fa-clipboard-list text-[#ba0b2f]"></i>
        จัดการคำขอจองพื้นที่
      </h2>
      <p class="text-sm text-gray-500 mt-1 font-medium">
        ตรวจสอบสถานะ ดำเนินการอนุมัติ และยืนยันการรับชำระเงิน
      </p>
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
              <th class="px-6 py-5">ผู้จอง / สถานะ</th>
              <th class="px-6 py-5">ห้องที่จอง</th>
              <th class="px-6 py-5 text-right">ยอดชำระ</th>
              <th class="px-6 py-5 text-center">จัดการคำขอ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="booking in bookings"
              :key="booking.id"
              class="hover:bg-gray-50/80 transition-colors"
            >
              <td class="px-6 py-6 font-bold text-gray-900 text-sm">
                {{ booking.id }}
              </td>
              <td class="px-6 py-6">
                <p class="font-bold text-gray-800 text-base mb-2">
                  {{ booking.userName }}
                </p>
                <div class="flex flex-wrap gap-2 items-center">
                  <span
                    :class="getStatusClass(booking.status)"
                    class="px-3 py-1.5 rounded-lg text-sm font-bold border shadow-sm flex items-center"
                  >
                    {{ getStatusText(booking.status) }}
                  </span>
                  <span
                    v-if="booking.userType === 'co_organizer'"
                    class="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded border border-blue-100 uppercase"
                    >Co-Org</span
                  >
                  <span
                    v-else-if="booking.userType === 'internal'"
                    class="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded border border-green-100 uppercase"
                    >Internal</span
                  >
                  <span
                    v-else-if="booking.userType === 'external'"
                    class="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded border border-gray-200 uppercase"
                    >External</span
                  >
                </div>
              </td>
              <td class="px-6 py-6 text-sm font-medium text-gray-700">
                <p class="font-bold">{{ booking.roomName }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  <i class="far fa-calendar-alt"></i> {{ booking.date }} |
                  <i class="far fa-clock"></i> {{ booking.duration }}
                </p>
              </td>
              <td
                class="px-6 py-6 text-right font-black text-[#ba0b2f] text-lg"
              >
                ฿{{ booking.totalPrice.toLocaleString() }}
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex justify-center gap-2">
                  <template v-if="booking.status === 'pending'">
                    <button
                      @click="openConfirm(booking.id, 'approve')"
                      class="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-green-100 flex items-center gap-1"
                    >
                      <i class="fas fa-check"></i> อนุมัติจอง
                    </button>
                    <button
                      @click="openConfirm(booking.id, 'reject')"
                      class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-100 flex items-center gap-1"
                    >
                      <i class="fas fa-times"></i> ปฏิเสธ
                    </button>
                  </template>

                  <template
                    v-else-if="booking.status === 'approved_pending_payment'"
                  >
                    <button
                      @click="openConfirm(booking.id, 'payment')"
                      class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                    >
                      <i class="fas fa-hand-holding-usd"></i> ยืนยันรับเงิน
                    </button>
                  </template>

                  <template v-else-if="booking.status === 'approved_paid'">
                    <span class="text-green-600 font-bold text-xs"
                      ><i class="fas fa-check-double mr-1"></i>
                      ตรวจสอบเรียบร้อย</span
                    >
                  </template>

                  <template v-else-if="booking.status === 'disapproved'">
                    <span class="text-red-400 font-bold text-xs"
                      ><i class="fas fa-ban mr-1"></i> ยกเลิกรายการ</span
                    >
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showActionModal"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div
        class="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center animate-fade-up relative overflow-hidden"
      >
        <div
          :class="{
            'bg-green-500': modalData.type === 'approve',
            'bg-blue-500': modalData.type === 'payment',
            'bg-red-500': modalData.type === 'reject',
          }"
          class="absolute top-0 left-0 w-full h-2"
        ></div>

        <div
          :class="{
            'bg-green-50 text-green-600': modalData.type === 'approve',
            'bg-blue-50 text-blue-600': modalData.type === 'payment',
            'bg-red-50 text-red-600': modalData.type === 'reject',
          }"
          class="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-inner border-4 border-white ring-1 ring-gray-100"
        >
          <i v-if="modalData.type === 'approve'" class="fas fa-check"></i>
          <i
            v-if="modalData.type === 'payment'"
            class="fas fa-hand-holding-usd"
          ></i>
          <i
            v-if="modalData.type === 'reject'"
            class="fas fa-exclamation-triangle"
          ></i>
        </div>

        <h3 class="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          {{ modalData.title }}
        </h3>
        <p class="text-gray-500 mb-8 font-medium leading-relaxed">
          {{ modalData.message }}
        </p>

        <div class="flex gap-4">
          <button
            @click="closeModal"
            class="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-widest"
          >
            ยกเลิก
          </button>
          <button
            @click="modalData.action"
            :class="{
              'bg-green-600 hover:bg-green-700': modalData.type === 'approve',
              'bg-blue-600 hover:bg-blue-700': modalData.type === 'payment',
              'bg-red-600 hover:bg-red-700': modalData.type === 'reject',
            }"
            class="flex-1 py-4 text-white font-bold rounded-2xl shadow-lg transition-all text-sm uppercase tracking-widest transform hover:-translate-y-1"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
