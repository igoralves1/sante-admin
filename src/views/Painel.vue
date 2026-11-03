<script setup>
import { computed } from 'vue'
import StatTile from '../components/StatTile.vue'
import OccupancyMeters from '../components/OccupancyMeters.vue'
import HBarChart from '../components/HBarChart.vue'
import ColumnChart from '../components/ColumnChart.vue'
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
  serieMensal(state.data, state.mes, 6).map((p) => ({
    label: mesCurto(p.mes),
    value: p.receitaOcupada,
    current: p.mes === state.mes,
    rows: [
      { label: 'Receita ocupada', value: brl(p.receitaOcupada) },
      { label: 'Confirmada + base', value: brl(p.receitaConfirmada) },
      { label: 'Ocupação (receita)', value: pct(p.taxa) },
    ],
  })),
)
const refs = computed(() => [
  { value: fin.value.pontoEquilibrio, label: `Ponto de equilíbrio ${brlCompact(fin.value.pontoEquilibrio)}` },
  { value: r.value.potencial * meta.value, label: `Meta ${pct(meta.value)} · ${brlCompact(r.value.potencial * meta.value)}` },
])

const cheios = computed(() => r.value.espacos.filter((e) => e.taxa >= 1))
const vazios = computed(() => r.value.espacos.filter((e) => e.ocupado === 0))
const abaixoMeta = computed(() => r.value.espacos.filter((e) => e.taxa > 0 && e.taxa < meta.value))
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
        {{ r.espacosVazios }} de {{ r.espacos.length }} espaços sem nenhuma reserva
      </StatTile>
      <StatTile v-if="fin.fixos > 0" label="Distância do ponto de equilíbrio" :value="(gapPE >= 0 ? '+' : '') + brl(gapPE)" :tone="gapPE >= 0 ? 'good' : 'bad'">
        {{ gapPE >= 0 ? 'Acima' : 'Abaixo' }} de {{ brl0(fin.pontoEquilibrio) }} necessários
      </StatTile>
      <StatTile v-else label="Ponto de equilíbrio" value="—">
        <RouterLink to="/financeiro">Informe os custos fixos</RouterLink> para calcular
      </StatTile>
    </section>

    <section class="grid cols-3">
      <div class="card span-2">
        <div class="card-head">
          <div>
            <h2>Ocupação por espaço</h2>
            <p>Unidades vendidas sobre a capacidade mensal de cada espaço</p>
          </div>
        </div>
        <OccupancyMeters :espacos="r.espacos" :meta="meta" />
      </div>
      <div class="card">
        <div class="card-head"><h2>Leitura rápida</h2></div>
        <ul class="facts">
          <li>
            <span class="chip good">Lotados</span>
            <span>{{ cheios.length ? cheios.map((e) => e.nome).join(', ') : 'Nenhum espaço com 100%' }}</span>
          </li>
          <li>
            <span class="chip warn">Abaixo da meta</span>
            <span>{{ abaixoMeta.length ? abaixoMeta.map((e) => `${e.nome} (${pct(e.taxa)})`).join(', ') : 'Nenhum' }}</span>
          </li>
          <li>
            <span class="chip bad">Sem reservas</span>
            <span>{{ vazios.length ? vazios.map((e) => e.nome).join(', ') : 'Todos têm reservas' }}</span>
          </li>
          <li v-if="oportunidades[0]">
            <span class="chip info">Maior oportunidade</span>
            <span>{{ oportunidades[0].label }}: {{ brl(oportunidades[0].value) }} livres no mês</span>
          </li>
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
        <HBarChart :items="oportunidades" :format="brl0" />
      </div>
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Receita ocupada por mês</h2>
            <p>Últimos 6 meses até o mês selecionado</p>
          </div>
        </div>
        <ColumnChart :points="serie" :refs="refs" :axis-format="brlCompact" />
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Tabela do mês</h2>
          <p>Mesmos números dos gráficos, como na aba Painel da planilha</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Espaço</th><th>Modalidade</th><th class="num">Capacidade</th><th class="num">Ocupado</th>
              <th class="num">Disponível</th><th class="num">Taxa</th><th class="num">Preço</th>
              <th class="num">Potencial</th><th class="num">Receita ocupada</th><th class="num">Receita disponível</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in r.espacos" :key="e.id">
              <td>{{ e.nome }}</td><td>{{ e.modalidade }}</td>
              <td class="num">{{ num(e.capacidade) }}</td><td class="num">{{ num(e.ocupado) }}</td>
              <td class="num">{{ num(e.disponivel) }}</td><td class="num">{{ pct(e.taxa) }}</td>
              <td class="num">{{ brl(e.preco) }}</td><td class="num">{{ brl(e.potencial) }}</td>
              <td class="num">{{ brl(e.receitaOcupada) }}</td><td class="num">{{ brl(e.receitaDisponivel) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5">Total</td><td class="num">{{ pct(r.taxaReceita) }}</td><td />
              <td class="num">{{ brl(r.potencial) }}</td><td class="num">{{ brl(r.receitaOcupada) }}</td>
              <td class="num">{{ brl(r.receitaDisponivel) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.facts { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 14px; }
.facts li { display: grid; gap: 4px; justify-items: start; color: var(--text-2); }
</style>
