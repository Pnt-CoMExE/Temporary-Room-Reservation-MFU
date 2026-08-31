<template>    <div class="animate-pulse" :class="computedClass">
    <div
      v-for="i in rows"
      :key="i"
      class="bg-gray-200 rounded-lg"
      :style="{ height: itemHeight + 'px', width: widths[i - 1] || '100%' }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    rows?: number
    itemHeight?: number
    widths?: string[]
    containerClass?: string
  }>(),
  {
    rows: 1,
    itemHeight: 16,
    widths: () => ['100%'],
  }
)

const computedClass = computed(() => props.containerClass || 'flex flex-col gap-3')
</script>
