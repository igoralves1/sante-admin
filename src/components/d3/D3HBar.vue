<script setup>
// Barras horizontais de uma série, valor na ponta.
import { max, scaleLinear } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'
import { barH } from '../../lib/shapes'

const props = defineProps({
  items: Array, // [{ label, sub, value, rows }]
  format: Function,
  ariaLabel: { type: String, default: 'Gráfico de barras' },
})

const { el, tip } = useChart((root, W, tip) => {
  const rows = props.items
  if (!rows.length) {
    root.append('div').attr('class', 'empty').text('Sem dados')
    return
  }
  const lw = W < 560 ? 112 : 172
  const vw = 96
  const rh = 36
  const H = rows.length * rh
  const x = scaleLinear().domain([0, max(rows, (d) => d.value) || 1]).range([lw, W - vw])
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', props.ariaLabel)
  const g = svg.selectAll('g').data(rows).join('g').attr('class', 'row').attr('transform', (d, i) => `translate(0,${i * rh})`)
  g.append('rect').attr('class', 'hover').attr('x', -6).attr('width', W + 12).attr('height', rh - 2).attr('rx', 8)
  g.append('text').attr('class', 'name').attr('y', (d) => (d.sub ? 15 : 22)).text((d) => d.label)
  g.filter((d) => d.sub).append('text').attr('class', 'axis').attr('y', 29).text((d) => d.sub)
  // `dim: true` desenha a barra em azul claro (contexto); o padrão é azul forte
  g.append('path').attr('class', (d) => (d.dim ? 'prop' : 'firm')).attr('d', (d) => barH(x(0), Math.max(x(0) + 2, x(d.value)), 11, 14))
  g.append('text').attr('class', 'val').attr('x', (d) => Math.max(x(0) + 2, x(d.value)) + 8).attr('y', 18)
    .attr('dominant-baseline', 'middle').text((d) => props.format(d.value))
  g.append('rect').attr('width', W).attr('height', rh).attr('fill', 'transparent')
    .on('mousemove', (ev, d) => d.rows && (tip.value = tipAt(el.value, ev, d.label, d.rows)))
    .on('mouseleave', () => (tip.value = null))
}, () => [props.items])
</script>

<template>
  <div ref="el" class="chart">
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
