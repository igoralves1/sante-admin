<script setup>
import { computed, reactive, ref } from 'vue'
import StatTile from '../components/StatTile.vue'
import Icon from '../components/Icon.vue'
import D3HBar from '../components/d3/D3HBar.vue'
import D3Lines from '../components/d3/D3Lines.vue'
import { state } from '../lib/store'
import { resumoMes } from '../lib/calc'
import { CENARIOS, PADRAO, simular, horasLivres, custoMensal, adicionarAoPlano } from '../lib/estrategia'
import { brl0, brlCompact, mesCurto, num, pct } from '../lib/format'
import {
  tamanho, personas, lacunas, escada, pilares, funilAcoes, redes, conteudo, calendario, metricas, medicao, riscos, fontes,
} from '../data/estrategia'

const n0 = (v) => Math.round(v).toLocaleString('pt-BR')
const n1 = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

// ---------- público ----------
const somaMin = tamanho.reduce((s, t) => s + t.f[0], 0)
const somaMax = tamanho.reduce((s, t) => s + t.f[1], 0)
const milhar = (v) => n1(Math.round(v / 100) / 10)

// ---------- simulador ----------
// todas as métricas exatamente no ponto de alerta da tabela de métricas
const ALERTA = { cpl: 35, qualif: 0.4, visita: 0.15, contrato: 0.25, ticket0: 250, upgrade: 0.15, churn: 0.15 }
const cen = ref('recomendado')
const preset = ref('feliz')
const p = reactive({ ...PADRAO })
function usar(k) {
  preset.value = k
  Object.assign(p, PADRAO, k === 'feliz' ? {} : ALERTA, { meses: p.meses })
}
const controles = [
  { k: 'cpl', t: 'Custo por lead pago', min: 8, max: 60, step: 1, f: brl0 },
  { k: 'qualif', t: 'Leads qualificados', min: 0.2, max: 0.9, step: 0.05, f: pct },
  { k: 'visita', t: 'Lead qualificado → visita', min: 0.05, max: 0.5, step: 0.01, f: pct },
  { k: 'contrato', t: 'Visita → contrato', min: 0.1, max: 0.7, step: 0.01, f: pct },
  { k: 'ticket0', t: 'Gasto mensal nos 3 primeiros meses', min: 200, max: 700, step: 10, f: brl0 },
  { k: 'ticket1', t: 'Gasto mensal com turno fixo', min: 400, max: 1200, step: 10, f: brl0 },
  { k: 'upgrade', t: 'Sobem para turno fixo no 4º mês', min: 0, max: 0.6, step: 0.05, f: pct },
  { k: 'churn', t: 'Saem por mês (churn)', min: 0.03, max: 0.3, step: 0.01, f: pct },
  { k: 'margem', t: 'Margem de contribuição', min: 0.5, max: 0.9, step: 0.05, f: pct },
  { k: 'meses', t: 'Duração da campanha', min: 3, max: 12, step: 1, f: (v) => `${v} meses` },
]
const sim = computed(() => simular(CENARIOS[cen.value], { ...p }))
const feliz6 = simular(CENARIOS.recomendado, PADRAO)
const comparativo = computed(() =>
  Object.entries(CENARIOS).map(([k, c]) => ({ k, c, r: simular(c, { ...p }) })),
)
const orcItems = computed(() =>
  [...CENARIOS[cen.value].itens].sort((a, b) => b.v - a.v).map((i) => ({
    label: i.c, value: i.v, dim: !i.midia, sub: i.midia ? 'mídia paga' : 'produção e relacionamento',
    rows: [{ label: i.t, value: '' }, { label: 'Por mês', value: brl0(i.v) }, { label: `Em ${p.meses} meses`, value: brl0(i.v * p.meses) }],
  })),
)
const linhas = computed(() => ({
  labels: sim.value.rows.map((r) => mesCurto(r.mes)),
  series: [
    { key: 'm', label: 'Margem acumulada', color: 'var(--s-firm)', values: sim.value.rows.map((r) => r.margemAcum) },
    { key: 'i', label: 'Investimento acumulado', color: 'var(--s-cost)', values: sim.value.rows.map((r) => r.investAcum) },
  ],
}))
const funil = computed(() => {
  const s = sim.value
  const top = s.leads || 1
  return [
    { k: 'Leads', v: s.leads },
    { k: 'Qualificados', v: s.qualificados },
    { k: 'Visitas', v: s.visitas },
    { k: 'Contratos', v: s.novos },
  ].map((x) => ({ ...x, w: `${Math.max(1.5, (x.v / top) * 100)}%` }))
})
const livres = computed(() => horasLivres(resumoMes(state.data, state.mes)))
const usoHoras = computed(() => (livres.value ? sim.value.fim.horas / livres.value : 0))

const okTone = (v, bom, ruim, maior = true) => (maior ? (v >= bom ? 'good' : v < ruim ? 'bad' : '') : v <= bom ? 'good' : v > ruim ? 'bad' : '')

// ---------- campanhas ----------
const aviso = ref('')
function adicionar() {
  const n = adicionarAoPlano(state.data, CENARIOS[cen.value], { ...p })
  aviso.value = n
    ? `${n} campanhas do cenário ${CENARIOS[cen.value].nome} foram criadas como planejadas no Marketing.`
    : 'As campanhas deste plano já estão na lista do Marketing.'
}

// ---------- tabelas ----------
const PRIO = { 1: { t: 'Alta', c: 'good' }, 2: { t: 'Média', c: 'info' }, 3: { t: 'Baixa', c: 'warn' }, 4: { t: 'Não usar agora', c: 'plain' } }
const grupos = [...new Set(metricas.map((m) => m.g))]
</script>

<template>
  <div class="stack">
    <section class="card intro">
      <div class="intro-top">
        <RouterLink to="/marketing" class="btn sm ghost"><Icon name="back" :size="14" /> Marketing</RouterLink>
        <span class="chip info">Plano de nov/26 a abr/27</span>
      </div>
      <h2>Primeiro Consultório: marketing para profissionais de saúde recém-formados</h2>
      <p class="txt">
        Os profissionais mais experientes já têm consultório, contrato longo e agenda cheia. Quem está chegando ao
        mercado precisa de flexibilidade, preço de entrada baixo, horário à noite e, acima de tudo, pacientes.
        Esta estratégia transforma a Santé no primeiro consultório de psicólogos, nutricionistas, fisioterapeutas,
        médicos e terapeutas recém-formados em Maceió. Eles começam por hora e, com o tempo, sobem para turno fixo
        e sala mensal.
      </p>
    </section>

    <section class="grid cols-4 tiles">
      <StatTile label="Formados por ano nas profissões-alvo" :value="`${milhar(somaMin)} a ${milhar(somaMax)} mil`" hint="Estimativa para Maceió; confirmar no e-MEC" />
      <StatTile label="Orçamento recomendado" :value="`${brl0(custoMensal(CENARIOS.recomendado))}/mês`" :hint="`${brl0(custoMensal(CENARIOS.recomendado) * 6)} em 6 meses`" />
      <StatTile label="Novos clientes por mês" :value="`≈ ${n0(feliz6.novos)}`" tone="good" :hint="`${n0(feliz6.leads)} leads por mês no caminho feliz`" />
      <StatTile label="Receita mensal no 6º mês" :value="brl0(feliz6.fim.receita)" tone="good" :hint="`${n0(feliz6.fim.ativos)} clientes ativos · se paga no ${feliz6.equilibrio}º mês`" />
    </section>

    <!-- ===== público ===== -->
    <section class="card">
      <h2>Análise do público-alvo</h2>
      <ul class="bullets">
        <li><strong>O mercado se renova todo ano.</strong> Maceió concentra os cursos de saúde de Alagoas e forma, por estimativa, de {{ milhar(somaMin) }} a {{ milhar(somaMax) }} mil profissionais por ano nas profissões que alugam consultório. Somando quem se formou nos últimos 3 anos, são alguns milhares de pessoas em busca de onde atender.</li>
        <li><strong>Eles não querem custo fixo.</strong> Com poucos pacientes, uma sala comercial com condomínio e mobília não se paga. Hora, pacote e turno resolvem isso.</li>
        <li><strong>Atendem fora do horário comercial.</strong> Muitos têm emprego, plantão, residência ou pós durante o dia. A Santé fecha às 18h e os concorrentes mais fortes abrem até 23h ou 24 horas.</li>
        <li><strong>Decidem pelo celular e por indicação.</strong> Veem o espaço no Instagram ou no TikTok, perguntam no WhatsApp e confiam em colegas e professores.</li>
        <li><strong>A maior dor é ter pacientes, não a sala.</strong> Quem ajudar o profissional a ser encontrado ganha a preferência e a fidelidade dele.</li>
        <li><strong>Público majoritariamente feminino e jovem.</strong> Cerca de 79% dos psicólogos são mulheres (CensoPsi 2022), e as mulheres já são maioria na medicina (Demografia Médica 2025).</li>
      </ul>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Profissão</th><th class="num">Formados por ano (estimativa)</th><th>Conselho</th><th>Observação</th></tr></thead>
          <tbody>
            <tr v-for="t in tamanho" :key="t.p">
              <td><strong class="fw">{{ t.p }}</strong></td>
              <td class="num tnum">{{ n0(t.f[0]) }} a {{ n0(t.f[1]) }}</td>
              <td>{{ t.conselho }}</td>
              <td class="muted">{{ t.obs }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="small muted foot">
        Faixas estimadas a partir das vagas ofertadas pelas faculdades de Maceió (UFAL, UNCISAL, CESMAC e faculdades
        privadas). Não há um número consolidado publicado; confirme no e-MEC e com os conselhos regionais. O alvo do
        plano recomendado, cerca de {{ n0(feliz6.fim.ativos) }} clientes ativos em 6 meses, é uma fração pequena desse público.
      </p>
    </section>

    <section>
      <h2 class="sec-title">Personas, em ordem de prioridade</h2>
      <div class="grid cols-3">
        <article v-for="s in personas" :key="s.id" class="card persona">
          <header>
            <span class="n">{{ s.prio }}</span>
            <div><strong>{{ s.nome }}</strong><span class="muted small">{{ s.idade }}</span></div>
          </header>
          <p class="sit">{{ s.situacao }}</p>
          <div>
            <span class="lbl">Dores</span>
            <ul class="mini-list"><li v-for="d in s.dores" :key="d">{{ d }}</li></ul>
          </div>
          <div><span class="lbl">O que a Santé oferece</span><p>{{ s.oferta }}</p></div>
          <p class="gancho">{{ s.gancho }}</p>
          <dl class="pd small">
            <div><dt>Canais</dt><dd>{{ s.canais }}</dd></div>
            <div><dt>Uso típico</dt><dd>{{ s.demanda }}</dd></div>
            <div><dt>Gasto mensal</dt><dd>{{ s.ticket }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section class="card">
      <h2>As lacunas que a Santé pode ocupar</h2>
      <p class="small muted">O que falta hoje para o recém-formado escolher a Santé, e a ação que resolve</p>
      <div class="gaps">
        <div v-for="g in lacunas" :key="g.t" class="gap">
          <strong>{{ g.t }}</strong>
          <p>{{ g.d }}</p>
          <p class="acao"><Icon name="check" :size="14" /> {{ g.acao }}</p>
        </div>
      </div>
    </section>

    <!-- ===== estratégia ===== -->
    <section class="card">
      <h2>A oferta: uma escada de entrada</h2>
      <p class="small muted">O profissional entra pelo degrau mais barato e sobe conforme a agenda cresce. Cada degrau aumenta o valor dele para a Santé.</p>
      <ol class="escada">
        <li v-for="(e, i) in escada" :key="e.t" :style="{ '--i': i }">
          <span class="step">{{ i + 1 }}</span>
          <strong>{{ e.t }}</strong>
          <span class="preco tnum">{{ e.p }}</span>
          <span class="muted small">{{ e.d }}</span>
        </li>
      </ol>
      <div class="note small">
        <strong>Bônus do programa, para quem se formou há até 3 anos:</strong> perfil na página “Profissionais da Santé”,
        post de boas-vindas no Instagram da Santé, sessão de fotos no consultório a cada trimestre, convite para os
        workshops mensais e desconto com contador e prontuário eletrônico parceiros.
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Pilares da estratégia</h2>
        <ol class="pilares">
          <li v-for="(x, i) in pilares" :key="x.t"><span class="n">{{ i + 1 }}</span><div><strong>{{ x.t }}</strong><p>{{ x.d }}</p></div></li>
        </ol>
      </div>
      <div class="card">
        <h2>Funil e ações</h2>
        <ol class="pilares">
          <li v-for="f in funilAcoes" :key="f.e">
            <span class="n etapa">{{ f.e.slice(0, 1) }}</span>
            <div><strong>{{ f.e }}</strong><p>{{ f.d }}</p><p class="small muted">Medir: {{ f.kpi }}</p></div>
          </li>
        </ol>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Redes sociais e canais</h2>
          <p>Todas as opções avaliadas, da mais à menos importante para este público</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="redes">
          <thead><tr><th>Canal</th><th>Prioridade</th><th>Papel</th><th>O que fazer</th><th>Custo</th><th>Indicador</th></tr></thead>
          <tbody>
            <tr v-for="r in redes" :key="r.n" :class="{ off: r.prio === 4 }">
              <td><strong class="fw">{{ r.n }}</strong></td>
              <td><span class="chip" :class="PRIO[r.prio].c">{{ PRIO[r.prio].t }}</span></td>
              <td>{{ r.papel }}</td>
              <td class="muted">{{ r.formato }}</td>
              <td class="muted">{{ r.custo }}</td>
              <td class="muted">{{ r.kpi }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Mix de conteúdo</h2>
        <p class="small muted">Quatro de cada dez posts ensinam a começar a carreira. Só um em cada dez vende.</p>
        <div class="mix">
          <div v-for="c in conteudo" :key="c.t" class="mix-row">
            <div class="mix-h"><strong>{{ c.t }}</strong><span class="tnum">{{ c.pct }}%</span></div>
            <div class="f-track"><div class="f-bar" :style="{ width: `${c.pct}%` }" /></div>
            <span class="muted small">{{ c.ex }}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <h2>Cadência semanal</h2>
        <ul class="bullets">
          <li><strong>3 Reels</strong> (tour, dia de atendimento, dica de carreira), publicados também no TikTok e no YouTube Shorts.</li>
          <li><strong>2 carrosséis</strong> educativos (CNPJ, preço da consulta, impostos, primeiro paciente).</li>
          <li><strong>Stories todos os dias</strong>, com os horários livres da semana e enquetes.</li>
          <li><strong>1 post no Google</strong> com foto nova.</li>
          <li><strong>1 live ou workshop por mês</strong>, gravado para o YouTube e o podcast.</li>
          <li><strong>Collab</strong> com cada profissional novo no primeiro mês dele na Santé.</li>
        </ul>
      </div>
    </section>

    <section>
      <h2 class="sec-title">Calendário de 6 meses</h2>
      <div class="grid cols-3">
        <div v-for="c in calendario" :key="c.m" class="card cal">
          <header><strong>{{ c.m }}</strong><span class="chip plain">{{ c.fase }}</span></header>
          <ul class="mini-list"><li v-for="i in c.itens" :key="i">{{ i }}</li></ul>
        </div>
      </div>
    </section>

    <!-- ===== orçamento e simulador ===== -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Orçamento estimado</h2>
          <p>Valores mensais de referência em Maceió. Mídia paga em azul forte, produção e relacionamento em azul claro.</p>
        </div>
        <div class="seg" role="tablist" aria-label="Cenário de orçamento">
          <button v-for="(c, k) in CENARIOS" :key="k" type="button" role="tab" :aria-selected="cen === k" :class="{ on: cen === k }" @click="cen = k">
            {{ c.nome }} · {{ brl0(custoMensal(c)) }}
          </button>
        </div>
      </div>
      <p class="small muted">{{ CENARIOS[cen].resumo }} Leads orgânicos e de parcerias estimados: {{ CENARIOS[cen].organicos }} por mês.</p>
      <D3HBar :items="orcItems" :format="brl0" aria-label="Orçamento mensal por item" />
      <div class="legend small key">
        <span><i style="background: var(--s-firm)" />Mídia paga</span>
        <span><i style="background: var(--s-prop)" />Produção e relacionamento</span>
      </div>
      <p class="small muted foot">
        Referências de mercado: no Brasil a Meta tem CPM médio baixo, mas saúde é um dos setores mais disputados.
        No Google, cliques de saúde local costumam custar alguns reais. Valide no Planejador de palavras-chave do
        Google e nas duas primeiras semanas de anúncio antes de aumentar a verba.
      </p>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Simulador de custo-benefício</h2>
          <p>Ajuste as premissas e veja o resultado. O padrão é o caminho feliz; “No limite do alerta” põe todas as métricas no ponto em que a campanha precisa ser revista.</p>
        </div>
        <div class="seg" role="tablist" aria-label="Premissas">
          <button type="button" role="tab" :aria-selected="preset === 'feliz'" :class="{ on: preset === 'feliz' }" @click="usar('feliz')">Caminho feliz</button>
          <button type="button" role="tab" :aria-selected="preset === 'alerta'" :class="{ on: preset === 'alerta' }" @click="usar('alerta')">No limite do alerta</button>
        </div>
      </div>
      <div class="sim">
        <div class="ctrls">
          <label v-for="c in controles" :key="c.k" class="ctrl">
            <span class="ch"><span>{{ c.t }}</span><strong class="tnum">{{ c.f(p[c.k]) }}</strong></span>
            <input v-model.number="p[c.k]" type="range" :min="c.min" :max="c.max" :step="c.step" @input="preset = ''" />
          </label>
        </div>
        <div class="res">
          <div class="kgrid">
            <div><span>Investimento</span><strong class="tnum">{{ brl0(sim.investTotal) }}</strong><small>{{ brl0(sim.invest) }}/mês por {{ p.meses }} meses</small></div>
            <div><span>Novos clientes</span><strong class="tnum">{{ n0(sim.novosTotal) }}</strong><small>{{ n1(sim.novos) }} por mês</small></div>
            <div><span>Clientes ativos no fim</span><strong class="tnum">{{ n0(sim.fim.ativos) }}</strong><small>já descontando quem sai</small></div>
            <div><span>Receita mensal no fim</span><strong class="tnum">{{ brl0(sim.fim.receita) }}</strong><small>{{ brl0(sim.fim.receitaAcum) }} no período</small></div>
            <div><span>CAC</span><strong class="tnum" :class="okTone(sim.cac, 450, 700, false)">{{ brl0(sim.cac) }}</strong><small>meta ≤ R$ 450</small></div>
            <div><span>LTV (margem)</span><strong class="tnum" :class="okTone(sim.ltv, 3000, 1500)">{{ brl0(sim.ltv) }}</strong><small>meta ≥ R$ 3.000</small></div>
            <div><span>LTV ÷ CAC</span><strong class="tnum" :class="okTone(sim.ltvCac, 3, 2)">{{ n1(sim.ltvCac) }}×</strong><small>meta ≥ 3×</small></div>
            <div><span>Payback do CAC</span><strong class="tnum" :class="okTone(sim.payback, 2, 4, false)">{{ n1(sim.payback) }} meses</strong><small>meta ≤ 2 meses</small></div>
            <div><span>ROI no período</span><strong class="tnum" :class="okTone(sim.roiPeriodo, 0.5, 0)">{{ pct(sim.roiPeriodo) }}</strong><small>sobre a margem gerada</small></div>
            <div><span>ROI na vida do cliente</span><strong class="tnum" :class="okTone(sim.roiVida, 2, 0)">{{ pct(sim.roiVida) }}</strong><small>usa o LTV dos novos</small></div>
            <div><span>Se paga em</span><strong class="tnum" :class="sim.equilibrio ? 'good' : 'bad'">{{ sim.equilibrio ? `${sim.equilibrio}º mês` : 'Não se paga' }}</strong><small>margem acumulada ≥ investimento</small></div>
            <div><span>Horas usadas no fim</span><strong class="tnum" :class="usoHoras > 0.8 ? 'bad' : ''">{{ n0(sim.fim.horas) }} h/mês</strong><small>{{ pct(usoHoras) }} das {{ n0(livres) }} h livres hoje</small></div>
          </div>
          <div class="funnel">
            <div v-for="s in funil" :key="s.k" class="f-row">
              <span class="small muted">{{ s.k }}</span>
              <div class="f-track"><div class="f-bar" :style="{ width: s.w }" /></div>
              <strong class="tnum small">{{ n1(s.v) }}</strong>
            </div>
            <p class="small muted">Funil de um mês: {{ n0(sim.leadsPagos) }} leads pagos + {{ CENARIOS[cen].organicos }} orgânicos.</p>
          </div>
        </div>
      </div>
      <h3 class="sub-h">Margem acumulada × investimento acumulado</h3>
      <D3Lines :labels="linhas.labels" :series="linhas.series" :format="brl0" :axis-format="brlCompact" :height="260" />
      <p v-if="usoHoras > 0.8" class="note small warnote">As horas vendidas passam de 80% das horas livres de hoje. Antes de aumentar a verba, abra mais horários ou priorize o turno fixo.</p>
      <details class="mes">
        <summary>Ver mês a mês</summary>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mês</th><th class="num">Leads</th><th class="num">Visitas</th><th class="num">Novos</th><th class="num">Ativos</th><th class="num">Receita</th><th class="num">Margem acum.</th><th class="num">Invest. acum.</th></tr></thead>
            <tbody>
              <tr v-for="r in sim.rows" :key="r.mes">
                <td>{{ mesCurto(r.mes) }}</td>
                <td class="num">{{ n0(r.leads) }}</td><td class="num">{{ n1(r.visitas) }}</td><td class="num">{{ n1(r.novos) }}</td>
                <td class="num">{{ n1(r.ativos) }}</td><td class="num">{{ brl0(r.receita) }}</td>
                <td class="num">{{ brl0(r.margemAcum) }}</td><td class="num">{{ brl0(r.investAcum) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <p class="small muted foot">
        Premissas: no mês de entrada o cliente usa metade do mês; nos 3 primeiros meses gasta o valor do pacote; a
        partir do 4º mês parte dele sobe para 1 turno fixo por semana (4 h). Pacote Start a R$ 35/h. LTV calculado em
        36 meses sobre a margem de contribuição.
      </p>
    </section>

    <section class="card">
      <h2>Resultados esperados por cenário</h2>
      <p class="small muted">Com as premissas do simulador e {{ p.meses }} meses de campanha</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Cenário</th><th class="num">Por mês</th><th class="num">Leads/mês</th><th class="num">Novos clientes</th><th class="num">Ativos no fim</th><th class="num">Receita mensal no fim</th><th class="num">CAC</th><th class="num">LTV ÷ CAC</th><th class="num">Se paga em</th></tr>
          </thead>
          <tbody>
            <tr v-for="x in comparativo" :key="x.k" :class="{ sel: x.k === cen }">
              <td><strong class="fw">{{ x.c.nome }}</strong></td>
              <td class="num">{{ brl0(x.r.invest) }}</td>
              <td class="num">{{ n0(x.r.leads) }}</td>
              <td class="num">{{ n0(x.r.novosTotal) }}</td>
              <td class="num">{{ n0(x.r.fim.ativos) }}</td>
              <td class="num">{{ brl0(x.r.fim.receita) }}</td>
              <td class="num">{{ brl0(x.r.cac) }}</td>
              <td class="num">{{ n1(x.r.ltvCac) }}×</td>
              <td class="num">{{ x.r.equilibrio ? `${x.r.equilibrio}º mês` : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="add">
        <button class="btn primary" type="button" @click="adicionar"><Icon name="plus" :size="16" /> Criar as campanhas do cenário {{ CENARIOS[cen].nome }} no Marketing</button>
        <span v-if="aviso" class="small muted">{{ aviso }} <RouterLink to="/marketing">Abrir o Marketing</RouterLink></span>
      </div>
    </section>

    <!-- ===== métricas ===== -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Métricas de custo-benefício</h2>
          <p>Meta do caminho feliz e o ponto em que a campanha precisa ser revista</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="mt">
          <thead><tr><th>Métrica</th><th>Como calcular</th><th>Meta</th><th>Alerta</th><th>Onde medir</th><th>Frequência</th></tr></thead>
          <tbody v-for="g in grupos" :key="g">
            <tr class="grp"><td colspan="6">{{ g }}</td></tr>
            <tr v-for="m in metricas.filter((x) => x.g === g)" :key="m.n">
              <td><strong class="fw">{{ m.n }}</strong></td>
              <td class="muted">{{ m.f }}</td>
              <td><span class="chip good">{{ m.meta }}</span></td>
              <td><span class="chip bad">{{ m.alerta }}</span></td>
              <td class="muted">{{ m.onde }}</td>
              <td class="muted">{{ m.freq }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Como medir sem perder nenhum lead</h2>
        <ul class="bullets"><li v-for="m in medicao" :key="m">{{ m }}</li></ul>
      </div>
      <div class="card">
        <h2>Cuidados e riscos</h2>
        <ul class="bullets"><li v-for="r in riscos" :key="r.t"><strong>{{ r.t }}.</strong> {{ r.d }}</li></ul>
      </div>
    </section>

    <section class="card">
      <h2>Fontes</h2>
      <ul class="refs">
        <li v-for="f in fontes" :key="f.u"><a :href="f.u" target="_blank" rel="noopener">{{ f.t }}</a><span class="muted small">{{ f.d }}</span></li>
        <li><RouterLink to="/concorrentes">Página Concorrentes</RouterLink><span class="muted small">horários, preços e canais dos concorrentes usados nas lacunas</span></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.intro-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: -6px 0 10px -10px; }
.intro h2 { font-size: 19px; }
.txt { margin: 8px 0 0; color: var(--text-2); line-height: 1.6; max-width: 880px; }
.sec-title { font-size: 17px; margin-bottom: 12px; }
.sub-h { font-size: 14px; margin: 22px 0 8px; }
.fw { font-weight: 500; }
.bullets { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 8px; color: var(--text-2); line-height: 1.55; }
.bullets strong { color: var(--text); }
.foot { margin: 10px 0 0; line-height: 1.5; }
.card > .table-wrap { margin-top: 14px; }

.persona { display: grid; gap: 10px; align-content: start; font-size: 13px; }
.persona header { display: flex; gap: 10px; align-items: center; }
.persona header > div { display: grid; }
.persona p { margin: 0; color: var(--text-2); line-height: 1.5; }
.n { width: 28px; height: 28px; flex: none; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; font-size: 13px; }
.lbl { display: block; font-size: 12px; color: var(--muted); margin-bottom: 2px; }
.mini-list { margin: 0; padding-left: 16px; display: grid; gap: 3px; color: var(--text-2); font-size: 13px; }
.gancho { font-weight: 500; color: var(--text) !important; background: var(--surface-2); border-radius: 10px; padding: 8px 10px; }
.pd { margin: 0; display: grid; gap: 4px; border-top: 1px solid var(--border); padding-top: 10px; }
.pd div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; }
.pd dt { color: var(--muted); }
.pd dd { margin: 0; color: var(--text-2); }

.gaps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
.gap { background: var(--surface-2); border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; align-content: start; font-size: 13px; }
.gap p { margin: 0; color: var(--text-2); line-height: 1.5; }
.gap .acao { color: var(--good); display: flex; gap: 6px; align-items: flex-start; font-weight: 500; }
.gap .acao svg { flex: none; margin-top: 3px; }

.escada { list-style: none; margin: 14px 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; align-items: end; }
.escada li { display: grid; gap: 4px; align-content: start; border: 1px solid var(--border); border-radius: 12px; padding: 12px; font-size: 13px; min-height: calc(120px + var(--i) * 16px); background: linear-gradient(to top, var(--accent-soft), transparent 70%); }
.escada .step { width: 22px; height: 22px; border-radius: 6px; background: var(--s-firm); color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 600; }
.escada .preco { font-weight: 600; color: var(--accent-ink); }
@media (max-width: 900px) { .escada { grid-template-columns: minmax(0, 1fr); } .escada li { min-height: 0; } }

.pilares { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 12px; }
.pilares li { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; }
.pilares p { margin: 2px 0 0; color: var(--text-2); line-height: 1.5; font-size: 13px; }
.etapa { background: var(--s-firm); color: #fff; }

.redes td { vertical-align: top; font-size: 13px; }
.redes tr.off td { opacity: 0.65; }

.mix { display: grid; gap: 12px; margin-top: 12px; }
.mix-row { display: grid; gap: 4px; }
.mix-h { display: flex; justify-content: space-between; font-size: 13px; }
.f-track { height: 10px; background: var(--s-track); border-radius: 4px; }
.f-bar { height: 100%; background: var(--s-firm); border-radius: 4px; }

.cal { display: grid; gap: 8px; align-content: start; }
.cal header { display: flex; justify-content: space-between; align-items: center; }

.seg { display: inline-flex; flex-wrap: wrap; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; }
.seg button { border: 0; background: transparent; color: var(--text-2); font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 8px; cursor: pointer; }
.seg button.on { background: var(--surface); color: var(--text); font-weight: 500; box-shadow: var(--shadow); }
.key { display: flex; gap: 16px; margin-top: 6px; color: var(--text-2); }
.key span { display: inline-flex; align-items: center; gap: 6px; }
.key i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

.sim { display: grid; grid-template-columns: minmax(240px, 320px) minmax(0, 1fr); gap: 20px; }
@media (max-width: 900px) { .sim { grid-template-columns: minmax(0, 1fr); } }
.ctrls { display: grid; gap: 10px; align-content: start; }
.ctrl { display: grid; gap: 2px; font-size: 13px; color: var(--text-2); }
.ctrl .ch { display: flex; justify-content: space-between; gap: 8px; }
.ctrl strong { color: var(--text); }
.ctrl input { width: 100%; accent-color: var(--accent); height: 18px; }
.res { display: grid; gap: 16px; align-content: start; }
.kgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.kgrid > div { background: var(--surface-2); border-radius: 10px; padding: 10px 12px; display: grid; gap: 1px; }
.kgrid span { font-size: 12px; color: var(--muted); }
.kgrid strong { font-size: 18px; font-weight: 600; }
.kgrid strong.good { color: var(--good); }
.kgrid strong.bad { color: var(--bad); }
.kgrid small { font-size: 11px; color: var(--muted); }
.funnel { display: grid; gap: 6px; }
.funnel p { margin: 4px 0 0; }
.f-row { display: grid; grid-template-columns: 90px minmax(0, 1fr) 48px; gap: 10px; align-items: center; }
.f-row strong { text-align: right; }
.warnote { margin-top: 10px; background: var(--warn-soft); color: var(--warn); }
.mes { margin-top: 12px; }
.mes summary { cursor: pointer; font-size: 13px; color: var(--accent-ink); }
tr.sel td { background: var(--accent-soft); }
.add { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 14px; }

.mt td { vertical-align: top; font-size: 13px; }
.mt .chip { white-space: normal; height: auto; min-height: 22px; padding: 2px 8px; }
.mt tr.grp td { background: var(--surface-2); font-weight: 600; font-size: 12px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.04em; }
.refs { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 10px; }
.refs li { display: grid; gap: 1px; }
@media (max-width: 900px) { .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
