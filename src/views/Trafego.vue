<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatTile from '../components/StatTile.vue'
import Icon from '../components/Icon.vue'
import { state } from '../lib/store'
import { resumoMes } from '../lib/calc'
import { CANAIS, INICIO, MESES, capacidadeSalas, simularPlano, verba } from '../lib/campanha'
import { addMes, brl0, mesCurto } from '../lib/format'
import { escopo, fundacao, midias, kpis, rotina, regras, contratacao } from '../data/trafego'

const route = useRoute()
const router = useRouter()
const ABAS = [
  { k: 'resumo', t: 'Visão geral' },
  { k: 'acoes', t: 'Ações por mídia' },
  { k: 'metas', t: 'Metas do mês' },
  { k: 'indicadores', t: 'Indicadores' },
  { k: 'rotina', t: 'Rotina e regras' },
  { k: 'contratar', t: 'Contratar o especialista' },
]
const aba = ref(ABAS.some((a) => a.k === route.query.aba) ? route.query.aba : 'resumo')
watch(aba, (v) => v !== route.query.aba && router.replace({ query: { ...route.query, aba: v } }))
watch(() => route.query.aba, (v) => ABAS.some((a) => a.k === v) && (aba.value = v))

const n0 = (v) => Math.round(v || 0).toLocaleString('pt-BR')
const canal = (k) => CANAIS.find((c) => c.k === k)

// ---------- metas do plano de campanha ----------
const plano = computed(() => simularPlano(capacidadeSalas(resumoMes(state.data, INICIO))))
const rows = computed(() => plano.value.rows.map((r) => {
  const vm = verba(canal('meta'), r.i)
  const vg = verba(canal('google'), r.i)
  const vt = verba(canal('tiktok'), r.i)
  const lm = r.porCanal.meta || 0
  const lg = r.porCanal.google || 0
  const lt = r.porCanal.tiktok || 0
  return {
    ...r,
    ig: { v: vm * 0.6, l: lm * 0.6 }, fb: { v: vm * 0.4, l: lm * 0.4 },
    google: { v: vg, l: lg }, tiktok: { v: vt, l: lt },
    custo: (v, l) => (l ? v / l : 0),
  }
}))
const total = computed(() => {
  const s = (f) => rows.value.reduce((a, r) => a + f(r), 0)
  return { midia: s((r) => r.midia), pagos: s((r) => r.leadsPagos), visitas: s((r) => r.visitas), novos: s((r) => r.novos) }
})
const verbaMidiaMes = computed(() => brl0(total.value.midia / MESES))
const nAcoes = midias.reduce((s, m) => s + m.acoes.length, 0)
const nKpis = midias.reduce((s, m) => s + m.acoes.reduce((a, x) => a + x.kpis.length, 0), 0)

// ---------- ações ----------
const sel = ref('meta-ig')
const midia = computed(() => midias.find((m) => m.id === sel.value))
const verbaMidia = (m) => (m.verba ? `${brl0(verba(canal(m.verba), 0) * m.parte)} → ${brl0(verba(canal(m.verba), 3) * m.parte)}/mês` : 'Sem verba própria')
const gruposKpi = [...new Set(kpis.map((k) => k.g))]
const FASE_TOM = { Setup: 'info', 'Mês 1–3': 'warn', 'Mês 4–9': 'good', 'Mês 10–12': 'plain', Contínuo: 'plain' }
</script>

<template>
  <div class="stack">
    <section class="card intro">
      <div class="intro-top">
        <RouterLink to="/marketing" class="btn sm ghost"><Icon name="back" :size="14" /> Comercial</RouterLink>
        <span class="chip info">{{ mesCurto(INICIO) }} a {{ mesCurto(addMes(INICIO, MESES - 1)) }}</span>
      </div>
      <h2>Plano de tráfego: o trabalho do especialista em todas as mídias</h2>
      <p class="txt">{{ escopo.resumo }}</p>
      <p class="txt muted small">As metas vêm do <RouterLink to="/marketing/campanha?aba=metas">Plano de campanha</RouterLink>. Cada ação tem indicador, meta e ponto de alerta: abaixo da meta, segue; no alerta, o especialista age.</p>
    </section>

    <section class="grid cols-4 tiles">
      <StatTile label="Verba de mídia" :value="`${verbaMidiaMes}/mês`" :hint="`${brl0(total.midia)} em 12 meses (Meta, Google, TikTok)`" />
      <StatTile label="Leads pagos esperados" :value="n0(total.pagos)" tone="good" :hint="`CPL médio ${brl0(total.midia / total.pagos)}`" />
      <StatTile label="Mídias e ações" :value="`${midias.length} mídias · ${nAcoes} ações`" :hint="`${nKpis} indicadores com meta e alerta`" />
      <StatTile label="Rotina do especialista" value="15 min/dia + 2 h/semana" hint="Relatório toda segunda, fechamento mensal" />
    </section>

    <div class="abas" role="tablist">
      <button v-for="a in ABAS" :key="a.k" type="button" role="tab" :aria-selected="aba === a.k" :class="{ on: aba === a.k }" @click="aba = a.k">{{ a.t }}</button>
    </div>

    <!-- ===== visão geral ===== -->
    <template v-if="aba === 'resumo'">
      <section class="grid cols-2">
        <div class="card">
          <h2>O que é do especialista</h2>
          <ul class="checks"><li v-for="x in escopo.responde" :key="x"><Icon name="check" :size="15" /><span>{{ x }}</span></li></ul>
        </div>
        <div class="card">
          <h2>O que não é (mas ele acompanha)</h2>
          <ul class="bullets"><li v-for="x in escopo.naoResponde" :key="x">{{ x }}</li></ul>
          <h3 class="sub-h">Mídias cobertas</h3>
          <div class="chips"><span v-for="m in midias" :key="m.id" class="chip" :class="m.destaque ? 'info' : 'plain'">{{ m.n }}</span></div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2>Fundação: antes do primeiro anúncio</h2>
            <p>Sem rastreamento não dá para saber o que traz contrato. É a primeira entrega do especialista.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="lista">
            <thead><tr><th>Item</th><th>O que fazer</th><th>Pronto quando</th></tr></thead>
            <tbody><tr v-for="f in fundacao" :key="f.t"><td class="fw">{{ f.t }}</td><td class="muted">{{ f.d }}</td><td>{{ f.kpi }}</td></tr></tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- ===== ações por mídia ===== -->
    <template v-if="aba === 'acoes'">
      <section class="card">
        <h2>Escolha a mídia</h2>
        <div class="seg" role="tablist">
          <button v-for="m in midias" :key="m.id" type="button" role="tab" :aria-selected="sel === m.id" :class="{ on: sel === m.id, destaque: m.destaque }" @click="sel = m.id">{{ m.n }}</button>
        </div>
      </section>

      <section v-if="midia" class="card">
        <header class="m-head">
          <div>
            <h2>{{ midia.n }}</h2>
            <p class="muted small">Verba: {{ verbaMidia(midia) }} · {{ midia.acoes.length }} ações</p>
          </div>
        </header>
        <div class="acoes">
          <article v-for="a in midia.acoes" :key="a.a" class="acao">
            <div class="acao-h">
              <span class="chip" :class="FASE_TOM[a.fase]">{{ a.fase }}</span>
              <h3>{{ a.a }}</h3>
              <span class="muted small freq"><Icon name="clock" :size="13" /> {{ a.freq }}</span>
            </div>
            <p class="como">{{ a.como }}</p>
            <table class="kpi">
              <thead><tr><th>Indicador</th><th>Meta</th><th>Alerta (agir)</th></tr></thead>
              <tbody>
                <tr v-for="k in a.kpis" :key="k[0]"><td class="fw">{{ k[0] }}</td><td class="ok">{{ k[1] }}</td><td class="ruim">{{ k[2] }}</td></tr>
              </tbody>
            </table>
          </article>
        </div>
      </section>
    </template>

    <!-- ===== metas do mês ===== -->
    <template v-if="aba === 'metas'">
      <section class="card">
        <div class="card-head">
          <div>
            <h2>Verba, leads e custo por lead por canal, mês a mês</h2>
            <p>O que o especialista precisa entregar em cada mês. A coluna “Custo” é a meta de custo por lead do canal naquele mês (já com o peso do mês). Leads abaixo do mínimo ou custo 30% acima da meta = revisar.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="metas">
            <thead>
              <tr>
                <th rowspan="2">Mês</th>
                <th colspan="3" class="grp">Instagram</th>
                <th colspan="3" class="grp">Facebook</th>
                <th colspan="3" class="grp">Google busca</th>
                <th colspan="3" class="grp">TikTok</th>
                <th colspan="4" class="grp">Total pago</th>
              </tr>
              <tr>
                <template v-for="c in 4" :key="c"><th class="num">Verba</th><th class="num">Leads</th><th class="num">Custo</th></template>
                <th class="num">Verba</th><th class="num">Leads</th><th class="num">CPL</th><th class="num">Mín. (70%)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.mes">
                <td class="fw">{{ mesCurto(r.mes) }}</td>
                <template v-for="k in ['ig', 'fb', 'google', 'tiktok']" :key="k">
                  <td class="num">{{ brl0(r[k].v) }}</td>
                  <td class="num">{{ r[k].v ? n0(r[k].l) : '—' }}</td>
                  <td class="num muted">{{ r[k].v ? brl0(r.custo(r[k].v, r[k].l)) : '—' }}</td>
                </template>
                <td class="num">{{ brl0(r.midia) }}</td>
                <td class="num fw">{{ n0(r.leadsPagos) }}</td>
                <td class="num">{{ brl0(r.cpl) }}</td>
                <td class="num muted">{{ n0(r.leadsPagos * 0.7) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>12 meses</td>
                <template v-for="k in ['ig', 'fb', 'google', 'tiktok']" :key="k">
                  <td class="num">{{ brl0(rows.reduce((a, r) => a + r[k].v, 0)) }}</td>
                  <td class="num">{{ n0(rows.reduce((a, r) => a + r[k].l, 0)) }}</td>
                  <td class="num muted">{{ brl0(rows.reduce((a, r) => a + r[k].v, 0) / (rows.reduce((a, r) => a + r[k].l, 0) || 1)) }}</td>
                </template>
                <td class="num">{{ brl0(total.midia) }}</td>
                <td class="num">{{ n0(total.pagos) }}</td>
                <td class="num">{{ brl0(total.midia / total.pagos) }}</td>
                <td class="num muted">{{ n0(total.pagos * 0.7) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="muted small nota">“Custo” = verba ÷ leads esperados no mês (já com o peso de cada mês). Instagram e Facebook dividem a verba Meta em 60/40. Os leads orgânicos, de eventos e de indicação estão no Plano de campanha e não entram aqui.</p>
      </section>

      <section class="card">
        <h2>Do lead ao contrato (metas que o especialista acompanha)</h2>
        <div class="table-wrap">
          <table class="metas">
            <thead><tr><th>Mês</th><th class="num">Leads (todos)</th><th class="num">Qualificados</th><th class="num">Visitas</th><th class="num">Contratos</th><th class="num">Custo por visita (mídia)</th><th class="num">CAC de mídia</th></tr></thead>
            <tbody>
              <tr v-for="r in rows" :key="r.mes">
                <td class="fw">{{ mesCurto(r.mes) }}</td>
                <td class="num">{{ n0(r.leads) }}</td>
                <td class="num">{{ n0(r.qualificados) }}</td>
                <td class="num">{{ n0(r.visitas) }}</td>
                <td class="num fw">{{ n0(r.novos) }}</td>
                <td class="num">{{ brl0(r.midia / (r.visitas * (r.leadsPagos / r.leads))) }}</td>
                <td class="num">{{ brl0(r.midia / (r.novos * (r.leadsPagos / r.leads))) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="muted small nota">Custo por visita e CAC de mídia consideram só a parte das visitas e contratos que veio de leads pagos.</p>
      </section>
    </template>

    <!-- ===== indicadores ===== -->
    <template v-if="aba === 'indicadores'">
      <section class="card">
        <h2>Indicadores do especialista de tráfego</h2>
        <div class="table-wrap">
          <table class="lista">
            <thead><tr><th>Grupo</th><th>Indicador</th><th>Como calcular</th><th>Para que serve</th></tr></thead>
            <tbody>
              <template v-for="g in gruposKpi" :key="g">
                <tr v-for="(k, i) in kpis.filter((x) => x.g === g)" :key="k.n">
                  <td><span v-if="i === 0" class="chip info plain">{{ g }}</span></td>
                  <td class="fw">{{ k.n }}</td>
                  <td class="muted">{{ k.f }}</td>
                  <td class="muted">{{ k.por }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- ===== rotina ===== -->
    <template v-if="aba === 'rotina'">
      <section class="grid cols-2">
        <div v-for="r in rotina" :key="r.f" class="card">
          <h2>{{ r.f }}</h2>
          <ul class="checks"><li v-for="x in r.itens" :key="x"><Icon name="check" :size="15" /><span>{{ x }}</span></li></ul>
        </div>
      </section>
      <section class="card">
        <h2>Regras de otimização</h2>
        <div class="gaps">
          <div v-for="r in regras" :key="r.t" class="gap"><strong>{{ r.t }}</strong><p>{{ r.d }}</p></div>
        </div>
      </section>
    </template>

    <!-- ===== contratar ===== -->
    <template v-if="aba === 'contratar'">
      <section class="grid cols-2">
        <div class="card">
          <h2>Perfil</h2>
          <ul class="checks"><li v-for="x in contratacao.perfil" :key="x"><Icon name="check" :size="15" /><span>{{ x }}</span></li></ul>
        </div>
        <div class="card">
          <h2>Entregas combinadas</h2>
          <ul class="bullets"><li v-for="x in contratacao.entregas" :key="x">{{ x }}</li></ul>
        </div>
      </section>
      <section class="card">
        <h2>Como avaliar o especialista</h2>
        <table class="kpi">
          <thead><tr><th>Indicador</th><th>Meta</th></tr></thead>
          <tbody><tr v-for="a in contratacao.avaliacao" :key="a[0]"><td class="fw">{{ a[0] }}</td><td>{{ a[1] }}</td></tr></tbody>
        </table>
        <p class="muted small nota">{{ contratacao.custo }}</p>
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
.fw { font-weight: 500; }
.sub-h { font-size: 14px; margin: 16px 0 8px; }
.nota { margin: 10px 0 0; line-height: 1.5; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.checks { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; font-size: 13px; color: var(--text-2); line-height: 1.5; }
.checks li { display: flex; gap: 8px; align-items: flex-start; }
.checks svg { flex: none; margin-top: 3px; color: var(--good); }
.bullets { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 8px; color: var(--text-2); line-height: 1.55; font-size: 13px; }
.lista td { vertical-align: top; font-size: 13px; }
.seg { display: inline-flex; flex-wrap: wrap; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; margin-top: 10px; }
.seg button { border: 0; background: transparent; color: var(--text-2); font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 8px; cursor: pointer; }
.seg button.destaque { font-weight: 600; color: var(--text); }
.seg button.on { background: var(--surface); color: var(--text); font-weight: 600; box-shadow: var(--shadow); }
.m-head h2 { margin: 0; }
.m-head p { margin: 2px 0 0; }
.acoes { display: grid; gap: 14px; margin-top: 14px; }
.acao { border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: grid; gap: 8px; }
.acao-h { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.acao-h h3 { font-size: 15px; margin: 0; flex: 1 1 220px; }
.freq { display: inline-flex; align-items: center; gap: 4px; }
.como { margin: 0; color: var(--text-2); font-size: 13px; line-height: 1.55; }
.kpi { font-size: 13px; }
.kpi td, .kpi th { padding: 6px 8px; }
.ok { color: var(--good); }
.ruim { color: var(--bad); }
.metas td, .metas th { white-space: nowrap; }
.metas th.grp { text-align: center; border-bottom: 1px solid var(--border); color: var(--text-2); }
.gaps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
.gap { background: var(--surface-2); border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; align-content: start; font-size: 13px; }
.gap p { margin: 0; color: var(--text-2); line-height: 1.5; }
</style>
