<script setup>
// Linha do tempo de posts: cada ponto é um post (data × curtidas). A Santé em azul forte,
// os concorrentes em azul claro. Clicar num ponto abre o post.
import { extent, max, scaleLinear, scaleTime, timeMonth } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'

const props = defineProps({
  points: Array, // [{ t: 'YYYY-MM-DD', y, hl, label, url, rows }]
  yLabel: { type: String, default: 'Curtidas' },
  height: { type: Number, default: 300 },
})
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const data = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const { el, tip } = useChart((root, W, tip) => {
  const pts = props.points.filter((p) => p.y != null)
  if (!pts.length) {
    root.append('div').attr('class', 'empty').text('Nenhum post com curtidas nesta busca.')
    return
  }
  const H = props.height
  const m = { t: 30, r: 16, b: 30, l: 46 }
  const [d0, d1] = extent(pts, (p) => data(p.t))
  const pad = Math.max(86400000 * 10, (d1 - d0) * 0.04)
  const x = scaleTime().domain([new Date(+d0 - pad), new Date(+d1 + pad)]).range([m.l, W - m.r])
  const y = scaleLinear().domain([0, (max(pts, (p) => p.y) || 1) * 1.1]).range([H - m.b, m.t]).nice()
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Posts por data e curtidas')

  const yt = y.ticks(5)
  svg.append('g').selectAll('line').data(yt).join('line').attr('class', 'grid').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y)
  svg.append('g').selectAll('text').data(yt).join('text').attr('class', 'axis').attr('x', m.l - 8).attr('y', y)
    .attr('text-anchor', 'end').attr('dominant-baseline', 'middle').text((v) => v)
  const meses = x.ticks(timeMonth.every(Math.max(1, Math.ceil((d1 - d0) / (86400000 * 30) / Math.max(2, Math.floor(W / 70))))))
  svg.append('g').selectAll('text').data(meses).join('text').attr('class', 'axis').attr('x', x).attr('y', H - 8)
    .attr('text-anchor', 'middle').text((d) => `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`)
  svg.append('text').attr('class', 'axis').attr('x', m.l - 8).attr('y', 12).text(`↑ ${props.yLabel}`)

  const ord = [...pts].sort((a, b) => (a.hl ? 1 : 0) - (b.hl ? 1 : 0))
  svg.append('g').selectAll('circle').data(ord).join('circle')
    .attr('class', (p) => (p.hl ? 'dot firm' : 'dot prop'))
    .attr('cx', (p) => x(data(p.t))).attr('cy', (p) => y(p.y)).attr('r', (p) => (p.hl ? 7 : 5.5))
    .style('cursor', 'pointer')
    .on('mousemove', (ev, p) => (tip.value = tipAt(el.value, ev, p.label, p.rows)))
    .on('mouseleave', () => (tip.value = null))
    .on('click', (ev, p) => p.url && window.open(p.url, '_blank', 'noopener'))
}, () => [props.points])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span><i style="background: var(--s-firm)" />Santé</span>
      <span><i style="background: var(--s-prop)" />Concorrentes</span>
      <span class="muted">Clique num ponto para abrir o post</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
