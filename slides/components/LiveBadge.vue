<!-- The "Live" pill on the steal-the-token slide: its dot pings a few times each time the slide comes on screen -->
<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'

const active = useIsSlideActive()
</script>

<template>
  <span class="live-badge" :class="{ 'is-live': active }"><slot>Live</slot></span>
</template>
