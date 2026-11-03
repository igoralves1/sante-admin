<script setup>
// Resultado mensal estimado em função da ocupação (por receita): mostra onde fica o equilíbrio.
import { area, line, max, min, scaleLinear, pointer } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart } from '../../lib/useChart'
import { niceMax } from '../../lib/shapes'
import { brl, brlCompact, pct } from '../../lib/format'

const props = defineProps({
  curva: Object, // { pts: [{ t, resultado }], tEquilibrio, atual: { t, resultado } }
  alvo: Number,
  height: { type: Number, default: 260 },
})

const { el, tip } = useChart((root, W, tip) => {
  const H = props.height
  const m = { t: 16, r: 16, b: 30, l: 66 }
  const { pts, tEquilibrio, atual } = props.curva
  const lo = min(pts, (p) => p.resultado)
  const hi = max(pts, (p) => p.resultado)
  const x = scaleLinear().domain([0, 1]).range([m.l, W - m.r])
  const y = scaleLinear().domain([lo < 0 ? -niceMax(-lo) : 0, niceMax(Math.max(hi, 1))]).range([H - m.b, m.t]).nice()
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Resultado por ocupação')

  const yt = y.ticks(5)
  svg.append('g').selectAll('line').data(yt).join('line').attr('class', (d) => (d === 0 ? 'zero' : 'grid'))
    .attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y)
  svg.append('g').selectAll('text').data(yt).join('text').attr('class', 'axis').attr('x', m.l - 8).attr('y', y)
    .attr('text-anchor', 'end').attr('dominant-baseline', 'middle').text(brlCompact)
  const xt = [0, 0.2, 0.4, 0.6, 0.8, 1]
  svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'axis').attr('x', x).attr('y', H - 12)
    .attr('text-anchor', 'middle').text(pct)

  svg.append('path').datum(pts).attr('d', area().x((p) => x(p.t)).y0(y(0)).y1((p) => y(p.resultado)))
    .style('fill', 'var(--s-firm)').attr('fill-opacity', 0.1)
  svg.append('path').datum(pts).attr('d', line().x((p) => x(p.t)).y((p) => y(p.resultado)))
    .attr('fill', 'none').style('stroke', 'var(--s-firm)').attr('stroke-width', 2)

  if (tEquilibrio !== null && tEquilibrio <= 1) {
    svg.append('line').attr('class', 'meta').attr('x1', x(tEquilibrio)).attr('x2', x(tEquilibrio)).attr('y1', m.t).attr('y2', H - m.b)
    svg.append('text').attr('class', 'halo').attr('x', x(tEquilibrio) + 6).attr('y', m.t + 10)
      .text(`Equilíbrio em ${pct(tEquilibrio)}`)
  }
  if (props.alvo !== undefined) {
    const ra = props.curva.pts.reduce((a, p) => (Math.abs(p.t - props.alvo) < Math.abs(a.t - props.alvo) ? p : a))
    svg.append('circle').attr('class', 'dot').attr('cx', x(props.alvo)).attr('cy', y(ra.resultado)).attr('r', 5)
      .style('fill', 'var(--s-prop)')
  }
  svg.append('circle').attr('class', 'dot firm').attr('cx', x(atual.t)).attr('cy', y(atual.resultado)).attr('r', 6)
  svg.append('text').attr('class', 'halo').attr('x', x(atual.t) + 10).attr('y', y(atual.resultado) + 4).text('Hoje')

  const cross = svg.append('line').attr('class', 'crosshair').attr('y1', m.t).attr('y2', H - m.b).style('display', 'none')
  svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).attr('fill', 'transparent')
    .on('mousemove', (ev) => {
      const t = Math.min(1, Math.max(0, x.invert(pointer(ev)[0])))
      const p = pts.reduce((a, q) => (Math.abs(q.t - t) < Math.abs(a.t - t) ? q : a))
      cross.style('display', null).attr('x1', x(p.t)).attr('x2', x(p.t))
      const r = el.value.getBoundingClientRect()
      tip.value = { x: Math.min(Math.max(x(p.t), 110), r.width - 110), y: y(p.resultado), title: `Ocupação ${pct(p.t)}`,
        rows: [{ label: 'Resultado estimado', value: brl(p.resultado) }] }
    })
    .on('mouseleave', () => {
      cross.style('display', 'none')
      tip.value = null
    })
}, () => [props.curva, props.alvo])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span><i class="line-key" style="background: var(--s-firm)" />Resultado mensal estimado</span>
      <span><i style="background: var(--s-firm); border-radius: 50%" />Situação atual</span>
      <span v-if="alvo !== undefined"><i style="background: var(--s-prop); border-radius: 50%" />Cenário</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
