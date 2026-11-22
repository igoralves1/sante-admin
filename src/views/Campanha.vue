<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatTile from '../components/StatTile.vue'
import Icon from '../components/Icon.vue'
import D3Lines from '../components/d3/D3Lines.vue'
import { state } from '../lib/store'
import { resumoMes } from '../lib/calc'
import { CANAIS, FASES, INICIO, MESES, PREMISSAS, adicionarPlano, capacidadeSalas, simularPlano, verba } from '../lib/campanha'
import { addMes, brl0, brlCompact, mesCurto, pct } from '../lib/format'
import {
  mercado, segmentos, pontoPartida, redes, outrosCanais, indicadores, rotina, cuidados, fontes,
} from '../data/campanha'

const route = useRoute()
const router = useRouter()
const ABAS = [
  { k: 'resumo', t: 'Visão geral' },
  { k: 'publico', t: 'Público' },
  { k: 'redes', t: 'Redes sociais' },
  { k: 'canais', t: 'Outros canais' },
  { k: 'metas', t: 'Metas mês a mês' },
  { k: 'indicadores', t: 'Indicadores' },
]
const aba = ref(ABAS.some((a) => a.k === route.query.aba) ? route.query.aba : 'resumo')
watch(aba, (v) => v !== route.query.aba && router.replace({ query: { ...route.query, aba: v } }))
watch(() => route.query.aba, (v) => ABAS.some((a) => a.k === v) && (aba.value = v))

const n0 = (v) => Math.round(v || 0).toLocaleString('pt-BR')
const n1 = (v) => (v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
const pct0 = (v) => `${Math.round((v || 0) * 100)}%`

// ---------- modelo ----------
const cap = computed(() => capacidadeSalas(resumoMes(state.data, INICIO)))
const plano = computed(() => simularPlano(cap.value))
const rows = computed(() => plano.value.rows)
const fim = computed(() => plano.value.fim)
const ALERTA = 0.7 // abaixo de 70% da meta = rever a campanha

// contratos reais vindos de campanhas, por mês de início
const reais = computed(() => {
  const m = {}
  for (const c of state.data.contratos) {
    if (!c.campanha || c.status === 'Cancelada' || !c.inicio) continue
    const k = c.inicio.slice(0, 7)
    m[k] = (m[k] || 0) + 1
  }
  return m
})
const mesHoje = new Date().toISOString().slice(0, 7)
const passou = (mes) => mes <= mesHoje

const linhasReceita = computed(() => ({
  labels: rows.value.map((r) => mesCurto(r.mes)),
  series: [
    { key: 'r', label: 'Receita nova', color: 'var(--s-firm)', values: rows.value.map((r) => r.receita) },
    { key: 'i', label: 'Investimento', color: 'var(--s-cost)', values: rows.value.map((r) => r.invest) },
  ],
}))
const linhasOcupacao = computed(() => ({
  labels: rows.value.map((r) => mesCurto(r.mes)),
  series: [
    { key: 'o', label: 'Ocupação esperada', color: 'var(--s-firm)', values: rows.value.map((r) => r.ocupacao) },
    { key: 'm', label: `Meta da Santé (${pct0(state.data.metas?.ocupacaoAlvo || 0.6)})`, color: 'var(--muted)', values: rows.value.map(() => state.data.metas?.ocupacaoAlvo || 0.6) },
  ],
}))

const orcTotal = (c) => Array.from({ length: MESES }, (_, i) => verba(c, i)).reduce((a, b) => a + b, 0)

// ---------- redes ----------
const PRIO = { 1: { t: 'Alta', c: 'good' }, 2: { t: 'Média', c: 'info' }, 3: { t: 'Baixa', c: 'warn' }, 4: { t: 'Não usar agora', c: 'plain' } }
const redeSel = ref('instagram')
const rede = computed(() => redes.find((r) => r.id === redeSel.value))
const gruposCanais = [...new Set(outrosCanais.map((c) => c.g))]
const gruposInd = [...new Set(indicadores.map((m) => m.g))]
const fonteDe = (k) => fontes.find((f) => f.k === k)

// ---------- campanhas em Comercial ----------
const aviso = ref('')
function criar() {
  const n = adicionarPlano(state.data)
  aviso.value = n ? `${n} campanhas do plano foram criadas como planejadas em Comercial.` : 'As campanhas do plano já estão em Comercial.'
}
</script>

<template>
  <div class="stack">
    <section class="card intro">
      <div class="intro-top">
        <RouterLink to="/marketing" class="btn sm ghost"><Icon name="back" :size="14" /> Comercial</RouterLink>
        <span class="chip info">{{ mesCurto(INICIO) }} a {{ mesCurto(addMes(INICIO, MESES - 1)) }}</span>
      </div>
      <h2>Plano de campanha de 12 meses: profissionais de saúde para as salas da Santé</h2>
      <p class="txt">
        Campanha para alugar horas, turnos, a piscina e o coworking da Santé a psicólogos, médicos, nutricionistas,
        fisioterapeutas, terapeutas infantis e outros profissionais de saúde de Maceió. Junta o que o Social Media Guide
        recomenda para cada rede com dados atuais do Brasil e de Maceió, diz o que fazer em cada canal (com destaque para
        Instagram e Facebook) e traz as metas de cada mês para comparar com o realizado.
      </p>
    </section>

    <section class="grid cols-4 tiles">
      <StatTile label="Investimento em 12 meses" :value="brl0(plano.investTotal)" :hint="`${brl0(plano.investTotal / MESES)} por mês em média`" />
      <StatTile label="Contratos novos esperados" :value="n0(plano.novosTotal)" tone="good" :hint="`${n0(plano.leadsTotal)} leads · ${n0(fim.ativos)} clientes ativos no 12º mês`" />
      <StatTile label="Ocupação das salas" :value="`${pct0(plano.ocupacaoInicial)} → ${pct0(fim.ocupacao)}`" tone="good" :hint="`Consultórios por hora e por turno · meta da Santé ${pct0(state.data.metas?.ocupacaoAlvo || 0.6)}`" />
      <StatTile label="Receita nova no 12º mês" :value="`${brl0(fim.receita)}/mês`" tone="good" :hint="`CAC médio ${brl0(plano.cacMedio)} · se paga no ${plano.equilibrio}º mês`" />
    </section>

    <div class="abas" role="tablist">
      <button v-for="a in ABAS" :key="a.k" type="button" role="tab" :aria-selected="aba === a.k" :class="{ on: aba === a.k }" @click="aba = a.k">{{ a.t }}</button>
    </div>

    <!-- ===== visão geral ===== -->
    <template v-if="aba === 'resumo'">
      <section class="grid cols-3">
        <div v-for="(f, i) in FASES" :key="f.nome" class="card fase">
          <span class="chip info plain">Meses {{ f.de + 1 }} a {{ f.ate + 1 }} · {{ mesCurto(addMes(INICIO, f.de)) }} a {{ mesCurto(addMes(INICIO, f.ate)) }}</span>
          <h3>{{ i + 1 }}. {{ f.nome }}</h3>
          <p>{{ f.d }}</p>
        </div>
      </section>

      <section class="card">
        <h2>Ponto de partida</h2>
        <div class="gaps">
          <div v-for="p in pontoPartida" :key="p.t" class="gap"><strong>{{ p.t }}</strong><p>{{ p.d }}</p></div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2>Orçamento por canal</h2>
            <p>Valores mensais em cada fase. A compra de mídia gera leads pelo custo por lead; o resto é produção e relacionamento.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Canal</th><th class="num">Meses 1–3</th><th class="num">Meses 4–9</th><th class="num">Meses 10–12</th><th class="num">12 meses</th><th>Como usar</th></tr></thead>
            <tbody>
              <tr v-for="c in CANAIS" :key="c.k">
                <td><strong class="fw">{{ c.t }}</strong><span class="chip plain small-chip">{{ c.midia ? 'mídia' : 'produção' }}</span></td>
                <td class="num">{{ brl0(c.v[0]) }}</td><td class="num">{{ brl0(c.v[1]) }}</td><td class="num">{{ brl0(c.v[2]) }}</td>
                <td class="num">{{ brl0(orcTotal(c)) }}</td>
                <td class="muted small">{{ c.nota }}<template v-if="c.cpl"> Custo por lead: {{ brl0(c.cpl[0]) }} no teste, {{ brl0(c.cpl[1]) }} otimizado.</template></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td v-for="f in [0, 3, 9]" :key="f" class="num">{{ brl0(CANAIS.reduce((s, c) => s + verba(c, f), 0)) }}</td>
                <td class="num">{{ brl0(plano.investTotal) }}</td><td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Calendário e sazonalidade</h2>
        <p class="muted small">Peso de cada mês na procura por sala (1,0 = mês normal) e as datas que viram conteúdo.</p>
        <div class="cal-grid">
          <div v-for="r in rows" :key="r.mes" class="cal-m" :class="{ alto: r.sazonal > 1.02, baixo: r.sazonal < 0.95 }">
            <header><strong>{{ mesCurto(r.mes) }}</strong><span class="tnum small">{{ n1(r.sazonal) }}</span></header>
            <p>{{ r.nota }}</p>
          </div>
        </div>
      </section>

      <section class="card acao-plano">
        <div>
          <h2>Acompanhar em Comercial</h2>
          <p class="muted">Cria as 6 campanhas do plano (Instagram e Facebook, Google, TikTok e YouTube, eventos, mídia tradicional e indicação) com o orçamento de 12 meses. Ao fechar um contrato, escolha a campanha de origem: o realizado aparece na aba Metas mês a mês.</p>
        </div>
        <div class="toolbar">
          <button class="btn primary" type="button" @click="criar"><Icon name="plus" :size="15" /> Criar as campanhas do plano</button>
          <span v-if="aviso" class="small muted">{{ aviso }} <RouterLink to="/marketing">Abrir Comercial</RouterLink></span>
        </div>
      </section>
    </template>

    <!-- ===== público ===== -->
    <template v-if="aba === 'publico'">
      <section class="grid cols-3">
        <div v-for="m in mercado" :key="m.t" class="card dado">
          <strong class="tnum grande">{{ m.v }}</strong>
          <span class="fw">{{ m.t }}</span>
          <p>{{ m.d }}</p>
          <a v-if="fonteDe(m.f)" class="small" :href="fonteDe(m.f).u" target="_blank" rel="noopener">{{ fonteDe(m.f).t }}</a>
        </div>
      </section>

      <section>
        <h2 class="sec-title">Quem pode alugar as salas</h2>
        <div class="grid cols-2">
          <article v-for="s in segmentos" :key="s.id" class="card seg-card">
            <header>
              <h3>{{ s.nome }}</h3>
              <span class="chip" :class="PRIO[s.prio].c">Prioridade {{ PRIO[s.prio].t.toLowerCase() }}</span>
            </header>
            <p class="gancho">{{ s.mensagem }}</p>
            <dl class="pd">
              <div><dt>Produto</dt><dd>{{ s.produto }}</dd></div>
              <div><dt>Por quê</dt><dd>{{ s.porque }}</dd></div>
              <div><dt>Precisa de</dt><dd>{{ s.precisa }}</dd></div>
              <div><dt>Onde achar</dt><dd>{{ s.onde }}<RouterLink v-if="s.id === 'novo'" to="/marketing/estrategia"> → abrir</RouterLink></dd></div>
            </dl>
          </article>
        </div>
      </section>
    </template>

    <!-- ===== redes ===== -->
    <template v-if="aba === 'redes'">
      <section class="card">
        <div class="card-head">
          <div>
            <h2>Estratégia e métricas por rede</h2>
            <p>Facebook e Instagram em primeiro: são as redes mais usadas pelos profissionais de saúde no Brasil e as que trazem lead mais barato pelo WhatsApp.</p>
          </div>
        </div>
        <div class="seg redes-seg" role="tablist">
          <button v-for="r in redes" :key="r.id" type="button" role="tab" :aria-selected="redeSel === r.id" :class="{ on: redeSel === r.id, destaque: r.destaque }" @click="redeSel = r.id">{{ r.n }}</button>
        </div>
      </section>

      <template v-if="rede">
        <section class="card">
          <header class="rede-h">
            <div>
              <h2>{{ rede.n }}</h2>
              <p class="muted">{{ rede.papel }}</p>
            </div>
            <span class="chip" :class="PRIO[rede.prio].c">Prioridade {{ PRIO[rede.prio].t.toLowerCase() }}</span>
          </header>

          <div class="grid cols-2 bloco">
            <div v-if="rede.guia" class="painel-g">
              <h3>O que diz o Social Media Guide</h3>
              <ul class="mini-list"><li v-for="x in rede.guia.numeros" :key="x">{{ x }}</li></ul>
              <span class="lbl">Objetivos</span>
              <ul class="mini-list"><li v-for="x in rede.guia.objetivos" :key="x">{{ x }}</li></ul>
              <span class="lbl">Dicas</span>
              <ul class="mini-list"><li v-for="x in rede.guia.dicas" :key="x">{{ x }}</li></ul>
              <p class="small"><span class="lbl">Quando publicar</span>{{ rede.guia.quando }}</p>
              <p class="small"><span class="lbl">Ferramentas</span>{{ rede.guia.ferramentas }}</p>
            </div>
            <div class="painel-g">
              <h3>No Brasil e em Maceió hoje</h3>
              <ul class="mini-list"><li v-for="x in rede.brasil" :key="x">{{ x }}</li></ul>
              <span class="lbl">O que mudou desde o guia</span>
              <ul class="mini-list"><li v-for="x in rede.hoje" :key="x">{{ x }}</li></ul>
            </div>
          </div>
        </section>

        <section class="grid cols-2">
          <div class="card">
            <h2>Estratégia da Santé</h2>
            <ol class="passos"><li v-for="x in rede.estrategia" :key="x">{{ x }}</li></ol>
          </div>
          <div class="card">
            <h2>Como publicar</h2>
            <dl class="pd">
              <div><dt>Frequência</dt><dd>{{ rede.frequencia }}</dd></div>
              <div><dt>Horário</dt><dd>{{ rede.horario }}</dd></div>
              <div v-if="rede.conteudo.length"><dt>Conteúdo</dt><dd>{{ rede.conteudo.join(' · ') }}</dd></div>
            </dl>
            <template v-if="rede.formatos.length">
              <h3 class="sub-h">Formatos</h3>
              <table class="mini">
                <tbody><tr v-for="f in rede.formatos" :key="f[0]"><td class="fw">{{ f[0] }}</td><td class="muted">{{ f[1] }}</td></tr></tbody>
              </table>
            </template>
          </div>
        </section>

        <section v-if="rede.kpis.length" class="card">
          <h2>Métricas e metas</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Métrica</th><th>Meta</th><th>Onde medir</th></tr></thead>
              <tbody>
                <tr v-for="k in rede.kpis" :key="k.n">
                  <td class="fw">{{ k.n }}</td>
                  <td>{{ k.meta }}</td>
                  <td class="muted">{{ k.fonte === 'modelo' ? 'Metas mês a mês' : k.fonte }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="rede.id === 'instagram' || rede.id === 'facebook'" class="table-wrap mes-a-mes">
            <h3 class="sub-h">{{ rede.n }} mês a mês</h3>
            <table>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th v-for="r in rows" :key="r.mes" class="num">{{ mesCurto(r.mes) }}</th>
                </tr>
              </thead>
              <tbody v-if="rede.id === 'instagram'">
                <tr><td>Seguidores</td><td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.seguidores) }}</td></tr>
                <tr><td>Alcance no mês</td><td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.alcanceIG) }}</td></tr>
                <tr><td>Conversas iniciadas</td><td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.conversasIG) }}</td></tr>
                <tr><td>Verba (60% da Meta)</td><td v-for="r in rows" :key="r.mes" class="num">{{ brl0(verba(CANAIS[0], r.i) * 0.6) }}</td></tr>
              </tbody>
              <tbody v-else>
                <tr><td>Alcance pago no mês</td><td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.alcanceFB) }}</td></tr>
                <tr><td>Conversas iniciadas</td><td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.conversasFB) }}</td></tr>
                <tr><td>Verba (40% da Meta)</td><td v-for="r in rows" :key="r.mes" class="num">{{ brl0(verba(CANAIS[0], r.i) * 0.4) }}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </template>

    <!-- ===== outros canais ===== -->
    <template v-if="aba === 'canais'">
      <section v-for="g in gruposCanais" :key="g" class="card">
        <h2>{{ g === 'Tradicional' ? 'Canais tradicionais' : g }}</h2>
        <div class="table-wrap">
          <table class="redes">
            <thead><tr><th>Canal</th><th>Prioridade</th><th>Como fazer</th><th>Custo</th><th>Indicador</th></tr></thead>
            <tbody>
              <tr v-for="c in outrosCanais.filter((x) => x.g === g)" :key="c.n" :class="{ off: c.prio === 4 }">
                <td><strong class="fw">{{ c.n }}</strong></td>
                <td><span class="chip" :class="PRIO[c.prio].c">{{ PRIO[c.prio].t }}</span></td>
                <td class="muted">{{ c.como }}</td>
                <td class="muted">{{ c.custo }}</td>
                <td class="muted">{{ c.kpi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- ===== metas ===== -->
    <template v-if="aba === 'metas'">
      <section class="grid cols-2">
        <div class="card">
          <h2>Receita nova × investimento</h2>
          <p class="muted small">Receita mensal dos contratos vindos da campanha, já descontando os que saem ({{ pct0(PREMISSAS.churn) }} ao mês).</p>
          <D3Lines :labels="linhasReceita.labels" :series="linhasReceita.series" :format="brl0" :axis-format="brlCompact" />
        </div>
        <div class="card">
          <h2>Ocupação das salas</h2>
          <p class="muted small">Horas vendidas ÷ horas disponíveis nos consultórios por hora e por turno ({{ n0(cap.total) }} h por mês).</p>
          <D3Lines :labels="linhasOcupacao.labels" :series="linhasOcupacao.series" :format="pct0" :axis-format="pct0" />
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2>Funil e resultado mês a mês</h2>
            <p>Meta = caminho esperado. Se o realizado ficar abaixo de {{ pct0(ALERTA) }} da meta, rever oferta, criativo ou público.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="metas">
            <thead>
              <tr>
                <th>Mês</th><th>Fase</th><th class="num">Investimento</th><th class="num">Leads</th><th class="num">CPL</th>
                <th class="num">Qualificados</th><th class="num">Visitas</th><th class="num">Contratos (meta)</th><th class="num">Alerta abaixo de</th>
                <th class="num">Contratos (real)</th><th class="num">Clientes ativos</th><th class="num">Horas vendidas</th><th class="num">Ocupação</th>
                <th class="num">Receita nova</th><th class="num">CAC</th><th class="num">ROI acumulado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.mes" :class="{ cheio: r.excedeCapacidade }">
                <td class="fw">{{ mesCurto(r.mes) }}</td>
                <td class="muted small">{{ r.fase }}</td>
                <td class="num">{{ brl0(r.invest) }}</td>
                <td class="num">{{ n0(r.leads) }}</td>
                <td class="num">{{ brl0(r.cpl) }}</td>
                <td class="num">{{ n0(r.qualificados) }}</td>
                <td class="num">{{ n0(r.visitas) }}</td>
                <td class="num fw">{{ n0(r.novos) }}</td>
                <td class="num muted">{{ n0(r.novos * ALERTA) }}</td>
                <td class="num">
                  <template v-if="passou(r.mes)">
                    <span :class="(reais[r.mes] || 0) >= r.novos * ALERTA ? 'ok' : 'ruim'">{{ reais[r.mes] || 0 }}</span>
                  </template>
                  <span v-else class="muted">—</span>
                </td>
                <td class="num">{{ n0(r.ativos) }}</td>
                <td class="num">{{ n0(r.horas) }}</td>
                <td class="num">{{ pct0(r.ocupacao) }}</td>
                <td class="num">{{ brl0(r.receita) }}</td>
                <td class="num">{{ brl0(r.cac) }}</td>
                <td class="num" :class="r.roi >= 0 ? 'ok' : 'ruim'">{{ pct0(r.roi) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>12 meses</td><td />
                <td class="num">{{ brl0(plano.investTotal) }}</td>
                <td class="num">{{ n0(plano.leadsTotal) }}</td>
                <td class="num">{{ brl0(rows.reduce((a, r) => a + r.midia, 0) / rows.reduce((a, r) => a + r.leadsPagos, 0)) }}</td>
                <td class="num">{{ n0(rows.reduce((a, r) => a + r.qualificados, 0)) }}</td>
                <td class="num">{{ n0(rows.reduce((a, r) => a + r.visitas, 0)) }}</td>
                <td class="num">{{ n0(plano.novosTotal) }}</td>
                <td class="num">{{ n0(plano.novosTotal * ALERTA) }}</td>
                <td class="num">{{ Object.values(reais).reduce((a, b) => a + b, 0) }}</td>
                <td class="num">{{ n0(fim.ativos) }}</td>
                <td class="num">{{ n0(fim.horas) }}</td>
                <td class="num">{{ pct0(fim.ocupacao) }}</td>
                <td class="num">{{ brl0(plano.receitaTotal) }}</td>
                <td class="num">{{ brl0(plano.cacMedio) }}</td>
                <td class="num">{{ pct0(fim.roi) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="muted small nota">
          “Contratos (real)” conta os contratos da Carteira com campanha de origem e início no mês. CAC = investimento do mês ÷ contratos novos do mês.
          ROI acumulado = (margem de {{ pct0(PREMISSAS.margem) }} sobre a receita acumulada − investimento acumulado) ÷ investimento acumulado.
        </p>
      </section>

      <section class="card">
        <h2>Leads por canal, mês a mês</h2>
        <div class="table-wrap">
          <table class="metas">
            <thead>
              <tr><th>Canal</th><th v-for="r in rows" :key="r.mes" class="num">{{ mesCurto(r.mes) }}</th><th class="num">Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in [
                { k: 'meta', t: 'Instagram e Facebook (anúncios)' },
                { k: 'organico', t: 'Instagram orgânico' },
                { k: 'google', t: 'Google Ads' },
                { k: 'perfil', t: 'Google Perfil da Empresa' },
                { k: 'tiktok', t: 'TikTok (Spark Ads)' },
                { k: 'eventos', t: 'Eventos e faculdades' },
                { k: 'tradicional', t: 'Mídia tradicional' },
                { k: 'indicacao', t: 'Indicação' },
              ]" :key="c.k">
                <td>{{ c.t }}</td>
                <td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.porCanal[c.k]) }}</td>
                <td class="num fw">{{ n0(rows.reduce((a, r) => a + (r.porCanal[c.k] || 0), 0)) }}</td>
              </tr>
              <tr>
                <td>Avaliações no Google (acumulado)</td>
                <td v-for="r in rows" :key="r.mes" class="num">{{ n0(r.avaliacoes) }}</td>
                <td class="num fw">{{ n0(fim.avaliacoes) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Premissas do modelo</h2>
        <div class="kgrid">
          <div><span>Leads qualificados</span><strong>{{ pct0(PREMISSAS.qualif[0]) }} → {{ pct0(PREMISSAS.qualif[1]) }}</strong></div>
          <div><span>Qualificado → visita</span><strong>{{ pct0(PREMISSAS.visita[0]) }} → {{ pct0(PREMISSAS.visita[1]) }}</strong></div>
          <div><span>Visita → contrato</span><strong>{{ pct0(PREMISSAS.contrato[0]) }} → {{ pct0(PREMISSAS.contrato[1]) }}</strong></div>
          <div><span>Gasto mensal do cliente novo</span><strong>{{ brl0(PREMISSAS.ticket) }}</strong></div>
          <div><span>Saem por mês</span><strong>{{ pct0(PREMISSAS.churn) }}</strong></div>
          <div><span>Preço médio da hora</span><strong>{{ brl0(PREMISSAS.precoHora) }}</strong></div>
          <div><span>Margem de contribuição</span><strong>{{ pct0(PREMISSAS.margem) }}</strong></div>
          <div><span>Horas ocupadas hoje</span><strong>{{ n0(cap.ocupadas) }} de {{ n0(cap.total) }}</strong></div>
        </div>
        <p class="muted small nota">As taxas sobem da primeira para a segunda nos 6 primeiros meses, conforme roteiro, criativos e públicos melhoram. Os custos por lead caem do valor de teste ao otimizado em 4 meses. Ajuste as premissas em <span class="mono">src/lib/campanha.js</span> quando tiver os números reais dos primeiros 3 meses.</p>
      </section>
    </template>

    <!-- ===== indicadores ===== -->
    <template v-if="aba === 'indicadores'">
      <section class="card">
        <h2>Indicadores de acompanhamento</h2>
        <div class="table-wrap">
          <table class="redes">
            <thead><tr><th>Grupo</th><th>Indicador</th><th>Como calcular</th><th>Onde medir</th><th>Frequência</th></tr></thead>
            <tbody>
              <template v-for="g in gruposInd" :key="g">
                <tr v-for="(m, i) in indicadores.filter((x) => x.g === g)" :key="m.n">
                  <td><span v-if="i === 0" class="chip info plain">{{ g }}</span></td>
                  <td class="fw">{{ m.n }}</td>
                  <td class="muted">{{ m.f }}</td>
                  <td class="muted">{{ m.onde }}</td>
                  <td class="muted">{{ m.freq }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
      <section class="grid cols-2">
        <div class="card">
          <h2>Rotina de acompanhamento</h2>
          <ul class="bullets"><li v-for="x in rotina" :key="x">{{ x }}</li></ul>
        </div>
        <div class="card">
          <h2>Cuidados</h2>
          <ul class="bullets"><li v-for="c in cuidados" :key="c.t"><strong>{{ c.t }}.</strong> {{ c.d }}</li></ul>
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
.abas { display: flex; flex-wrap: wrap; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.abas button { border: 0; background: none; font: inherit; font-weight: 500; color: var(--text-2); padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.abas button:hover { background: var(--surface-2); }
.abas button.on { background: var(--accent-soft); color: var(--accent-ink); }
.sec-title { font-size: 17px; margin-bottom: 12px; }
.sub-h { font-size: 14px; margin: 18px 0 8px; }
.fw { font-weight: 500; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.fase { display: grid; gap: 6px; align-content: start; }
.fase h3 { font-size: 15px; margin: 4px 0 0; }
.fase p { margin: 0; color: var(--text-2); font-size: 13px; line-height: 1.5; }
.gaps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 12px; }
.gap { background: var(--surface-2); border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; align-content: start; font-size: 13px; }
.gap p { margin: 0; color: var(--text-2); line-height: 1.5; }
.small-chip { margin-left: 8px; height: 18px; font-size: 11px; }
.cal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; margin-top: 12px; }
.cal-m { border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: grid; gap: 4px; align-content: start; font-size: 12px; }
.cal-m header { display: flex; justify-content: space-between; }
.cal-m p { margin: 0; color: var(--text-2); line-height: 1.45; }
.cal-m.alto { border-color: var(--good); background: var(--good-soft); }
.cal-m.baixo { background: var(--surface-2); }
.acao-plano { display: grid; gap: 10px; }
.acao-plano p { margin: 4px 0 0; }
.toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.dado { display: grid; gap: 4px; align-content: start; }
.dado .grande { font-size: 24px; font-weight: 600; color: var(--accent-ink); }
.dado p { margin: 0; color: var(--text-2); font-size: 13px; line-height: 1.5; }
.seg-card { display: grid; gap: 10px; align-content: start; font-size: 13px; }
.seg-card header { display: flex; justify-content: space-between; gap: 8px; align-items: start; }
.seg-card h3 { font-size: 15px; margin: 0; }
.gancho { margin: 0; font-weight: 500; background: var(--surface-2); border-radius: 10px; padding: 8px 10px; }
.pd { margin: 0; display: grid; gap: 6px; }
.pd div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; }
.pd dt { color: var(--muted); }
.pd dd { margin: 0; color: var(--text-2); line-height: 1.5; }
.seg { display: inline-flex; flex-wrap: wrap; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; margin-top: 12px; }
.seg button { border: 0; background: transparent; color: var(--text-2); font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 8px; cursor: pointer; }
.seg button.destaque { font-weight: 600; color: var(--text); }
.seg button.on { background: var(--surface); color: var(--text); font-weight: 600; box-shadow: var(--shadow); }
.rede-h { display: flex; justify-content: space-between; align-items: start; gap: 12px; }
.rede-h p { margin: 2px 0 0; }
.bloco { margin-top: 14px; }
.painel-g { background: var(--surface-2); border-radius: 12px; padding: 14px 16px; display: grid; gap: 6px; align-content: start; }
.painel-g h3 { font-size: 14px; margin: 0 0 4px; }
.painel-g p { margin: 4px 0 0; color: var(--text-2); }
.lbl { display: block; font-size: 12px; color: var(--muted); margin-top: 6px; }
.mini-list { margin: 0; padding-left: 18px; display: grid; gap: 3px; color: var(--text-2); font-size: 13px; line-height: 1.45; }
.passos { margin: 8px 0 0; padding-left: 20px; display: grid; gap: 8px; color: var(--text-2); font-size: 13px; line-height: 1.55; }
.mini td { padding: 6px 4px; font-size: 13px; }
.mes-a-mes { margin-top: 6px; }
.redes td { vertical-align: top; font-size: 13px; }
.redes tr.off td { opacity: 0.65; }
.metas td, .metas th { white-space: nowrap; }
.metas tr.cheio td { background: var(--warn-soft); }
.ok { color: var(--good); font-weight: 600; }
.ruim { color: var(--bad); font-weight: 600; }
.nota { margin: 10px 0 0; line-height: 1.5; }
.kgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; margin-top: 12px; }
.kgrid > div { background: var(--surface-2); border-radius: 10px; padding: 10px 12px; display: grid; gap: 1px; }
.kgrid span { font-size: 12px; color: var(--muted); }
.kgrid strong { font-size: 16px; font-weight: 600; }
.bullets { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 8px; color: var(--text-2); line-height: 1.55; font-size: 13px; }
.bullets strong { color: var(--text); }
.fontes { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; }
.fontes li { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; }
</style>
