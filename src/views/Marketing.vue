<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import StatTile from '../components/StatTile.vue'
import { state, espacoPorId } from '../lib/store'
import { STATUS_CAMPANHA, resumoMes, resultadoCampanha } from '../lib/calc'
import { brl, brl0, clone, dataBR, num, pct, uid } from '../lib/format'

const r = computed(() => resumoMes(state.data, state.mes))
const meta = computed(() => state.data.metas?.ocupacaoAlvo || 0)
const camps = computed(() => state.data.campanhas.map((c) => ({ ...c, res: resultadoCampanha(state.data, c, state.mes) })))
const orig = (c) => state.data.campanhas.find((x) => x.id === c.id)
const abertas = (c) => c.status === 'Ativa' || c.status === 'Planejada'

const totais = computed(() => {
  const cs = camps.value
  return {
    ativas: cs.filter((c) => c.status === 'Ativa').length,
    planejadas: cs.filter((c) => c.status === 'Planejada').length,
    investimento: cs.reduce((a, c) => a + (Number(c.orcamento) || 0), 0),
    leads: cs.reduce((a, c) => a + (Number(c.leads) || 0), 0),
    contratos: cs.reduce((a, c) => a + c.res.contratos, 0),
    receita: cs.reduce((a, c) => a + c.res.receitaMensal, 0),
    receitaTotal: cs.reduce((a, c) => a + c.res.receitaTotal, 0),
  }
})

// Espaços abaixo da meta, ordenados pelo valor que falta para chegar nela
const prioridades = computed(() =>
  r.value.espacos
    .filter((e) => e.taxa < meta.value)
    .map((e) => ({
      ...e,
      falta: Math.max(0, meta.value * e.potencial - e.receitaOcupada),
      campanhas: state.data.campanhas.filter((c) => abertas(c) && c.espacos.includes(e.id)),
    }))
    .sort((a, b) => b.falta - a.falta),
)
const semCampanha = computed(() => prioridades.value.filter((p) => !p.campanhas.length).length)

const tom = { Ativa: 'good', Planejada: 'info', Pausada: 'warn', 'Concluída': 'plain' }

// ---------- formulário ----------
const edit = ref(null)
function nova(espaco) {
  edit.value = {
    id: '', nome: '', canal: 'Instagram', espacos: espaco ? [espaco] : [], inicio: `${state.mes}-01`, fim: '',
    orcamento: 0, leads: 0, visitas: 0, status: 'Planejada', obs: '',
  }
}
function editar(c) {
  const { res, ...rest } = c
  edit.value = clone(rest)
}
function salvar() {
  const c = edit.value
  if (!c.nome.trim()) return alert('Dê um nome à campanha.')
  ;['orcamento', 'leads', 'visitas'].forEach((k) => (c[k] = Number(c[k]) || 0))
  if (c.id) {
    const i = state.data.campanhas.findIndex((x) => x.id === c.id)
    state.data.campanhas.splice(i, 1, c)
  } else state.data.campanhas.push({ ...c, id: uid('k') })
  edit.value = null
}
function excluir(c) {
  if (!confirm(`Excluir a campanha “${c.nome}”? Os contratos ligados a ela ficam sem campanha.`)) return
  state.data.contratos.forEach((r) => r.campanha === c.id && (r.campanha = ''))
  state.data.campanhas = state.data.campanhas.filter((x) => x.id !== c.id)
  edit.value = null
}
function funil(c) {
  const top = Math.max(1, c.leads, c.visitas, c.res.contratos)
  return [
    { k: 'Leads', v: c.leads },
    { k: 'Visitas', v: c.visitas },
    { k: 'Contratos', v: c.res.contratos },
  ].map((s) => ({ ...s, w: `${(s.v / top) * 100}%` }))
}
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile label="Campanhas" :value="`${totais.ativas} ativas`" :hint="`${totais.planejadas} planejadas · ${state.data.campanhas.length} no total`" />
      <StatTile label="Leads registrados" :value="num(totais.leads)" :hint="`${totais.contratos} contratos atribuídos às campanhas`" />
      <StatTile label="Receita mensal atribuída" :value="brl(totais.receita)" :hint="`${brl0(totais.receitaTotal)} no valor total dos contratos`" />
      <StatTile label="Investimento" :value="brl(totais.investimento)">
        <template v-if="totais.investimento && totais.contratos">CAC médio {{ brl(totais.investimento / totais.contratos) }}</template>
        <template v-else>Orçamento somado das campanhas</template>
      </StatTile>
    </section>

    <section class="grid cols-3">
      <div class="card span-2">
        <div class="card-head">
          <div>
            <h2>Prioridades do mês</h2>
            <p>Espaços abaixo da meta de {{ pct(meta) }}, ordenados pela receita que falta para alcançá-la</p>
          </div>
          <span v-if="semCampanha" class="chip bad">{{ semCampanha }} sem campanha</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Espaço</th><th class="num">Ocupação</th><th class="num">Falta para a meta</th><th>Campanhas</th><th /></tr>
            </thead>
            <tbody>
              <tr v-for="p in prioridades" :key="p.id">
                <td><strong class="fw">{{ p.nome }}</strong> <span class="muted small">{{ p.modalidade }}</span></td>
                <td class="num">{{ pct(p.taxa) }}</td>
                <td class="num">{{ brl0(p.falta) }}</td>
                <td>
                  <div class="tags">
                    <span v-for="c in p.campanhas" :key="c.id" class="chip" :class="tom[c.status]">{{ c.nome }}</span>
                    <span v-if="!p.campanhas.length" class="chip bad">Sem campanha</span>
                  </div>
                </td>
                <td class="num">
                  <button class="btn sm ghost" type="button" @click="nova(p.id)"><Icon name="plus" :size="14" /> Campanha</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!prioridades.length" class="empty">Todos os espaços estão na meta neste mês.</div>
        </div>
      </div>

      <div class="card insta">
        <div class="card-head"><h2>Instagram</h2></div>
        <a :href="state.data.meta.instagram" target="_blank" rel="noopener" class="profile">
          <span class="avatar"><Icon name="insta" :size="22" /></span>
          <span><strong>@santeconsultoriosmaceio</strong><span class="muted small">Abrir perfil</span></span>
        </a>
        <ul class="tips small">
          <li>Mostre cada espaço vazio em um post próprio: foto, para quem serve, preço e como reservar.</li>
          <li>Use o link da bio para WhatsApp e registre cada contato como lead na campanha.</li>
          <li>Ao fechar um contrato em Situação atual, marque a campanha de origem: o resultado aparece aqui.</li>
        </ul>
      </div>
    </section>

    <section>
      <div class="section-head">
        <h2>Campanhas</h2>
        <button class="btn primary" type="button" @click="nova()"><Icon name="plus" :size="16" /> Nova campanha</button>
      </div>
      <div class="grid cols-2">
        <article v-for="c in camps" :key="c.id" class="card camp">
          <!-- c = cópia com resultado; orig = objeto editável -->
          <div class="camp-head">
            <div>
              <h3>{{ c.nome }}</h3>
              <p class="muted small">{{ c.canal }} · {{ dataBR(c.inicio) }}{{ c.fim ? ` a ${dataBR(c.fim)}` : '' }}</p>
            </div>
            <span class="chip" :class="tom[c.status]">{{ c.status }}</span>
          </div>
          <div class="tags">
            <span v-for="id in c.espacos" :key="id" class="chip plain">{{ espacoPorId(id)?.nome || id }}</span>
          </div>
          <div class="funnel">
            <div v-for="s in funil(c)" :key="s.k" class="f-row">
              <span class="small muted">{{ s.k }}</span>
              <div class="f-track"><div class="f-bar" :style="{ width: s.w }" /></div>
              <strong class="tnum small">{{ num(s.v) }}</strong>
            </div>
          </div>
          <dl class="kpis small">
            <div><dt>Receita/mês</dt><dd class="tnum">{{ brl0(c.res.receitaMensal) }}</dd></div>
            <div><dt>Orçamento</dt><dd class="tnum">{{ brl0(c.orcamento) }}</dd></div>
            <div><dt>Conversão</dt><dd class="tnum">{{ c.leads ? pct(c.res.conversao) : '—' }}</dd></div>
            <div><dt>CAC</dt><dd class="tnum">{{ c.res.contratos && c.orcamento ? brl0(c.res.cac) : '—' }}</dd></div>
            <div><dt>ROI</dt><dd class="tnum">{{ c.orcamento ? pct(c.res.roi) : '—' }}</dd></div>
          </dl>
          <p v-if="c.obs" class="muted small obs">{{ c.obs }}</p>
          <div class="camp-foot">
            <label class="mini">Leads <input v-model.number="orig(c).leads" type="number" min="0" /></label>
            <label class="mini">Visitas <input v-model.number="orig(c).visitas" type="number" min="0" /></label>
            <button class="btn sm" type="button" @click="editar(c)"><Icon name="edit" :size="14" /> Editar</button>
          </div>
        </article>
      </div>
      <div v-if="!camps.length" class="card empty">Nenhuma campanha cadastrada.</div>
    </section>

    <Modal v-if="edit" :title="edit.id ? 'Editar campanha' : 'Nova campanha'" @close="edit = null">
      <form class="form-grid" @submit.prevent="salvar">
        <label class="field full">Nome<input v-model="edit.nome" required placeholder="Ex.: Piscina — hidroterapia" /></label>
        <label class="field">Canal<input v-model="edit.canal" list="canais" /></label>
        <datalist id="canais">
          <option>Instagram</option><option>Instagram (anúncios)</option><option>Google Meu Negócio</option>
          <option>WhatsApp</option><option>Indicação</option><option>Parcerias</option><option>LinkedIn</option>
        </datalist>
        <label class="field">Status
          <select v-model="edit.status"><option v-for="s in STATUS_CAMPANHA" :key="s">{{ s }}</option></select>
        </label>
        <label class="field">Início<input v-model="edit.inicio" type="date" /></label>
        <label class="field">Fim<input v-model="edit.fim" type="date" /></label>
        <label class="field">Orçamento (R$)<input v-model="edit.orcamento" type="number" min="0" step="0.01" /></label>
        <label class="field">Leads<input v-model="edit.leads" type="number" min="0" /></label>
        <label class="field">Visitas ao espaço<input v-model="edit.visitas" type="number" min="0" /></label>
        <fieldset class="full espacos">
          <legend>Espaços-alvo</legend>
          <label v-for="e in state.data.espacos" :key="e.id" class="check">
            <input v-model="edit.espacos" type="checkbox" :value="e.id" /> {{ e.nome }}
          </label>
        </fieldset>
        <label class="field full">Estratégia / observações<textarea v-model="edit.obs" rows="3" /></label>
        <div class="full actions">
          <button v-if="edit.id" class="btn danger" type="button" @click="excluir(edit)"><Icon name="trash" :size="15" /> Excluir</button>
          <span class="grow" />
          <button class="btn" type="button" @click="edit = null">Cancelar</button>
          <button class="btn primary" type="submit">Salvar</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.fw { font-weight: 500; }
.tags { display: flex; flex-wrap: wrap; gap: 4px; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; }
.section-head h2 { font-size: 17px; }
.camp { display: grid; gap: 14px; align-content: start; }
.camp-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
.camp-head h3 { font-size: 15px; }
.camp-head p { margin: 2px 0 0; }
.funnel { display: grid; gap: 6px; }
.f-row { display: grid; grid-template-columns: 64px minmax(0, 1fr) 40px; gap: 10px; align-items: center; }
.f-row strong { text-align: right; }
.f-track { height: 10px; background: var(--s-track); border-radius: 4px; }
.f-bar { height: 100%; background: var(--s-firm); border-radius: 4px; min-width: 0; }
.kpis { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin: 0; padding: 10px 12px; background: var(--surface-2); border-radius: 10px; }
.kpis dt { color: var(--muted); }
.kpis dd { margin: 0; font-weight: 600; color: var(--text); }
@media (max-width: 560px) { .kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.obs { margin: 0; }
.camp-foot { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 12px; }
.mini { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-2); }
.mini input { width: 72px; height: 30px; }
.camp-foot .btn { margin-left: auto; }
.insta .profile { display: flex; gap: 12px; align-items: center; text-decoration: none; color: var(--text); padding: 10px; border-radius: 12px; background: var(--surface-2); }
.insta .profile > span:last-child { display: grid; }
.avatar { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, #f58529, #dd2a7b 50%, #8134af); flex: none; }
.tips { margin: 16px 0 0; padding-left: 18px; color: var(--text-2); display: grid; gap: 8px; }
.espacos { border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0; }
.espacos legend { font-size: 12px; font-weight: 500; color: var(--text-2); padding: 0 4px; }
.check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
.check input { height: auto; }
.actions { display: flex; gap: 8px; align-items: center; }
.grow { flex: 1; }
</style>
