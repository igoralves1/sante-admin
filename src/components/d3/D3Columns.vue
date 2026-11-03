<script setup>
// Receita por mês: meses até o de referência em azul cheio, meses seguintes (projeção
// pelos contratos vigentes) em azul claro. Linhas de referência opcionais.
import { scaleBand, scaleLinear, max } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'
import { barV, niceMax } from '../../lib/shapes'

const props = defineProps({
  points: Array, // [{ label, value, futuro, atual, rows }]
  refs: { type: Array, default: () => [] }, // [{ value, label }]
  axisFormat: Function,
  height: { type: Number, default: 250 },
})

const { el, tip } = useChart((root, W, tip) => {
  const H = props.height
  const m = { t: 18, r: 8, b: 26, l: 62 }
  const refs = props.refs.filter((r) => r.value > 0)
  const yMax = niceMax(Math.max(max(props.points, (p) => p.value) || 0, max(refs, (r) => r.value) || 0) * 1.08)
  const x = scaleBand().domain(props.points.map((p) => p.label)).range([m.l, W - m.r]).padding(0.25)
  const y = scaleLinear().domain([0, yMax]).range([H - m.b, m.t])
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Receita por mês')

  const ticks = y.ticks(4)
  svg.append('g').selectAll('line').data(ticks).join('line').attr('class', 'grid')
    .attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y)
  svg.append('g').selectAll('text').data(ticks).join('text').attr('class', 'axis')
    .attr('x', m.l - 8).attr('y', y).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').text(props.axisFormat)

  const bw = Math.min(24, x.bandwidth())
  const step = Math.max(1, Math.ceil(props.points.length / Math.floor((W - m.l) / 44)))
  const g = svg.selectAll('g.col').data(props.points).join('g').attr('class', 'col')
  g.filter((p) => p.value > 0).append('path').attr('class', (p) => (p.futuro ? 'prop' : 'firm'))
    .attr('d', (p) => barV(x(p.label) + (x.bandwidth() - bw) / 2, bw, y(p.value), y(0)))
  // rótulos alinhados ao mês de referência, para não colidir com ele
  const cur = Math.max(0, props.points.findIndex((p) => p.atual))
  g.filter((p, i) => (i - cur) % step === 0).append('text')
    .attr('class', (p) => (p.atual ? 'axis cur' : 'axis'))
    .attr('x', (p) => x(p.label) + x.bandwidth() / 2).attr('y', H - 8).attr('text-anchor', 'middle').text((p) => p.label)

  const rg = svg.selectAll('g.ref').data(refs).join('g').attr('class', 'ref')
  rg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', (r) => y(r.value)).attr('y2', (r) => y(r.value))
  rg.append('text').attr('x', W - m.r).attr('y', (r) => y(r.value) - 6).attr('text-anchor', 'end').text((r) => r.label)

  g.append('rect').attr('x', (p) => x(p.label) - (x.step() - x.bandwidth()) / 2).attr('y', m.t)
    .attr('width', x.step()).attr('height', H - m.t - m.b).attr('fill', 'transparent')
    .on('mousemove', (ev, p) => (tip.value = tipAt(el.value, ev, p.label, p.rows)))
    .on('mouseleave', () => (tip.value = null))
}, () => [props.points, props.refs])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span><i style="background: var(--s-firm)" />Até o mês de referência</span>
      <span><i style="background: var(--s-prop)" />Próximos meses (contratos vigentes)</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
