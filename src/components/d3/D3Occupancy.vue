<script setup>
// Ocupação por espaço: confirmado + proposta sobre a capacidade livre, com linha de meta.
import { scaleLinear } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'
import { barH } from '../../lib/shapes'
import { brl, num, pct } from '../../lib/format'
import { UNIDADE } from '../../lib/calc'

const props = defineProps({ espacos: Array, meta: Number })

const { el, tip } = useChart((root, W, tip) => {
  const rows = props.espacos
  const lw = W < 560 ? 96 : 150
  const rw = 56
  const rh = 38
  const top = 4
  const H = top + rows.length * rh + 22
  const x = scaleLinear().domain([0, 1]).range([lw, W - rw]).clamp(true)
  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'img')
    .attr('aria-label', 'Ocupação por espaço')

  // grade vertical
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  svg.append('g').selectAll('line').data(ticks).join('line')
    .attr('x1', (d) => x(d)).attr('x2', (d) => x(d)).attr('y1', top).attr('y2', H - 20).attr('class', 'grid')
  svg.append('g').selectAll('text').data(ticks).join('text')
    .attr('x', (d) => x(d)).attr('y', H - 4).attr('text-anchor', 'middle').attr('class', 'axis').text((d) => pct(d))

  const g = svg.selectAll('g.row').data(rows).join('g').attr('class', 'row')
    .attr('transform', (d, i) => `translate(0,${top + i * rh})`)
  g.append('rect').attr('class', 'hover').attr('x', -6).attr('width', W + 12).attr('height', rh - 2).attr('rx', 8)
  g.append('text').attr('class', 'axis').attr('y', 30).text((d) => d.modalidade)

  const by = 11
  const bh = 14
  g.append('rect').attr('x', x(0)).attr('y', by).attr('width', x(1) - x(0)).attr('height', bh).attr('rx', 4).attr('class', 'track')
  g.filter((d) => d.confirmado > 0).append('path').attr('class', 'firm')
    .attr('d', (d) => barH(x(0), x(d.taxaConfirmada), by, bh, !(d.proposta > 0) || d.taxaConfirmada >= 1))
  g.filter((d) => d.proposta > 0 && d.taxaConfirmada < 1).append('path').attr('class', 'prop')
    .attr('d', (d) => barH(x(d.taxaConfirmada) + (d.confirmado > 0 ? 2 : 0), x(d.taxa), by, bh))
  g.append('text').attr('class', 'val').attr('x', W).attr('y', by + bh / 2).attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle').text((d) => pct(d.taxa))

  if (props.meta) {
    svg.append('line').attr('class', 'meta').attr('x1', x(props.meta)).attr('x2', x(props.meta))
      .attr('y1', top).attr('y2', H - 20)
  }

  g.append('rect').attr('width', W).attr('height', rh).attr('fill', 'transparent')
    .on('mousemove', (ev, d) => {
      const u = UNIDADE[d.modalidade] || 'unidades'
      tip.value = tipAt(el.value, ev, `${d.nome} · ${d.modalidade}`, [
        { label: 'Confirmado + base', value: `${num(d.confirmado)} ${u}`, color: 'var(--s-firm)' },
        { label: 'Em proposta', value: `${num(d.proposta)} ${u}`, color: 'var(--s-prop)' },
        { label: 'Disponível', value: `${num(d.disponivel)} de ${num(d.capacidade)} em aberto`, color: 'var(--s-track)' },
        ...(d.bloqueado ? [{ label: 'Não disponível', value: `${num(d.bloqueado)} ${u} · ${brl(d.receitaBloqueada)}` }] : []),
        { label: 'Receita no mês', value: brl(d.receitaOcupada) },
        { label: 'Receita disponível', value: brl(d.receitaDisponivel) },
      ])
    })
    .on('mouseleave', () => (tip.value = null))
  // nome do espaço por cima da camada do tooltip, como link para a página do espaço
  g.append('a').attr('class', 'lnk').attr('href', (d) => `#/espacos/${d.id}`)
    .append('text').attr('class', 'name').attr('y', 16).text((d) => d.nome)
}, () => [props.espacos, props.meta])
</script>

<template>
  <div ref="el" class="chart">
    <div class="legend small">
      <span><i style="background: var(--s-firm)" />Confirmado + base inicial</span>
      <span><i style="background: var(--s-prop)" />Proposta</span>
      <span><i class="trk" />Disponível</span>
      <span v-if="meta"><i class="meta-key" />Meta {{ pct(meta) }}</span>
    </div>
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>
