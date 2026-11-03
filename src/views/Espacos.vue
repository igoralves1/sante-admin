<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import { state } from '../lib/store'
import { MODALIDADES, UNIDADE } from '../lib/calc'
import { brl, uid } from '../lib/format'

const potencial = computed(() => state.data.espacos.reduce((a, e) => a + (Number(e.capacidade) || 0) * (Number(e.preco) || 0), 0))

// Renomear um espaço também atualiza as reservas ligadas a ele
function renomear(e, novo) {
  novo = novo.trim()
  if (!novo || novo === e.nome) return
  if (state.data.espacos.some((x) => x !== e && x.nome === novo)) return alert('Já existe um espaço com esse nome.')
  state.data.reservas.forEach((r) => r.espaco === e.nome && (r.espaco = novo))
  state.data.campanhas.forEach((c) => (c.espacos = c.espacos.map((n) => (n === e.nome ? novo : n))))
  e.nome = novo
}
function adicionar() {
  let n = state.data.espacos.length + 1
  while (state.data.espacos.some((e) => e.nome === `Novo espaço ${n}`)) n++
  state.data.espacos.push({ id: uid('e'), nome: `Novo espaço ${n}`, modalidade: 'Turno', capacidade: 50, preco: 0, obs: '' })
}
function remover(e) {
  const n = state.data.reservas.filter((r) => r.espaco === e.nome).length
  if (n) return alert(`${e.nome} tem ${n} reserva(s). Exclua ou mova as reservas antes de remover o espaço.`)
  if (confirm(`Remover ${e.nome}?`)) state.data.espacos = state.data.espacos.filter((x) => x !== e)
}
const metaPct = computed({
  get: () => Math.round((state.data.metas?.ocupacaoAlvo || 0) * 100),
  set: (v) => (state.data.metas = { ...state.data.metas, ocupacaoAlvo: Math.min(100, Math.max(0, Number(v) || 0)) / 100 }),
})
</script>

<template>
  <div class="stack">
    <section class="grid cols-3">
      <div class="card">
        <div class="muted small">Espaços cadastrados</div>
        <div class="big tnum">{{ state.data.espacos.length }}</div>
      </div>
      <div class="card">
        <div class="muted small">Receita potencial mensal</div>
        <div class="big tnum">{{ brl(potencial) }}</div>
      </div>
      <div class="card">
        <label class="field">Meta de ocupação (usada no painel e no marketing)
          <span class="meta-input"><input v-model.number="metaPct" type="number" min="0" max="100" step="5" /> %</span>
        </label>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Cadastro de espaços</h2>
          <p>A capacidade é mensal e na unidade da modalidade: horas, turnos ou contratos. As edições salvam automaticamente.</p>
        </div>
        <button class="btn primary" type="button" @click="adicionar"><Icon name="plus" :size="16" /> Novo espaço</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Espaço</th><th>Modalidade</th><th class="num">Capacidade / mês</th><th class="num">Preço unitário (R$)</th>
              <th class="num">Receita potencial</th><th>Observações</th><th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in state.data.espacos" :key="e.id">
              <td class="w-name"><input :value="e.nome" aria-label="Nome" @change="renomear(e, $event.target.value)" /></td>
              <td class="w-mod">
                <select v-model="e.modalidade" aria-label="Modalidade"><option v-for="m in MODALIDADES" :key="m">{{ m }}</option></select>
              </td>
              <td class="w-num">
                <input v-model.number="e.capacidade" type="number" min="0" step="0.01" aria-label="Capacidade" />
                <span class="muted small">{{ UNIDADE[e.modalidade] }}</span>
              </td>
              <td class="w-num"><input v-model.number="e.preco" type="number" min="0" step="0.01" aria-label="Preço" /></td>
              <td class="num">{{ brl(e.capacidade * e.preco) }}</td>
              <td><input v-model="e.obs" aria-label="Observações" /></td>
              <td><button class="btn icon sm ghost danger" type="button" aria-label="Remover" @click="remover(e)"><Icon name="trash" :size="15" /></button></td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colspan="4">Total</td><td class="num">{{ brl(potencial) }}</td><td colspan="2" /></tr>
          </tfoot>
        </table>
      </div>
    </section>

    <section class="note">
      <strong>Como a capacidade foi calculada:</strong> 4,33 semanas por mês. Salas por hora: 173,2 horas;
      salas por turno: 50 turnos; piscina: 51,96 turnos; administrativo: 16 posições mensais.
      A área/pontos ainda precisa de capacidade, unidade e preço para entrar no cálculo.
    </section>
  </div>
</template>

<style scoped>
.big { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
.meta-input { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text); }
.meta-input input { width: 90px; }
.w-name { min-width: 150px; }
.w-mod { min-width: 110px; }
.w-num { min-width: 120px; }
.w-num input { text-align: right; }
.w-num .small { display: block; text-align: right; margin-top: 2px; }
</style>
