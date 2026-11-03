<script setup>
// Uma barra por espaço: confirmado (sólido) + proposta (claro) sobre a trilha livre.
// A linha vertical marca a meta de ocupação.
import { ref } from 'vue'
import Tooltip from './Tooltip.vue'
import { brl, num, pct } from '../lib/format'
import { UNIDADE } from '../lib/calc'

const props = defineProps({ espacos: Array, meta: Number })
const tip = ref(null)
const box = ref(null)

function w(v) {
  return `${Math.min(100, Math.max(0, v * 100))}%`
}
function show(e, ev) {
  const r = box.value.getBoundingClientRect()
  const t = ev.currentTarget.querySelector('.track').getBoundingClientRect()
  const u = UNIDADE[e.modalidade] || 'unidades'
  tip.value = {
    x: Math.min(Math.max(t.left - r.left + (t.width * Math.min(e.taxa, 1)), 110), r.width - 110),
    y: t.top - r.top,
    title: `${e.nome} · ${e.modalidade}`,
    rows: [
      { label: 'Confirmado + base', value: `${num(e.confirmado)} ${u}`, color: 'var(--s-firm)' },
      { label: 'Em proposta', value: `${num(e.proposta)} ${u}`, color: 'var(--s-prop)' },
      { label: 'Disponível', value: `${num(e.disponivel)} de ${num(e.capacidade)}`, color: 'var(--s-track)' },
      { label: 'Receita ocupada', value: brl(e.receitaOcupada) },
      { label: 'Receita disponível', value: brl(e.receitaDisponivel) },
    ],
  }
}
</script>

<template>
  <div ref="box" class="meters" @mouseleave="tip = null">
    <div class="legend small">
      <span><i style="background: var(--s-firm)" />Confirmado + base inicial</span>
      <span><i style="background: var(--s-prop)" />Proposta</span>
      <span><i class="trk" />Disponível</span>
      <span v-if="meta"><i class="meta-key" />Meta {{ pct(meta) }}</span>
    </div>
    <div v-for="e in props.espacos" :key="e.id" class="row" tabindex="0"
      @mouseenter="show(e, $event)" @focus="show(e, $event)" @blur="tip = null">
      <div class="name">
        <strong>{{ e.nome }}</strong>
        <span class="muted small">{{ e.modalidade }}</span>
      </div>
      <div class="track">
        <div v-if="e.confirmado > 0" class="seg firm" :class="{ solo: !(e.proposta > 0) }" :style="{ width: w(e.taxaConfirmada) }" />
        <div v-if="e.proposta > 0" class="seg prop" :class="{ solo: !(e.confirmado > 0) }" :style="{ width: w(e.taxa - e.taxaConfirmada) }" />
        <div v-if="meta" class="meta" :style="{ left: w(meta) }" />
      </div>
      <div class="val tnum">{{ pct(e.taxa) }}</div>
    </div>
    <Tooltip :tip="tip" />
  </div>
</template>

<style scoped>
.meters { position: relative; display: grid; gap: 4px; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; color: var(--text-2); margin-bottom: 8px; }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.legend i.trk { background: var(--s-track); box-shadow: inset 0 0 0 1px var(--border); }
.legend i.meta-key { width: 2px; height: 12px; border-radius: 0; background: var(--text-2); }
.row {
  display: grid; grid-template-columns: 130px minmax(0, 1fr) 56px; align-items: center; gap: 12px;
  padding: 6px 8px; margin: 0 -8px; border-radius: 8px; outline: none; cursor: default;
}
.row:hover, .row:focus-visible { background: var(--surface-2); }
.name { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.name strong { font-weight: 500; }
.track { position: relative; height: 14px; border-radius: 4px; background: var(--s-track); display: flex; gap: 2px; }
.seg { height: 100%; }
.seg.firm { background: var(--s-firm); border-radius: 4px 0 0 4px; }
.seg.prop { background: var(--s-prop); border-radius: 0 4px 4px 0; }
.seg.solo { border-radius: 4px; }
.meta { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--text-2); transform: translateX(-1px); opacity: 0.7; }
.val { text-align: right; font-weight: 600; }
@media (max-width: 560px) { .row { grid-template-columns: 92px minmax(0, 1fr) 48px; gap: 8px; } }
</style>
