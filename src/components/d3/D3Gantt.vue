<script setup>
// Linha do tempo dos contratos por espaço. Contratos sem término seguem até a borda com "→".
import { scaleLinear } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'
import { barH } from '../../lib/shapes'
import { addMes, brl, dataBR, mesCurto, num } from '../../lib/format'
import { idxMes, valorMensal, valorTotal, duracaoMeses, UNIDADE } from '../../lib/calc'

const props = defineProps({
  espacos: Array,
  contratos: Array,
  mes: String,
  antes: { type: Number, default: 3 },
  depois: { type: Number, default: 12 },
})

const { el, tip } = useChart((root, W, tip) => {
  const lw = W < 560 ? 90 : 140
  const m0 = idxMes(props.mes) - props.antes
  const m1 = idxMes(props.mes) + props.depois + 1
  const x = scaleLinear().domain([m0, m1]).range([lw, W - 8])
  const lane = 18
  const pad = 10
  const rows = props.espacos.map((e) => {
    const cs = props.contratos
      .filter((c) => c.espacoId === e.id && c.status !== 'Cancelada' && c.inicio)
      .filter((c) => idxMes(c.inicio) < m1 && (!c.fim || idxMes(c.fim) >= m0))
    return { e, cs, h: Math.max(1, cs.length) * lane + pad }
  })
  let acc = 24
  rows.forEach((r) => {
    r.y = acc
    acc += r.h
  })
  const H = acc + 4
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Linha do tempo dos contratos')

  // meses
  const meses = []
  for (let i = m0; i < m1; i++) meses.push(i)
  const step = Math.max(1, Math.ceil(meses.length / Math.floor((W - lw) / 46)))
  const ref = idxMes(props.mes)
  svg.append('rect').attr('x', x(ref)).attr('width', x(ref + 1) - x(ref)).attr('y', 16).attr('height', H - 16)
    .style('fill', 'var(--accent-soft)')
  svg.append('g').selectAll('line').data(meses).join('line').attr('class', 'grid')
    .attr('x1', x).attr('x2', x).attr('y1', 16).attr('y2', H)
  const lbl = (i) => mesCurto(addMes(props.mes, i - ref))
  svg.append('g').selectAll('text').data(meses.filter((i) => (i - m0) % step === 0 || i === ref)).join('text')
    .attr('class', (i) => (i === ref ? 'axis cur' : 'axis'))
    .attr('x', (i) => (x(i) + x(i + 1)) / 2).attr('y', 10).attr('text-anchor', 'middle').text(lbl)

  const g = svg.selectAll('g.row').data(rows).join('g').attr('class', 'row').attr('transform', (r) => `translate(0,${r.y})`)
  g.append('line').attr('class', 'grid').attr('x1', 0).attr('x2', W).attr('y1', (r) => r.h).attr('y2', (r) => r.h)
  g.append('text').attr('class', 'name').attr('y', 14).text((r) => r.e.nome)
  g.filter((r) => !r.cs.length).append('text').attr('class', 'axis').attr('x', lw + 6).attr('y', 14).text('sem contratos no período')

  const bars = g.selectAll('g.bar').data((r) => r.cs).join('g').attr('class', 'bar')
    .attr('transform', (c, i) => `translate(0,${pad / 2 + i * lane})`)
  const ini = (c) => Math.max(m0, idxMes(c.inicio))
  const fim = (c) => (c.fim ? Math.min(m1, idxMes(c.fim) + 1) : m1)
  bars.append('path').attr('class', (c) => (c.status === 'Proposta' ? 'prop' : 'firm'))
    .attr('d', (c) => barH(x(ini(c)), x(fim(c)) - 2, 0, lane - 6, !!c.fim))
  bars.filter((c) => !c.fim).append('text').attr('class', 'axis').attr('x', W - 12).attr('y', (lane - 6) / 2)
    .attr('text-anchor', 'end').attr('dominant-baseline', 'middle').style('fill', '#fff').text('→')
  bars.append('rect').attr('x', (c) => x(ini(c))).attr('width', (c) => Math.max(6, x(fim(c)) - x(ini(c))))
    .attr('height', lane - 4).attr('fill', 'transparent')
    .on('mousemove', (ev, c) => {
      const d = duracaoMeses(c)
      tip.value = tipAt(el.value, ev, c.cliente || 'Contrato', [
        { label: 'Período', value: `${dataBR(c.inicio)} → ${c.fim ? dataBR(c.fim) : 'sem término'}` },
        { label: 'Duração', value: d ? `${d} ${d === 1 ? 'mês' : 'meses'}` : '—' },
        { label: 'Por mês', value: `${num(c.quantidade)} ${UNIDADE[c.modalidade] || ''} · ${brl(valorMensal(c))}` },
        { label: 'Valor total', value: d ? brl(valorTotal(c)) : 'defina o término' },
        { label: 'Status', value: c.status },
      ])
    })
    .on('mouseleave', () => (tip.value = null))
}, () => [props.espacos, props.contratos, props.mes])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span><i style="background: var(--s-firm)" />Confirmado / base inicial</span>
      <span><i style="background: var(--s-prop)" />Proposta</span>
      <span><i style="background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--border)" />Mês de referência</span>
      <span>→ sem data de término</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
