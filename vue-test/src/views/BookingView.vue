<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;

const loading = ref(true);
const room = ref(null);

const bookingForm = ref({
  userName: "",
  userType: "",
  date: "",
  duration: "",
  paymentMethod: "counter",
  slipImage: null,
  acceptTerms: false,
});

const fetchRoomData = () => {
  setTimeout(() => {
    room.value = {
      id: roomId,
      name:
        roomId == 1
          ? "ห้องประชุม ท่าสุด,นางแล,แม่ข้าวต้ม,ริมกก (AD)"
          : "ห้องประชุมคำมอกหลวง",
      location: roomId == 1 ? "อาคารบริหาร (AD)" : "อาคาร M-Square",
      image:
        roomId == 1
          ? "https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      priceHalfDayInternal: 2400,
      priceFullDayInternal: 3600,
      priceHalfDayExternal: 4800,
      priceFullDayExternal: 7200,
    };
    loading.value = false;
  }, 400);
};

onMounted(() => fetchRoomData());

const estimatedPrice = computed(() => {
  if (!room.value || !bookingForm.value.userType || !bookingForm.value.duration)
    return 0;
  const type = bookingForm.value.userType;
  const duration = bookingForm.value.duration;
  const isHalfDay =
    duration === "half_morning" || duration === "half_afternoon";

  if (type === "internal")
    return isHalfDay
      ? room.value.priceHalfDayInternal
      : room.value.priceFullDayInternal;
  if (type === "external")
    return isHalfDay
      ? room.value.priceHalfDayExternal
      : room.value.priceFullDayExternal;
  return 0;
});

const handleFileUpload = (event) => {
  bookingForm.value.slipImage = event.target.files[0];
};

const submitBooking = () => {
  if (!bookingForm.value.acceptTerms) {
    alert("กรุณายอมรับเงื่อนไขการใช้บริการก่อนทำการจอง");
    return;
  }
  alert(
    `✅ ทำรายการจองสำเร็จ!\nระบบได้บันทึกคำขอจองห้อง ${room.value.name} เรียบร้อยแล้ว`,
  );
  router.push("/dashboard");
};

const goBack = () => router.push(`/rooms/${roomId}`);
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="bg-[#ba0b2f] py-16 mb-10 relative overflow-hidden">
      <div
        class="max-w-7xl mx-auto px-4 relative z-10 flex justify-between items-center text-white"
      >
        <div>
          <h1 class="text-4xl font-extrabold">ยืนยันการจองห้อง</h1>
          <p class="text-red-100 mt-2 text-lg">
            ตรวจสอบข้อมูลและเลือกช่องทางการชำระเงินเพื่อดำเนินการต่อ
          </p>
        </div>
        <button
          @click="goBack"
          class="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full font-bold transition-all border border-white/30 flex items-center gap-2"
        >
          <i class="fas fa-arrow-left"></i> ย้อนกลับ
        </button>
      </div>
      <div
        class="absolute right-[-5%] bottom-[-20%] opacity-10 text-[12rem] font-bold text-white select-none pointer-events-none uppercase"
      >
        BOOKING
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-t-[#ba0b2f] border-gray-200"
        ></div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-16 relative z-20"
      >
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-24"
          >
            <div class="relative">
              <img
                :src="room.image"
                :alt="room.name"
                class="w-full h-48 object-cover"
              />
              <div
                class="absolute top-4 left-4 bg-[#ba0b2f] text-white px-3 py-1 rounded-lg text-xs font-bold uppercase shadow-lg"
              >
                สรุปรายการ
              </div>
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 leading-snug mb-3">
                {{ room.name }}
              </h3>
              <div class="space-y-3 pt-4 border-t border-gray-50">
                <div class="flex items-center text-gray-600 gap-3">
                  <i class="fas fa-map-marker-alt text-[#d4af37]"></i>
                  <span class="text-sm font-medium">{{ room.location }}</span>
                </div>
                <div
                  v-if="bookingForm.date"
                  class="flex items-center text-gray-600 gap-3"
                >
                  <i class="fas fa-calendar-day text-[#d4af37]"></i>
                  <span class="text-sm font-medium"
                    >วันที่: {{ bookingForm.date }}</span
                  >
                </div>
              </div>

              <div
                v-if="estimatedPrice > 0"
                class="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100 text-center"
              >
                <p
                  class="text-xs font-bold text-red-600 uppercase tracking-widest mb-1"
                >
                  ยอดชำระโดยประมาณ
                </p>
                <p class="text-3xl font-black text-[#ba0b2f]">
                  ฿{{ estimatedPrice.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div
            class="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100"
          >
            <h2
              class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3"
            >
              <span
                class="w-8 h-8 bg-[#ba0b2f] text-white rounded-full flex items-center justify-center text-sm"
                >1</span
              >
              กรอกข้อมูลการใช้งาน
            </h2>

            <form @submit.prevent="submitBooking" class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700 ml-1"
                    >ชื่อผู้จอง / หน่วยงาน
                    <span class="text-red-500">*</span></label
                  >
                  <input
                    type="text"
                    v-model="bookingForm.userName"
                    required
                    placeholder="ชื่อ-นามสกุล หรือชื่อหน่วยงาน"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700 ml-1"
                    >ประเภทหน่วยงาน <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="bookingForm.userType"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  >
                    <option value="" disabled>-- เลือกประเภท --</option>
                    <option value="internal">หน่วยงานภายในมหาวิทยาลัย</option>
                    <option value="external">หน่วยงานภายนอกมหาวิทยาลัย</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700 ml-1"
                    >วันที่ต้องการใช้งาน
                    <span class="text-red-500">*</span></label
                  >
                  <input
                    type="date"
                    v-model="bookingForm.date"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-gray-700 ml-1"
                    >ระยะเวลาการใช้ <span class="text-red-500">*</span></label
                  >
                  <select
                    v-model="bookingForm.duration"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all"
                  >
                    <option value="" disabled>-- เลือกช่วงเวลา --</option>
                    <option value="half_morning">
                      ครึ่งวันเช้า (08:00 - 12:00 น.)
                    </option>
                    <option value="half_afternoon">
                      ครึ่งวันบ่าย (13:00 - 17:00 น.)
                    </option>
                    <option value="full">เต็มวัน (08:00 - 17:00 น.)</option>
                  </select>
                </div>
              </div>

              <div
                v-if="estimatedPrice > 0"
                class="pt-8 border-t border-gray-100"
              >
                <h2
                  class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
                >
                  <span
                    class="w-8 h-8 bg-[#ba0b2f] text-white rounded-full flex items-center justify-center text-sm"
                    >2</span
                  >
                  เลือกช่องทางการชำระเงิน
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    :class="
                      bookingForm.paymentMethod === 'counter'
                        ? 'border-[#ba0b2f] bg-red-50'
                        : 'border-gray-200'
                    "
                    class="flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all hover:bg-red-50/50 group"
                  >
                    <input
                      type="radio"
                      v-model="bookingForm.paymentMethod"
                      value="counter"
                      class="w-5 h-5 text-[#ba0b2f] focus:ring-[#ba0b2f]"
                    />
                    <div class="ml-4">
                      <p class="font-bold text-gray-900">ชำระเงินสด</p>
                      <p class="text-xs text-gray-500">
                        ที่ส่วนจัดการทรัพย์สิน (มฟล.)
                      </p>
                    </div>
                  </label>
                  <label
                    :class="
                      bookingForm.paymentMethod === 'transfer'
                        ? 'border-[#ba0b2f] bg-red-50'
                        : 'border-gray-200'
                    "
                    class="flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all hover:bg-red-50/50 group"
                  >
                    <input
                      type="radio"
                      v-model="bookingForm.paymentMethod"
                      value="transfer"
                      class="w-5 h-5 text-[#ba0b2f] focus:ring-[#ba0b2f]"
                    />
                    <div class="ml-4">
                      <p class="font-bold text-gray-900">โอนผ่านธนาคาร</p>
                      <p class="text-xs text-gray-500">
                        แนบหลักฐานการโอนในระบบ
                      </p>
                    </div>
                  </label>
                </div>

                <div
                  v-if="bookingForm.paymentMethod === 'transfer'"
                  class="mt-6 p-6 bg-[#ba0b2f]/5 border border-[#ba0b2f]/10 rounded-2xl"
                >
                  <div
                    class="flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <p class="text-sm font-bold text-gray-800">
                        ธนาคารกรุงไทย (KTB)
                      </p>
                      <p class="text-xl font-black text-[#ba0b2f]">
                        123-4-56789-0
                      </p>
                      <p class="text-xs text-gray-500">
                        ชื่อบัญชี: มหาวิทยาลัยแม่ฟ้าหลวง
                      </p>
                    </div>
                    <div class="shrink-0">
                      <input
                        type="file"
                        @change="handleFileUpload"
                        accept="image/*"
                        class="hidden"
                        id="slip-upload"
                      />
                      <label
                        for="slip-upload"
                        class="cursor-pointer bg-white border border-dashed border-[#ba0b2f] text-[#ba0b2f] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#ba0b2f] hover:text-white transition-all"
                      >
                        <i class="fas fa-cloud-upload-alt"></i>
                        {{
                          bookingForm.slipImage
                            ? "เปลี่ยนรูปสลิป"
                            : "แนบสลิปการโอน"
                        }}
                      </label>
                      <p
                        v-if="bookingForm.slipImage"
                        class="text-[10px] text-green-600 font-bold mt-2 text-center"
                      >
                        ✓ อัปโหลดไฟล์แล้ว
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="pt-8 flex items-start p-4 bg-gray-50 rounded-2xl border border-gray-100"
              >
                <input
                  type="checkbox"
                  v-model="bookingForm.acceptTerms"
                  class="mt-1 w-6 h-6 text-[#ba0b2f] rounded-lg border-gray-300 focus:ring-[#ba0b2f]"
                />
                <label class="ml-4 text-sm text-gray-600 leading-relaxed">
                  ข้าพเจ้ายอมรับ
                  <a href="#" class="text-[#ba0b2f] font-bold underline"
                    >เงื่อนไขและข้อตกลง</a
                  >
                  การขอใช้พื้นที่ของมหาวิทยาลัยแม่ฟ้าหลวง
                  และยืนยันว่าข้อมูลที่ระบุในคำขอนี้เป็นความจริงทุกประการ
                </label>
              </div>

              <div class="pt-4 flex flex-col md:flex-row gap-4">
                <button
                  type="submit"
                  :disabled="!bookingForm.acceptTerms"
                  class="flex-1 py-4 bg-[#ba0b2f] disabled:bg-gray-400 text-white font-black rounded-2xl shadow-xl shadow-red-100 hover:bg-[#8c0823] transform hover:scale-[1.02] transition-all uppercase tracking-widest"
                >
                  ยืนยันและส่งคำขอจอง
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
