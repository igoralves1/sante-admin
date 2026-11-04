<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import StatTile from '../components/StatTile.vue'
import { state } from '../lib/store'
import { UNIDADE, ativoEm, despesasEspaco } from '../lib/calc'
import { capacidadeMes, usaAgenda } from '../lib/agenda'
import { brl, mesAtual, num } from '../lib/format'

const hoje = mesAtual()
const linhas = computed(() =>
  state.data.espacos.map((e) => ({
    ...e,
    capMes: capacidadeMes(e, state.mes),
    potencial: capacidadeMes(e, state.mes) * e.preco,
    despesasMes: despesasEspaco(e),
    vigentes: state.data.contratos.filter((c) => c.espacoId === e.id && ativoEm(c, hoje)).length,
    total: state.data.contratos.filter((c) => c.espacoId === e.id).length,
  })),
)
const potencial = computed(() => linhas.value.reduce((a, e) => a + e.potencial, 0))
const despesas = computed(() => linhas.value.reduce((a, e) => a + e.despesasMes, 0))

function remover(e) {
  if (e.total) return alert(`${e.nome} tem ${e.total} contrato(s). Exclua ou mova os contratos em Situação atual antes de remover o espaço.`)
  if (!confirm(`Remover ${e.nome}?`)) return
  state.data.espacos = state.data.espacos.filter((x) => x.id !== e.id)
  state.data.campanhas.forEach((c) => (c.espacos = c.espacos.filter((id) => id !== e.id)))
}
const metaPct = computed({
  get: () => Math.round((state.data.metas?.ocupacaoAlvo || 0) * 100),
  set: (v) => (state.data.metas = { ...state.data.metas, ocupacaoAlvo: Math.min(100, Math.max(0, Number(v) || 0)) / 100 }),
})
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile label="Espaços cadastrados" :value="String(state.data.espacos.length)" />
      <StatTile label="Receita potencial mensal" :value="brl(potencial)" hint="Capacidade × preço de todos os espaços" />
      <StatTile label="Despesas dos espaços / mês" :value="brl(despesas)" hint="Soma das despesas associadas a cada espaço" />
      <div class="card">
        <label class="field">Meta de ocupação
          <span class="meta-input"><input v-model.number="metaPct" type="number" min="0" max="100" step="5" /> %</span>
        </label>
        <p class="small muted hint">Usada no painel, nas estatísticas e no marketing.</p>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Espaços</h2>
          <p>Clique no nome para ver a agenda, o histórico e a movimentação do espaço. O lápis abre o cadastro.</p>
        </div>
        <RouterLink to="/espacos/novo" class="btn primary"><Icon name="plus" :size="16" /> Cadastrar novo espaço</RouterLink>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Espaço</th><th>Tipo</th><th>Modalidade</th><th class="num">Capacidade / mês</th><th class="num">Preço unitário</th>
              <th class="num">Potencial / mês</th><th class="num">Despesas / mês</th><th class="num">Contratos vigentes</th><th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in linhas" :key="e.id">
              <td><RouterLink :to="`/espacos/${e.id}`" class="name">{{ e.nome }}</RouterLink>
                <div v-if="e.descricao" class="muted small desc">{{ e.descricao }}</div></td>
              <td>{{ e.tipo }}</td>
              <td>{{ e.modalidade }}</td>
              <td class="num">{{ num(e.capMes) }} {{ UNIDADE[e.modalidade] }}<span v-if="usaAgenda(e)" class="muted small"> · agenda</span></td>
              <td class="num">{{ brl(e.preco) }}</td>
              <td class="num">{{ brl(e.potencial) }}</td>
              <td class="num">{{ e.despesasMes ? brl(e.despesasMes) : '—' }}</td>
              <td class="num">{{ e.vigentes }}</td>
              <td class="acts">
                <RouterLink :to="`/espacos/${e.id}/editar`" class="btn icon sm ghost" aria-label="Editar"><Icon name="edit" :size="15" /></RouterLink>
                <button class="btn icon sm ghost danger" type="button" aria-label="Remover" @click="remover(e)"><Icon name="trash" :size="15" /></button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="5">Total</td><td class="num">{{ brl(potencial) }}</td><td class="num">{{ brl(despesas) }}</td><td colspan="2" /></tr>
          </tfoot>
        </table>
      </div>
    </section>

    <section class="note">
      <strong>Como a capacidade é calculada:</strong> salas e piscina contam os turnos abertos na agenda de cada uma
      no mês de referência (08–12, 14–18 e 19–22 nos dias úteis; 08–12 e 14–18 no sábado). Em novembro de 2026 são
      71 turnos. Salas por hora usam as horas desses turnos. Salas em contrato mensal e o administrativo (16 posições)
      usam a capacidade cadastrada.
    </section>
  </div>
</template>

<style scoped>
.meta-input { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text); }
.meta-input input { width: 90px; }
.hint { margin: 6px 0 0; }
.name { font-weight: 500; text-decoration: none; }
.name:hover { text-decoration: underline; }
.desc { max-width: 280px; }
.acts { white-space: nowrap; text-align: right; }
</style>
