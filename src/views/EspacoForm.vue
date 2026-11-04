<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { state } from '../lib/store'
import { MODALIDADES, SEMANAS_MES, TIPOS, UNIDADE } from '../lib/calc'
import { brl, clone, num, uid } from '../lib/format'
import { agendaPadrao, capacidadeMes, usaAgenda } from '../lib/agenda'

const route = useRoute()
const router = useRouter()
const original = computed(() => state.data.espacos.find((e) => e.id === route.params.id))
const novo = !route.params.id

const draft = ref(
  novo
    ? { id: '', nome: '', tipo: 'Consultório', modalidade: 'Turno', capacidade: 50, preco: 0, descricao: '', obs: '', despesas: [] }
    : original.value
      ? clone(original.value)
      : null,
)
const erro = ref('')

// ajuda para capacidade: unidades por semana × 4,33
const porSemana = ref(null)
function aplicarSemana() {
  if (!(porSemana.value > 0)) return
  draft.value.capacidade = +(porSemana.value * SEMANAS_MES).toFixed(2)
}
const dicaSemana = computed(() => ({
  Hora: 'Horas disponíveis por semana (ex.: 40 → 173,2 h/mês)',
  Turno: 'Turnos por semana (ex.: 11,5 → 50 turnos/mês)',
  Mensal: 'Para mensal, informe o número de contratos/posições',
})[draft.value?.modalidade])

// salas e piscina por hora/turno: capacidade contada na agenda do mês de referência
const pelaAgenda = computed(() => usaAgenda(draft.value))
const capMes = computed(() => (draft.value ? capacidadeMes(draft.value, state.mes) : 0))
const mesRef = computed(() => { const [y, m] = state.mes.split('-'); return `${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][Number(m) - 1]}-${y}` })
const potencial = computed(() => capMes.value * (Number(draft.value?.preco) || 0))
const totalDespesas = computed(() => (draft.value?.despesas || []).reduce((a, d) => a + (Number(d.valor) || 0), 0))
const contratos = computed(() => (novo ? 0 : state.data.contratos.filter((c) => c.espacoId === draft.value.id).length))

const SUGESTOES = ['Energia elétrica', 'Limpeza', 'Manutenção', 'Material de consumo', 'Aquecimento da piscina', 'Produtos químicos da piscina', 'Depreciação de equipamentos']
function addDespesa(descricao = '') {
  draft.value.despesas.push({ id: uid('d'), descricao, valor: 0 })
}
function delDespesa(d) {
  draft.value.despesas = draft.value.despesas.filter((x) => x !== d)
}

function salvar() {
  const e = draft.value
  e.nome = e.nome.trim()
  if (!e.nome) return (erro.value = 'Dê um nome ao espaço.')
  if (state.data.espacos.some((x) => x.id !== e.id && x.nome.toLowerCase() === e.nome.toLowerCase())) return (erro.value = 'Já existe um espaço com esse nome.')
  if (!usaAgenda(e) && !(Number(e.capacidade) > 0)) return (erro.value = 'A capacidade mensal precisa ser maior que zero.')
  e.capacidade = Number(e.capacidade)
  e.preco = Number(e.preco) || 0
  e.despesas = e.despesas.filter((d) => d.descricao.trim() || Number(d.valor)).map((d) => ({ ...d, valor: Number(d.valor) || 0 }))
  // agenda em turnos (padrão da Santé) para espaço novo
  if (novo || !e.agenda) e.agenda = agendaPadrao()
  if (novo) {
    state.data.espacos.push({ ...e, id: uid('e') })
    router.push('/espacos')
  } else {
    state.data.espacos.splice(state.data.espacos.findIndex((x) => x.id === e.id), 1, e)
    router.push(`/espacos/${e.id}`)
  }
}
function excluir() {
  if (contratos.value) return alert(`Este espaço tem ${contratos.value} contrato(s). Exclua ou mova os contratos antes.`)
  const ags = (state.data.agendamentos || []).filter((a) => a.espacoId === draft.value.id).length
  if (ags) return alert(`Este espaço tem ${ags} agendamento(s) na agenda. Exclua-os na página do espaço antes.`)
  if (!confirm(`Remover ${draft.value.nome}?`)) return
  state.data.espacos = state.data.espacos.filter((x) => x.id !== draft.value.id)
  router.push('/espacos')
}
</script>

<template>
  <div v-if="draft" class="stack">
    <RouterLink to="/espacos" class="back"><Icon name="back" :size="16" /> Voltar para espaços</RouterLink>

    <form class="grid cols-3" @submit.prevent="salvar">
      <div class="card span-2">
        <div class="card-head"><h2>Dados do espaço</h2></div>
        <div class="form-grid">
          <label class="field">Nome<input v-model="draft.nome" required placeholder="Ex.: Consultório 12" /></label>
          <label class="field">Tipo
            <select v-model="draft.tipo"><option v-for="t in TIPOS" :key="t">{{ t }}</option></select>
          </label>
          <label class="field">Modalidade de venda
            <select v-model="draft.modalidade"><option v-for="m in MODALIDADES" :key="m">{{ m }}</option></select>
          </label>
          <label class="field">Preço unitário (R$ por {{ { Hora: 'hora', Turno: 'turno', Mensal: 'mês' }[draft.modalidade] }})
            <input v-model.number="draft.preco" type="number" min="0" step="0.01" />
          </label>
          <div v-if="pelaAgenda" class="field">
            <span>Capacidade em {{ mesRef }} ({{ UNIDADE[draft.modalidade] }})</span>
            <input :value="num(capMes)" readonly aria-readonly="true" />
            <span class="muted small">Contada na agenda do espaço: turnos abertos em cada dia do mês. Mude os turnos na página do espaço.</span>
          </div>
          <label v-else class="field">Capacidade mensal ({{ UNIDADE[draft.modalidade] }})
            <input v-model.number="draft.capacidade" type="number" min="0" step="0.01" required />
          </label>
          <div v-if="draft.modalidade !== 'Mensal' && !pelaAgenda" class="field">
            <span>{{ dicaSemana }}</span>
            <span class="semana">
              <input v-model.number="porSemana" type="number" min="0" step="0.5" aria-label="Unidades por semana" />
              <button class="btn" type="button" @click="aplicarSemana">× 4,33</button>
            </span>
          </div>
          <label class="field full">Descrição e equipamentos
            <textarea v-model="draft.descricao" rows="3" placeholder="Ex.: maca, mesa de atendimento, ar-condicionado, banheiro privativo" />
          </label>
          <label class="field full">Observações<input v-model="draft.obs" /></label>
        </div>
      </div>

      <div class="stack side">
        <div class="card">
          <div class="muted small">Receita potencial por mês</div>
          <div class="big tnum">{{ brl(potencial) }}</div>
          <div class="muted small">{{ num(capMes) }} {{ UNIDADE[draft.modalidade] }} × {{ brl(draft.preco) }}{{ pelaAgenda ? ` em ${mesRef}` : '' }}</div>
          <hr />
          <div class="muted small">Despesas associadas por mês</div>
          <div class="big tnum">{{ brl(totalDespesas) }}</div>
          <div class="muted small">Margem no potencial: {{ brl(potencial - totalDespesas) }}</div>
        </div>
        <div v-if="!novo" class="card small muted">
          {{ contratos }} contrato(s) neste espaço.
          <RouterLink to="/situacao">Ver na situação atual</RouterLink>
        </div>
      </div>

      <div class="card span-2">
        <div class="card-head">
          <div>
            <h2>Despesas associadas ao espaço</h2>
            <p>Custos mensais que existem por causa deste espaço. Não repita aqui os custos gerais lançados em Financeiro.</p>
          </div>
          <button class="btn" type="button" @click="addDespesa()"><Icon name="plus" :size="16" /> Adicionar despesa</button>
        </div>
        <div class="sugs">
          <button v-for="s in SUGESTOES" :key="s" type="button" class="chip plain sug" @click="addDespesa(s)">+ {{ s }}</button>
        </div>
        <div v-if="draft.despesas.length" class="table-wrap">
          <table>
            <thead><tr><th>Descrição</th><th class="num">Valor mensal (R$)</th><th /></tr></thead>
            <tbody>
              <tr v-for="d in draft.despesas" :key="d.id">
                <td><input v-model="d.descricao" aria-label="Descrição" /></td>
                <td class="w-num"><input v-model.number="d.valor" type="number" min="0" step="0.01" aria-label="Valor mensal" /></td>
                <td><button class="btn icon sm ghost danger" type="button" aria-label="Remover" @click="delDespesa(d)"><Icon name="trash" :size="15" /></button></td>
              </tr>
            </tbody>
            <tfoot><tr><td>Total</td><td class="num">{{ brl(totalDespesas) }}</td><td /></tr></tfoot>
          </table>
        </div>
        <div v-else class="empty">Nenhuma despesa cadastrada para este espaço.</div>
      </div>

      <div class="actions span-2">
        <button v-if="!novo" class="btn danger" type="button" @click="excluir"><Icon name="trash" :size="15" /> Remover espaço</button>
        <span class="grow" />
        <p v-if="erro" class="err">{{ erro }}</p>
        <RouterLink to="/espacos" class="btn">Cancelar</RouterLink>
        <button class="btn primary" type="submit">{{ novo ? 'Cadastrar espaço' : 'Salvar alterações' }}</button>
      </div>
    </form>
  </div>
  <div v-else class="card empty">
    Espaço não encontrado. <RouterLink to="/espacos">Voltar para espaços</RouterLink>
  </div>
</template>

<style scoped>
.back { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; font-weight: 500; }
.side { align-content: start; }
.big { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin: 2px 0; }
hr { border: 0; border-top: 1px solid var(--border); margin: 14px 0; }
.semana { display: flex; gap: 8px; }
.semana input { flex: 1; font-size: 14px; font-weight: 400; }
.sugs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.sug { border: 0; cursor: pointer; font: inherit; font-size: 12px; }
.sug:hover { background: var(--accent-soft); color: var(--accent-ink); }
.w-num { width: 200px; }
.w-num input { text-align: right; }
.actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.grow { flex: 1; }
.err { color: var(--bad); margin: 0; }
</style>
