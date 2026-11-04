<script setup>
// Tabela ordenável renderizada com D3 (clique no cabeçalho). Colunas com `bar` ganham
// uma barrinha proporcional ao valor (0–1). Colunas com `hint` mostram um resumo do
// cálculo ao passar o mouse (ou focar com o teclado) no nome.
import { ascending, descending, select } from 'd3'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  columns: Array, // [{ key, label, num, format, bar, tone, hint, link(row) -> href }]
  rows: Array,
  footer: Object, // linha de totais opcional (mesmas chaves)
  sortKey: String,
  compact: Boolean, // menos espaço entre colunas, para tabelas largas
})
const el = ref(null)
const sort = ref({ key: props.sortKey || props.columns[0].key, dir: -1 })
const uid = `tbl${Math.random().toString(36).slice(2, 8)}`

// popup do cabeçalho: posição fixa na tela, para não ser cortado pela rolagem da tabela
const pop = ref(null)
let alvo = null // cabeçalho com o popup aberto; a posição acompanha a rolagem
function abrir(th, c) {
  if (!c.hint) return
  alvo = { th, c }
  const r = th.getBoundingClientRect()
  const W = Math.min(300, window.innerWidth - 24)
  const x = Math.min(Math.max(r.left + r.width / 2, 12 + W / 2), window.innerWidth - 12 - W / 2)
  const acima = r.top > 170
  pop.value = { x, y: acima ? r.top - 8 : r.bottom + 8, acima, w: W, titulo: c.label.replace(/\n/g, ' '), texto: c.hint, id: `${uid}-${c.key}` }
}
function fechar() {
  alvo = null
  pop.value = null
}
const seguir = () => alvo && (alvo.th.isConnected ? abrir(alvo.th, alvo.c) : fechar())
onMounted(() => window.addEventListener('scroll', seguir, true))
onBeforeUnmount(() => window.removeEventListener('scroll', seguir, true))

function render() {
  const root = select(el.value)
  root.selectAll('*').remove()
  const table = root.append('table').classed('compact', props.compact)
  const s = sort.value
  const tr = table.append('thead').append('tr')
  tr.selectAll('th').data(props.columns).join('th')
    .attr('class', (c) => (c.num ? 'num sortable' : 'sortable'))
    .attr('aria-sort', (c) => (c.key === s.key ? (s.dir > 0 ? 'ascending' : 'descending') : 'none'))
    .attr('tabindex', 0)
    .each(function (c) {
      // rótulo (aceita \n para quebrar linha) + seta: ↕ sem ordem, ↑/↓ na coluna ordenada
      const on = c.key === s.key
      const box = select(this).append('span').attr('class', 'th-in')
      box.append('span').attr('class', c.hint ? 'th-label has-hint' : 'th-label').text(c.label)
      if (c.hint) select(this).attr('aria-describedby', `${uid}-${c.key}`)
      box.append('span').attr('class', on ? 'th-arrow on' : 'th-arrow').attr('aria-hidden', 'true')
        .text(on ? (s.dir > 0 ? '↑' : '↓') : '↕')
    })
    .on('click', (ev, c) => {
      sort.value = { key: c.key, dir: c.key === s.key ? -s.dir : c.num ? -1 : 1 }
    })
    .on('keydown', (ev, c) => {
      if (ev.key === 'Escape') fechar()
      if (ev.key === 'Enter') sort.value = { key: c.key, dir: c.key === s.key ? -s.dir : -1 }
    })
    .on('mouseenter focus', function (ev, c) { abrir(this, c) })
    .on('mouseleave blur', fechar)

  const cmp = s.dir > 0 ? ascending : descending
  const rows = [...props.rows].sort((a, b) => cmp(a[s.key], b[s.key]))
  const body = table.append('tbody')
  const trs = body.selectAll('tr').data(rows).join('tr')
  trs.selectAll('td').data((r) => props.columns.map((c) => ({ c, v: r[c.key], r }))).join('td')
    .attr('class', (d) => (d.c.num ? 'num' : null))
    .each(function (d) {
      const td = select(this)
      const txt = d.c.format ? d.c.format(d.v) : d.v ?? '—'
      // `tone(row)` devolve { c: 'good' | 'warn' | 'bad', t: explicação } e pinta o valor
      const tone = d.c.tone?.(d.r)
      if (d.c.link) {
        td.append('a').attr('class', 'cell-link').attr('href', d.c.link(d.r)).text(txt)
      } else if (tone) {
        td.append('span').attr('class', `tone ${tone.c}`).attr('title', tone.t).text(txt)
      } else if (d.c.bar) {
        const w = td.append('span').attr('class', 'cellbar')
        w.append('span').attr('class', 'cellbar-track').append('span').attr('class', 'cellbar-fill')
          .style('width', `${Math.min(100, Math.max(0, d.v * 100))}%`)
        w.append('span').text(txt)
      } else td.text(txt)
    })
  if (props.footer) {
    table.append('tfoot').append('tr').selectAll('td').data(props.columns).join('td')
      .attr('class', (c) => (c.num ? 'num' : null))
      .text((c) => (props.footer[c.key] === undefined ? '' : c.format && typeof props.footer[c.key] === 'number' ? c.format(props.footer[c.key]) : props.footer[c.key]))
  }
}
onMounted(render)
watch(() => [props.rows, props.columns, props.footer, sort.value], render, { deep: true })
</script>

<template>
  <div class="table-wrap"><div ref="el" /></div>
  <div
    v-if="pop" :id="pop.id" class="th-pop" :class="{ abaixo: !pop.acima }" role="tooltip"
    :style="{ left: `${pop.x}px`, top: `${pop.y}px`, width: `${pop.w}px` }"
  >
    <strong>{{ pop.titulo }}</strong>
    <p>{{ pop.texto }}</p>
  </div>
</template>

<style>
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { color: var(--text); }
th.sortable { vertical-align: bottom; }
.th-in { display: inline-flex; align-items: flex-end; gap: 4px; }
th.num .th-in { justify-content: flex-end; }
.th-label { white-space: pre-line; line-height: 1.3; }
.th-label.has-hint { text-decoration: underline dotted; text-underline-offset: 3px; text-decoration-color: color-mix(in srgb, currentColor 45%, transparent); }
.th-pop {
  position: fixed; z-index: 50; pointer-events: none; transform: translate(-50%, -100%);
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.16); padding: 10px 12px; font-size: 12px; line-height: 1.5;
}
.th-pop.abaixo { transform: translate(-50%, 0); }
.th-pop strong { display: block; color: var(--text); margin-bottom: 2px; }
.th-pop p { margin: 0; color: var(--text-2); white-space: pre-line; }
.th-arrow { opacity: 0.45; font-size: 11px; line-height: 1.3; }
.th-arrow.on { opacity: 1; color: var(--accent-ink); }
th.sortable:hover .th-arrow, th.sortable:focus-visible .th-arrow { opacity: 1; }
table.compact th, table.compact td { padding-left: 6px; padding-right: 6px; }
table.compact td { font-size: 13px; }
table.compact th { font-size: 11px; }
table.compact .cellbar { gap: 6px; }
table.compact .cellbar-track { width: 32px; }
table.compact .tone { padding: 1px 6px; }
.cell-link { font-weight: 500; text-decoration: none; }
.cell-link:hover { text-decoration: underline; }
.tone { display: inline-block; padding: 1px 8px; border-radius: 999px; font-weight: 600; }
.tone.good { color: var(--good); background: var(--good-soft); }
.tone.warn { color: var(--warn); background: var(--warn-soft); }
.tone.bad { color: var(--bad); background: var(--bad-soft); }
.cellbar { display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end; }
.cellbar-track { width: 56px; height: 8px; border-radius: 4px; background: var(--s-track); overflow: hidden; display: inline-block; }
.cellbar-fill { display: block; height: 100%; background: var(--s-firm); border-radius: 0 4px 4px 0; }
</style>
