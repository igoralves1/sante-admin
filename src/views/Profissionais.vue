<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import Modal from '../components/Modal.vue'
import StatTile from '../components/StatTile.vue'
import { state } from '../lib/store'
import { ativoAg, unidadesAg } from '../lib/agenda'
import { brl, clone, num, uid } from '../lib/format'

// Redes e perfis profissionais. `base` monta o link quando a pessoa digita só o @usuário.
const REDES = [
  { k: 'instagram', t: 'Instagram', base: 'https://www.instagram.com/', ph: '@usuario' },
  { k: 'facebook', t: 'Facebook', base: 'https://www.facebook.com/', ph: 'usuario ou link' },
  { k: 'linkedin', t: 'LinkedIn', base: 'https://www.linkedin.com/in/', ph: 'usuario ou link' },
  { k: 'tiktok', t: 'TikTok', base: 'https://www.tiktok.com/@', ph: '@usuario' },
  { k: 'youtube', t: 'YouTube', base: 'https://www.youtube.com/@', ph: '@canal' },
  { k: 'x', t: 'X (Twitter)', base: 'https://x.com/', ph: '@usuario' },
  { k: 'threads', t: 'Threads', base: 'https://www.threads.net/@', ph: '@usuario' },
  { k: 'kwai', t: 'Kwai', base: 'https://www.kwai.com/@', ph: '@usuario' },
  { k: 'pinterest', t: 'Pinterest', base: 'https://www.pinterest.com/', ph: 'usuario' },
  { k: 'site', t: 'Site', base: '', ph: 'www.seusite.com.br' },
  { k: 'doctoralia', t: 'Doctoralia', base: '', ph: 'link do perfil' },
  { k: 'lattes', t: 'Currículo Lattes', base: '', ph: 'link do Lattes' },
]
const PROFISSOES = ['Psicologia', 'Nutrição', 'Fisioterapia', 'Medicina', 'Fonoaudiologia', 'Terapia ocupacional', 'Psicopedagogia', 'Educação física', 'Odontologia', 'Enfermagem', 'Biomedicina']
const CANAIS = ['Instagram', 'Google', 'TikTok', 'Indicação de colega', 'Faculdade ou liga acadêmica', 'Workshop da Santé', 'WhatsApp', 'Passou na frente', 'Outro']

function linkRede(r, v) {
  const x = (v || '').trim()
  if (!x) return ''
  if (/^https?:\/\//i.test(x)) return x
  if (r.base) return r.base + x.replace(/^@/, '').replace(/^\/+/, '')
  return `https://${x.replace(/^\/+/, '')}`
}
const whats = (tel) => {
  const d = (tel || '').replace(/\D/g, '')
  if (!d) return ''
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`
}

const lista = computed(() => state.data.profissionais || [])
const busca = ref('')
const anoAtual = Number(state.mes.slice(0, 4))
const uso = computed(() => {
  const m = {}
  const espPorId = Object.fromEntries(state.data.espacos.map((e) => [e.id, e]))
  for (const a of state.data.agendamentos || []) {
    if (!ativoAg(a) || !a.profissionalId) continue
    const u = (m[a.profissionalId] ||= { total: 0, mes: 0, turnosMes: 0, receitaMes: 0, receita: 0, salas: new Set() })
    u.total++
    u.receita += Number(a.valor) || 0
    u.salas.add(espPorId[a.espacoId]?.nome || a.espacoId)
    if (a.data.startsWith(state.mes)) {
      u.mes++
      u.turnosMes += a.slots.length
      u.receitaMes += Number(a.valor) || 0
    }
  }
  return m
})
const linhas = computed(() => {
  const q = busca.value.trim().toLowerCase()
  return [...lista.value]
    .filter((p) => !q || [p.nome, p.profissao, p.especialidade, p.registro].some((x) => (x || '').toLowerCase().includes(q)))
    .sort((a, b) => a.nome.localeCompare(b.nome))
})
const tiles = computed(() => ({
  total: lista.value.length,
  ativos: lista.value.filter((p) => uso.value[p.id]?.mes).length,
  novos: lista.value.filter((p) => Number(p.anoFormatura) >= anoAtual - 3).length,
  semRede: lista.value.filter((p) => !REDES.some((r) => (p.redes || {})[r.k]) && !(p.outras || []).length).length,
}))
const redesDe = (p) => [
  ...REDES.filter((r) => (p.redes || {})[r.k]).map((r) => ({ t: r.t, u: linkRede(r, p.redes[r.k]) })),
  ...(p.outras || []).filter((o) => o.url).map((o) => ({ t: o.rotulo || 'Link', u: linkRede({ base: '' }, o.url) })),
]

// ---------- formulário ----------
const edit = ref(null)
const erro = ref('')
const vazio = () => ({
  id: '', nome: '', profissao: '', especialidade: '', registro: '', anoFormatura: '', telefone: '', email: '',
  canal: '', redes: Object.fromEntries(REDES.map((r) => [r.k, ''])), outras: [], obs: '', criadoEm: '',
})
function novo() {
  erro.value = ''
  edit.value = vazio()
}
function editar(p) {
  erro.value = ''
  const v = vazio()
  const c = clone(p)
  edit.value = { ...v, ...c, redes: { ...v.redes, ...(c.redes || {}) }, outras: c.outras || [] }
}
function salvar() {
  const p = edit.value
  p.nome = p.nome.trim()
  if (!p.nome) return (erro.value = 'Informe o nome.')
  if (lista.value.some((x) => x.id !== p.id && x.nome.toLowerCase() === p.nome.toLowerCase())) return (erro.value = 'Já existe um profissional com esse nome.')
  p.redes = Object.fromEntries(Object.entries(p.redes).filter(([, v]) => (v || '').trim()).map(([k, v]) => [k, v.trim()]))
  p.outras = p.outras.filter((o) => (o.url || '').trim())
  const arr = (state.data.profissionais ||= [])
  if (p.id) {
    arr.splice(arr.findIndex((x) => x.id === p.id), 1, p)
    // mantém o nome atualizado nos agendamentos
    ;(state.data.agendamentos || []).forEach((a) => a.profissionalId === p.id && (a.cliente = p.nome))
  } else arr.push({ ...p, id: uid('p'), criadoEm: new Date().toISOString().slice(0, 10) })
  edit.value = null
}
function excluir(p) {
  const n = (state.data.agendamentos || []).filter((a) => a.profissionalId === p.id).length
  const msg = n ? `${p.nome} tem ${n} agendamento(s). Eles continuam na agenda com o nome, sem o cadastro. Excluir mesmo assim?` : `Excluir o cadastro de ${p.nome}?`
  if (!confirm(msg)) return
  state.data.profissionais = lista.value.filter((x) => x.id !== p.id)
  ;(state.data.agendamentos || []).forEach((a) => a.profissionalId === p.id && (a.profissionalId = ''))
  edit.value = null
}
</script>

<template>
  <div class="stack">
    <section class="grid cols-4">
      <StatTile label="Profissionais cadastrados" :value="num(tiles.total)" />
      <StatTile label="Com reserva no mês" :value="num(tiles.ativos)" hint="Agendamentos no mês de referência" />
      <StatTile label="Formados há até 3 anos" :value="num(tiles.novos)" hint="Público da estratégia Primeiro Consultório" />
      <StatTile label="Sem rede social informada" :value="num(tiles.semRede)" :tone="tiles.semRede ? 'bad' : ''" />
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Profissionais</h2>
          <p>Quem aluga ou pode alugar os espaços. Os nomes aparecem na lista da agenda de cada sala.</p>
        </div>
        <div class="toolbar">
          <input v-model="busca" type="search" placeholder="Buscar por nome, profissão ou registro" aria-label="Buscar profissional" class="busca" />
          <button class="btn primary" type="button" @click="novo"><Icon name="plus" :size="16" /> Cadastrar profissional</button>
        </div>
      </div>
      <p class="note small">
        <strong>Dados pessoais:</strong> o cadastro fica salvo neste navegador. Ao exportar e publicar o <code>sante.json</code>,
        ele vai para o repositório público no GitHub. Publique telefone e e-mail só com autorização do profissional (LGPD).
      </p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>Profissão</th><th>Registro</th><th>Contato</th><th>Redes</th><th class="num">No mês</th><th class="num">Total</th><th /></tr>
          </thead>
          <tbody>
            <tr v-for="p in linhas" :key="p.id">
              <td>
                <button class="link-btn" type="button" @click="editar(p)">{{ p.nome }}</button>
                <span v-if="Number(p.anoFormatura) >= anoAtual - 3" class="chip info">Recém-formado</span>
              </td>
              <td>{{ p.profissao || '—' }}<span v-if="p.especialidade" class="muted small"> · {{ p.especialidade }}</span></td>
              <td>{{ p.registro || '—' }}</td>
              <td class="contato">
                <a v-if="p.telefone" :href="whats(p.telefone)" target="_blank" rel="noopener">{{ p.telefone }}</a>
                <a v-if="p.email" :href="`mailto:${p.email}`">{{ p.email }}</a>
                <span v-if="!p.telefone && !p.email" class="muted">—</span>
              </td>
              <td>
                <div class="redes">
                  <a v-for="r in redesDe(p)" :key="r.u" :href="r.u" target="_blank" rel="noopener" class="chip plain">{{ r.t }}</a>
                  <span v-if="!redesDe(p).length" class="muted">—</span>
                </div>
              </td>
              <td class="num">
                <template v-if="uso[p.id]?.mes">{{ uso[p.id].turnosMes }} {{ uso[p.id].turnosMes === 1 ? 'turno' : 'turnos' }}<br><span class="muted small">{{ brl(uso[p.id].receitaMes) }}</span></template>
                <span v-else class="muted">—</span>
              </td>
              <td class="num">
                <template v-if="uso[p.id]">{{ uso[p.id].total }} {{ uso[p.id].total === 1 ? 'reserva' : 'reservas' }}<br><span class="muted small">{{ brl(uso[p.id].receita) }}</span></template>
                <span v-else class="muted">—</span>
              </td>
              <td class="num">
                <button class="btn icon sm ghost" type="button" aria-label="Editar" @click="editar(p)"><Icon name="edit" :size="15" /></button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!linhas.length" class="empty">
          {{ lista.length ? 'Nenhum profissional encontrado com essa busca.' : 'Nenhum profissional cadastrado ainda.' }}
        </div>
      </div>
    </section>

    <Modal v-if="edit" :title="edit.id ? `Editar ${edit.nome}` : 'Cadastrar profissional'" @close="edit = null">
      <form class="form-grid" @submit.prevent="salvar">
        <h3 class="full sub">Dados profissionais</h3>
        <label class="field full">Nome completo<input v-model="edit.nome" required /></label>
        <label class="field">Profissão<input v-model="edit.profissao" list="profissoes" placeholder="Ex.: Psicologia" /></label>
        <datalist id="profissoes"><option v-for="x in PROFISSOES" :key="x" :value="x" /></datalist>
        <label class="field">Especialidade<input v-model="edit.especialidade" placeholder="Ex.: TCC, nutrição esportiva" /></label>
        <label class="field">Registro no conselho<input v-model="edit.registro" placeholder="Ex.: CRP-15/12345" /></label>
        <label class="field">Ano de formatura<input v-model.number="edit.anoFormatura" type="number" min="1950" :max="anoAtual + 1" /></label>

        <h3 class="full sub">Contato</h3>
        <label class="field">Telefone / WhatsApp<input v-model="edit.telefone" type="tel" placeholder="(82) 99999-9999" /></label>
        <label class="field">E-mail<input v-model="edit.email" type="email" /></label>
        <label class="field full">Como conheceu a Santé<select v-model="edit.canal"><option value="">—</option><option v-for="c in CANAIS" :key="c">{{ c }}</option></select></label>

        <h3 class="full sub">Redes sociais e perfis</h3>
        <label v-for="r in REDES" :key="r.k" class="field">{{ r.t }}<input v-model="edit.redes[r.k]" :placeholder="r.ph" /></label>
        <div class="full outras">
          <div v-for="(o, i) in edit.outras" :key="i" class="outra">
            <input v-model="o.rotulo" placeholder="Rede (ex.: Spotify)" aria-label="Nome da rede" />
            <input v-model="o.url" placeholder="Link" aria-label="Link" />
            <button class="btn icon sm ghost" type="button" aria-label="Remover" @click="edit.outras.splice(i, 1)"><Icon name="trash" :size="14" /></button>
          </div>
          <button class="btn sm" type="button" @click="edit.outras.push({ rotulo: '', url: '' })"><Icon name="plus" :size="14" /> Outra rede</button>
        </div>

        <label class="field full">Observações<textarea v-model="edit.obs" rows="2" /></label>
        <p v-if="erro" class="full erro small">{{ erro }}</p>
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
.busca { min-width: 260px; height: 36px; }
.note { margin: 0 0 12px; }
.link-btn { border: 0; background: none; padding: 0; font: inherit; font-weight: 500; color: var(--accent-ink); cursor: pointer; text-align: left; margin-right: 6px; }
.link-btn:hover { text-decoration: underline; }
.contato { display: grid; gap: 2px; font-size: 13px; }
.redes { display: flex; flex-wrap: wrap; gap: 4px; }
.redes a { text-decoration: none; }
td { vertical-align: top; }
.sub { font-size: 13px; color: var(--text-2); margin: 6px 0 -4px; }
.outras { display: grid; gap: 6px; justify-items: start; }
.outra { display: grid; grid-template-columns: 160px minmax(0, 1fr) auto; gap: 6px; width: 100%; }
.erro { color: var(--bad); margin: 0; }
.actions { display: flex; gap: 8px; align-items: center; }
.grow { flex: 1; }
@media (max-width: 560px) { .busca { min-width: 0; width: 100%; } .outra { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; } }
</style>
