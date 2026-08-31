<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="$emit('cancel')"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-md">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">{{ icon }}</span>
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          </div>
          <p class="text-gray-600 text-sm mb-6 leading-relaxed">
            {{ message }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#ba0b2f] hover:bg-[#980926]',
              ]"
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
    visible: boolean
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    icon?: string
    danger?: boolean
  }>(),
  {
    title: 'ยืนยันการดำเนินการ',
    message: 'คุณแน่ใจหรือไม่?',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    icon: '⚠️',
    danger: false,
  }
)

defineEmits<{
  confirm: []
  cancel: []
}>()
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
