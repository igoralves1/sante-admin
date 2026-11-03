<script setup>
// Linhas (um único eixo em R$) com mira e tooltip, rótulo no fim de cada linha.
import { line, max, min, scalePoint, scaleLinear, pointer, curveMonotoneX } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart } from '../../lib/useChart'
import { niceMax } from '../../lib/shapes'

const props = defineProps({
  labels: Array, // rótulos do eixo x
  series: Array, // [{ key, label, color, values: [number] }]
  format: Function,
  axisFormat: Function,
  height: { type: Number, default: 280 },
})

const { el, tip } = useChart((root, W, tip) => {
  const H = props.height
  const m = { t: 16, r: W < 560 ? 12 : 120, b: 26, l: 62 }
  const all = props.series.flatMap((s) => s.values)
  const lo = Math.min(0, min(all))
  const y = scaleLinear().domain([lo < 0 ? -niceMax(-lo) : 0, niceMax((max(all) || 0) * 1.05)]).range([H - m.b, m.t]).nice()
  const x = scalePoint().domain(props.labels).range([m.l, W - m.r]).padding(0.3)
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Projeção mensal')

  const ticks = y.ticks(5)
  svg.append('g').selectAll('line').data(ticks).join('line').attr('class', (d) => (d === 0 ? 'zero' : 'grid'))
    .attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y)
  svg.append('g').selectAll('text').data(ticks).join('text').attr('class', 'axis')
    .attr('x', m.l - 8).attr('y', y).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').text(props.axisFormat)
  const step = Math.max(1, Math.ceil(props.labels.length / Math.floor((W - m.l - m.r) / 48)))
  svg.append('g').selectAll('text').data(props.labels.filter((d, i) => i % step === 0)).join('text').attr('class', 'axis')
    .attr('x', x).attr('y', H - 8).attr('text-anchor', 'middle').text((d) => d)

  const ln = line().x((d, i) => x(props.labels[i])).y((d) => y(d)).curve(curveMonotoneX)
  svg.append('g').selectAll('path').data(props.series).join('path')
    .attr('d', (s) => ln(s.values)).attr('fill', 'none').style('stroke', (s) => s.color)
    .attr('stroke-width', 2).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round')
  const last = props.labels.length - 1
  svg.append('g').selectAll('circle').data(props.series).join('circle').attr('class', 'dot')
    .attr('cx', x(props.labels[last])).attr('cy', (s) => y(s.values[last])).attr('r', 4).style('fill', (s) => s.color)
  if (W >= 560) {
    // rótulos no fim; afasta os que colidem
    const ends = props.series.map((s) => ({ s, y: y(s.values[last]) })).sort((a, b) => a.y - b.y)
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14
    svg.append('g').selectAll('text').data(ends).join('text').attr('class', 'halo')
      .attr('x', x(props.labels[last]) + 10).attr('y', (d) => d.y).attr('dominant-baseline', 'middle').text((d) => d.s.label)
  }

  const cross = svg.append('line').attr('class', 'crosshair').attr('y1', m.t).attr('y2', H - m.b).style('display', 'none')
  svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b)
    .attr('fill', 'transparent')
    .on('mousemove', (ev) => {
      const [px] = pointer(ev)
      const xs = props.labels.map((l) => x(l))
      let i = 0
      xs.forEach((v, k) => Math.abs(v - px) < Math.abs(xs[i] - px) && (i = k))
      cross.style('display', null).attr('x1', xs[i]).attr('x2', xs[i])
      const r = el.value.getBoundingClientRect()
      tip.value = {
        x: Math.min(Math.max(xs[i], 110), r.width - 110),
        y: m.t + 34,
        title: props.labels[i],
        rows: props.series.map((s) => ({ label: s.label, value: props.format(s.values[i]), color: s.color })),
      }
    })
    .on('mouseleave', () => {
      cross.style('display', 'none')
      tip.value = null
    })
}, () => [props.labels, props.series])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span v-for="s in series" :key="s.key"><i class="line-key" :style="{ background: s.color }" />{{ s.label }}</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
