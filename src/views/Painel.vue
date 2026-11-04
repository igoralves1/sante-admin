<script setup>
import { computed } from 'vue'
import StatTile from '../components/StatTile.vue'
import D3Occupancy from '../components/d3/D3Occupancy.vue'
import D3HBar from '../components/d3/D3HBar.vue'
import D3Columns from '../components/d3/D3Columns.vue'
import D3Table from '../components/d3/D3Table.vue'
import { state } from '../lib/store'
import { resumoMes, financeiro, serieMensal, UNIDADE } from '../lib/calc'
import { brl, brl0, brlCompact, num, pct, mesCurto } from '../lib/format'

const r = computed(() => resumoMes(state.data, state.mes))
const fin = computed(() => financeiro(state.data))
const meta = computed(() => state.data.metas?.ocupacaoAlvo || 0)
const gapPE = computed(() => r.value.receitaConfirmada - fin.value.pontoEquilibrio)

const oportunidades = computed(() =>
  [...r.value.espacos]
    .filter((e) => e.receitaDisponivel > 0)
    .sort((a, b) => b.receitaDisponivel - a.receitaDisponivel)
    .map((e) => ({
      label: e.nome,
      sub: `${num(e.disponivel)} ${UNIDADE[e.modalidade]} livres`,
      value: e.receitaDisponivel,
      rows: [
        { label: 'Disponível', value: `${num(e.disponivel)} ${UNIDADE[e.modalidade]}` },
        { label: 'Preço unitário', value: brl(e.preco) },
        { label: 'Receita disponível', value: brl(e.receitaDisponivel) },
      ],
    })),
)

const serie = computed(() =>
  serieMensal(state.data, state.mes, 5, 6).map((p) => ({
    label: mesCurto(p.mes),
    value: p.receitaOcupada,
    futuro: p.offset > 0,
    atual: p.offset === 0,
    rows: [
      { label: p.offset > 0 ? 'Contratado (vigentes)' : 'Receita ocupada', value: brl(p.receitaOcupada) },
      { label: 'Confirmada + base', value: brl(p.receitaConfirmada) },
      { label: 'Ocupação (receita)', value: pct(p.taxa) },
    ],
  })),
)
const refs = computed(() => [
  { value: fin.value.pontoEquilibrio, label: `Equilíbrio ${brlCompact(fin.value.pontoEquilibrio)}` },
  { value: r.value.potencial * meta.value, label: `Meta ${pct(meta.value)} · ${brlCompact(r.value.potencial * meta.value)}` },
])

const cheios = computed(() => r.value.espacos.filter((e) => e.taxa >= 1))
const vazios = computed(() => r.value.espacos.filter((e) => e.ocupado === 0))
const abaixoMeta = computed(() => r.value.espacos.filter((e) => e.taxa > 0 && e.taxa < meta.value))

// Resultado: verde = ganho de sala mensal, amarelo = outro ganho, vermelho = zero ou negativo
function tomResultado(e) {
  if (e.resultado <= 0) return { c: 'bad', t: 'Sem ganho neste mês' }
  if (e.modalidade === 'Mensal') return { c: 'good', t: 'Ganho de contrato mensal' }
  return { c: 'warn', t: `Ganho por ${e.modalidade === 'Hora' ? 'hora' : 'turno'}` }
}
const colunas = [
  { key: 'nome', label: 'Espaço', hint: 'Nome da sala ou área cadastrada em Espaços.' },
  { key: 'modalidade', label: 'Modalidade', hint: 'Como o espaço é alugado: por hora, por turno ou por contrato mensal. Define a unidade das colunas de capacidade, ocupado e disponível.' },
  { key: 'capacidade', label: 'Capacidade', num: true, format: num, hint: 'Quantas unidades o espaço pode vender no mês: horas, turnos ou contratos. Valor cadastrado em Espaços.' },
  { key: 'ocupado', label: 'Ocupado', num: true, format: num, hint: 'Soma das quantidades dos contratos vigentes no mês (confirmados, base inicial e propostas). Contratos cancelados ficam de fora.' },
  { key: 'disponivel', label: 'Disponível', num: true, format: num, hint: 'Capacidade − Ocupado. Nunca fica abaixo de zero.' },
  { key: 'taxa', label: 'Taxa de\nOcupação', num: true, format: pct, bar: true, hint: 'Ocupado ÷ Capacidade.\nNa linha Total, a taxa é ponderada pela receita: Receita total ÷ Potencial total, porque horas, turnos e contratos não se somam.' },
  { key: 'potencial', label: 'Potencial', num: true, format: brl, hint: 'Capacidade × Preço da unidade. É a receita do mês com o espaço 100% ocupado.' },
  { key: 'receitaOcupada', label: 'Receita', num: true, format: brl, hint: 'Soma de Quantidade × Preço de cada contrato vigente no mês.' },
  { key: 'despesas', label: 'Despesas', num: true, format: brl, hint: 'Soma das despesas mensais cadastradas no próprio espaço. Custos gerais da clínica ficam no Financeiro.' },
  { key: 'resultado', label: 'Resultado', num: true, format: brl, tone: tomResultado, hint: 'Receita − Despesas do espaço.\nVerde: ganho de sala mensal. Amarelo: ganho por hora ou turno. Vermelho: zero ou negativo.' },
  { key: 'receitaDisponivel', label: 'Disponível R$', num: true, format: brl, hint: 'Disponível × Preço da unidade. É a receita que ainda pode ser vendida neste mês.' },
]
const rodape = computed(() => ({
  nome: 'Total',
  taxa: pct(r.value.taxaReceita),
  potencial: r.value.potencial,
  receitaOcupada: r.value.receitaOcupada,
  despesas: r.value.despesasEspacos,
  resultado: r.value.receitaOcupada - r.value.despesasEspacos,
  receitaDisponivel: r.value.receitaDisponivel,
}))
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile hero label="Ocupação ponderada pela receita" :value="pct(r.taxaReceita)">
        {{ brl0(r.receitaOcupada) }} de {{ brl0(r.potencial) }} de potencial
      </StatTile>
      <StatTile label="Receita ocupada no mês" :value="brl(r.receitaOcupada)">
        Confirmada + base: {{ brl(r.receitaConfirmada) }}<template v-if="r.receitaProposta > 0"> · em proposta: {{ brl(r.receitaProposta) }}</template>
      </StatTile>
      <StatTile label="Receita disponível para vender" :value="brl(r.receitaDisponivel)">
        {{ r.espacosVazios }} de {{ r.espacos.length }} espaços sem nenhum contrato
      </StatTile>
      <StatTile v-if="fin.fixos > 0" label="Distância do ponto de equilíbrio" :value="(gapPE >= 0 ? '+' : '') + brl(gapPE)" :tone="gapPE >= 0 ? 'good' : 'bad'">
        {{ gapPE >= 0 ? 'Acima' : 'Abaixo' }} de {{ brl0(fin.pontoEquilibrio) }} necessários
      </StatTile>
      <StatTile v-else label="Ponto de equilíbrio" value="—">
        <RouterLink to="/financeiro">Informe os custos</RouterLink> para calcular
      </StatTile>
    </section>

    <section class="grid cols-3">
      <div class="card span-2">
        <div class="card-head">
          <div>
            <h2>Ocupação por espaço</h2>
            <p>Unidades contratadas sobre a capacidade mensal de cada espaço</p>
          </div>
        </div>
        <D3Occupancy :espacos="r.espacos" :meta="meta" />
      </div>
      <div class="card">
        <div class="card-head"><h2>Leitura rápida</h2></div>
        <ul class="facts">
          <li><span class="chip good">Lotados</span>
            <span>{{ cheios.length ? cheios.map((e) => e.nome).join(', ') : 'Nenhum espaço com 100%' }}</span></li>
          <li><span class="chip warn">Abaixo da meta</span>
            <span>{{ abaixoMeta.length ? abaixoMeta.map((e) => `${e.nome} (${pct(e.taxa)})`).join(', ') : 'Nenhum' }}</span></li>
          <li><span class="chip bad">Sem contratos</span>
            <span>{{ vazios.length ? vazios.map((e) => e.nome).join(', ') : 'Todos têm contratos' }}</span></li>
          <li v-if="oportunidades[0]"><span class="chip info">Maior oportunidade</span>
            <span>{{ oportunidades[0].label }}: {{ brl(oportunidades[0].value) }} livres no mês</span></li>
        </ul>
        <div class="note small">
          Horas, turnos e contratos mensais são unidades diferentes. Por isso a ocupação geral é
          ponderada pela receita; compare os espaços pela taxa de cada um.
        </div>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Onde está o dinheiro parado</h2>
            <p>Receita disponível por espaço (capacidade livre × preço)</p>
          </div>
        </div>
        <D3HBar :items="oportunidades" :format="brl0" aria-label="Receita disponível por espaço" />
      </div>
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Receita por mês</h2>
            <p>5 meses antes e 6 depois do mês de referência</p>
          </div>
        </div>
        <D3Columns :points="serie" :refs="refs" :axis-format="brlCompact" />
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Tabela do mês</h2>
          <p>Clique no cabeçalho para ordenar</p>
        </div>
      </div>
      <D3Table :columns="colunas" :rows="r.espacos" :footer="rodape" sort-key="receitaDisponivel" />
      <p class="tone-legend small">
        Resultado:
        <span class="tone good">verde</span> ganho de sala mensal ·
        <span class="tone warn">amarelo</span> ganho por hora ou turno ·
        <span class="tone bad">vermelho</span> sem ganho
      </p>
    </section>
  </div>
</template>

<style scoped>
.facts { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 14px; }
.facts li { display: grid; gap: 4px; justify-items: start; color: var(--text-2); }
.tone-legend { margin: 12px 0 0; color: var(--text-2); line-height: 2; }
.tone-legend .tone { font-weight: 500; }
</style>
