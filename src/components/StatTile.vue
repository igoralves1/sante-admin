<script setup>
defineProps({
  label: String,
  value: String,
  hint: String,
  hero: Boolean,
  tone: { type: String, default: '' }, // '', 'good', 'bad'
})
</script>

<template>
  <div class="card tile" :class="{ hero }">
    <div class="label">{{ label }}</div>
    <div class="value tnum" :class="tone">{{ value }}</div>
    <div v-if="hint || $slots.default" class="hint"><slot>{{ hint }}</slot></div>
  </div>
</template>

<style scoped>
.tile { display: grid; gap: 4px; align-content: start; }
.label { color: var(--text-2); font-size: 13px; font-weight: 500; }
.value { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; }
.hero .value { font-size: 48px; letter-spacing: -0.03em; }
.value.good { color: var(--good); }
.value.bad { color: var(--bad); }
.hint { color: var(--muted); font-size: 12px; }
</style>
