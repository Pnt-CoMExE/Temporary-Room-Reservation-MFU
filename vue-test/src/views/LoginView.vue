<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// ตัวแปรควบคุมสถานะ: true = แสดง Sign In, false = แสดง Sign Up
const isSignIn = ref(true);

const toggleForm = () => {
  isSignIn.value = !isSignIn.value;
};

// ฟอร์มเข้าสู่ระบบ
const signInForm = ref({ username: "", password: "" });

// ฟอร์มสมัครสมาชิก
const signUpForm = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// ฟังก์ชันจัดการ Sign In (เข้าสู่ระบบ)
const handleSignIn = async () => {
  if (!signInForm.value.username || !signInForm.value.password) {
    alert("กรุณากรอก Username และ Password ให้ครบถ้วน");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: signInForm.value.username,
        password: signInForm.value.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // เซฟข้อมูลลง LocalStorage ไว้ใช้ข้ามหน้า
      localStorage.setItem("user_token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "userName",
        data.user.firstName + " " + data.user.lastName,
      );

      alert(`ยินดีต้อนรับคุณ ${data.user.firstName}`);
      router.push("/home");
    } else {
      alert("❌ " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ Server");
  }
};

// ฟังก์ชันจัดการ Sign Up (สมัครสมาชิก)
const handleSignUp = async () => {
  if (signUpForm.value.password !== signUpForm.value.confirmPassword) {
    alert("❌ รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: signUpForm.value.firstName,
        lastName: signUpForm.value.lastName,
        username: signUpForm.value.username,
        email: signUpForm.value.email,
        password: signUpForm.value.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ " + data.message + "\nกรุณาเข้าสู่ระบบด้วยบัญชีที่สร้างใหม่");
      isSignIn.value = true;

      // ล้างข้อมูลในฟอร์มหลังสมัครเสร็จ
      signUpForm.value = {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      };
    } else {
      alert("❌ " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ Server");
  }
};
</script>

<template>
  <div
    class="bg-gray-100 min-h-screen py-10 flex flex-col justify-center items-center overflow-x-hidden"
  >
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-0 lg:px-0">
      <RouterLink
        to="/"
        class="block text-center text-3xl font-extrabold text-[#ba0b2f] hover:text-[#8c0823] transition-colors mb-8"
      >
        <span class="text-[#d4af37]">MFU</span> Property
      </RouterLink>

      <div
        class="bg-white rounded-[35px] shadow-2xl border border-gray-100 overflow-hidden relative min-h-150 max-w-5xl mx-auto"
      >
        <!-- แผง Sign In -->
        <div
          class="absolute top-0 h-full w-1/2 left-0 transition-all duration-700 ease-in-out bg-white"
          :class="
            isSignIn
              ? 'translate-x-0 opacity-100 z-20 pointer-events-auto'
              : 'translate-x-full opacity-0 z-10 pointer-events-none'
          "
        >
          <form
            @submit.prevent="handleSignIn"
            class="p-8 md:p-10 flex flex-col justify-center items-center h-full text-center"
          >
            <h2
              class="text-3xl font-extrabold text-gray-900 mb-4 flex flex-col items-center"
            >
              <span class="text-4xl text-yellow-500 mb-2">👋</span>
              สวัสดีครับ/ค่ะ!
            </h2>
            <p class="text-sm text-gray-500 mb-6 max-w-sm">
              ยินดีต้อนรับกลับเข้าสู่ระบบ MFU Property
              กรุณาเข้าสู่ระบบเพื่อใช้งาน
            </p>

            <div class="space-y-3 w-full max-w-sm">
              <!-- ช่องกรอก Username -->
              <div class="relative">
                <i
                  class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-lg"
                ></i>
                <input
                  type="text"
                  v-model="signInForm.username"
                  required
                  placeholder="ชื่อผู้ใช้งาน (Username)"
                  class="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-base"
                />
              </div>
              <div class="relative">
                <i
                  class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-lg"
                ></i>
                <input
                  type="password"
                  v-model="signInForm.password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-base"
                />
              </div>
            </div>

            <a
              href="#"
              class="text-sm text-[#d4af37] hover:underline font-semibold mt-3 mb-6"
              >ลืมรหัสผ่าน?</a
            >
            <button
              type="submit"
              class="w-full max-w-xs py-3 px-6 bg-[#ba0b2f] hover:bg-[#8c0823] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all text-base uppercase tracking-wider"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

        <!-- แผง Sign Up -->
        <div
          class="absolute top-0 h-full w-1/2 left-0 transition-all duration-700 ease-in-out bg-white"
          :class="
            !isSignIn
              ? 'translate-x-full opacity-100 z-20 pointer-events-auto'
              : 'translate-x-0 opacity-0 z-10 pointer-events-none'
          "
        >
          <form
            @submit.prevent="handleSignUp"
            class="p-8 md:p-10 flex flex-col justify-center items-center h-full text-center"
          >
            <h2
              class="text-3xl font-extrabold text-gray-900 mb-4 flex flex-col items-center"
            >
              <span class="text-4xl text-green-500 mb-2">🤝</span>
              สวัสดีเพื่อนใหม่!
            </h2>
            <p class="text-sm text-gray-500 mb-4 max-w-sm">
              สมัครสมาชิกเพื่อเริ่มต้นค้นหาและจองห้องพักกับ MFU Property
            </p>

            <div class="space-y-3 w-full max-w-sm">
              <!-- แยก ชื่อ และ นามสกุล ให้อยู่บรรทัดเดียวกัน -->
              <div class="grid grid-cols-2 gap-3">
                <div class="relative">
                  <i
                    class="fas fa-address-card absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-sm"
                  ></i>
                  <input
                    type="text"
                    v-model="signUpForm.firstName"
                    required
                    placeholder="ชื่อ"
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-sm"
                  />
                </div>
                <div class="relative">
                  <input
                    type="text"
                    v-model="signUpForm.lastName"
                    required
                    placeholder="นามสกุล"
                    class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-sm"
                  />
                </div>
              </div>

              <!-- ช่อง Username -->
              <div class="relative">
                <i
                  class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-lg"
                ></i>
                <input
                  type="text"
                  v-model="signUpForm.username"
                  required
                  placeholder="ชื่อผู้ใช้งาน (Username)"
                  class="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-base"
                />
              </div>

              <!-- อีเมลและรหัสผ่าน -->
              <div class="relative">
                <i
                  class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-lg"
                ></i>
                <input
                  type="email"
                  v-model="signUpForm.email"
                  required
                  placeholder="student@lamduan.mfu.ac.th"
                  class="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-base"
                />
              </div>
              <div class="relative">
                <i
                  class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-lg"
                ></i>
                <input
                  type="password"
                  v-model="signUpForm.password"
                  required
                  placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)"
                  class="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-base"
                />
              </div>
              <div class="relative">
                <i
                  class="fas fa-check absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] text-lg"
                ></i>
                <input
                  type="password"
                  v-model="signUpForm.confirmPassword"
                  required
                  placeholder="ยืนยันรหัสผ่าน"
                  class="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#ba0b2f] outline-none transition-all shadow-inner text-base"
                />
              </div>
            </div>

            <div class="flex items-center mt-4 mb-4">
              <input
                type="checkbox"
                required
                class="w-4 h-4 text-[#ba0b2f] rounded border-gray-300 focus:ring-[#ba0b2f]"
              />
              <label class="ml-3 text-sm text-gray-600">
                ฉันยอมรับ
                <a href="#" class="text-[#ba0b2f] hover:underline font-semibold"
                  >ข้อตกลงและเงื่อนไข</a
                >
              </label>
            </div>
            <button
              type="submit"
              class="w-full max-w-xs py-3 px-6 bg-[#ba0b2f] hover:bg-[#8c0823] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all text-base uppercase tracking-wider"
            >
              สร้างบัญชี
            </button>
          </form>
        </div>

        <!-- แผง Overlay สีแดง/ทองตรงกลาง -->
        <div
          class="absolute top-0 h-full w-1/2 left-1/2 overflow-hidden z-30 transition-all duration-700 ease-in-out"
          :class="isSignIn ? 'translate-x-0' : '-translate-x-full'"
        >
          <div
            class="absolute top-0 h-full w-[200%] -left-full text-white transition-all duration-700 ease-in-out bg-cover bg-center bg-no-repeat"
            style="
              background-image: linear-gradient(
                135deg,
                #ba0b2f 0%,
                #8c0823 100%
              );
            "
            :class="isSignIn ? 'translate-x-0' : 'translate-x-1/2'"
          >
            <div
              class="absolute top-0 h-full w-1/2 left-0 px-10 md:px-14 flex flex-col justify-center items-center text-center transition-all duration-700 ease-in-out"
              :class="isSignIn ? '-translate-x-[20%]' : 'translate-x-0'"
            >
              <h2
                class="text-4xl font-extrabold mb-4 flex flex-col items-center"
              >
                <span class="text-5xl text-blue-100 mb-2">🎉</span>
                ยินดีต้อนรับกลับมา!
              </h2>
              <p class="text-base leading-relaxed mb-8 max-w-sm">
                กรุณาเข้าสู่ระบบด้วยข้อมูลส่วนตัวของคุณเพื่อเริ่มใช้งานการจองห้องพักและพื้นที่ต่างๆ
              </p>
              <button
                @click="toggleForm"
                class="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#ba0b2f] transition-all shadow-md text-sm uppercase tracking-wider"
              >
                ไปหน้าสมัครสมาชิก &rarr;
              </button>
            </div>

            <div
              class="absolute top-0 h-full w-1/2 right-0 px-10 md:px-14 flex flex-col justify-center items-center text-center transition-all duration-700 ease-in-out"
              :class="isSignIn ? 'translate-x-0' : 'translate-x-[20%]'"
            >
              <h2
                class="text-4xl font-extrabold mb-4 flex flex-col items-center"
              >
                <span class="text-5xl text-blue-100 mb-2">👋</span>
                สวัสดีเพื่อนใหม่!
              </h2>
              <p class="text-base leading-relaxed mb-8 max-w-sm">
                สมัครสมาชิกง่ายๆ เพียงไม่กี่ขั้นตอน
                เพื่อเริ่มต้นค้นหาและจองพื้นที่ภายในมหาวิทยาลัยได้ง่ายๆ ตลอด 24
                ชั่วโมง
              </p>
              <button
                @click="toggleForm"
                class="px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-[#ba0b2f] transition-all shadow-md text-sm uppercase tracking-wider"
              >
                &larr; ไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
