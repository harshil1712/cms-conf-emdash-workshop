<!-- Slide chrome on content slides (default, two-cols-header): deck, section, page, progress.
     Per slide rather than global, so export prints the right page numbers. -->
<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

const { $nav, $page, $frontmatter } = useSlideContext()
const SHOWN = new Set(['default', 'two-cols-header'])
const show = computed(() => SHOWN.has($frontmatter.layout ?? 'default') && $page.value > 1)
// slide 1's title is the headmatter `title`; the chrome shows the part before the colon, "Ship, Automate, Extend"
const deck = computed(() => String($nav.value.slides[0]?.meta?.slide?.title ?? '').split(':')[0].trim())
const section = computed(() => {
  for (let i = $page.value - 1; i >= 0; i--) {
    const slide = $nav.value.slides[i]?.meta?.slide
    if (slide?.frontmatter?.layout === 'section')
      return slide.title ?? ''
  }
  return ''
})
const pct = computed(() => `${($page.value / $nav.value.total) * 100}%`)
</script>

<template>
  <div v-if="show" class="slide-chrome" aria-hidden="true">
    <div class="chrome-row">
      <img class="chrome-mark" src="/favicon.svg" alt="" width="32" height="32">
      <span>{{ deck }}</span>
      <template v-if="section">
        <i class="chrome-sep" />
        <span>{{ section }}</span>
      </template>
      <span class="chrome-progress"><span :style="{ width: pct }" /></span>
      <span class="chrome-page"><b>{{ $page }}</b> / {{ $nav.total }}</span>
    </div>
  </div>
</template>

<style>
.slide-chrome { position: absolute; inset: 0; z-index: 10; pointer-events: none; }
.chrome-row {
  position: absolute; left: 120px; right: 120px; bottom: 48px; height: 40px;
  display: flex; align-items: center; gap: 16px;
  font: 500 22px/1 "Inter", ui-sans-serif, system-ui, sans-serif; letter-spacing: 0;
  color: #6b6b6b; white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}
.chrome-mark { display: block; width: 32px; height: 32px; flex: none; margin-inline-end: 2px; }
.chrome-sep { width: 4px; height: 4px; border-radius: 50%; background: #8f8f8f; flex: none; }
.chrome-progress {
  margin-inline-start: auto; width: 160px; height: 4px; border-radius: 4px; background: #e3e3e3; overflow: hidden; flex: none;
}
.chrome-progress > span { display: block; height: 100%; border-radius: 4px; background: #ff5e1f; }
.chrome-page { margin-inline-start: 8px; min-width: 76px; text-align: end; font-variant-numeric: tabular-nums; }
.chrome-page b { color: #262626; font-weight: 600; }
html.dark .chrome-row { color: #a3a3a3; }
html.dark .chrome-sep { background: #737373; }
html.dark .chrome-progress { background: #262626; }
html.dark .chrome-page b { color: #f5f5f5; }
</style>
