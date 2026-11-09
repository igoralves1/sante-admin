<script setup>
// Grade de resultado de consulta: colunas com tipo, NULL destacado e ordenação opcional pelo cabeçalho.
import { textoValor, tipoNumerico } from '../lib/banco'

const props = defineProps({
  colunas: { type: Array, required: true },
  linhas: { type: Array, required: true },
  ordem: { type: String, default: '' },
  desc: { type: Boolean, default: false },
  ordenavel: { type: Boolean, default: false },
  inicio: { type: Number, default: 1 }, // número da primeira linha (paginação)
})
const emit = defineEmits(['ordenar'])

const ehNum = (i) => tipoNumerico(props.colunas[i]?.tipo)
const curto = (v) => {
  const t = textoValor(v)
  return t.length > 120 ? `${t.slice(0, 119)}…` : t
}
</script>

<template>
  <div class="grade-wrap">
    <table class="grade">
      <thead>
        <tr>
          <th class="n">#</th>
          <th v-for="(c, i) in colunas" :key="i" :class="{ num: ehNum(i) }" :aria-sort="ordem === c.nome ? (desc ? 'descending' : 'ascending') : undefined">
            <button v-if="ordenavel" type="button" class="ord" @click="emit('ordenar', c.nome)">
              {{ c.nome }}<span class="seta">{{ ordem === c.nome ? (desc ? '↓' : '↑') : '' }}</span>
            </button>
            <span v-else>{{ c.nome }}</span>
            <small>{{ c.tipo }}</small>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(l, r) in linhas" :key="r">
          <td class="n">{{ inicio + r }}</td>
          <td v-for="(v, i) in l" :key="i" :class="{ num: ehNum(i) && v !== null, nulo: v === null }" :title="textoValor(v).length > 120 ? textoValor(v) : undefined">
            {{ curto(v) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!linhas.length" class="empty">Nenhuma linha.</p>
  </div>
</template>

<style scoped>
.grade-wrap { overflow: auto; max-height: calc(100vh - 330px); min-height: 160px; border: 1px solid var(--border); border-radius: 10px; }
.grade { font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; width: max-content; min-width: 100%; }
.grade th {
  position: sticky; top: 0; z-index: 1; background: var(--surface-2); color: var(--text); font-weight: 600;
  padding: 6px 10px; vertical-align: bottom; border-bottom: 1px solid var(--border);
}
.grade th small { display: block; font-weight: 400; color: var(--muted); font-size: 10px; }
.grade td { padding: 5px 10px; white-space: nowrap; max-width: 420px; overflow: hidden; text-overflow: ellipsis; border-bottom: 1px solid var(--border); }
.grade tbody tr:hover td { background: var(--surface-2); }
.grade .n { color: var(--muted); text-align: right; position: sticky; left: 0; background: var(--surface); font-variant-numeric: tabular-nums; }
.grade th.n { background: var(--surface-2); z-index: 2; }
.grade td.num { text-align: right; font-variant-numeric: tabular-nums; }
.grade th.num { text-align: right; }
.grade td.nulo { color: var(--muted); font-style: italic; }
.ord { border: 0; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; }
.ord:hover { color: var(--accent-ink); }
.seta { margin-left: 4px; color: var(--accent-ink); }
</style>
