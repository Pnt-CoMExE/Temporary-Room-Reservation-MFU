<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  getBookingStatusBadgeClass,
  getBookingStatusIcon,
  getBookingStatusLabel,
} from "@/utils/bookingStatus";

const props = withDefaults(
  defineProps<{
    status: string;
    size?: "sm" | "md";
    as?: "span" | "button";
    showPointer?: boolean;
    title?: string;
  }>(),
  {
    size: "sm",
    as: "span",
    showPointer: false,
  }
);

const emit = defineEmits<{ click: [MouseEvent] }>();
const { locale } = useI18n();

const label = computed(() =>
  getBookingStatusLabel(props.status, locale.value)
);
const badgeClass = computed(() => getBookingStatusBadgeClass(props.status));
const icon = computed(() => getBookingStatusIcon(props.status));
const sizeClass = computed(() =>
  props.size === "md"
    ? "px-4 py-2 rounded-xl text-sm gap-2"
    : "px-3 py-1.5 rounded-full text-xs gap-1.5"
);
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    :title="title"
    :class="[
      'inline-flex items-center font-bold border shadow-sm transition-all',
      sizeClass,
      badgeClass,
      as === 'button'
        ? 'hover:shadow-md hover:opacity-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mfu-red/35'
        : 'cursor-default',
    ]"
    @click="as === 'button' ? emit('click', $event) : undefined"
  >
    <font-awesome-icon :icon="icon" class="text-[11px] opacity-80" />
    <span>{{ label }}</span>
    <font-awesome-icon
      v-if="showPointer"
      icon="mouse-pointer"
      class="text-[10px] opacity-50"
    />
  </component>
</template>
