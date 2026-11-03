<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    id?: string;
    inputClass?: string;
  }>(),
  {
    modelValue: "",
    min: "",
    max: "",
    disabled: false,
    id: undefined,
    inputClass: "border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold pr-11",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const open = ref(false);
const viewYear = ref(new Date().getFullYear());

const displayLocale = computed(() =>
  locale.value === "en" || String(locale.value).startsWith("en") ? "en-GB" : "th-TH"
);

const selected = computed(() => parseYm(props.modelValue));

const displayLabel = computed(() => {
  const s = selected.value;
  if (!s) return t("common.pick_month");
  return new Date(s.y, s.m - 1, 1, 12).toLocaleDateString(displayLocale.value, {
    month: "long",
    year: "numeric",
    calendar: "gregory",
  });
});

const monthLabels = computed(() =>
  Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(displayLocale.value, {
      month: "short",
      calendar: "gregory",
    })
  )
);

watch(
  () => props.modelValue,
  (v) => {
    const s = parseYm(v);
    if (s) viewYear.value = s.y;
  },
  { immediate: true }
);

function parseYm(value?: string): { y: number; m: number } | null {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  if (m < 1 || m > 12) return null;
  return { y, m };
}

function toYm(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, "0")}`;
}

function isDisabledMonth(y: number, m: number): boolean {
  const key = toYm(y, m);
  if (props.min && key < props.min) return true;
  if (props.max && key > props.max) return true;
  return false;
}

const openPicker = async () => {
  if (props.disabled || open.value) return;
  const s = selected.value;
  viewYear.value = s?.y ?? new Date().getFullYear();
  open.value = true;
  await nextTick();
};

const togglePicker = async () => {
  if (props.disabled) return;
  if (open.value) {
    open.value = false;
    return;
  }
  await openPicker();
};

const selectMonth = (m: number) => {
  if (isDisabledMonth(viewYear.value, m)) return;
  emit("update:modelValue", toYm(viewYear.value, m));
  open.value = false;
};

const pickThisMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (isDisabledMonth(y, m)) return;
  emit("update:modelValue", toYm(y, m));
  open.value = false;
};

const onDocPointer = (e: MouseEvent | TouchEvent) => {
  if (!open.value || !rootRef.value) return;
  const target = e.target as Node | null;
  if (target && !rootRef.value.contains(target)) open.value = false;
};

const onDocKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" && open.value) open.value = false;
};

onMounted(() => {
  document.addEventListener("mousedown", onDocPointer);
  document.addEventListener("touchstart", onDocPointer);
  document.addEventListener("keydown", onDocKey);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocPointer);
  document.removeEventListener("touchstart", onDocPointer);
  document.removeEventListener("keydown", onDocKey);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      :id="id"
      type="button"
      class="relative w-full text-left"
      :class="[inputClass, disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="dialog"
      :aria-label="t('common.pick_month')"
      @click="togglePicker"
    >
      <span class="block truncate capitalize">{{ displayLabel }}</span>
      <span
        class="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-gray-400 pointer-events-none"
      >
        <font-awesome-icon :icon="['far', 'calendar-alt']" />
      </span>
    </button>

    <div
      v-if="open"
      role="dialog"
      :aria-label="t('common.pick_month')"
      class="absolute z-50 mt-2 w-[min(100%,18rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl animate-fade-up"
    >
      <div class="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          class="w-8 h-8 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-mfu-red transition-colors cursor-pointer"
          :aria-label="t('common.prev_year')"
          @click="viewYear -= 1"
        >
          <font-awesome-icon icon="chevron-left" />
        </button>
        <p class="text-sm font-extrabold text-gray-900 tabular-nums">{{ viewYear }}</p>
        <button
          type="button"
          class="w-8 h-8 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-mfu-red transition-colors cursor-pointer"
          :aria-label="t('common.next_year')"
          @click="viewYear += 1"
        >
          <font-awesome-icon icon="chevron-right" />
        </button>
      </div>

      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="(label, idx) in monthLabels"
          :key="idx"
          type="button"
          class="py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed capitalize"
          :class="
            selected && selected.y === viewYear && selected.m === idx + 1
              ? 'bg-mfu-red text-white shadow-sm'
              : 'text-gray-800 hover:bg-gray-100'
          "
          :disabled="isDisabledMonth(viewYear, idx + 1)"
          @click="selectMonth(idx + 1)"
        >
          {{ label }}
        </button>
      </div>

      <div class="mt-3 pt-2 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          class="text-xs font-bold text-mfu-red hover:underline cursor-pointer"
          @click="pickThisMonth"
        >
          {{ t("common.this_month") }}
        </button>
      </div>
    </div>
  </div>
</template>
