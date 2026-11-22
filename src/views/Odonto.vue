<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatTile from '../components/StatTile.vue'
import Icon from '../components/Icon.vue'
import D3Lines from '../components/d3/D3Lines.vue'
import {
  CENARIOS, FIXOS, MONTAGEM, PADRAO, SEMANAS_MES, SERVICO, fixoPadrao, investimentoPadrao, simularAluguel, simularServico,
} from '../lib/odonto'
import {
  resumo, servicos, alugueis, concorrentes, precos, swot, estrategiasSwot, etapas, criterios, exigencias, marketing, fontes,
  recemFormados, alternativas, comparativo, sinergias, vantagens, ofertaRecem, cuidadosPoli, buzz,
} from '../data/odonto'
import { brl0, brlCompact } from '../lib/format'

const route = useRoute()
const router = useRouter()
const ABAS = [
  { k: 'resumo', t: 'Visão geral' },
  { k: 'concorrencia', t: 'Concorrência' },
  { k: 'swot', t: 'SWOT' },
  { k: 'recem', t: 'Recém-formados e policlínica' },
  { k: 'buzz', t: 'Marketing e buzz' },
  { k: 'plano', t: 'Planejamento' },
  { k: 'financas', t: 'Finanças' },
  { k: 'regras', t: 'Regras e exigências' },
]
const aba = ref(ABAS.some((a) => a.k === route.query.aba) ? route.query.aba : 'resumo')
watch(aba, (v) => v !== route.query.aba && router.replace({ query: { ...route.query, aba: v } }))
watch(() => route.query.aba, (v) => ABAS.some((a) => a.k === v) && (aba.value = v))

const n1 = (v) => (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
const pct0 = (v) => `${Math.round((v || 0) * 100)}%`
const meses = (m) => (m ? `${m} meses` : 'mais de 36 meses')

// ---------- finanças ----------
const p = reactive({ ...PADRAO })
const sim = reactive({ ...CENARIOS.base })
const cenSel = ref('base')
function usar(k) {
  cenSel.value = k
  Object.assign(sim, CENARIOS[k])
}
const resultados = computed(() => Object.fromEntries(Object.entries(CENARIOS).map(([k, c]) => [k, simularAluguel(c, { ...p })])))
const meu = computed(() => simularAluguel({ ...sim }, { ...p }))
const base = computed(() => resultados.value.base)
// turnos por semana para pagar o investimento em 36 meses, no preço escolhido
const turnosPara = (mesesAlvo, preco) => (p.investimento / mesesAlvo + p.fixo + p.oportunidade) / (SEMANAS_MES * Math.max(1, preco - p.variavelTurno))
const caixa = computed(() => ({
  labels: Array.from({ length: p.meses }, (_, i) => `${i + 1}`),
  series: [
    { key: 'c', label: 'Conservador', color: 'var(--s-cost)', values: resultados.value.conservador.rows.map((r) => r.acum) },
    { key: 'b', label: 'Base', color: 'var(--s-firm)', values: resultados.value.base.rows.map((r) => r.acum) },
    { key: 'p', label: 'Policlínica', color: 'var(--g-mercado)', values: resultados.value.policlinica.rows.map((r) => r.acum) },
    { key: 'o', label: 'Otimista', color: 'var(--good)', values: resultados.value.otimista.rows.map((r) => r.acum) },
  ],
}))
const servico = computed(() => [2, 4, 6].map((t) => ({ t, ...simularServico(t, SERVICO, { ...p }) })))
const controles = [
  { k: 'precoTurno', t: 'Preço do turno de 4 h', min: 120, max: 500, step: 10, f: brl0 },
  { k: 'turnosIni', t: 'Turnos por semana no início', min: 1, max: 8, step: 1, f: (v) => `${v}` },
  { k: 'turnosFim', t: 'Turnos por semana depois da rampa', min: 1, max: 10, step: 1, f: (v) => `${v}` },
  { k: 'rampa', t: 'Mês em que chega ao final', min: 1, max: 12, step: 1, f: (v) => `${v}º mês` },
  { k: 'cirurgias', t: 'Cirurgias Tipo I por mês (a partir do 4º)', min: 0, max: 10, step: 1, f: (v) => `${v}` },
  { k: 'taxaCirurgia', t: 'Taxa de sala por cirurgia', min: 0, max: 800, step: 50, f: brl0 },
]
const ctrlCustos = [
  { k: 'investimento', t: 'Investimento', min: 40000, max: 120000, step: 5000, f: brl0 },
  { k: 'fixo', t: 'Custo fixo mensal da sala', min: 500, max: 4000, step: 100, f: brl0 },
  { k: 'variavelTurno', t: 'Custo por turno', min: 0, max: 150, step: 5, f: brl0 },
  { k: 'oportunidade', t: 'Receita que a sala daria como consultório comum', min: 0, max: 3000, step: 100, f: brl0 },
]
// pacientes por mês que a odontologia traz para dentro da casa (3,5 por turno)
const PAC_TURNO = 3.5
const pacientesMes = (k) => Math.round(CENARIOS[k].turnosFim * SEMANAS_MES * PAC_TURNO)
const MARCA = ['✕', '◐', '✓']
const TOM = ['bad', 'warn', 'good']
const tom = (m) => (m && m <= 24 ? 'good' : m && m <= 36 ? '' : 'bad')
</script>

<template>
  <div class="stack">
    <section class="card intro">
      <div class="intro-top">
        <RouterLink to="/marketing" class="btn sm ghost"><Icon name="back" :size="14" /> Comercial</RouterLink>
        <span class="chip warn">Em estudo · nov/2026</span>
      </div>
      <h2>Sala de odontologia estética: harmonização orofacial e cirurgia estética</h2>
      <p class="txt">{{ resumo.ideia }}</p>
      <p class="txt"><strong>A novidade para a cidade.</strong> {{ resumo.novidade }}</p>
      <p class="rec"><Icon name="target" :size="16" /> <span><strong>Recomendação:</strong> {{ resumo.recomendacao }}</span></p>
    </section>

    <section class="grid cols-4 tiles">
      <StatTile label="Investimento da Santé" :value="brl0(investimentoPadrao())" hint="Montagem completa, sala Tipo I" />
      <StatTile label="Payback no cenário base" :value="meses(base.payback)" :tone="tom(base.payback)" :hint="`2 → 4 turnos por semana a ${brl0(CENARIOS.base.precoTurno)}`" />
      <StatTile label="Resultado mensal no 12º mês" :value="brl0(base.resultadoMes12)" :tone="base.resultadoMes12 > 0 ? 'good' : 'bad'" hint="Cenário base, depois dos custos da sala" />
      <StatTile label="Para se pagar em 3 anos" :value="`${n1(turnosPara(36, CENARIOS.base.precoTurno))} turnos/semana`" :hint="`No preço de ${brl0(CENARIOS.base.precoTurno)}; em 2 anos: ${n1(turnosPara(24, CENARIOS.base.precoTurno))}`" />
    </section>

    <div class="abas" role="tablist">
      <button v-for="a in ABAS" :key="a.k" type="button" role="tab" :aria-selected="aba === a.k" :class="{ on: aba === a.k }" @click="aba = a.k">{{ a.t }}</button>
    </div>

    <!-- ===== visão geral ===== -->
    <template v-if="aba === 'resumo'">
      <section class="grid cols-2">
        <div v-for="s in servicos" :key="s.g" class="card serv">
          <h3>{{ s.g }}</h3>
          <ul class="mini-list"><li v-for="i in s.itens" :key="i">{{ i }}</li></ul>
          <p class="status">{{ s.status }}</p>
        </div>
      </section>
      <section class="card">
        <h2>Dois modelos de negócio</h2>
        <div class="grid cols-2 modelos">
          <div class="modelo rec-box">
            <span class="chip good">Recomendado</span>
            <h3>A · Aluguel por turno</h3>
            <p>A Santé monta e mantém a sala e aluga por turno (e por diária para cursos) a dentistas com especialização. O dentista traz o paciente e os produtos e responde pelo procedimento. É o negócio que a casa já sabe fazer, com risco menor para a Santé.</p>
          </div>
          <div class="modelo">
            <span class="chip warn">Mais risco</span>
            <h3>B · Serviço próprio</h3>
            <p>A Santé vende os procedimentos ao paciente e repassa parte ao dentista. A receita é maior, mas a Santé passa a responder pelo atendimento, e precisa de marketing para o paciente final.</p>
          </div>
        </div>
      </section>
    </template>

    <!-- ===== concorrência ===== -->
    <template v-if="aba === 'concorrencia'">
      <section class="card">
        <div class="card-head">
          <div>
            <h2>Quem já oferece harmonização e estética orofacial</h2>
            <p>Busca na internet em nov/2026 (sites, Doctoralia e diretórios). Confirmar endereço e CRO antes de usar.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="lista">
            <thead><tr><th>Quem</th><th>Tipo</th><th>Onde</th><th>O que oferece</th></tr></thead>
            <tbody>
              <tr v-for="c in concorrentes" :key="c.n">
                <td><a :href="c.u" target="_blank" rel="noopener" class="fw">{{ c.n }}</a></td>
                <td class="muted">{{ c.tipo }}</td>
                <td>{{ c.onde }}</td>
                <td class="muted">{{ c.oferta }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <div class="card-head">
          <div>
            <h2>Quem já aluga consultório odontológico</h2>
            <p>Concorrência direta do modelo de aluguel. Anúncios de datas variadas: ligar para confirmar preço e se ainda estão ativos.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="lista">
            <thead><tr><th>Oferta</th><th>Onde</th><th>Preço</th><th>O que inclui</th></tr></thead>
            <tbody>
              <tr v-for="a in alugueis" :key="a.u">
                <td><a :href="a.u" target="_blank" rel="noopener" class="fw">{{ a.n }}</a></td>
                <td>{{ a.onde }}</td>
                <td>{{ a.preco }}</td>
                <td class="muted">{{ a.inclui }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="grid cols-2">
        <div class="card">
          <h2>O que a busca mostra</h2>
          <ul class="bullets">
            <li><strong>Concentração:</strong> a harmonização está no Harmony Trade Center e no The Square Park Office, na Jatiúca, a poucas quadras da Santé.</li>
            <li><strong>Aluguel de turno já existe:</strong> consultório odontológico comum sai por R$ 130 a R$ 200 o turno (Jatiúca, Farol, Ponta Verde, Mangabeiras, Poço, Serraria). A Santé não deve competir nesse preço.</li>
            <li><strong>Sala de estética:</strong> não encontramos sala montada para estética orofacial (maca, foco cirúrgico, kit de emergência) para alugar por turno.</li>
            <li><strong>Cirurgia Tipo I:</strong> nenhum anúncio de sala adequada à Res. 286 para bichectomia, lip lift ou lipo de papada em Maceió.</li>
            <li><strong>Concorrência médica:</strong> dermatologistas e cirurgiões plásticos disputam os mesmos pacientes.</li>
          </ul>
        </div>
        <div class="card">
          <h2>Preços de referência</h2>
          <table class="mini">
            <tbody><tr v-for="x in precos" :key="x.t"><td class="fw">{{ x.t }}</td><td class="muted">{{ x.v }}</td></tr></tbody>
          </table>
          <p class="muted small nota">Faixas de diretórios e tabelas de clínicas; não há pesquisa oficial de preço em Maceió.</p>
        </div>
      </section>
    </template>

    <!-- ===== swot ===== -->
    <template v-if="aba === 'swot'">
      <section class="swot">
        <div class="card q forcas"><h2>Forças</h2><ul class="bullets"><li v-for="x in swot.forcas" :key="x">{{ x }}</li></ul></div>
        <div class="card q fraquezas"><h2>Fraquezas</h2><ul class="bullets"><li v-for="x in swot.fraquezas" :key="x">{{ x }}</li></ul></div>
        <div class="card q oportunidades"><h2>Oportunidades</h2><ul class="bullets"><li v-for="x in swot.oportunidades" :key="x">{{ x }}</li></ul></div>
        <div class="card q ameacas"><h2>Ameaças</h2><ul class="bullets"><li v-for="x in swot.ameacas" :key="x">{{ x }}</li></ul></div>
      </section>
      <section class="card">
        <h2>O que fazer com a SWOT</h2>
        <div class="gaps">
          <div v-for="e in estrategiasSwot" :key="e.q" class="gap"><strong>{{ e.q }}</strong><p>{{ e.d }}</p></div>
        </div>
      </section>
    </template>

    <!-- ===== planejamento ===== -->
    <template v-if="aba === 'plano'">
      <section class="etapas">
        <div v-for="(e, i) in etapas" :key="e.f" class="card etapa">
          <header><span class="n">{{ i + 1 }}</span><div><strong>{{ e.t }}</strong><span class="muted small">{{ e.f }}</span></div></header>
          <ul class="mini-list"><li v-for="x in e.itens" :key="x">{{ x }}</li></ul>
        </div>
      </section>
      <section class="grid cols-2">
        <div class="card">
          <h2>Critérios para comprar os equipamentos</h2>
          <p class="muted small">Só seguir para a montagem se todos estiverem atendidos.</p>
          <ul class="checks">
            <li v-for="c in criterios" :key="c.t"><Icon name="check" :size="15" /><span><strong>{{ c.t }}.</strong> {{ c.d }}</span></li>
          </ul>
        </div>
        <div class="card">
          <h2>Como divulgar para dentistas</h2>
          <ul class="bullets"><li v-for="m in marketing" :key="m.c"><strong>{{ m.c }}.</strong> {{ m.d }}</li></ul>
        </div>
      </section>
    </template>

    <!-- ===== recém-formados e policlínica ===== -->
    <template v-if="aba === 'recem'">
      <section class="card">
        <h2>O dentista recém-formado</h2>
        <p class="txt">{{ recemFormados.intro }}</p>
        <div class="gaps">
          <div v-for="d in recemFormados.dores" :key="d" class="gap dor"><Icon name="alert" :size="14" /><p>{{ d }}</p></div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2>Santé × alternativas do recém-formado</h2>
            <p>✓ atende · ◐ em parte · ✕ não atende. Preços dos anúncios e da pesquisa de mercado; confirmar na pesquisa ativa.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="comp">
            <thead><tr><th>O que importa</th><th v-for="(a, i) in alternativas" :key="a" :class="{ nos: i === 0 }">{{ a }}</th></tr></thead>
            <tbody>
              <tr v-for="r in comparativo" :key="r.c">
                <td class="fw">{{ r.c }}</td>
                <td v-for="(v, i) in r.v" :key="i" :class="{ nos: i === 0 }">
                  <span class="marca" :class="TOM[v[0]]" :aria-label="['não atende', 'em parte', 'atende'][v[0]]">{{ MARCA[v[0]] }}</span>
                  <span class="small">{{ v[1] }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Itens atendidos</td>
                <td v-for="(a, i) in alternativas" :key="a" class="num" :class="{ nos: i === 0 }">{{ comparativo.filter((r) => r.v[i][0] === 2).length }} de {{ comparativo.length }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="grid cols-2">
        <div class="card">
          <h2>A vantagem da Santé</h2>
          <ul class="bullets"><li v-for="v in vantagens" :key="v.t"><strong>{{ v.t }}.</strong> {{ v.d }}</li></ul>
        </div>
        <div class="card">
          <h2>Odontologia dentro da policlínica</h2>
          <p class="muted small">Encaminhamentos naturais entre as áreas que já atendem na Santé.</p>
          <table class="mini">
            <tbody><tr v-for="s in sinergias" :key="s.a"><td class="fw">Dentista ↔ {{ s.a }}</td><td class="muted">{{ s.d }}</td></tr></tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Oferta para o dentista recém-formado</h2>
        <ol class="escada">
          <li v-for="(o, i) in ofertaRecem" :key="o.t">
            <span class="n">{{ i + 1 }}</span>
            <strong>{{ o.t }}</strong>
            <span class="preco">{{ o.p }}</span>
            <span class="muted small">{{ o.d }}</span>
          </li>
        </ol>
        <p class="muted small nota">
          No cenário <strong>Policlínica</strong> (aba Finanças), juntar a estética com a clínica geral de recém-formados leva a sala a
          {{ CENARIOS.policlinica.turnosFim }} turnos por semana e o investimento se paga em {{ meses(resultados.policlinica.payback) }},
          contra {{ meses(resultados.base.payback) }} só com estética.
        </p>
      </section>

      <section class="card">
        <h2>Cuidados</h2>
        <ul class="bullets"><li v-for="c in cuidadosPoli" :key="c.t"><strong>{{ c.t }}.</strong> {{ c.d }}</li></ul>
      </section>
    </template>

    <!-- ===== marketing e buzz ===== -->
    <template v-if="aba === 'buzz'">
      <section class="card">
        <h2>Por que a odontologia ajuda a marca</h2>
        <p class="txt">{{ buzz.tese }}</p>
        <div class="kgrid buzz-k">
          <div><span>Pacientes novos por mês na casa (cenário base)</span><strong>≈ {{ pacientesMes('base') }}</strong></div>
          <div><span>No cenário policlínica</span><strong class="good">≈ {{ pacientesMes('policlinica') }}</strong></div>
          <div><span>Em 12 meses (policlínica)</span><strong>≈ {{ (pacientesMes('policlinica') * 10).toLocaleString('pt-BR') }}</strong></div>
        </div>
        <p class="muted small nota">{{ PAC_TURNO.toLocaleString('pt-BR') }} pacientes por turno; 12 meses contam 10 meses de agenda cheia por causa da rampa. Cada paciente conhece a Santé e pode ser encaminhado para as outras áreas.</p>
      </section>

      <section class="card">
        <h2>O ciclo de crescimento</h2>
        <ol class="ciclo">
          <li v-for="(c, i) in buzz.ciclo" :key="c.t"><span class="n">{{ i + 1 }}</span><div><strong>{{ c.t }}</strong><p>{{ c.d }}</p></div></li>
        </ol>
      </section>

      <section class="card">
        <h2>Como gerar buzz positivo</h2>
        <div class="gaps">
          <div v-for="a in buzz.alavancas" :key="a.t" class="gap"><strong>{{ a.t }}</strong><p>{{ a.d }}</p></div>
        </div>
      </section>

      <section class="grid cols-2">
        <div class="card">
          <h2>Indicadores de crescimento e reputação</h2>
          <table class="mini">
            <tbody>
              <tr v-for="k in buzz.indicadores" :key="k.n">
                <td class="fw">{{ k.n }}</td>
                <td>{{ k.n.startsWith('Pacientes') ? `≈ ${pacientesMes('base')} a ${pacientesMes('policlinica')} por mês` : k.meta }}</td>
                <td class="muted">{{ k.onde }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h2>O que pode virar buzz negativo</h2>
          <ul class="bullets"><li v-for="r in buzz.riscos" :key="r.t"><strong>{{ r.t }}.</strong> {{ r.d }}</li></ul>
        </div>
      </section>
    </template>

    <!-- ===== finanças ===== -->
    <template v-if="aba === 'financas'">
      <section class="grid cols-2">
        <div class="card">
          <h2>Montagem estimada</h2>
          <table class="mini">
            <tbody><tr v-for="m in MONTAGEM" :key="m.k"><td>{{ m.t }}</td><td class="num">{{ brl0(m.v) }}</td></tr></tbody>
            <tfoot><tr><td>Total</td><td class="num">{{ brl0(investimentoPadrao()) }}</td></tr></tfoot>
          </table>
          <p class="muted small nota">Estimativa para distribuir os R$ 70 mil. Pedir 3 cotações por item antes de comprar.</p>
        </div>
        <div class="card">
          <h2>Custos mensais da sala</h2>
          <table class="mini">
            <tbody><tr v-for="f in FIXOS" :key="f.t"><td>{{ f.t }}</td><td class="num">{{ brl0(f.v) }}</td></tr></tbody>
            <tfoot><tr><td>Total fixo</td><td class="num">{{ brl0(fixoPadrao()) }}</td></tr></tfoot>
          </table>
          <p class="muted small nota">Mais {{ brl0(PADRAO.variavelTurno) }} por turno de limpeza, esterilização, energia e descartáveis. Toxina, ácido hialurônico e material do procedimento ficam com o dentista no modelo de aluguel.</p>
        </div>
      </section>

      <section class="card">
        <h2>Modelo A · aluguel por turno: três cenários</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cenário</th><th>Premissas</th><th class="num">Receita no 1º ano</th><th class="num">Resultado no 1º ano</th><th class="num">Resultado no 12º mês</th><th class="num">Payback</th><th class="num">Retorno em 36 meses</th><th class="num">Uso da sala no 12º mês</th></tr></thead>
            <tbody>
              <tr v-for="(c, k) in CENARIOS" :key="k">
                <td class="fw">{{ c.nome }}</td>
                <td class="muted small">{{ c.resumo }} Turno a {{ brl0(c.precoTurno) }}.</td>
                <td class="num">{{ brl0(resultados[k].receitaAno1) }}</td>
                <td class="num">{{ brl0(resultados[k].resultadoAno1) }}</td>
                <td class="num">{{ brl0(resultados[k].resultadoMes12) }}</td>
                <td class="num" :class="tom(resultados[k].payback)">{{ meses(resultados[k].payback) }}</td>
                <td class="num" :class="resultados[k].roi36 >= 0 ? 'good' : 'bad'">{{ pct0(resultados[k].roi36) }}</td>
                <td class="num">{{ pct0(resultados[k].ocupacaoSala) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="sub-h">Caixa acumulado em 36 meses (começa em −{{ brl0(p.investimento) }})</h3>
        <D3Lines :labels="caixa.labels" :series="caixa.series" :format="brl0" :axis-format="brlCompact" />
        <p class="muted small nota">Eixo horizontal: mês desde a abertura. O cenário se paga quando a linha cruza o zero. Uso da sala = turnos vendidos ÷ 13 turnos por semana da agenda da casa.</p>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2>Simulador</h2>
            <p>Mude as premissas e veja o payback. Os custos também mudam a tabela dos cenários.</p>
          </div>
          <div class="seg">
            <button v-for="(c, k) in CENARIOS" :key="k" type="button" :class="{ on: cenSel === k }" @click="usar(k)">{{ c.nome }}</button>
          </div>
        </div>
        <div class="sim">
          <div class="ctrls">
            <label v-for="c in controles" :key="c.k" class="ctrl">
              <span class="ch"><span>{{ c.t }}</span><strong>{{ c.f(sim[c.k]) }}</strong></span>
              <input v-model.number="sim[c.k]" type="range" :min="c.min" :max="c.max" :step="c.step" @input="cenSel = ''" />
            </label>
            <hr />
            <label v-for="c in ctrlCustos" :key="c.k" class="ctrl">
              <span class="ch"><span>{{ c.t }}</span><strong>{{ c.f(p[c.k]) }}</strong></span>
              <input v-model.number="p[c.k]" type="range" :min="c.min" :max="c.max" :step="c.step" />
            </label>
          </div>
          <div class="kgrid">
            <div><span>Payback</span><strong :class="tom(meu.payback)">{{ meses(meu.payback) }}</strong></div>
            <div><span>Resultado no 12º mês</span><strong :class="meu.resultadoMes12 >= 0 ? 'good' : 'bad'">{{ brl0(meu.resultadoMes12) }}</strong></div>
            <div><span>Resultado no 1º ano</span><strong>{{ brl0(meu.resultadoAno1) }}</strong></div>
            <div><span>Retorno em 36 meses</span><strong :class="meu.roi36 >= 0 ? 'good' : 'bad'">{{ pct0(meu.roi36) }}</strong></div>
            <div><span>Turnos/semana para pagar em 2 anos</span><strong>{{ n1(turnosPara(24, sim.precoTurno)) }}</strong></div>
            <div><span>Turnos/semana para pagar em 3 anos</span><strong>{{ n1(turnosPara(36, sim.precoTurno)) }}</strong></div>
            <div><span>Uso da sala no 12º mês</span><strong>{{ pct0(meu.ocupacaoSala) }}</strong></div>
            <div><span>Receita no 1º ano</span><strong>{{ brl0(meu.receitaAno1) }}</strong></div>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>Modelo B · serviço próprio (comparação)</h2>
        <p class="muted small">{{ SERVICO.procedimentosTurno }} procedimentos por turno, ticket médio de {{ brl0(SERVICO.ticket) }}, produto {{ pct0(SERVICO.insumos) }}, repasse ao dentista {{ pct0(SERVICO.repasse) }}, impostos e cartão {{ pct0(SERVICO.impostosTaxas) }} e {{ brl0(SERVICO.marketingMes) }}/mês de anúncios para paciente.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Turnos por semana</th><th class="num">Faturamento</th><th class="num">Margem depois de produto, repasse e impostos</th><th class="num">Resultado mensal</th><th class="num">Payback</th></tr></thead>
            <tbody>
              <tr v-for="s in servico" :key="s.t">
                <td class="fw">{{ s.t }}</td>
                <td class="num">{{ brl0(s.receita) }}</td>
                <td class="num">{{ brl0(s.margem) }}</td>
                <td class="num" :class="s.resultado >= 0 ? 'good' : 'bad'">{{ brl0(s.resultado) }}</td>
                <td class="num">{{ s.payback ? `${s.payback} meses` : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="muted small nota">O modelo B se paga mais rápido se a agenda encher, mas depende de vender ao paciente final num mercado concorrido, e a Santé passa a responder pelo atendimento. Por isso a recomendação é começar pelo modelo A.</p>
      </section>
    </template>

    <!-- ===== regras ===== -->
    <template v-if="aba === 'regras'">
      <section class="card">
        <h2>Exigências para abrir</h2>
        <div class="table-wrap">
          <table class="lista">
            <tbody><tr v-for="e in exigencias" :key="e.t"><td class="fw">{{ e.t }}</td><td class="muted">{{ e.d }}</td></tr></tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Fontes</h2>
        <ul class="fontes">
          <li v-for="f in fontes" :key="f.u"><a :href="f.u" target="_blank" rel="noopener">{{ f.t }}</a><span class="muted small">{{ f.d }}</span></li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.intro-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: -6px 0 10px -10px; }
.intro h2 { font-size: 19px; }
.txt { margin: 8px 0 0; color: var(--text-2); line-height: 1.6; max-width: 900px; }
.rec { margin: 12px 0 0; display: flex; gap: 8px; align-items: flex-start; background: var(--good-soft); color: var(--text); border-radius: 10px; padding: 10px 12px; line-height: 1.5; max-width: 900px; }
.rec svg { flex: none; margin-top: 3px; color: var(--good); }
.abas { display: flex; flex-wrap: wrap; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.abas button { border: 0; background: none; font: inherit; font-weight: 500; color: var(--text-2); padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.abas button:hover { background: var(--surface-2); }
.abas button.on { background: var(--accent-soft); color: var(--accent-ink); }
.fw { font-weight: 500; }
.sub-h { font-size: 14px; margin: 20px 0 8px; }
.nota { margin: 10px 0 0; line-height: 1.5; }
.serv { display: grid; gap: 8px; align-content: start; }
.serv h3 { font-size: 15px; margin: 0; }
.status { margin: 0; font-size: 12px; color: var(--muted); line-height: 1.5; border-top: 1px solid var(--border); padding-top: 8px; }
.mini-list { margin: 0; padding-left: 18px; display: grid; gap: 3px; color: var(--text-2); font-size: 13px; line-height: 1.45; }
.modelos { margin-top: 12px; }
.modelo { border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: grid; gap: 6px; align-content: start; }
.modelo h3 { font-size: 15px; margin: 4px 0 0; }
.modelo p { margin: 0; color: var(--text-2); font-size: 13px; line-height: 1.55; }
.modelo .chip { justify-self: start; }
.rec-box { border-color: var(--good); }
.lista td { vertical-align: top; font-size: 13px; }
.mini td { padding: 7px 4px; font-size: 13px; vertical-align: top; }
.mini tfoot td { font-weight: 600; }
.bullets { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 8px; color: var(--text-2); line-height: 1.55; font-size: 13px; }
.bullets strong { color: var(--text); }
.swot { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
@media (max-width: 760px) { .swot { grid-template-columns: minmax(0, 1fr); } }
.q { border-top: 4px solid var(--q); }
.q h2 { color: var(--q); }
.forcas { --q: var(--good); }
.fraquezas { --q: var(--warn); }
.oportunidades { --q: var(--accent-ink); }
.ameacas { --q: var(--bad); }
.gaps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 12px; }
.gap { background: var(--surface-2); border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; align-content: start; font-size: 13px; }
.gap p { margin: 0; color: var(--text-2); line-height: 1.5; }
.etapas { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.etapa { display: grid; gap: 10px; align-content: start; }
.etapa header { display: flex; gap: 10px; align-items: center; }
.etapa header > div { display: grid; }
.n { width: 28px; height: 28px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; font-size: 13px; }
.checks { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 10px; font-size: 13px; color: var(--text-2); line-height: 1.5; }
.checks li { display: flex; gap: 8px; align-items: flex-start; }
.checks svg { flex: none; margin-top: 3px; color: var(--good); }
.checks strong { color: var(--text); }
.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
td.good, strong.good { color: var(--good); font-weight: 600; }
td.bad, strong.bad { color: var(--bad); font-weight: 600; }
.seg { display: inline-flex; flex-wrap: wrap; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; }
.seg button { border: 0; background: transparent; color: var(--text-2); font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 8px; cursor: pointer; }
.seg button.on { background: var(--surface); color: var(--text); font-weight: 500; box-shadow: var(--shadow); }
.sim { display: grid; grid-template-columns: minmax(240px, 340px) minmax(0, 1fr); gap: 20px; margin-top: 12px; }
@media (max-width: 900px) { .sim { grid-template-columns: minmax(0, 1fr); } }
.ctrls { display: grid; gap: 10px; align-content: start; }
.ctrls hr { border: 0; border-top: 1px solid var(--border); margin: 4px 0; width: 100%; }
.ctrl { display: grid; gap: 2px; font-size: 13px; color: var(--text-2); }
.ctrl .ch { display: flex; justify-content: space-between; gap: 8px; }
.ctrl strong { color: var(--text); }
.ctrl input { width: 100%; accent-color: var(--accent); height: 18px; }
.kgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; align-content: start; }
.kgrid > div { background: var(--surface-2); border-radius: 10px; padding: 10px 12px; display: grid; gap: 1px; }
.kgrid span { font-size: 12px; color: var(--muted); }
.kgrid strong { font-size: 18px; font-weight: 600; }
.buzz-k { margin-top: 12px; }
.ciclo { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; counter-reset: c; }
.ciclo li { display: flex; gap: 10px; align-items: flex-start; border: 1px solid var(--border); border-radius: 12px; padding: 12px; font-size: 13px; position: relative; }
.ciclo li:not(:last-child)::after { content: '→'; position: absolute; right: -9px; top: 50%; transform: translateY(-50%); color: var(--muted); background: var(--surface); }
.ciclo p { margin: 2px 0 0; color: var(--text-2); line-height: 1.45; }
.dor { display: flex; gap: 8px; align-items: flex-start; }
.dor svg { flex: none; margin-top: 2px; color: var(--warn); }
.comp td, .comp th { vertical-align: top; font-size: 13px; min-width: 140px; }
.comp td:first-child { min-width: 180px; }
.comp .nos { background: var(--accent-soft); }
.comp th.nos { color: var(--accent-ink); }
.marca { display: inline-block; width: 18px; font-weight: 700; }
.marca.good { color: var(--good); }
.marca.warn { color: var(--warn); }
.marca.bad { color: var(--bad); }
.escada { list-style: none; margin: 12px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }
.escada li { display: grid; gap: 4px; align-content: start; border: 1px solid var(--border); border-radius: 12px; padding: 12px; font-size: 13px; }
.escada .preco { font-weight: 600; color: var(--accent-ink); }
.fontes { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; }
.fontes li { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
</style>
