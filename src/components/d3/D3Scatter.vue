<script setup>
// Dispersão com rótulo em cada ponto. O ponto marcado com `hl` (a Santé) fica em azul
// forte; os demais em azul claro. Rótulos que colidiriam com outro já colocado mudam de lado.
import { extent, max, scaleLinear, scaleLog } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'

const props = defineProps({
  points: Array, // [{ label, x, y, hl, rows }]
  xLabel: String,
  yLabel: String,
  xFormat: { type: Function, default: (v) => v },
  yFormat: { type: Function, default: (v) => v },
  xLog: Boolean,
  yDomain: Array,
  height: { type: Number, default: 320 },
  ariaLabel: { type: String, default: 'Gráfico de dispersão' },
})

const { el, tip } = useChart((root, W, tip) => {
  const H = props.height
  const m = { t: 34, r: 20, b: 44, l: 56 }
  const pts = props.points.filter((p) => p.x != null && p.y != null)
  const [x0, x1] = extent(pts, (p) => p.x)
  const x = props.xLog
    ? scaleLog().domain([Math.max(1, x0 * 0.7), x1 * 1.4]).range([m.l, W - m.r])
    : scaleLinear().domain([0, (x1 || 1) * 1.1]).range([m.l, W - m.r]).nice()
  const y = scaleLinear().domain(props.yDomain || [0, (max(pts, (p) => p.y) || 1) * 1.1]).range([H - m.b, m.t]).nice()
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', props.ariaLabel)

  const yt = y.ticks(5)
  svg.append('g').selectAll('line').data(yt).join('line').attr('class', 'grid')
    .attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y)
  svg.append('g').selectAll('text').data(yt).join('text').attr('class', 'axis')
    .attr('x', m.l - 8).attr('y', y).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').text(props.yFormat)
  const [d0, d1] = x.domain()
  const xt = props.xLog
    ? [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].filter((v) => v >= d0 && v <= d1)
    : x.ticks(W < 560 ? 4 : 6)
  svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'axis')
    .attr('x', x).attr('y', H - 24).attr('text-anchor', 'middle').text(props.xFormat)
  svg.append('text').attr('class', 'axis').attr('x', W - m.r).attr('y', H - 4).attr('text-anchor', 'end').text(`${props.xLabel} →`)
  svg.append('text').attr('class', 'axis').attr('x', m.l - 8).attr('y', 10).attr('text-anchor', 'start').text(`↑ ${props.yLabel}`)

  // contexto primeiro, destaque por cima
  const ord = [...pts].sort((a, b) => (a.hl ? 1 : 0) - (b.hl ? 1 : 0))
  svg.append('g').selectAll('circle').data(ord).join('circle')
    .attr('class', (p) => (p.hl ? 'dot firm' : 'dot prop'))
    .attr('cx', (p) => x(p.x)).attr('cy', (p) => y(p.y)).attr('r', (p) => (p.hl ? 8 : 6))

  // rótulos: tenta à direita, depois à esquerda, depois acima; pula se nada couber
  // começa com o título do eixo y ocupado, para nenhum rótulo cair em cima dele
  const postos = [{ x: m.l - 8, y: 10, w: props.yLabel.length * 6.4 + 16 }]
  const livre = (bx, by, w) => bx >= 0 && bx + w <= W && !postos.some((q) => Math.abs(q.y - by) < 13 && bx < q.x + q.w && q.x < bx + w)
  const lab = svg.append('g')
  for (const p of [...pts].sort((a, b) => (b.hl ? 1 : 0) - (a.hl ? 1 : 0))) {
    const cx = x(p.x)
    const cy = y(p.y)
    const w = p.label.length * 6.4
    const opts = [
      [cx + 11, cy, 'start'],
      [cx - 11 - w, cy, 'end'],
      [cx - w / 2, cy - 15, 'middle'],
      [cx - w / 2, cy + 16, 'middle'],
    ]
    const ok = opts.find(([bx, by]) => livre(bx, by, w))
    if (!ok) continue
    postos.push({ x: ok[0], y: ok[1], w })
    const tx = ok[2] === 'start' ? ok[0] : ok[2] === 'end' ? ok[0] + w : cx
    lab.append('text').attr('class', p.hl ? 'halo strong' : 'halo').attr('x', tx).attr('y', ok[1])
      .attr('text-anchor', ok[2]).attr('dominant-baseline', 'middle').text(p.label)
  }

  svg.append('g').selectAll('circle').data(pts).join('circle')
    .attr('cx', (p) => x(p.x)).attr('cy', (p) => y(p.y)).attr('r', 14).attr('fill', 'transparent')
    .on('mousemove', (ev, p) => (tip.value = tipAt(el.value, ev, p.label, p.rows)))
    .on('mouseleave', () => (tip.value = null))
}, () => [props.points])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span><i style="background: var(--s-firm)" />Santé</span>
      <span><i style="background: var(--s-prop)" />Concorrentes</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>

<style scoped>
.chart :deep(.halo.strong) { fill: var(--text); font-weight: 600; font-size: 12px; }
</style>
