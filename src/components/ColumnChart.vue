<script setup>
// Colunas de uma série + linhas de referência (ex.: ponto de equilíbrio, meta).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Tooltip from './Tooltip.vue'

const props = defineProps({
  points: Array, // [{ label, value, rows, current }]
  refs: { type: Array, default: () => [] }, // [{ value, label }]
  axisFormat: Function,
  height: { type: Number, default: 240 },
})

const box = ref(null)
const width = ref(600)
let ro
onMounted(() => {
  ro = new ResizeObserver(([e]) => (width.value = Math.max(280, e.contentRect.width)))
  ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())

const pad = { t: 16, r: 8, b: 28, l: 64 }
const innerW = computed(() => width.value - pad.l - pad.r)
const innerH = computed(() => props.height - pad.t - pad.b)

function niceMax(v) {
  if (v <= 0) return 1000
  const p = 10 ** Math.floor(Math.log10(v))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
}
const yMax = computed(() => niceMax(Math.max(...props.points.map((p) => p.value), ...props.refs.map((r) => r.value)) * 1.08))
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax.value))
const y = (v) => pad.t + innerH.value - (v / yMax.value) * innerH.value
const band = computed(() => innerW.value / props.points.length)
const barW = computed(() => Math.min(24, band.value * 0.6))
const x = (i) => pad.l + band.value * i + band.value / 2

function barPath(i, v) {
  const h = Math.max(0, y(0) - y(v))
  const w = barW.value
  const x0 = x(i) - w / 2
  const r = Math.min(4, h, w / 2)
  const yb = y(0)
  return `M${x0},${yb} V${yb - h + r} Q${x0},${yb - h} ${x0 + r},${yb - h} H${x0 + w - r} Q${x0 + w},${yb - h} ${x0 + w},${yb - h + r} V${yb} Z`
}

const tip = ref(null)
function show(i, p) {
  tip.value = { x: Math.min(Math.max(x(i), 110), width.value - 110), y: y(p.value), title: p.label, rows: p.rows }
}
</script>

<template>
  <div ref="box" class="col-chart" @mouseleave="tip = null">
    <svg :width="width" :height="height" role="img" aria-label="Receita por mês">
      <g v-for="t in ticks" :key="t">
        <line :x1="pad.l" :x2="width - pad.r" :y1="y(t)" :y2="y(t)" class="grid" />
        <text :x="pad.l - 8" :y="y(t)" class="axis" text-anchor="end" dominant-baseline="middle">{{ axisFormat(t) }}</text>
      </g>
      <g v-for="(p, i) in points" :key="p.label">
        <path v-if="p.value > 0" :d="barPath(i, p.value)" class="bar" :class="{ dim: !p.current }" />
        <text :x="x(i)" :y="height - 8" class="axis" :class="{ cur: p.current }" text-anchor="middle">{{ p.label }}</text>
        <rect :x="x(i) - band / 2" :y="pad.t" :width="band" :height="innerH" fill="transparent"
          @mouseenter="show(i, p)" @mousemove="show(i, p)" />
      </g>
      <g v-for="r in refs.filter((r) => r.value > 0)" :key="r.label" class="ref">
        <line :x1="pad.l" :x2="width - pad.r" :y1="y(r.value)" :y2="y(r.value)" />
        <text :x="width - pad.r" :y="y(r.value) - 6" text-anchor="end">{{ r.label }}</text>
      </g>
    </svg>
    <Tooltip :tip="tip" />
  </div>
</template>

<style scoped>
.col-chart { position: relative; width: 100%; }
svg { display: block; overflow: visible; }
.grid { stroke: var(--grid); stroke-width: 1; }
.axis { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.axis.cur { fill: var(--text); font-weight: 600; }
.bar { fill: var(--s-firm); }
.bar.dim { fill: var(--s-prop); }
.ref line { stroke: var(--text-2); stroke-width: 1; opacity: 0.8; }
.ref text { fill: var(--text-2); font-size: 11px; font-weight: 500; paint-order: stroke; stroke: var(--surface); stroke-width: 3px; }
</style>
