<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import StatTile from '../components/StatTile.vue'
import { state, espacoPorId } from '../lib/store'
import { capacidadeMes } from '../lib/agenda'
import {
  MODALIDADES, STATUS, UNIDADE, ativoEm, duracaoMeses, fimApos, receitaEmRisco,
  resumoMes, valorMensal, valorTotal, vigencia,
} from '../lib/calc'
import { addMes, brl, dataBR, mesLongo, num, pct, uid } from '../lib/format'

const filtro = ref({ espaco: '', vig: 'vigente', busca: '' })
const VIGS = [
  { k: 'vigente', t: 'Vigentes no mês' },
  { k: 'todos', t: 'Todos' },
  { k: 'futuro', t: 'Começam depois' },
  { k: 'encerrado', t: 'Encerrados' },
  { k: 'cancelado', t: 'Cancelados' },
]
const campanhas = computed(() => Object.fromEntries(state.data.campanhas.map((c) => [c.id, c.nome])))
const resumo = computed(() => resumoMes(state.data, state.mes))
const risco = computed(() => receitaEmRisco(state.data, state.mes, 3))

const vigentes = computed(() => state.data.contratos.filter((c) => ativoEm(c, state.mes)))
const totais = computed(() => {
  const v = vigentes.value
  const comFim = v.filter((c) => c.fim)
  return {
    n: v.length,
    mensal: v.reduce((a, c) => a + valorMensal(c), 0),
    total: comFim.reduce((a, c) => a + valorTotal(c), 0),
    semFim: v.length - comFim.length,
  }
})

const grupos = computed(() => {
  const f = filtro.value
  const q = f.busca.trim().toLowerCase()
  return resumo.value.espacos
    .filter((e) => !f.espaco || e.id === f.espaco)
    .map((e) => {
      const cs = state.data.contratos
        .filter((c) => c.espacoId === e.id)
        .filter((c) => f.vig === 'todos' || vigencia(c, state.mes).k === f.vig)
        .filter((c) => !q || `${c.cliente} ${c.obs}`.toLowerCase().includes(q))
        .sort((a, b) => a.inicio.localeCompare(b.inicio))
      return { e, cs }
    })
    .filter((g) => g.cs.length || (!q && (f.vig === 'vigente' || f.vig === 'todos')))
})
// contratos com espaço apagado ou inexistente
const orfaos = computed(() => state.data.contratos.filter((c) => !espacoPorId(c.espacoId)))

// ---------- formulário ----------
const edit = ref(null)
const erro = ref('')
function novo(espacoId) {
  const e = espacoPorId(espacoId) || state.data.espacos[0]
  edit.value = {
    id: '', espacoId: e.id, cliente: '', modalidade: e.modalidade, quantidade: e.modalidade === 'Mensal' ? 1 : 4,
    preco: e.preco, inicio: `${state.mes}-01`, fim: '', status: 'Confirmada', campanha: '', obs: '',
  }
  erro.value = ''
}
function editar(c) {
  edit.value = { ...c }
  erro.value = ''
}
function renovar(c) {
  const d = duracaoMeses(c) || 12
  const inicio = `${addMes(c.fim.slice(0, 7), 1)}-01`
  edit.value = { ...c, id: '', inicio, fim: fimApos(inicio, d), status: 'Proposta', obs: `Renovação de ${dataBR(c.inicio)}–${dataBR(c.fim)}` }
  erro.value = ''
}
function trocarEspaco() {
  const e = espacoPorId(edit.value.espacoId)
  if (e) Object.assign(edit.value, { modalidade: e.modalidade, preco: e.preco })
}
function prazo(meses) {
  if (!edit.value.inicio) return
  edit.value.fim = meses ? fimApos(edit.value.inicio, meses) : ''
}
const prev = computed(() => {
  const c = edit.value
  if (!c) return null
  const d = duracaoMeses(c)
  // capacidade livre no espaço no mês de início, sem contar o próprio contrato
  const e = espacoPorId(c.espacoId)
  let livre = null
  if (e && c.inicio) {
    const outros = state.data.contratos.filter((x) => x.id !== c.id && x.espacoId === e.id && ativoEm(x, c.inicio.slice(0, 7)))
    livre = capacidadeMes(e, c.inicio.slice(0, 7)) - outros.reduce((a, x) => a + (Number(x.quantidade) || 0), 0)
  }
  return { mensal: valorMensal(c), duracao: d, total: d ? valorTotal(c) : null, livre, unidade: UNIDADE[c.modalidade] }
})
function salvar() {
  const c = edit.value
  if (!c.espacoId || !c.inicio) return (erro.value = 'Informe espaço e data de início.')
  if (!(Number(c.quantidade) > 0)) return (erro.value = 'A quantidade por mês precisa ser maior que zero.')
  if (c.fim && c.fim < c.inicio) return (erro.value = 'O término não pode ser antes do início.')
  c.quantidade = Number(c.quantidade)
  c.preco = Number(c.preco) || 0
  if (c.id) state.data.contratos.splice(state.data.contratos.findIndex((x) => x.id === c.id), 1, c)
  else state.data.contratos.push({ ...c, id: uid('ct') })
  edit.value = null
}
function excluir(c) {
  if (!confirm(`Excluir o contrato de ${c.cliente || 'cliente sem nome'}? Para manter o histórico, prefira marcar como Cancelada.`)) return
  state.data.contratos = state.data.contratos.filter((x) => x.id !== c.id)
  edit.value = null
}
const tomStatus = { Confirmada: 'good', Proposta: 'info', 'Base inicial': 'warn', Cancelada: 'bad' }
const dur = (c) => {
  const d = duracaoMeses(c)
  return d ? `${d} ${d === 1 ? 'mês' : 'meses'}` : 'Sem término'
}
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile label="Contratos vigentes" :value="String(totais.n)" :hint="`em ${mesLongo(state.mes)}`" />
      <StatTile label="Receita mensal contratada" :value="brl(totais.mensal)">
        Ocupação por receita: {{ pct(resumo.taxaReceita) }}
      </StatTile>
      <StatTile label="Valor total dos contratos vigentes" :value="brl(totais.total)">
        <template v-if="totais.semFim">{{ totais.semFim }} sem data de término (fora da soma)</template>
        <template v-else>Soma de valor mensal × duração</template>
      </StatTile>
      <StatTile label="Resultado dos espaços no mês" :value="brl(resumo.receitaOcupada - resumo.despesasEspacos)"
        :tone="resumo.receitaOcupada - resumo.despesasEspacos >= 0 ? '' : 'bad'">
        Receita − {{ brl(resumo.despesasEspacos) }} de despesas dos espaços
      </StatTile>
    </section>

    <div v-if="risco.contratos.length" class="note">
      <strong>{{ risco.contratos.length }} contrato(s) terminam nos próximos 3 meses</strong>, somando
      {{ brl(risco.valor) }} por mês. Use “Renovar” para registrar a proposta de renovação.
    </div>
    <div v-if="totais.semFim" class="note">
      <strong>{{ totais.semFim }} contrato(s) vigentes sem data de término.</strong>
      Informe o fim para calcular duração e valor total. Os lançamentos “Base inicial” vieram da planilha e precisam de revisão.
    </div>

    <section class="card">
      <div class="toolbar between">
        <div class="toolbar">
          <select v-model="filtro.espaco" aria-label="Filtrar por espaço">
            <option value="">Todos os espaços</option>
            <option v-for="e in state.data.espacos" :key="e.id" :value="e.id">{{ e.nome }}</option>
          </select>
          <select v-model="filtro.vig" aria-label="Filtrar por vigência">
            <option v-for="v in VIGS" :key="v.k" :value="v.k">{{ v.t }}</option>
          </select>
          <input v-model="filtro.busca" type="search" placeholder="Buscar cliente ou observação" aria-label="Buscar" />
        </div>
        <button class="btn primary" type="button" @click="novo()"><Icon name="plus" :size="16" /> Novo contrato</button>
      </div>
    </section>

    <section v-for="g in grupos" :key="g.e.id" class="card space">
      <div class="space-head">
        <div>
          <h2><RouterLink :to="`/espacos/${g.e.id}`">{{ g.e.nome }}</RouterLink></h2>
          <p class="muted small">{{ g.e.tipo }} · {{ g.e.modalidade }} · capacidade {{ num(g.e.capacidade) }} {{ UNIDADE[g.e.modalidade] }} no mês · {{ brl(g.e.preco) }} por unidade</p>
        </div>
        <dl class="space-kpis small">
          <div><dt>Ocupação</dt><dd class="tnum">{{ pct(g.e.taxa) }}</dd></div>
          <div><dt>Receita/mês</dt><dd class="tnum">{{ brl(g.e.receitaOcupada) }}</dd></div>
          <div><dt>Despesas/mês</dt><dd class="tnum"><RouterLink :to="`/espacos/${g.e.id}/editar`">{{ brl(g.e.despesas) }}</RouterLink></dd></div>
          <div><dt>Resultado</dt><dd class="tnum" :class="{ neg: g.e.resultado < 0 }">{{ brl(g.e.resultado) }}</dd></div>
        </dl>
      </div>
      <div v-if="espacoPorId(g.e.id)?.despesas?.length" class="desp small muted">
        Despesas: {{ espacoPorId(g.e.id).despesas.map((d) => `${d.descricao} ${brl(d.valor)}`).join(' · ') }}
      </div>

      <div v-if="g.cs.length" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente / profissional</th><th>Período</th><th>Duração</th><th class="num">Qtd./mês</th>
              <th class="num">Valor mensal</th><th class="num">Valor total</th><th>Status</th><th>Vigência</th><th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in g.cs" :key="c.id" :class="{ cancel: c.status === 'Cancelada' }">
              <td>
                <div class="fw">{{ c.cliente || '—' }}</div>
                <div v-if="c.campanha || c.obs" class="small muted">{{ [campanhas[c.campanha], c.obs].filter(Boolean).join(' · ') }}</div>
              </td>
              <td class="tnum nowrap">{{ dataBR(c.inicio) }} → {{ c.fim ? dataBR(c.fim) : '…' }}</td>
              <td class="nowrap">{{ dur(c) }}</td>
              <td class="num">{{ num(c.quantidade) }} {{ UNIDADE[c.modalidade] }}</td>
              <td class="num">{{ brl(valorMensal(c)) }}</td>
              <td class="num">{{ c.fim ? brl(valorTotal(c)) : '—' }}</td>
              <td><span class="chip" :class="tomStatus[c.status]">{{ c.status }}</span></td>
              <td><span class="chip" :class="vigencia(c, state.mes).tom">{{ vigencia(c, state.mes).label }}</span></td>
              <td class="acts">
                <button v-if="c.fim && c.status !== 'Cancelada'" class="btn sm ghost" type="button" title="Criar proposta de renovação" @click="renovar(c)">Renovar</button>
                <button class="btn icon sm ghost" type="button" aria-label="Editar" @click="editar(c)"><Icon name="edit" :size="15" /></button>
                <button class="btn icon sm ghost danger" type="button" aria-label="Excluir" @click="excluir(c)"><Icon name="trash" :size="15" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-row">
        <span class="muted">Nenhum contrato {{ filtro.vig === 'vigente' ? `vigente em ${mesLongo(state.mes)}` : 'cadastrado' }}.</span>
        <button class="btn sm" type="button" @click="novo(g.e.id)"><Icon name="plus" :size="14" /> Adicionar contrato</button>
      </div>
    </section>
    <div v-if="!grupos.length" class="card empty">Nenhum contrato com esses filtros.</div>
    <div v-if="orfaos.length" class="note">
      {{ orfaos.length }} contrato(s) apontam para um espaço que não existe mais. Edite-os para escolher o espaço.
      <button v-for="c in orfaos" :key="c.id" class="btn sm ghost" type="button" @click="editar(c)">{{ c.cliente || 'sem nome' }}</button>
    </div>

    <Modal v-if="edit" :title="edit.id ? 'Editar contrato' : 'Novo contrato'" @close="edit = null">
      <form class="form-grid" @submit.prevent="salvar">
        <label class="field">Espaço
          <select v-model="edit.espacoId" @change="trocarEspaco">
            <option v-for="e in state.data.espacos" :key="e.id" :value="e.id">{{ e.nome }}</option>
          </select>
        </label>
        <label class="field">Cliente / profissional<input v-model="edit.cliente" placeholder="Nome do profissional ou empresa" /></label>
        <label class="field">Modalidade
          <select v-model="edit.modalidade"><option v-for="m in MODALIDADES" :key="m">{{ m }}</option></select>
        </label>
        <label class="field">Quantidade por mês ({{ prev.unidade }})<input v-model="edit.quantidade" type="number" min="0" step="0.01" required /></label>
        <label class="field">Preço unitário (R$)<input v-model="edit.preco" type="number" min="0" step="0.01" /></label>
        <label class="field">Status
          <select v-model="edit.status"><option v-for="s in STATUS" :key="s">{{ s }}</option></select>
        </label>
        <label class="field">Início<input v-model="edit.inicio" type="date" required /></label>
        <label class="field">Término (vazio = sem término)<input v-model="edit.fim" type="date" :min="edit.inicio" /></label>
        <div class="full quick">
          <span class="small muted">Duração rápida:</span>
          <button v-for="mm in [1, 3, 6, 12, 24]" :key="mm" class="btn sm" type="button" @click="prazo(mm)">{{ mm }} {{ mm === 1 ? 'mês' : 'meses' }}</button>
          <button class="btn sm ghost" type="button" @click="prazo(0)">Sem término</button>
        </div>
        <label class="field full">Campanha de origem
          <select v-model="edit.campanha">
            <option value="">Sem campanha / orgânico</option>
            <option v-for="c in state.data.campanhas" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </label>
        <label class="field full">Observações (dias e horários)<textarea v-model="edit.obs" rows="2" placeholder="Ex.: terças e quintas, 8h–12h" /></label>

        <dl class="full resumo">
          <div><dt>Valor mensal</dt><dd class="tnum">{{ brl(prev.mensal) }}</dd></div>
          <div><dt>Duração</dt><dd>{{ prev.duracao ? `${prev.duracao} ${prev.duracao === 1 ? 'mês' : 'meses'}` : 'Sem término' }}</dd></div>
          <div><dt>Valor total do contrato</dt><dd class="tnum">{{ prev.total !== null ? brl(prev.total) : '—' }}</dd></div>
        </dl>
        <p v-if="prev.livre !== null && Number(edit.quantidade) > prev.livre && edit.status !== 'Cancelada'" class="full warn">
          <Icon name="alert" :size="14" /> O espaço tem {{ num(Math.max(0, prev.livre)) }} {{ prev.unidade }} livres no mês de início; este contrato passa da capacidade.
        </p>
        <p v-if="erro" class="full err">{{ erro }}</p>
        <div class="full actions">
          <button v-if="edit.id" class="btn danger" type="button" @click="excluir(edit)"><Icon name="trash" :size="15" /> Excluir</button>
          <span class="grow" />
          <button class="btn" type="button" @click="edit = null">Cancelar</button>
          <button class="btn primary" type="submit">Salvar</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.between { justify-content: space-between; }
.toolbar select { width: 200px; max-width: 100%; }
.toolbar input[type='search'] { width: 240px; max-width: 100%; }
@media (max-width: 560px) { .toolbar, .toolbar select, .toolbar input[type='search'] { width: 100%; } }
.space { display: grid; gap: 12px; }
.space-head { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: start; }
.space-head h2 a { color: var(--text); text-decoration: none; }
.space-head h2 a:hover { text-decoration: underline; }
.space-head p { margin: 2px 0 0; }
.space-kpis { display: flex; gap: 20px; margin: 0; flex-wrap: wrap; }
.space-kpis dt { color: var(--muted); }
.space-kpis dd { margin: 0; font-weight: 600; font-size: 14px; }
.space-kpis dd a { color: inherit; }
.space-kpis .neg { color: var(--bad); }
.desp { margin-top: -4px; }
.fw { font-weight: 500; }
.nowrap { white-space: nowrap; }
.acts { white-space: nowrap; text-align: right; }
tr.cancel td { opacity: 0.55; }
.empty-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 12px; background: var(--surface-2); border-radius: 10px; flex-wrap: wrap; }
.quick { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.resumo { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; padding: 12px; background: var(--surface-2); border-radius: 10px; }
.resumo dt { font-size: 12px; color: var(--muted); }
.resumo dd { margin: 0; font-weight: 600; }
.warn { display: flex; gap: 6px; align-items: center; color: var(--warn); margin: 0; font-size: 13px; }
.err { color: var(--bad); margin: 0; }
.actions { display: flex; gap: 8px; align-items: center; }
.grow { flex: 1; }
</style>
