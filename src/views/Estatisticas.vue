<script setup>
import { computed, ref } from 'vue'
import { deviation, mean, median, sum } from 'd3'
import StatTile from '../components/StatTile.vue'
import D3Lines from '../components/d3/D3Lines.vue'
import D3Gantt from '../components/d3/D3Gantt.vue'
import D3Curve from '../components/d3/D3Curve.vue'
import D3Quadrant from '../components/d3/D3Quadrant.vue'
import D3Table from '../components/d3/D3Table.vue'
import { state } from '../lib/store'
import {
  UNIDADE, cenario, curvaEquilibrio, financeiro, idxMes, receitaEmRisco, resumoMes, serieMensal, valorMensal,
} from '../lib/calc'
import { brl, brl0, brlCompact, mesCurto, num, pct } from '../lib/format'

const r = computed(() => resumoMes(state.data, state.mes))
const fin = computed(() => financeiro(state.data))
const meta = computed(() => state.data.metas?.ocupacaoAlvo || 0)
const risco = computed(() => receitaEmRisco(state.data, state.mes, 3))

// ---------- estatísticas descritivas ----------
const est = computed(() => {
  const taxas = r.value.espacos.map((e) => e.taxa)
  const contratos = r.value.espacos.flatMap((e) => e.contratos)
  const receitas = r.value.espacos.map((e) => e.receitaOcupada).sort((a, b) => b - a)
  const total = sum(receitas)
  return {
    media: mean(taxas) || 0,
    mediana: median(taxas) || 0,
    desvio: deviation(taxas) || 0,
    ticket: mean(contratos, valorMensal) || 0,
    top3: total ? sum(receitas.slice(0, 3)) / total : 0,
    nContratos: contratos.length,
  }
})

// ---------- projeção 12 meses ----------
const proj = computed(() => serieMensal(state.data, state.mes, 0, 11))
const projLabels = computed(() => proj.value.map((p) => mesCurto(p.mes)))
const projSeries = computed(() => {
  const s = [
    { key: 'firme', label: 'Confirmada + base', color: 'var(--s-firm)', values: proj.value.map((p) => p.receitaConfirmada) },
    { key: 'total', label: 'Com propostas', color: 'var(--s-prop)', values: proj.value.map((p) => p.receitaOcupada) },
  ]
  if (fin.value.fixos > 0) s.push({ key: 'custos', label: 'Receita de equilíbrio', color: 'var(--s-cost)', values: proj.value.map(() => fin.value.pontoEquilibrio) })
  return s
})
const projResumo = computed(() => {
  const p = proj.value
  return { soma: sum(p, (x) => x.receitaConfirmada), ultimo: p[p.length - 1].receitaConfirmada, primeiro: p[0].receitaConfirmada }
})

// ---------- cenário ----------
const alvoPct = ref(Math.round(meta.value * 100))
const alvo = computed(() => alvoPct.value / 100)
const cen = computed(() => cenario(state.data, state.mes, alvo.value))
const curva = computed(() => curvaEquilibrio(state.data, state.mes))
const cenColunas = [
  { key: 'nome', label: 'Espaço', hint: 'Nome da sala ou área cadastrada em Espaços.' },
  { key: 'taxa', label: 'Hoje', num: true, format: pct, bar: true, hint: 'Taxa de ocupação atual: Ocupado ÷ Capacidade no mês de referência.' },
  { key: 'taxaCenario', label: 'Cenário', num: true, format: pct, bar: true, hint: 'A maior entre a ocupação de hoje e a meta escolhida no controle acima. Espaços já acima da meta não mudam.' },
  { key: 'unidades', label: 'A vender', num: true, format: (v) => (v ? num(v) : '—'), hint: 'Taxa do cenário × Capacidade − Ocupado. Quanto falta vender para chegar ao cenário.' },
  { key: 'unidadeTxt', label: 'Unidade', hint: 'Unidade da coluna A vender, conforme a modalidade: horas, turnos ou contratos.' },
  { key: 'adicional', label: 'Receita adicional', num: true, format: brl, hint: 'Receita no cenário − Receita de hoje. A receita no cenário é Taxa do cenário × Potencial, nunca menor que a receita de hoje.' },
]
const cenLinhas = computed(() =>
  cen.value.espacos.map((e) => ({
    ...e,
    unidades: Math.max(0, +(e.taxaCenario * e.capacidade - e.ocupado).toFixed(2)),
    unidadeTxt: UNIDADE[e.modalidade],
    adicional: e.receitaCenario - e.receitaOcupada,
  })),
)

// ---------- tabela por espaço ----------
const espColunas = [
  { key: 'nome', label: 'Espaço', hint: 'Nome da sala ou área cadastrada em Espaços.' },
  { key: 'taxa', label: 'Ocupação', num: true, format: pct, bar: true, hint: 'Ocupado ÷ Capacidade no mês de referência.' },
  { key: 'receitaOcupada', label: 'Receita/mês', num: true, format: brl, hint: 'Soma de Quantidade × Preço de cada contrato vigente no mês.' },
  { key: 'despesas', label: 'Despesas/mês', num: true, format: brl, hint: 'Soma das despesas mensais cadastradas no espaço.' },
  { key: 'margem', label: 'Margem', num: true, format: (v) => (v === null ? '—' : pct(v)), hint: '(Receita − Despesas) ÷ Receita. Fica em branco quando o espaço não tem receita.' },
  { key: 'participacao', label: '% da receita', num: true, format: pct, bar: true, hint: 'Receita do espaço ÷ Receita total da clínica no mês.' },
  { key: 'nVig', label: 'Contratos', num: true, format: num, hint: 'Número de contratos vigentes no mês, exceto os cancelados.' },
  { key: 'vence', label: 'Próximo término', num: true, format: (v) => (v === null ? '—' : v === 0 ? 'este mês' : `em ${v} ${v === 1 ? 'mês' : 'meses'}`), hint: 'Meses até o primeiro contrato do espaço terminar, contando do mês de referência. Contratos sem data de fim não entram.' },
]
const espLinhas = computed(() => {
  const total = r.value.receitaOcupada
  const m = idxMes(state.mes)
  return r.value.espacos.map((e) => {
    const fins = e.contratos.filter((c) => c.fim).map((c) => idxMes(c.fim) - m)
    return {
      ...e,
      margem: e.receitaOcupada ? (e.receitaOcupada - e.despesas) / e.receitaOcupada : null,
      participacao: total ? e.receitaOcupada / total : 0,
      nVig: e.contratos.length,
      vence: fins.length ? Math.min(...fins) : null,
    }
  })
})
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile label="Ocupação média dos espaços" :value="pct(est.media)">
        Mediana {{ pct(est.mediana) }} · desvio padrão {{ pct(est.desvio) }}
      </StatTile>
      <StatTile label="Ticket médio por contrato" :value="brl(est.ticket)" :hint="`${est.nContratos} contratos vigentes no mês`" />
      <StatTile label="Concentração da receita" :value="pct(est.top3)" hint="Parte da receita que vem dos 3 maiores espaços" />
      <StatTile label="Receita que vence em 3 meses" :value="brl(risco.valor)" :tone="risco.valor ? 'bad' : ''"
        :hint="risco.contratos.length ? `${risco.contratos.length} contrato(s) com término próximo` : 'Nenhum contrato com término próximo'" />
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Projeção dos próximos 12 meses</h2>
          <p>Receita garantida pelos contratos vigentes. Contratos sem término seguem na projeção; os com término saem dela.</p>
        </div>
        <div class="proj-sum small">
          <span class="muted">Soma em 12 meses (confirmada + base)</span>
          <strong class="tnum">{{ brl0(projResumo.soma) }}</strong>
        </div>
      </div>
      <D3Lines :labels="projLabels" :series="projSeries" :format="brl" :axis-format="brlCompact" />
      <p v-if="!fin.fixos" class="small muted foot">Cadastre os custos em Financeiro ou as despesas dos espaços para ver a linha de custos.</p>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Linha do tempo dos contratos</h2>
          <p>3 meses antes e 12 depois do mês de referência. Passe o mouse para ver duração e valor total.</p>
        </div>
      </div>
      <D3Gantt :espacos="state.data.espacos" :contratos="state.data.contratos" :mes="state.mes" />
    </section>

    <section class="grid cols-2">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Potencial × ocupação</h2>
            <p>Espaços que valem muito e estão vazios aparecem no canto inferior direito</p>
          </div>
        </div>
        <D3Quadrant :espacos="r.espacos" :meta="meta" />
      </div>
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Resultado por nível de ocupação</h2>
            <p>Estimativa: receita × margem − custos fixos e despesas dos espaços</p>
          </div>
        </div>
        <D3Curve :curva="curva" :alvo="alvo" />
        <p v-if="!fin.fixos" class="small muted foot">Sem custos cadastrados, o resultado é igual à receita. Preencha Financeiro para ver o ponto de equilíbrio.</p>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Simulador de cenário</h2>
          <p>E se todos os espaços abaixo de uma ocupação chegassem a ela?</p>
        </div>
      </div>
      <div class="sim">
        <label class="field slider">Ocupação mínima de cada espaço: <strong class="tnum">{{ alvoPct }}%</strong>
          <input v-model.number="alvoPct" type="range" min="0" max="100" step="5" />
        </label>
        <div class="grid cols-3 sim-tiles">
          <StatTile label="Receita mensal estimada" :value="brl(cen.receita)" :hint="`Hoje: ${brl(r.receitaOcupada)}`" />
          <StatTile label="Receita adicional" :value="'+' + brl(cen.adicional)" tone="good" :hint="`${brl0(cen.adicional * 12)} em 12 meses`" />
          <StatTile label="Resultado mensal estimado" :value="brl(cen.resultado)" :tone="cen.resultado >= 0 ? 'good' : 'bad'" :hint="`Hoje: ${brl(cen.resultadoAtual)}`" />
        </div>
      </div>
      <D3Table :columns="cenColunas" :rows="cenLinhas" sort-key="adicional" />
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Indicadores por espaço</h2>
          <p>Clique no cabeçalho para ordenar</p>
        </div>
      </div>
      <D3Table :columns="espColunas" :rows="espLinhas" sort-key="receitaOcupada" />
    </section>
  </div>
</template>

<style scoped>
.proj-sum { display: grid; text-align: right; }
.proj-sum strong { font-size: 18px; }
.foot { margin: 8px 0 0; }
.sim { display: grid; gap: 16px; margin-bottom: 16px; }
.slider { max-width: 420px; font-size: 13px; }
.slider input { padding: 0; height: 24px; border: 0; accent-color: var(--accent); }
.sim-tiles :deep(.card) { background: var(--surface-2); border: 0; box-shadow: none; }
</style>
