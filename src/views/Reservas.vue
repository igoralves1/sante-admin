<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import { state } from '../lib/store'
import { MODALIDADES, STATUS, UNIDADE, reservasDoMes } from '../lib/calc'
import { addMes, brl, dataBR, mesLongo, num, uid } from '../lib/format'

const filtro = ref({ espaco: '', status: '', campanha: '', busca: '' })
const campanhas = computed(() => Object.fromEntries(state.data.campanhas.map((c) => [c.id, c.nome])))

const lista = computed(() => {
  const f = filtro.value
  const q = f.busca.trim().toLowerCase()
  return reservasDoMes(state.data, state.mes)
    .filter((r) => (!f.espaco || r.espaco === f.espaco) && (!f.status || r.status === f.status))
    .filter((r) => !f.campanha || (f.campanha === '-' ? !r.campanha : r.campanha === f.campanha))
    .filter((r) => !q || `${r.cliente} ${r.obs}`.toLowerCase().includes(q))
    .sort((a, b) => a.data.localeCompare(b.data) || a.espaco.localeCompare(b.espaco, 'pt-BR', { numeric: true }))
})
const totais = computed(() => {
  const ativos = lista.value.filter((r) => r.status !== 'Cancelada')
  return {
    n: ativos.length,
    total: ativos.reduce((a, r) => a + r.quantidade * r.preco, 0),
    propostas: ativos.filter((r) => r.status === 'Proposta').length,
    base: ativos.filter((r) => r.status === 'Base inicial').length,
  }
})

const tom = { Confirmada: 'good', Proposta: 'info', 'Base inicial': 'warn', Cancelada: 'bad' }

// ---------- formulário ----------
const edit = ref(null)
const erro = ref('')
function nova() {
  const e = state.data.espacos[0]
  edit.value = {
    id: '', data: `${state.mes}-01`, espaco: e.nome, cliente: '', modalidade: e.modalidade,
    quantidade: 1, preco: e.preco, status: 'Confirmada', campanha: '', obs: '',
  }
  erro.value = ''
}
function editar(r) {
  edit.value = { ...r }
  erro.value = ''
}
function trocarEspaco() {
  const e = state.data.espacos.find((x) => x.nome === edit.value.espaco)
  if (e) Object.assign(edit.value, { modalidade: e.modalidade, preco: e.preco })
}
function salvar() {
  const r = edit.value
  if (!r.data || !r.espaco) return (erro.value = 'Informe data e espaço.')
  if (!(Number(r.quantidade) > 0)) return (erro.value = 'A quantidade precisa ser maior que zero.')
  r.quantidade = Number(r.quantidade)
  r.preco = Number(r.preco) || 0
  if (r.id) {
    const i = state.data.reservas.findIndex((x) => x.id === r.id)
    state.data.reservas.splice(i, 1, r)
  } else {
    state.data.reservas.push({ ...r, id: uid('r') })
  }
  edit.value = null
}
function excluir(r) {
  if (!confirm(`Excluir a reserva de ${r.cliente || r.espaco}?`)) return
  state.data.reservas = state.data.reservas.filter((x) => x.id !== r.id)
}

// ---------- replicar contratos mensais ----------
const mensais = computed(() =>
  reservasDoMes(state.data, state.mes).filter((r) => r.modalidade === 'Mensal' && r.status !== 'Cancelada' && r.status !== 'Proposta'),
)
function replicar() {
  const prox = addMes(state.mes, 1)
  const jaExiste = new Set(reservasDoMes(state.data, prox).map((r) => `${r.espaco}|${r.cliente}`))
  const novos = mensais.value
    .filter((r) => !jaExiste.has(`${r.espaco}|${r.cliente}`))
    .map((r) => ({ ...r, id: uid('r'), data: `${prox}-01`, status: r.status === 'Base inicial' ? 'Base inicial' : 'Confirmada' }))
  if (!novos.length) return alert(`Os contratos mensais já existem em ${mesLongo(prox)}.`)
  if (!confirm(`Copiar ${novos.length} contrato(s) mensal(is) para ${mesLongo(prox)}?`)) return
  state.data.reservas.push(...novos)
  state.mes = prox
}
</script>

<template>
  <div class="stack">
    <section class="card">
      <div class="toolbar between">
        <div class="toolbar">
          <select v-model="filtro.espaco" aria-label="Filtrar por espaço">
            <option value="">Todos os espaços</option>
            <option v-for="e in state.data.espacos" :key="e.id">{{ e.nome }}</option>
          </select>
          <select v-model="filtro.status" aria-label="Filtrar por status">
            <option value="">Todos os status</option>
            <option v-for="s in STATUS" :key="s">{{ s }}</option>
          </select>
          <select v-model="filtro.campanha" aria-label="Filtrar por campanha">
            <option value="">Todas as origens</option>
            <option value="-">Sem campanha</option>
            <option v-for="c in state.data.campanhas" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
          <input v-model="filtro.busca" type="search" placeholder="Buscar cliente ou observação" aria-label="Buscar" />
        </div>
        <div class="toolbar">
          <button class="btn" type="button" :disabled="!mensais.length" title="Copia os contratos mensais deste mês para o próximo" @click="replicar">
            <Icon name="copy" :size="16" /> Replicar mensais
          </button>
          <button class="btn primary" type="button" @click="nova"><Icon name="plus" :size="16" /> Nova reserva</button>
        </div>
      </div>

      <div class="summary small">
        <span><strong class="tnum">{{ totais.n }}</strong> reservas ativas</span>
        <span><strong class="tnum">{{ brl(totais.total) }}</strong> no total</span>
        <span v-if="totais.propostas"><strong class="tnum">{{ totais.propostas }}</strong> em proposta</span>
        <span v-if="totais.base" class="warn-txt"><Icon name="alert" :size="14" /> {{ totais.base }} lançamentos de “Base inicial” para revisar</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Espaço</th><th>Cliente / profissional</th><th>Modalidade</th>
              <th class="num">Qtd.</th><th class="num">Preço</th><th class="num">Total</th>
              <th>Status</th><th>Campanha</th><th>Observações</th><th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in lista" :key="r.id" :class="{ cancel: r.status === 'Cancelada' }">
              <td class="tnum">{{ dataBR(r.data) }}</td>
              <td>{{ r.espaco }}</td>
              <td>{{ r.cliente || '—' }}</td>
              <td>{{ r.modalidade }}</td>
              <td class="num">{{ num(r.quantidade) }}</td>
              <td class="num">{{ brl(r.preco) }}</td>
              <td class="num">{{ brl(r.quantidade * r.preco) }}</td>
              <td><span class="chip" :class="tom[r.status]">{{ r.status }}</span></td>
              <td class="small">{{ campanhas[r.campanha] || '—' }}</td>
              <td class="small muted obs">{{ r.obs }}</td>
              <td class="acts">
                <button class="btn icon sm ghost" type="button" aria-label="Editar" @click="editar(r)"><Icon name="edit" :size="15" /></button>
                <button class="btn icon sm ghost danger" type="button" aria-label="Excluir" @click="excluir(r)"><Icon name="trash" :size="15" /></button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!lista.length" class="empty">
          Nenhuma reserva em {{ mesLongo(state.mes) }} com esses filtros.
        </div>
      </div>
    </section>

    <Modal v-if="edit" :title="edit.id ? 'Editar reserva' : 'Nova reserva'" @close="edit = null">
      <form class="form-grid" @submit.prevent="salvar">
        <label class="field">Data<input v-model="edit.data" type="date" required /></label>
        <label class="field">Espaço
          <select v-model="edit.espaco" @change="trocarEspaco">
            <option v-for="e in state.data.espacos" :key="e.id">{{ e.nome }}</option>
          </select>
        </label>
        <label class="field full">Cliente / profissional<input v-model="edit.cliente" placeholder="Nome do profissional ou empresa" /></label>
        <label class="field">Modalidade
          <select v-model="edit.modalidade"><option v-for="m in MODALIDADES" :key="m">{{ m }}</option></select>
        </label>
        <label class="field">Quantidade ({{ UNIDADE[edit.modalidade] }})<input v-model="edit.quantidade" type="number" min="0" step="0.01" required /></label>
        <label class="field">Preço unitário (R$)<input v-model="edit.preco" type="number" min="0" step="0.01" /></label>
        <label class="field">Status
          <select v-model="edit.status"><option v-for="s in STATUS" :key="s">{{ s }}</option></select>
        </label>
        <label class="field full">Campanha de origem
          <select v-model="edit.campanha">
            <option value="">Sem campanha / orgânico</option>
            <option v-for="c in state.data.campanhas" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </label>
        <label class="field full">Observações (dia e horário)<textarea v-model="edit.obs" rows="2" placeholder="Ex.: terças e quintas, 8h–12h" /></label>
        <div class="full total-line">
          <span class="muted">Total</span>
          <strong class="tnum">{{ brl((Number(edit.quantidade) || 0) * (Number(edit.preco) || 0)) }}</strong>
        </div>
        <p v-if="erro" class="full err">{{ erro }}</p>
        <div class="full modal-actions">
          <button class="btn" type="button" @click="edit = null">Cancelar</button>
          <button class="btn primary" type="submit">Salvar</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.between { justify-content: space-between; }
.toolbar select, .toolbar input { max-width: 100%; }
.toolbar select { width: 200px; }
.toolbar input[type='search'] { width: 240px; }
@media (max-width: 560px) { .toolbar select, .toolbar input[type='search'] { width: 100%; } .toolbar { width: 100%; } }
.summary { display: flex; flex-wrap: wrap; gap: 6px 20px; color: var(--text-2); margin: 16px 0 8px; }
.summary strong { color: var(--text); }
.warn-txt { display: inline-flex; align-items: center; gap: 4px; color: var(--warn); }
.acts { white-space: nowrap; text-align: right; }
.obs { max-width: 260px; }
tr.cancel td { opacity: 0.55; }
tr.cancel td:nth-child(8) { opacity: 1; }
.total-line { display: flex; justify-content: space-between; padding: 10px 12px; background: var(--surface-2); border-radius: 10px; }
.err { color: var(--bad); margin: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
