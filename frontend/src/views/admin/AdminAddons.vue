<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import api from "@/services/api";
import { resolveAddonImage } from "@/utils/addonImage";

interface AddonRow {
  id: number;
  name: string;
  price_per_unit: number | string;
  unit_name: string;
  is_active: boolean;
  image_url?: string | null;
  draftName: string;
  draftUnit: string;
  draftPrice: number;
}

const loading = ref(true);
const savingId = ref<number | null>(null);
const creating = ref(false);
const addons = ref<AddonRow[]>([]);

const activeCount = computed(
  () => addons.value.filter((a) => a.is_active).length
);

const mapRow = (a: any): AddonRow => {
  const unit = a.unit_name || "ชิ้น";
  const name = a.name || "";
  return {
    id: a.id,
    name,
    price_per_unit: a.price_per_unit,
    unit_name: unit,
    is_active: a.is_active !== false,
    image_url: a.image_url || null,
    draftName: name,
    draftUnit: unit,
    draftPrice: Number(a.price_per_unit) || 0,
  };
};

const isDirty = (row: AddonRow) =>
  row.draftName.trim() !== row.name ||
  row.draftUnit.trim() !== row.unit_name ||
  Number(row.draftPrice) !== Number(row.price_per_unit);

const loadAddons = async () => {
  loading.value = true;
  try {
    const res = await api.get("/api/admin/addons");
    addons.value = (res.data || []).map(mapRow);
  } catch {
    Swal.fire("ผิดพลาด", "โหลดรายการอุปกรณ์เสริมไม่ได้", "error");
  } finally {
    loading.value = false;
  }
};

const saveRow = async (row: AddonRow) => {
  const name = row.draftName.trim();
  const unit_name = row.draftUnit.trim() || "ชิ้น";
  if (!name) {
    Swal.fire("ผิดพลาด", "กรุณาระบุชื่ออุปกรณ์", "error");
    return;
  }
  if (row.draftPrice < 0 || Number.isNaN(row.draftPrice)) {
    Swal.fire("ผิดพลาด", "ราคาต้องมากกว่าหรือเท่ากับ 0", "error");
    return;
  }
  savingId.value = row.id;
  try {
    const res = await api.put(`/api/admin/addons/${row.id}`, {
      name,
      unit_name,
      price_per_unit: row.draftPrice,
    });
    row.name = res.data.name;
    row.unit_name = res.data.unit_name || "ชิ้น";
    row.price_per_unit = res.data.price_per_unit;
    row.draftName = row.name;
    row.draftUnit = row.unit_name;
    row.draftPrice = Number(res.data.price_per_unit) || 0;
    Swal.fire({
      icon: "success",
      title: "บันทึกแล้ว",
      timer: 1000,
      showConfirmButton: false,
    });
  } catch {
    Swal.fire("ผิดพลาด", "บันทึกไม่สำเร็จ", "error");
  } finally {
    savingId.value = null;
  }
};

const toggleActive = async (row: AddonRow) => {
  savingId.value = row.id;
  try {
    const res = await api.put(`/api/admin/addons/${row.id}`, {
      is_active: !row.is_active,
    });
    row.is_active = res.data.is_active;
  } catch {
    Swal.fire("ผิดพลาด", "อัปเดตสถานะไม่สำเร็จ", "error");
  } finally {
    savingId.value = null;
  }
};

const handleAddAddon = () => {
  Swal.fire({
    title: `<h3 class="text-xl font-black text-gray-900">เพิ่มอุปกรณ์เสริม</h3>`,
    html: `
      <div class="text-left space-y-3 mt-2">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">ชื่ออุปกรณ์</label>
          <input id="addon-name" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold" placeholder="เช่น ขาตั้งไมโครโฟน" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">หน่วย</label>
            <input id="addon-unit" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold" value="ชิ้น" placeholder="ชิ้น / ตัว / ชุด" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">ราคาต่อหน่วย (บาท)</label>
            <input id="addon-price" type="number" min="0" step="1" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold" value="0" />
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "เพิ่มรายการ",
    cancelButtonText: "ยกเลิก",
    showLoaderOnConfirm: true,
    width: "28rem",
    customClass: {
      popup: "rounded-[2rem] p-6",
      confirmButton:
        "bg-[#ba0b2f] text-white rounded-xl px-5 py-3 font-bold cursor-pointer",
      cancelButton:
        "bg-gray-100 text-gray-700 rounded-xl px-5 py-3 font-bold cursor-pointer",
    },
    preConfirm: async () => {
      const name = (
        document.getElementById("addon-name") as HTMLInputElement
      )?.value?.trim();
      const unit_name =
        (document.getElementById("addon-unit") as HTMLInputElement)?.value?.trim() ||
        "ชิ้น";
      const price_per_unit = Number(
        (document.getElementById("addon-price") as HTMLInputElement)?.value
      );
      if (!name) {
        Swal.showValidationMessage("กรุณาระบุชื่ออุปกรณ์");
        return false;
      }
      if (!Number.isFinite(price_per_unit) || price_per_unit < 0) {
        Swal.showValidationMessage("ราคาต้องมากกว่าหรือเท่ากับ 0");
        return false;
      }
      creating.value = true;
      try {
        const res = await api.post("/api/admin/addons", {
          name,
          unit_name,
          price_per_unit,
        });
        return res.data;
      } catch (err: any) {
        Swal.showValidationMessage(
          err?.response?.data?.message || "เพิ่มอุปกรณ์ไม่สำเร็จ"
        );
        return false;
      } finally {
        creating.value = false;
      }
    },
  }).then((result) => {
    if (!result.isConfirmed || !result.value) return;
    addons.value.push(mapRow(result.value));
    Swal.fire({
      icon: "success",
      title: "เพิ่มแล้ว",
      timer: 1200,
      showConfirmButton: false,
    });
  });
};

onMounted(loadAddons);
</script>

<template>
  <div class="space-y-6 animate-fade-up">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-card border border-gray-200"
    >
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
          <font-awesome-icon icon="box-open" class="text-[#d4af37]" />
          อุปกรณ์เสริม (Add-ons)
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          {{ addons.length }} รายการ
          <span class="text-gray-300 mx-1">·</span>
          เปิดใช้ {{ activeCount }}
        </p>
      </div>
      <button
        type="button"
        class="w-full sm:w-auto px-6 py-3 bg-[#ba0b2f] text-white font-bold rounded-xl hover:bg-[#8c0823] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        :disabled="creating"
        @click="handleAddAddon"
      >
        <font-awesome-icon icon="plus" />
        เพิ่ม Add-on
      </button>
    </div>

    <div
      v-if="loading"
      class="bg-white rounded-3xl p-8 border border-gray-200 animate-pulse space-y-4"
    >
      <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-xl"></div>
    </div>

    <div
      v-else-if="addons.length === 0"
      class="bg-white rounded-3xl shadow-card border border-gray-200 py-16 flex flex-col items-center text-center"
    >
      <p class="text-lg font-black text-gray-700 mb-1">ยังไม่มีอุปกรณ์เสริม</p>
      <p class="text-sm text-gray-400 mb-5">กด「เพิ่ม Add-on」เพื่อสร้างรายการแรก</p>
      <button
        type="button"
        class="px-5 py-2.5 bg-[#ba0b2f] text-white font-bold rounded-xl cursor-pointer"
        @click="handleAddAddon"
      >
        เพิ่ม Add-on
      </button>
    </div>

    <div
      v-else
      class="bg-white rounded-3xl shadow-card border border-gray-200 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[720px]">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-4 text-sm font-extrabold text-gray-700">อุปกรณ์</th>
              <th class="px-3 py-4 text-sm font-extrabold text-gray-700 whitespace-nowrap">หน่วย</th>
              <th class="px-3 py-4 text-sm font-extrabold text-gray-700 whitespace-nowrap">ราคา</th>
              <th class="px-4 py-4 text-center text-sm font-extrabold text-gray-700">สถานะ</th>
              <th class="px-4 py-4 text-center text-sm font-extrabold text-gray-700">บันทึก</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(row, idx) in addons"
              :key="row.id"
              class="transition-colors"
              :class="[
                !row.is_active ? 'opacity-55 bg-gray-50/80' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                'hover:bg-amber-50/40',
              ]"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="resolveAddonImage(row.draftName || row.name, row.image_url)"
                    :alt="row.draftName || row.name"
                    class="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                  />
                  <div class="min-w-0 flex-1">
                    <input
                      v-model="row.draftName"
                      type="text"
                      class="w-full max-w-xs px-3 py-2 rounded-xl border bg-white text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ba0b2f]/30"
                      :class="
                        row.draftName.trim() !== row.name
                          ? 'border-[#ba0b2f]/40 ring-1 ring-[#ba0b2f]/20'
                          : 'border-gray-200'
                      "
                      :title="row.draftName"
                    />
                    <p class="text-[11px] text-gray-400 font-medium mt-1">#{{ row.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-4 w-[1%] whitespace-nowrap">
                <input
                  v-model="row.draftUnit"
                  type="text"
                  class="w-14 px-2 py-2 rounded-xl border bg-white text-xs font-bold text-gray-700 text-center outline-none focus:ring-2 focus:ring-[#ba0b2f]/30"
                  :class="
                    row.draftUnit.trim() !== row.unit_name
                      ? 'border-[#ba0b2f]/40 ring-1 ring-[#ba0b2f]/20'
                      : 'border-gray-200'
                  "
                />
              </td>
              <td class="px-3 py-4 w-[1%] whitespace-nowrap">
                <div class="relative inline-flex items-center">
                  <span class="absolute left-2.5 text-xs font-bold text-gray-400">฿</span>
                  <input
                    v-model.number="row.draftPrice"
                    type="number"
                    min="0"
                    step="1"
                    class="w-[5.5rem] pl-6 pr-2 py-2 rounded-xl border bg-white text-sm font-bold text-gray-900 tabular-nums outline-none focus:ring-2 focus:ring-[#ba0b2f]/30"
                    :class="
                      Number(row.draftPrice) !== Number(row.price_per_unit)
                        ? 'border-[#ba0b2f]/40 ring-1 ring-[#ba0b2f]/20'
                        : 'border-gray-200'
                    "
                  />
                </div>
              </td>
              <td class="px-4 py-4 text-center">
                <button
                  type="button"
                  class="text-3xl cursor-pointer transition-colors outline-none"
                  :class="row.is_active ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'"
                  :disabled="savingId === row.id"
                  :title="row.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'"
                  @click="toggleActive(row)"
                >
                  <font-awesome-icon :icon="row.is_active ? 'toggle-on' : 'toggle-off'" />
                </button>
              </td>
              <td class="px-4 py-4 text-center">
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  :class="
                    isDirty(row)
                      ? 'bg-[#ba0b2f] text-white hover:bg-[#8c0823] shadow-sm'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  "
                  :disabled="savingId === row.id || !isDirty(row)"
                  @click="saveRow(row)"
                >
                  {{ savingId === row.id ? "…" : "บันทึก" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
