<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { formatDateDMY, parseDateDMY, toDateKey } from "@/utils/dateKey";

const { t } = useI18n();

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

const text = ref(formatDateDMY(props.modelValue));

watch(
  () => props.modelValue,
  (v) => {
    const next = formatDateDMY(v);
    if (next !== text.value) text.value = next;
  }
);

const hintId = computed(() => (props.id ? `${props.id}-hint` : undefined));

const commitText = () => {
  const raw = text.value.trim();
  if (!raw) {
    emit("update:modelValue", "");
    text.value = "";
    return;
  }
  const parsed = parseDateDMY(raw);
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
</script>

<template>
  <div>
    <input
      :id="id"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="t('common.date_placeholder')"
      :aria-describedby="hintId"
      :value="text"
      :required="required"
      :disabled="disabled"
      :class="inputClass"
      @input="text = ($event.target as HTMLInputElement).value"
      @blur="commitText"
      @keydown.enter.prevent="commitText"
    />
    <p v-if="hintId" :id="hintId" class="sr-only">
      {{ t("common.date_format_hint") }}
    </p>
  </div>
</template>
