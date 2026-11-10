<script setup lang="ts">
import Halftone from '../components/Halftone.vue'
</script>

<template>
  <div class="slidev-layout cover">
    <div class="cover-glow" aria-hidden="true" />
    <Halftone class="cover-art" seed="ship-automate-extend" motif="dash" :columns="42" :rows="44" tone="light" />
    <div>
      <img class="cover-logo cover-logo--dark" src="/brand/logo-dark-text.svg" alt="EmDash" width="208" height="52">
      <img class="cover-logo cover-logo--light" src="/brand/logo-light-text.svg" alt="" width="208" height="52">
    </div>
    <div class="cover-copy">
      <slot />
    </div>
  </div>
</template>
