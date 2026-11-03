<script setup>
// Potencial mensal (x) × ocupação (y). Abaixo da meta e com potencial alto = prioridade.
import { max, median, scaleLinear, scaleSqrt } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'
import { brl, brlCompact, pct } from '../../lib/format'

const props = defineProps({ espacos: Array, meta: Number, height: { type: Number, default: 300 } })

const { el, tip } = useChart((root, W, tip) => {
  const H = props.height
  const m = { t: 14, r: 16, b: 48, l: 48 }
  const pts = props.espacos.filter((e) => e.potencial > 0)
  const x = scaleLinear().domain([0, (max(pts, (e) => e.potencial) || 1) * 1.1]).range([m.l, W - m.r]).nice()
  const y = scaleLinear().domain([0, 1.05]).range([H - m.b, m.t])
  const r = scaleSqrt().domain([0, max(pts, (e) => e.receitaDisponivel) || 1]).range([4, 14])
  const med = median(pts, (e) => e.potencial)
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Potencial por ocupação')

  // quadrante de prioridade
  svg.append('rect').attr('x', x(med)).attr('y', y(props.meta)).attr('width', W - m.r - x(med))
    .attr('height', y(0) - y(props.meta)).style('fill', 'var(--warn-soft)')
  svg.append('text').attr('class', 'halo').attr('x', W - m.r - 6).attr('y', y(props.meta) + 16).attr('text-anchor', 'end')
    .text('Prioridade')

  const yt = [0, 0.25, 0.5, 0.75, 1]
  svg.append('g').selectAll('line').data(yt).join('line').attr('class', 'grid').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y)
  svg.append('g').selectAll('text').data(yt).join('text').attr('class', 'axis').attr('x', m.l - 8).attr('y', y)
    .attr('text-anchor', 'end').attr('dominant-baseline', 'middle').text(pct)
  const xt = x.ticks(W < 560 ? 3 : 5)
  svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'axis').attr('x', x).attr('y', H - 22)
    .attr('text-anchor', 'middle').text(brlCompact)
  svg.append('text').attr('class', 'axis').attr('x', W - m.r).attr('y', H - 2).attr('text-anchor', 'end').text('Receita potencial por mês →')

  svg.append('line').attr('class', 'meta').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(props.meta)).attr('y2', y(props.meta))
  svg.append('text').attr('class', 'halo').attr('x', m.l + 4).attr('y', y(props.meta) - 6).text(`Meta ${pct(props.meta)}`)

  const sorted = [...pts].sort((a, b) => b.receitaDisponivel - a.receitaDisponivel)
  const g = svg.selectAll('g.pt').data(sorted).join('g').attr('class', 'pt')
  g.append('circle').attr('class', 'dot firm').attr('cx', (e) => x(e.potencial)).attr('cy', (e) => y(Math.min(e.taxa, 1.05)))
    .attr('r', (e) => r(e.receitaDisponivel)).attr('fill-opacity', 0.85)
  // rótulos nos maiores círculos, pulando os que colidiriam com um já colocado
  const postos = []
  const cabe = (e) => {
    const px = x(e.potencial) + r(e.receitaDisponivel) + 4
    const py = y(Math.min(e.taxa, 1.05))
    const w = e.nome.length * 6.5
    if (px + w > W) return false
    if (postos.some((q) => Math.abs(q.y - py) < 14 && px < q.x + q.w && q.x < px + w)) return false
    postos.push({ x: px, y: py, w })
    return true
  }
  g.filter((e, i) => i < 6 && cabe(e)).append('text').attr('class', 'halo')
    .attr('x', (e) => x(e.potencial) + r(e.receitaDisponivel) + 4).attr('y', (e) => y(Math.min(e.taxa, 1.05)))
    .attr('dominant-baseline', 'middle').text((e) => e.nome)
  g.append('circle').attr('cx', (e) => x(e.potencial)).attr('cy', (e) => y(Math.min(e.taxa, 1.05)))
    .attr('r', (e) => r(e.receitaDisponivel) + 6).attr('fill', 'transparent')
    .on('mousemove', (ev, e) => (tip.value = tipAt(el.value, ev, e.nome, [
      { label: 'Ocupação', value: pct(e.taxa) },
      { label: 'Potencial / mês', value: brl(e.potencial) },
      { label: 'Receita disponível', value: brl(e.receitaDisponivel) },
    ])))
    .on('mouseleave', () => (tip.value = null))
}, () => [props.espacos, props.meta])
</script>

<template>
  <div ref="el" class="chart">
    <div class="d3-root" />
    <p class="small muted cap">Tamanho do círculo = receita disponível para vender.</p>
    <Tooltip :tip="tip" />
  </div>
</template>

<style scoped>
.cap { margin: 6px 0 0; }
</style>
