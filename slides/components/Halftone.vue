<!-- Brand halftone art, rendered the way emdashcms.com's PostCover.astro does -->
<script setup lang="ts">
import type { ArtMotif } from '../lib/halftone'
import { computed, useId } from 'vue'
import { halftoneArt } from '../lib/halftone'

const props = withDefaults(defineProps<{
  seed: string
  motif: ArtMotif
  columns: number
  rows: number
  tone?: 'light' | 'dark'
}>(), { tone: 'light' })

const art = computed(() => halftoneArt(props.seed, props.columns, props.rows, props.motif))
// unique per instance: the presenter view and overview render the same slide more than once
const paperId = `ht-paper-${useId()}`
</script>

<template>
  <svg
    class="halftone"
    :class="`halftone--${tone}`"
    :viewBox="`0 0 ${art.width} ${art.height}`"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <pattern :id="paperId" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle class="halftone-grain" cx="5" cy="5" r="0.75" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#${paperId})`" />
    <path
      v-for="(layer, i) in art.layers"
      :key="i"
      class="halftone-dots"
      :class="{ 'halftone-dots--accent': layer.accent }"
      :d="layer.d"
      :stroke-width="layer.width"
    />
  </svg>
</template>

<style>
.halftone { display: block; }
/* PostCover.astro values: ink at 62% / paper at 9% on light, 50% / 8% on dark */
.halftone--light { --ht-ink: rgb(38 38 38 / 62%); --ht-paper: rgb(38 38 38 / 9%); }
.halftone--dark { --ht-ink: rgb(245 245 245 / 50%); --ht-paper: rgb(245 245 245 / 8%); }
html.dark .halftone--light { --ht-ink: rgb(245 245 245 / 50%); --ht-paper: rgb(245 245 245 / 8%); }
.halftone-grain { fill: var(--ht-paper); }
.halftone-dots { fill: none; stroke: var(--ht-ink); stroke-linecap: round; }
.halftone-dots--accent { stroke: #ff5e1f; }
</style>
