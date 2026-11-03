<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatDateDMY, parseDateDMY, toDateKey } from "@/utils/dateKey";

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

const iso = computed({
  get: () => toDateKey(props.modelValue),
  set: (v: string) => emit("update:modelValue", toDateKey(v)),
});

const text = ref(formatDateDMY(props.modelValue));
const picker = ref<HTMLInputElement | null>(null);

watch(
  () => props.modelValue,
  (v) => {
    const next = formatDateDMY(v);
    if (next !== text.value) text.value = next;
  }
);

const commitText = () => {
  const parsed = parseDateDMY(text.value);
  if (!parsed) {
    text.value = formatDateDMY(props.modelValue);
    return;
  }
  if (props.min && parsed < toDateKey(props.min)) {
    text.value = formatDateDMY(props.modelValue);
    return;
  }
  if (props.max && parsed > toDateKey(props.max)) {
    text.value = formatDateDMY(props.modelValue);
    return;
  }
  emit("update:modelValue", parsed);
  text.value = formatDateDMY(parsed);
};

const openPicker = () => {
  if (props.disabled) return;
  const el = picker.value;
  if (!el) return;
  try {
    el.showPicker?.();
  } catch {
    el.click();
  }
};

const onPickerInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;
  emit("update:modelValue", toDateKey(v));
};
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      placeholder="วว/ดด/ปปปป"
      :value="text"
      :required="required"
      :disabled="disabled"
      :class="[inputClass, 'pr-11']"
      @input="text = ($event.target as HTMLInputElement).value"
      @blur="commitText"
      @keydown.enter.prevent="commitText"
    />
    <button
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-gray-500 hover:text-mfu-red hover:bg-red-50 flex items-center justify-center cursor-pointer disabled:opacity-40"
      :disabled="disabled"
      tabindex="-1"
      aria-label="เลือกวันที่"
      @click="openPicker"
    >
      <font-awesome-icon :icon="['far', 'calendar-alt']" />
    </button>
    <input
      ref="picker"
      type="date"
      class="sr-only"
      tabindex="-1"
      :value="iso"
      :min="min || undefined"
      :max="max || undefined"
      :disabled="disabled"
      @input="onPickerInput"
    />
  </div>
</template>
