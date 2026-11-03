<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { formatDateDMY, parseDateDMY, toDateKey } from "@/utils/dateKey";

const { t, locale } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    /** Extra classes for the visible text field */
    inputClass?: string;
  }>(),
  {
    modelValue: "",
    min: "",
    max: "",
    required: false,
    disabled: false,
    id: undefined,
    inputClass: "ui-input py-3.5 shadow-sm",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const text = ref(formatDateDMY(props.modelValue));
const open = ref(false);
/** First day of the month currently shown in the popover (local noon). */
const viewMonth = ref(startOfMonth(new Date()));

watch(
  () => props.modelValue,
  (v) => {
    const next = formatDateDMY(v);
    if (next !== text.value) text.value = next;
  }
);

const hintId = computed(() => (props.id ? `${props.id}-hint` : undefined));
const displayLocale = computed(() =>
  locale.value === "en" || String(locale.value).startsWith("en") ? "en-GB" : "th-TH"
);

const minKey = computed(() => toDateKey(props.min));
const maxKey = computed(() => toDateKey(props.max));
const selectedKey = computed(() => toDateKey(props.modelValue));
const todayKey = computed(() => toDateKey(new Date()));

const monthTitle = computed(() =>
  // Force Gregorian year so the popover matches DD/MM/YYYY text input (not Buddhist Era).
  viewMonth.value.toLocaleDateString(displayLocale.value, {
    month: "long",
    year: "numeric",
    calendar: "gregory",
  })
);

const weekdayLabels = computed(() => {
  // Sunday-first grid (matches common TH calendars)
  const base = new Date(2024, 0, 7); // Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d.toLocaleDateString(displayLocale.value, { weekday: "short" });
  });
});

const calendarDays = computed(() => {
  const year = viewMonth.value.getFullYear();
  const month = viewMonth.value.getMonth();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ key: string; day: number; inMonth: boolean } | null> = [];

  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key, day, inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
});

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
}

function keyToDate(key: string): Date | null {
  const k = toDateKey(key);
  if (!k) return null;
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function isDisabled(key: string): boolean {
  if (minKey.value && key < minKey.value) return true;
  if (maxKey.value && key > maxKey.value) return true;
  return false;
}

function syncViewToValue() {
  const fromValue = keyToDate(props.modelValue || "");
  if (fromValue) {
    viewMonth.value = startOfMonth(fromValue);
    return;
  }
  const fromMin = keyToDate(minKey.value);
  const fromMax = keyToDate(maxKey.value);
  const today = new Date();
  let base = today;
  if (fromMin && today < fromMin) base = fromMin;
  if (fromMax && today > fromMax) base = fromMax;
  viewMonth.value = startOfMonth(base);
}

const commitText = () => {
  const raw = text.value.trim();
  if (!raw) {
    emit("update:modelValue", "");
    text.value = "";
    return;
  }
  const parsed = parseDateDMY(raw);
  if (!parsed || isDisabled(parsed)) {
    text.value = formatDateDMY(props.modelValue);
    return;
  }
  emit("update:modelValue", parsed);
  text.value = formatDateDMY(parsed);
};

const selectDay = (key: string) => {
  if (isDisabled(key)) return;
  emit("update:modelValue", key);
  text.value = formatDateDMY(key);
  open.value = false;
};

const shiftMonth = (delta: number) => {
  const d = new Date(viewMonth.value);
  d.setMonth(d.getMonth() + delta);
  viewMonth.value = startOfMonth(d);
};

const openCalendar = async () => {
  if (props.disabled || open.value) return;
  syncViewToValue();
  open.value = true;
  await nextTick();
};

const toggleCalendar = async () => {
  if (props.disabled) return;
  if (open.value) {
    open.value = false;
    return;
  }
  await openCalendar();
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
    <div class="relative">
      <input
        :id="id"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        :placeholder="t('common.date_placeholder')"
        :aria-describedby="hintId"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :value="text"
        :required="required"
        :disabled="disabled"
        :class="[inputClass, 'pr-11']"
        @input="text = ($event.target as HTMLInputElement).value"
        @focus="openCalendar"
        @click="openCalendar"
        @blur="commitText"
        @keydown.enter.prevent="commitText"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-gray-400 hover:text-mfu-red transition-colors disabled:opacity-40 cursor-pointer"
        :disabled="disabled"
        :aria-label="t('common.pick_date')"
        :aria-expanded="open"
        @click="toggleCalendar"
      >
        <font-awesome-icon :icon="['far', 'calendar-alt']" />
      </button>
    </div>
    <p v-if="hintId" :id="hintId" class="sr-only">
      {{ t("common.date_format_hint") }}
    </p>

    <div
      v-if="open"
      role="dialog"
      :aria-label="t('common.pick_date')"
      class="absolute z-50 mt-2 w-[min(100%,18.5rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl animate-fade-up"
    >
      <div class="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          class="w-8 h-8 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-mfu-red transition-colors cursor-pointer"
          :aria-label="t('common.prev_month')"
          @click="shiftMonth(-1)"
        >
          <font-awesome-icon icon="chevron-left" />
        </button>
        <p class="text-sm font-extrabold text-gray-900 capitalize tabular-nums">
          {{ monthTitle }}
        </p>
        <button
          type="button"
          class="w-8 h-8 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-mfu-red transition-colors cursor-pointer"
          :aria-label="t('common.next_month')"
          @click="shiftMonth(1)"
        >
          <font-awesome-icon icon="chevron-right" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-0.5 mb-1">
        <span
          v-for="(label, i) in weekdayLabels"
          :key="i"
          class="text-[10px] font-bold text-gray-400 text-center py-1 uppercase tracking-wide"
        >
          {{ label }}
        </span>
      </div>

      <div class="grid grid-cols-7 gap-0.5">
        <template v-for="(cell, i) in calendarDays" :key="i">
          <span v-if="!cell" class="h-9" />
          <button
            v-else
            type="button"
            class="h-9 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            :class="
              cell.key === selectedKey
                ? 'bg-mfu-red text-white shadow-sm'
                : cell.key === todayKey
                  ? 'bg-red-50 text-mfu-red ring-1 ring-mfu-red/20'
                  : 'text-gray-800 hover:bg-gray-100'
            "
            :disabled="isDisabled(cell.key)"
            @click="selectDay(cell.key)"
          >
            {{ cell.day }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
