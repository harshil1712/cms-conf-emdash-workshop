<!-- Same API as the built-in: `class` goes to the columns, `layoutClass` to the root; slots default, left, right, bottom -->
<script setup lang="ts">
const props = defineProps({
  class: { type: String },
  layoutClass: { type: String },
})
</script>

<template>
  <div class="slidev-layout two-cols-header" :class="layoutClass">
    <div class="col-header">
      <slot />
    </div>
    <div class="col-left col-card" :class="props.class">
      <slot name="left" />
    </div>
    <div class="col-right col-card" :class="props.class">
      <slot name="right" />
    </div>
    <div class="col-bottom" :class="props.class">
      <slot name="bottom" />
    </div>
  </div>
</template>
