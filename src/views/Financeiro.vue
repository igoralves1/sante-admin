<script setup>
import { computed } from 'vue'
import Icon from '../components/Icon.vue'
import StatTile from '../components/StatTile.vue'
import { state } from '../lib/store'
import { financeiro, resumoMes } from '../lib/calc'
import { brl, mesLongo, pct, uid } from '../lib/format'

const fin = computed(() => financeiro(state.data))
const r = computed(() => resumoMes(state.data, state.mes))
const gap = computed(() => r.value.receitaConfirmada - fin.value.pontoEquilibrio)
// Ocupação (por receita) necessária para empatar
const ocupNecessaria = computed(() => (r.value.potencial ? fin.value.pontoEquilibrio / r.value.potencial : 0))

const pctField = (k) =>
  computed({
    get: () => +((state.data.custos[k] || 0) * 100).toFixed(2),
    set: (v) => (state.data.custos[k] = (Number(v) || 0) / 100),
  })
const impostos = pctField('impostos')
const comissoes = pctField('comissoes')

function addCusto() {
  state.data.custos.fixos.push({ id: uid('c'), descricao: 'Novo custo', valor: 0 })
}
function delCusto(c) {
  state.data.custos.fixos = state.data.custos.fixos.filter((x) => x !== c)
}
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile label="Custos fixos mensais" :value="brl(fin.fixos)">
        Gerais {{ brl(fin.fixosGerais) }} + despesas dos espaços {{ brl(fin.despesasEspacos) }}
      </StatTile>
      <StatTile label="Margem de contribuição" :value="pct(fin.margem)" hint="1 − impostos − comissões" />
      <StatTile label="Receita no ponto de equilíbrio" :value="brl(fin.pontoEquilibrio)">
        Equivale a {{ pct(ocupNecessaria) }} de ocupação por receita
      </StatTile>
      <StatTile label="Resultado vs. equilíbrio" :value="(gap >= 0 ? '+' : '') + brl(gap)" :tone="fin.fixos ? (gap >= 0 ? 'good' : 'bad') : ''">
        Receita confirmada + base em {{ mesLongo(state.mes) }}: {{ brl(r.receitaConfirmada) }}
      </StatTile>
    </section>

    <div v-if="!fin.fixos" class="note">
      <strong>Os custos ainda estão zerados.</strong> Preencha os valores reais abaixo para que o ponto de equilíbrio e a
      distância até ele apareçam no painel.
    </div>

    <section class="grid cols-3">
      <div class="card span-2">
        <div class="card-head">
          <div>
            <h2>Custos gerais da clínica</h2>
            <p>Valores mensais em reais. As edições salvam automaticamente.</p>
          </div>
          <button class="btn" type="button" @click="addCusto"><Icon name="plus" :size="16" /> Adicionar custo</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Descrição</th><th class="num">Valor mensal (R$)</th><th /></tr></thead>
            <tbody>
              <tr v-for="c in state.data.custos.fixos" :key="c.id">
                <td><input v-model="c.descricao" aria-label="Descrição" /></td>
                <td class="w-num"><input v-model.number="c.valor" type="number" min="0" step="0.01" aria-label="Valor" /></td>
                <td><button class="btn icon sm ghost danger" type="button" aria-label="Remover" @click="delCusto(c)"><Icon name="trash" :size="15" /></button></td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td>Total geral</td><td class="num">{{ brl(fin.fixosGerais) }}</td><td /></tr>
              <tr><td><RouterLink to="/espacos">Despesas associadas aos espaços</RouterLink></td><td class="num">{{ brl(fin.despesasEspacos) }}</td><td /></tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Custos variáveis</h2></div>
        <div class="stack">
          <label class="field">Impostos sobre faturamento (%)<input v-model.number="impostos" type="number" min="0" max="100" step="0.1" /></label>
          <label class="field">Comissões / taxas sobre faturamento (%)<input v-model.number="comissoes" type="number" min="0" max="100" step="0.1" /></label>
          <div class="note small">
            O cálculo é aproximado: receita de equilíbrio = custos fixos ÷ margem de contribuição.
            Para mais precisão, inclua custos variáveis por modalidade e avalie o mix de vendas.
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.w-num { width: 200px; }
.w-num input { text-align: right; }
</style>
