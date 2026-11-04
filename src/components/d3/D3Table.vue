<script setup>
// Tabela ordenável renderizada com D3 (clique no cabeçalho). Colunas com `bar` ganham
// uma barrinha proporcional ao valor (0–1).
import { ascending, descending, select } from 'd3'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  columns: Array, // [{ key, label, num, format, bar }]
  rows: Array,
  footer: Object, // linha de totais opcional (mesmas chaves)
  sortKey: String,
})
const el = ref(null)
const sort = ref({ key: props.sortKey || props.columns[0].key, dir: -1 })

function render() {
  const root = select(el.value)
  root.selectAll('*').remove()
  const table = root.append('table')
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
      box.append('span').attr('class', 'th-label').text(c.label)
      box.append('span').attr('class', on ? 'th-arrow on' : 'th-arrow').attr('aria-hidden', 'true')
        .text(on ? (s.dir > 0 ? '↑' : '↓') : '↕')
    })
    .on('click', (ev, c) => {
      sort.value = { key: c.key, dir: c.key === s.key ? -s.dir : c.num ? -1 : 1 }
    })
    .on('keydown', (ev, c) => ev.key === 'Enter' && (sort.value = { key: c.key, dir: c.key === s.key ? -s.dir : -1 }))

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
      if (tone) {
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
</template>

<style>
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { color: var(--text); }
th.sortable { vertical-align: bottom; }
.th-in { display: inline-flex; align-items: flex-end; gap: 4px; }
th.num .th-in { justify-content: flex-end; }
.th-label { white-space: pre-line; line-height: 1.3; }
.th-arrow { opacity: 0.45; font-size: 11px; line-height: 1.3; }
.th-arrow.on { opacity: 1; color: var(--accent-ink); }
th.sortable:hover .th-arrow { opacity: 1; }
.tone { display: inline-block; padding: 1px 8px; border-radius: 999px; font-weight: 600; }
.tone.good { color: var(--good); background: var(--good-soft); }
.tone.warn { color: var(--warn); background: var(--warn-soft); }
.tone.bad { color: var(--bad); background: var(--bad-soft); }
.cellbar { display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end; }
.cellbar-track { width: 56px; height: 8px; border-radius: 4px; background: var(--s-track); overflow: hidden; display: inline-block; }
.cellbar-fill { display: block; height: 100%; background: var(--s-firm); border-radius: 0 4px 4px 0; }
</style>
