<script setup>
// Barras horizontais de uma única série, valor na ponta.
import { computed, ref } from 'vue'
import Tooltip from './Tooltip.vue'

const props = defineProps({
  items: Array, // [{ label, value, sub, rows }]
  format: Function,
})
const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)))
const tip = ref(null)
const box = ref(null)

function show(it, ev) {
  if (!it.rows) return
  const r = box.value.getBoundingClientRect()
  const b = ev.currentTarget.querySelector('.bar-area').getBoundingClientRect()
  tip.value = {
    x: Math.min(Math.max(b.left - r.left + b.width * (it.value / max.value), 110), r.width - 110),
    y: b.top - r.top,
    title: it.label,
    rows: it.rows,
  }
}
</script>

<template>
  <div ref="box" class="hbar" @mouseleave="tip = null">
    <div v-for="it in items" :key="it.label" class="row" tabindex="0"
      @mouseenter="show(it, $event)" @focus="show(it, $event)" @blur="tip = null">
      <div class="name">
        <span>{{ it.label }}</span>
        <span v-if="it.sub" class="muted small">{{ it.sub }}</span>
      </div>
      <div class="bar-area">
        <div class="bar" :style="{ width: `calc(${(it.value / max) * 100}% - 0px)` }" />
        <span class="val tnum">{{ format(it.value) }}</span>
      </div>
    </div>
    <div v-if="!items.length" class="empty">Sem dados</div>
    <Tooltip :tip="tip" />
  </div>
</template>

<style scoped>
.hbar { position: relative; display: grid; gap: 2px; }
.row { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 12px; align-items: center; padding: 5px 8px; margin: 0 -8px; border-radius: 8px; outline: none; }
.row:hover, .row:focus-visible { background: var(--surface-2); }
.name { display: flex; flex-direction: column; line-height: 1.25; }
.bar-area { display: flex; align-items: center; gap: 8px; min-width: 0; padding-right: 92px; position: relative; }
.bar { height: 14px; min-width: 2px; background: var(--s-firm); border-radius: 0 4px 4px 0; }
.val { position: relative; white-space: nowrap; font-weight: 500; margin-right: -92px; }
@media (max-width: 560px) { .row { grid-template-columns: 92px minmax(0, 1fr); gap: 8px; } }
</style>
