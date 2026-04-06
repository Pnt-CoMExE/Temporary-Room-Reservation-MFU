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
      image: roomId == 1 ? "/images/room1.jpg" : "/images/room2.jpg",
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

const submitBooking = () => {
  if (!bookingForm.value.acceptTerms) {
    alert("กรุณายอมรับเงื่อนไขการใช้บริการก่อนทำการจอง");
    return;
  }

  // แจ้งเตือนเมื่อจองสำเร็จ พร้อมย้ำเตือนเรื่องการชำระเงิน
  alert(
    `✅ ส่งคำขอจองสำเร็จ!\nระบบได้บันทึกคำขอจองห้อง ${room.value.name} เรียบร้อยแล้ว\n\n📌 กรุณาติดต่อชำระเงินที่ "ส่วนจัดการทรัพย์สิน มฟล." เพื่อยืนยันสิทธิ์การจองของคุณ`,
  );
  router.push("/dashboard");
};

const goBack = () => router.push(`/rooms/${roomId}`);
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header แบบ Mini Hero -->
    <div class="bg-[#ba0b2f] py-16 mb-10 relative overflow-hidden">
      <div
        class="max-w-7xl mx-auto px-4 relative z-10 flex justify-between items-center text-white"
      >
        <div>
          <h1 class="text-4xl font-extrabold">ยืนยันการจองห้อง</h1>
          <p class="text-red-100 mt-2 text-lg">
            ตรวจสอบข้อมูลและยืนยันคำขอจองพื้นที่ของคุณ
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
        <!-- ฝั่งซ้าย: ข้อมูลห้อง -->
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
                  ยอดชำระที่เคาน์เตอร์
                </p>
                <p class="text-3xl font-black text-[#ba0b2f]">
                  ฿{{ estimatedPrice.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ฝั่งขวา: ฟอร์มกรอกข้อมูล -->
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

              <!-- ส่วนที่แก้ไข: ลบฟอร์มชำระเงิน เปลี่ยนเป็นกล่องแจ้งเตือน -->
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
                  ช่องทางการชำระเงิน
                </h2>

                <div
                  class="p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-start gap-5"
                >
                  <div
                    class="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#ba0b2f] shadow-sm shrink-0 text-2xl"
                  >
                    <i class="fas fa-building"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">
                      ติดต่อชำระเงินที่ส่วนจัดการทรัพย์สิน
                    </h3>
                    <p class="text-gray-600 text-sm leading-relaxed mb-3">
                      ระบบไม่รองรับการชำระเงินออนไลน์
                      หลังจากท่านกดส่งคำขอจองห้องพักแล้ว
                      <b
                        >กรุณาไปติดต่อชำระเงินด้วยตนเองที่ ส่วนจัดการทรัพย์สิน
                        มหาวิทยาลัยแม่ฟ้าหลวง</b
                      >
                      เพื่อยืนยันสิทธิ์การใช้งานพื้นที่
                    </p>
                    <p
                      class="text-xs font-bold text-[#ba0b2f] bg-white inline-block px-3 py-1 rounded-md border border-red-100"
                    >
                      * คำขอจองจะสมบูรณ์เมื่อชำระเงินเรียบร้อยแล้วเท่านั้น
                    </p>
                  </div>
                </div>
              </div>

              <!-- ข้อตกลงและปุ่มยืนยัน -->
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

              <div class="pt-4">
                <button
                  type="submit"
                  :disabled="!bookingForm.acceptTerms"
                  class="w-full py-4 bg-[#ba0b2f] disabled:bg-gray-400 text-white font-black rounded-2xl shadow-xl shadow-red-100 hover:bg-[#8c0823] transform hover:scale-[1.02] transition-all uppercase tracking-widest"
                >
                  ส่งคำขอจอง
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
