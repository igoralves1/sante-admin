<script setup>
// Matriz de horários (colunas × linhas) desenhada com D3.
// Cada célula vem de `celula(col, row)`: { t: 'livre' | 'off' | 'conf' | 'prop' | 'heat', ref, v, num, tip }.
// Quadrados agendados mostram o número do profissional; a legenda com os nomes fica fora do gráfico.
// Arrastar sobre células livres seleciona um retângulo (como criar um evento no Google Agenda)
// e emite `selecionar`; clicar numa célula ocupada emite `abrir` com o `ref` dela.
import { pointer } from 'd3'
import Tooltip from '../Tooltip.vue'
import { useChart, tipAt } from '../../lib/useChart'
import { pct } from '../../lib/format'

const props = defineProps({
  cols: Array, // [{ k, l, s, fds, hoje }]
  rows: Array, // [{ k, l }]
  celula: Function,
  selecao: Object, // { c0, c1, r0, r1 } desenhada enquanto o formulário está aberto
  selecionavel: { type: Boolean, default: true },
  rowH: { type: Number, default: 30 },
  minCol: { type: Number, default: 22 },
  deps: { type: null, default: null }, // dados que, ao mudar, pedem novo desenho
  ariaLabel: { type: String, default: 'Agenda' },
})
const emit = defineEmits(['selecionar', 'abrir'])

const { el, tip } = useChart((root, W0, tip) => {
  const nC = props.cols.length
  const nR = props.rows.length
  if (!nC || !nR) {
    root.append('div').attr('class', 'empty').text('Nenhum horário configurado para este espaço.')
    return
  }
  const lw = W0 < 560 ? 58 : 76
  const top = 38
  const W = Math.max(W0, lw + nC * props.minCol)
  const cw = (W - lw) / nC
  const ch = props.rowH
  const H = top + nR * ch + 2
  const est = props.rows.map((r) => props.cols.map((c) => props.celula(c, r)))

  const svg = root.append('svg').attr('width', W).attr('height', H).attr('role', 'grid').attr('aria-label', props.ariaLabel)
    .attr('class', 'sg')

  // cabeçalho das colunas: número/nome em cima, dia da semana embaixo
  const hc = svg.append('g')
  props.cols.forEach((c, i) => {
    const x = lw + i * cw + cw / 2
    if (c.hoje) hc.append('circle').attr('class', 'sg-hoje').attr('cx', x).attr('cy', 13).attr('r', 10)
    hc.append('text').attr('class', `sg-h ${c.hoje ? 'on' : ''} ${c.fds ? 'fds' : ''}`).attr('x', x).attr('y', 13)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').text(c.l)
    if (c.s) hc.append('text').attr('class', `sg-s ${c.fds ? 'fds' : ''}`).attr('x', x).attr('y', 31).attr('text-anchor', 'middle').text(c.s)
  })
  // rótulos das linhas
  svg.append('g').selectAll('text').data(props.rows).join('text').attr('class', 'sg-r')
    .attr('x', lw - 8).attr('y', (d, i) => top + i * ch + ch / 2).attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
    .text((d) => d.l)

  // células
  const cells = []
  est.forEach((linha, ri) => linha.forEach((st, ci) => cells.push({ ri, ci, st })))
  const g = svg.append('g')
  const gap = cw > 14 ? 2 : 1
  const rects = g.selectAll('rect').data(cells).join('rect')
    .attr('class', (d) => `sg-c ${d.st.t}`)
    .attr('x', (d) => lw + d.ci * cw + gap / 2).attr('y', (d) => top + d.ri * ch + gap / 2)
    .attr('width', Math.max(1, cw - gap)).attr('height', ch - gap).attr('rx', Math.min(4, cw / 4))
    .style('opacity', (d) => (d.st.t === 'heat' ? 0.12 + 0.88 * Math.min(1, d.st.v || 0) : null))
  // valores do mapa de calor
  if (cw >= 34) {
    g.selectAll('text.sg-v').data(cells.filter((d) => d.st.t === 'heat')).join('text').attr('class', (d) => `sg-v ${d.st.v > 0.55 ? 'inv' : ''}`)
      .attr('x', (d) => lw + d.ci * cw + cw / 2).attr('y', (d) => top + d.ri * ch + ch / 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').text((d) => pct(d.st.v || 0))
  }
  // número do profissional dentro de cada quadrado agendado
  if (cw >= 14) {
    g.selectAll('text.sg-n').data(cells.filter((d) => d.st.num != null)).join('text').attr('class', (d) => `sg-n ${d.st.t}`)
      .attr('x', (d) => lw + d.ci * cw + cw / 2).attr('y', (d) => top + d.ri * ch + ch / 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central').text((d) => d.st.num)
  }

  const selG = svg.append('g')
  const rectSel = (s, cls) => selG.append('rect').attr('class', cls)
    .attr('x', lw + s.c0 * cw).attr('y', top + s.r0 * ch)
    .attr('width', (s.c1 - s.c0 + 1) * cw).attr('height', (s.r1 - s.r0 + 1) * ch).attr('rx', 5)
  if (props.selecao) rectSel(props.selecao, 'sg-sel')

  const norm = (a, b) => ({ c0: Math.min(a.ci, b.ci), c1: Math.max(a.ci, b.ci), r0: Math.min(a.ri, b.ri), r1: Math.max(a.ri, b.ri) })
  const boxOf = (s) => {
    const r = svg.node().getBoundingClientRect()
    return { left: r.left + lw + s.c0 * cw, right: r.left + lw + (s.c1 + 1) * cw, top: r.top + top + s.r0 * ch, bottom: r.top + top + (s.r1 + 1) * ch }
  }
  const cellAt = (ev) => {
    const [px, py] = pointer(ev, svg.node())
    const ci = Math.floor((px - lw) / cw)
    const ri = Math.floor((py - top) / ch)
    return ci >= 0 && ci < nC && ri >= 0 && ri < nR ? { ci, ri } : null
  }
  const ocupada = (st) => st.t === 'conf' || st.t === 'prop'
  const destacar = (ref) => rects.classed('hl', (d) => !!ref && d.st.ref === ref)

  let drag = null
  let temp = null
  svg.append('rect').attr('class', 'sg-hit').attr('x', lw).attr('y', top).attr('width', W - lw).attr('height', nR * ch)
    .attr('fill', 'transparent')
    .on('pointerdown', function (ev) {
      const c = cellAt(ev)
      if (!c) return
      const st = est[c.ri][c.ci]
      if (ocupada(st)) {
        drag = { modo: 'abrir', ref: st.ref, a: c }
        return
      }
      if (st.t !== 'livre' || !props.selecionavel) return
      ev.preventDefault()
      this.setPointerCapture(ev.pointerId)
      drag = { modo: 'sel', a: c, b: c }
      tip.value = null
      temp?.remove()
      selG.selectAll('.sg-sel').remove()
      temp = rectSel(norm(c, c), 'sg-sel drag')
    })
    .on('pointermove', (ev) => {
      const c = cellAt(ev)
      if (drag?.modo === 'sel') {
        if (c && (c.ci !== drag.b.ci || c.ri !== drag.b.ri)) {
          drag.b = c
          temp.remove()
          temp = rectSel(norm(drag.a, drag.b), 'sg-sel drag')
        }
        return
      }
      if (!c) return (tip.value = null)
      const st = est[c.ri][c.ci]
      destacar(st.ref)
      tip.value = st.tip ? tipAt(el.value, ev, st.tip.title, st.tip.rows) : null
    })
    .on('pointerup', (ev) => {
      if (!drag) return
      const d = drag
      drag = null
      if (d.modo === 'abrir') {
        const c = cellAt(ev)
        if (c && est[c.ri][c.ci].ref === d.ref) emit('abrir', { ref: d.ref, box: boxOf(norm(c, c)) })
        return
      }
      const s = norm(d.a, d.b)
      emit('selecionar', { ...s, box: boxOf(s) })
    })
    .on('pointerleave', () => {
      if (drag?.modo !== 'sel') {
        tip.value = null
        destacar(null)
      }
    })
}, () => [props.cols, props.rows, props.selecao, props.deps, props.selecionavel])
</script>

<template>
  <div ref="el" class="chart sgw">
    <div class="d3-root" />
    <Tooltip :tip="tip" />
  </div>
</template>

<style scoped>
.sgw .d3-root { overflow-x: auto; touch-action: pan-y; }
.sgw :deep(.sg) { user-select: none; -webkit-user-select: none; display: block; }
.sgw :deep(.sg-h) { font-size: 12px; fill: var(--text-2); font-weight: 500; }
.sgw :deep(.sg-h.on) { fill: #fff; font-weight: 600; }
.sgw :deep(.sg-h.fds), .sgw :deep(.sg-s.fds) { fill: var(--muted); }
.sgw :deep(.sg-hoje) { fill: var(--accent); }
.sgw :deep(.sg-s) { font-size: 10px; fill: var(--muted); }
.sgw :deep(.sg-r) { font-size: 11px; fill: var(--text-2); }
.sgw :deep(.sg-c) { stroke: transparent; stroke-width: 1.5; }
.sgw :deep(.sg-c.livre) { fill: var(--s-track); cursor: cell; }
.sgw :deep(.sg-c.livre:hover) { fill: var(--accent-soft); stroke: var(--accent); }
.sgw :deep(.sg-c.off) { fill: transparent; stroke: var(--border); stroke-dasharray: 2 3; }
.sgw :deep(.sg-c.conf) { fill: var(--s-firm); cursor: pointer; }
.sgw :deep(.sg-c.prop) { fill: var(--s-prop); cursor: pointer; }
.sgw :deep(.sg-c.heat) { fill: var(--s-firm); }
.sgw :deep(.sg-c.hl) { stroke: var(--text); }
.sgw :deep(.sg-sel) { fill: var(--s-firm); fill-opacity: 0.6; stroke: var(--accent); stroke-width: 2; pointer-events: none; }
.sgw :deep(.sg-n) { font-size: 12px; font-weight: 600; fill: #fff; pointer-events: none; font-variant-numeric: tabular-nums; }
.sgw :deep(.sg-n.prop) { fill: var(--text); }
.sgw :deep(.sg-v) { font-size: 11px; fill: var(--text); pointer-events: none; font-variant-numeric: tabular-nums; }
.sgw :deep(.sg-v.inv) { fill: #fff; }
</style>
