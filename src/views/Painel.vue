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

// receita que os turnos não disponíveis deixam de gerar, por espaço
const bloqueios = computed(() =>
  r.value.espacos.filter((e) => e.receitaBloqueada > 0).sort((a, b) => b.receitaBloqueada - a.receitaBloqueada).map((e) => ({
    label: e.nome,
    href: `#/espacos/${e.id}`,
    sub: `${num(e.bloqueado)} ${UNIDADE[e.modalidade]} não disponíveis`,
    value: e.receitaBloqueada,
    rows: [
      { label: 'Não disponíveis', value: `${num(e.bloqueado)} de ${num(e.capacidadeInstalada)} ${UNIDADE[e.modalidade]}` },
      { label: 'Preço unitário', value: brl(e.preco) },
      { label: 'Receita não realizada', value: brl(e.receitaBloqueada) },
    ],
  })),
)
const oportunidades = computed(() =>
  [...r.value.espacos]
    .filter((e) => e.receitaDisponivel > 0)
    .sort((a, b) => b.receitaDisponivel - a.receitaDisponivel)
    .map((e) => ({
      label: e.nome,
      href: `#/espacos/${e.id}`,
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

// Mês de referência no título da tabela, ex.: "Nov-2026"
const MES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const mesTitulo = computed(() => {
  const [y, m] = state.mes.split('-').map(Number)
  return `${MES_ABREV[m - 1]}-${y}`
})

// Margem de contribuição: verde = sala mensal, amarelo = hora ou turno, vermelho = zero ou negativa
function tomResultado(e) {
  if (e.resultado <= 0) return { c: 'bad', t: 'Margem de contribuição zero ou negativa' }
  if (e.modalidade === 'Mensal') return { c: 'good', t: 'Margem de contrato mensal' }
  return { c: 'warn', t: `Margem de locação por ${e.modalidade === 'Hora' ? 'hora' : 'turno'}` }
}
// Nomes da contabilidade de custos; o popup de cada coluna resume o cálculo
const colunas = [
  { key: 'nome', label: 'Espaço', link: (e) => `#/espacos/${e.id}`, hint: 'Sala ou área cadastrada em Centros de custo. É o centro de custo de cada linha. Clique no nome para abrir a página do espaço: agenda, histórico e movimentação.' },
  { key: 'modalidade', label: 'Modalidade', hint: 'Forma de locação: por hora, por turno ou contrato mensal. Define a unidade das colunas de capacidade.' },
  { key: 'capacidade', label: 'Capacidade\nem aberto', num: true, format: num, hint: 'Quantas unidades o espaço pode locar neste mês. Salas e piscina: turnos (ou horas) da agenda no calendário do mês, menos os turnos não disponíveis. Contrato mensal e administrativo: valor cadastrado.' },
  { key: 'ocupado', label: 'Capacidade\nutilizada', num: true, format: num, hint: 'Soma das quantidades dos contratos vigentes no mês (confirmados, base inicial e propostas). Contratos cancelados ficam de fora.' },
  { key: 'disponivel', label: 'Capacidade\nociosa', num: true, format: num, hint: 'Capacidade instalada − Capacidade utilizada. Nunca fica abaixo de zero.' },
  { key: 'taxa', label: 'Taxa de\nOcupação', num: true, format: pct, bar: true, hint: 'Capacidade utilizada ÷ Capacidade instalada.\nNa linha Total, a taxa é ponderada pela receita: Receita bruta ÷ Receita potencial, porque horas, turnos e contratos não se somam.' },
  { key: 'potencial', label: 'Receita\npotencial', num: true, format: brl0, hint: 'Capacidade instalada × Preço da unidade. É o faturamento do mês com o espaço 100% ocupado.' },
  { key: 'receitaOcupada', label: 'Receita bruta\n(faturamento)', num: true, format: brl0, hint: 'Soma de Quantidade × Preço de cada contrato vigente no mês, antes de impostos e custos.' },
  { key: 'despesas', label: 'Custos\ndiretos', num: true, format: brl0, hint: 'Custos mensais lançados no próprio espaço (ex.: aquecimento da piscina). Custos fixos gerais, impostos e comissões ficam no Financeiro.' },
  { key: 'resultado', label: 'Margem de\ncontribuição', num: true, format: brl0, tone: tomResultado, hint: 'Receita bruta − Custos diretos do espaço. É quanto o espaço contribui para pagar os custos fixos gerais e gerar lucro.\nVerde: contrato mensal. Amarelo: locação por hora ou turno. Vermelho: zero ou negativa.' },
  { key: 'receitaDisponivel', label: 'Receita\nociosa', num: true, format: brl0, hint: 'Capacidade ociosa × Preço da unidade. Faturamento que ainda pode ser vendido neste mês.' },
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
        {{ r.espacosVazios }} de {{ r.espacos.length }} espaços sem nenhum contrato<template v-if="r.receitaBloqueada > 0"> · {{ brl0(r.receitaBloqueada) }} perdidos com turnos não disponíveis</template>
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
            <p>Unidades contratadas sobre os turnos em aberto de cada espaço (os não disponíveis ficam de fora)</p>
          </div>
        </div>
        <D3Occupancy :espacos="r.espacos" :meta="meta" />
      </div>
      <div class="card">
        <div class="card-head"><h2>Leitura rápida</h2></div>
        <ul class="facts">
          <li><span class="chip good">Lotados</span>
            <span v-if="cheios.length"><template v-for="(e, i) in cheios" :key="e.id">{{ i ? ', ' : '' }}<RouterLink :to="`/espacos/${e.id}`" class="lk">{{ e.nome }}</RouterLink></template></span>
            <span v-else>Nenhum espaço com 100%</span></li>
          <li><span class="chip warn">Abaixo da meta</span>
            <span v-if="abaixoMeta.length"><template v-for="(e, i) in abaixoMeta" :key="e.id">{{ i ? ', ' : '' }}<RouterLink :to="`/espacos/${e.id}`" class="lk">{{ e.nome }}</RouterLink> ({{ pct(e.taxa) }})</template></span>
            <span v-else>Nenhum</span></li>
          <li><span class="chip bad">Sem contratos</span>
            <span v-if="vazios.length"><template v-for="(e, i) in vazios" :key="e.id">{{ i ? ', ' : '' }}<RouterLink :to="`/espacos/${e.id}`" class="lk">{{ e.nome }}</RouterLink></template></span>
            <span v-else>Todos têm contratos</span></li>
          <li v-if="oportunidades[0]"><span class="chip info">Maior oportunidade</span>
            <span><a :href="oportunidades[0].href" class="lk">{{ oportunidades[0].label }}</a>: {{ brl(oportunidades[0].value) }} livres no mês</span></li>
          <li><span class="chip plain">Não disponíveis</span>
            <span v-if="bloqueios.length">{{ brl(r.receitaBloqueada) }} de receita não realizada em {{ bloqueios.length }} {{ bloqueios.length === 1 ? 'espaço' : 'espaços' }}</span>
            <span v-else>Nenhum turno bloqueado no mês</span></li>
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
            <p>Receita disponível por espaço (turnos em aberto ainda livres × preço)</p>
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
          <h2>Turnos não disponíveis ({{ mesTitulo }})</h2>
          <p>Turnos que a administração tirou da locação. Não entram na ocupação nem na receita potencial; aqui fica quanto deixam de render.</p>
        </div>
        <strong class="tnum perda">{{ brl(r.receitaBloqueada) }}</strong>
      </div>
      <D3HBar v-if="bloqueios.length" :items="bloqueios" :format="brl0" aria-label="Receita não realizada por turnos não disponíveis" />
      <p v-else class="muted small">Nenhum turno marcado como não disponível neste mês.</p>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Demonstrativo de margem de contribuição ({{ mesTitulo }})</h2>
          <p>Por espaço (centro de custo) · clique no cabeçalho para ordenar</p>
        </div>
      </div>
      <D3Table :columns="colunas" :rows="r.espacos" :footer="rodape" sort-key="receitaDisponivel" compact />
      <p class="tone-legend small">
        Margem de contribuição:
        <span class="tone good">verde</span> contrato mensal ·
        <span class="tone warn">amarelo</span> locação por hora ou turno ·
        <span class="tone bad">vermelho</span> zero ou negativa
      </p>
    </section>
  </div>
</template>

<style scoped>
.facts { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 14px; }
.facts li { display: grid; gap: 4px; justify-items: start; color: var(--text-2); }
.lk { font-weight: 500; text-decoration: none; }
.perda { font-size: 22px; font-weight: 600; color: var(--bad); }
.lk:hover { text-decoration: underline; }
.tone-legend { margin: 12px 0 0; color: var(--text-2); line-height: 2; }
.tone-legend .tone { font-weight: 500; }
</style>
