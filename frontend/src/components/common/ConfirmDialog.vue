<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('cancel')"
      >
        <div class="ui-card-elevated p-6 mx-auto w-full max-w-md">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl" aria-hidden="true">{{ icon }}</span>
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          </div>
          <p class="text-gray-600 text-base mb-6 leading-relaxed">
            {{ message }}
          </p>
          <div class="flex justify-end gap-3">
            <button type="button" class="ui-btn-secondary" @click="$emit('cancel')">
              {{ cancelText }}
            </button>
            <button
              type="button"
              :class="danger ? 'ui-btn-primary bg-red-600 hover:bg-red-700 shadow-red-200' : 'ui-btn-primary'"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
    danger?: boolean;
  }>(),
  {
    title: "ยืนยันการดำเนินการ",
    message: "คุณแน่ใจหรือไม่?",
    confirmText: "ยืนยัน",
    cancelText: "ยกเลิก",
    icon: "⚠️",
    danger: false,
  }
);

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.25s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from > div,
.dialog-leave-to > div {
  transform: scale(0.9);
}
</style>
