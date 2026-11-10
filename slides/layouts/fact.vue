<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { onMounted, ref } from 'vue'

// The numeral ("91%") sets how many of the 100 discs are filled; they fill in order while the slide is on screen
const copy = ref<HTMLElement>()
const filled = ref(0)
const active = useIsSlideActive()
onMounted(() => {
  const value = Number.parseInt(copy.value?.querySelector('h1')?.textContent ?? '', 10)
  filled.value = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
})
</script>

<template>
  <div class="slidev-layout fact">
    <div ref="copy" class="fact-copy">
      <slot />
    </div>
    <div class="fact-matrix" :class="{ 'is-live': active }" aria-hidden="true">
      <i v-for="i in 100" :key="i" :class="{ on: i <= filled }" :style="{ '--n': i }" />
    </div>
  </div>
</template>
