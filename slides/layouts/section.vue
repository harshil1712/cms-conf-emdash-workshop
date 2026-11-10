<script setup lang="ts">
import type { ArtMotif } from '../lib/halftone'
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Halftone from '../components/Halftone.vue'

const MOTIFS: ArtMotif[] = ['waves', 'ripple', 'dash', 'sphere', 'lines', 'waveform', 'braid', 'stack', 'horizon', 'calendar']

const { $frontmatter } = useSlideContext()
// `class: art-<motif>` picks the chapter's halftone motif (the guide's part heads use the same seeds)
const motif = computed<ArtMotif>(() => {
  const name = String($frontmatter.class ?? '').split(/\s+/).find(c => c.startsWith('art-'))?.slice(4)
  return MOTIFS.includes(name as ArtMotif) ? (name as ArtMotif) : 'ripple'
})
</script>

<template>
  <div class="slidev-layout section">
    <div class="section-glow" aria-hidden="true" />
    <Halftone class="section-art" :seed="`part-${motif}`" :motif="motif" :columns="40" :rows="32" tone="light" />
    <span class="section-rule" aria-hidden="true" />
    <div class="section-copy">
      <slot />
    </div>
  </div>
</template>
