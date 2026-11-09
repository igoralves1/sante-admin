<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from './components/Icon.vue'
import { state, carregar, exportarJSON, publicadoMaisNovo, descartarLocal } from './lib/store'
import { addMes, mesLongo } from './lib/format'

const route = useRoute()
onMounted(carregar)

const nav = [
  // nomes do domínio da contabilidade gerencial
  { to: '/', label: 'Visão geral', icon: 'home' },
  { to: '/painel', label: 'Painel gerencial', icon: 'painel' },
  { to: '/situacao', label: 'Carteira de contratos', icon: 'reservas' },
  { to: '/espacos', label: 'Centros de custo', icon: 'espacos' },
  { to: '/profissionais', label: 'Locatários', icon: 'user' },
  { to: '/estatisticas', label: 'Projeções e cenários', icon: 'stats' },
  { to: '/marketing', label: 'Comercial', icon: 'marketing' },
  { to: '/concorrentes', label: 'Análise de mercado', icon: 'users' },
  { to: '/financeiro', label: 'Custos e equilíbrio', icon: 'financeiro' },
  {
    to: '/dados',
    label: 'Base de dados',
    icon: 'dados',
    filhos: [
      { to: '/dados/diagrama', label: 'Diagrama do banco', icon: 'diagrama' },
      { to: '/dados/consultas', label: 'Tabelas e consultas', icon: 'tabela' },
    ],
  },
  { to: '/documentacao-api', label: 'Documentação da API', icon: 'api' },
]

// tema: auto -> claro -> escuro
const TEMAS = ['auto', 'light', 'dark']
const tema = ref('auto')
try {
  tema.value = localStorage.getItem('sante-tema') || 'auto'
} catch {
  /* ignore */
}
function aplicarTema() {
  if (tema.value === 'auto') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', tema.value)
}
aplicarTema()
function trocarTema() {
  tema.value = TEMAS[(TEMAS.indexOf(tema.value) + 1) % 3]
  try {
    localStorage.setItem('sante-tema', tema.value)
  } catch {
    /* ignore */
  }
  aplicarTema()
}
const temaIcone = computed(() => ({ auto: 'auto', light: 'sun', dark: 'moon' })[tema.value])
const temaLabel = computed(() => ({ auto: 'Tema automático', light: 'Tema claro', dark: 'Tema escuro' })[tema.value])

const instagram = computed(() => state.data?.meta?.instagram)
const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const statusServidor = computed(() => {
  const s = state.servidor
  if (s.status === 'salvando') return 'Salvando no servidor…'
  if (s.status === 'erro') return 'Erro ao salvar'
  if (s.status === 'offline') return 'Servidor sem conexão'
  return s.salvoEm ? `Salvo no servidor às ${hora(s.salvoEm)}` : 'Conectado ao servidor'
})
const recarregar = () => window.location.reload()
</script>

<template>
  <div v-if="state.loaded" class="shell">
    <aside class="side">
      <RouterLink to="/" class="brand">
        <span class="logo">S</span>
        <span class="brand-txt"><strong>Santé Admin</strong><small>Consultórios · Maceió</small></span>
      </RouterLink>
      <nav class="nav">
        <template v-for="n in nav" :key="n.to">
          <RouterLink :to="n.to" class="nav-item" :class="{ 'router-link-active': route.meta.secao === n.to }">
            <Icon :name="n.icon" /> <span>{{ n.label }}</span>
          </RouterLink>
          <RouterLink v-for="f in n.filhos || []" :key="f.to" :to="f.to" class="nav-item sub">
            <Icon :name="f.icon" :size="16" /> <span>{{ f.label }}</span>
          </RouterLink>
        </template>
      </nav>
      <div class="side-foot">
        <RouterLink v-if="state.modo === 'api'" to="/dados" class="nav-item sync" :class="state.servidor.status" :title="`Servidor: ${state.servidor.url}`">
          <Icon name="dados" /> <span>{{ statusServidor }}</span>
        </RouterLink>
        <a v-if="instagram" :href="instagram" target="_blank" rel="noopener" class="nav-item">
          <Icon name="insta" /> <span>@santeconsultoriosmaceio</span>
        </a>
        <button class="nav-item" type="button" :title="temaLabel" @click="trocarTema">
          <Icon :name="temaIcone" /> <span>{{ temaLabel }}</span>
        </button>
      </div>
    </aside>

    <main class="main">
      <header v-if="!route.meta.home" class="topbar">
        <div>
          <h1>{{ route.meta.dinamico && state.tituloPagina ? state.tituloPagina : route.meta.title }}</h1>
          <p v-if="route.meta.mes" class="muted sub">Referência: {{ mesLongo(state.mes) }}</p>
        </div>
        <div v-if="route.meta.mes" class="month">
          <button class="btn icon" type="button" aria-label="Mês anterior" @click="state.mes = addMes(state.mes, -1)"><Icon name="left" /></button>
          <input v-model="state.mes" type="month" aria-label="Mês de análise" required />
          <button class="btn icon" type="button" aria-label="Próximo mês" @click="state.mes = addMes(state.mes, 1)"><Icon name="right" /></button>
        </div>
      </header>

      <div v-if="state.modo === 'local' && state.servidor.status === 'offline'" class="banner">
        <Icon name="alert" />
        <span>
          O servidor <strong>{{ state.servidor.url }}</strong> não respondeu<template v-if="state.servidor.erro"> ({{ state.servidor.erro }})</template>.
          Usando os dados deste navegador.
        </span>
        <span class="toolbar">
          <button class="btn sm" type="button" @click="recarregar">Tentar de novo</button>
          <RouterLink to="/dados" class="btn sm ghost">Configurar servidor</RouterLink>
        </span>
      </div>
      <div v-if="state.modo === 'api' && state.servidor.status === 'erro'" class="banner bad">
        <Icon name="alert" />
        <span>
          <strong>Não foi salvo:</strong> {{ state.servidor.erro }}
          A tela voltou para o que está gravado no servidor.
        </span>
        <span class="toolbar"><button class="btn sm ghost" type="button" @click="state.servidor.status = 'ok'">Fechar</button></span>
      </div>
      <div v-if="state.modo === 'api' && state.servidor.status === 'offline'" class="banner">
        <Icon name="alert" />
        <span>Sem conexão com o servidor. Alterações feitas agora podem não ser salvas.</span>
      </div>
      <div v-if="state.modo === 'local' && state.local" class="banner">
        <Icon name="alert" />
        <span>
          Há alterações salvas <strong>só neste navegador</strong>.
          Para atualizar o link público, exporte o arquivo e publique no repositório.
          <template v-if="publicadoMaisNovo()"> A versão publicada é mais recente que a sua cópia.</template>
        </span>
        <span class="toolbar">
          <button class="btn sm" type="button" @click="exportarJSON"><Icon name="download" :size="15" /> Exportar sante.json</button>
          <RouterLink to="/dados" class="btn sm ghost">Como publicar</RouterLink>
          <button class="btn sm ghost" type="button" @click="descartarLocal">Descartar</button>
        </span>
      </div>

      <RouterView />

      <footer class="foot muted small">
        Santé Admin · dados do documento “Potencial Santé”, da planilha de controle e do
        <a :href="state.data.meta.site" target="_blank" rel="noopener">site da Santé</a>.
      </footer>
    </main>
  </div>
  <div v-else class="loading">
    <span v-if="state.erro">{{ state.erro }}</span>
    <span v-else>Carregando…</span>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 240px minmax(0, 1fr); min-height: 100vh; }
.side {
  position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 20px;
  padding: 20px 14px; background: var(--surface); border-right: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px; text-decoration: none; color: var(--text); }
.logo { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: #1c5cab; color: #fff; font-weight: 700; font-size: 18px; flex: none; }
.brand-txt { display: grid; line-height: 1.2; }
.brand-txt small { color: var(--muted); font-size: 12px; }
.nav { display: grid; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; height: 38px; padding: 0 10px; border-radius: 10px;
  color: var(--text-2); text-decoration: none; font: inherit; font-weight: 500; border: 0; background: none; cursor: pointer; text-align: left; width: 100%;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.nav-item:hover { background: var(--surface-2); color: var(--text); }
.nav-item.sub { height: 32px; padding-left: 38px; font-size: 13px; }
.nav-item.router-link-exact-active, .nav-item.router-link-active:not([href='#/']) { background: var(--accent-soft); color: var(--accent-ink); }
.side-foot { margin-top: auto; display: grid; gap: 2px; border-top: 1px solid var(--border); padding-top: 12px; }
.side-foot .nav-item span { overflow: hidden; text-overflow: ellipsis; }

.main { padding: 24px 32px 32px; min-width: 0; display: grid; gap: 20px; align-content: start; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.topbar h1 { font-size: 22px; }
.sub { margin: 2px 0 0; font-size: 13px; }
.month { display: flex; gap: 6px; align-items: center; }
.month input { width: 160px; }
.banner {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  background: var(--warn-soft); color: var(--text); border-radius: 12px; padding: 10px 14px; font-size: 13px;
}
.banner > svg { color: var(--warn); flex: none; }
.banner.bad { background: var(--bad-soft); }
.banner.bad > svg { color: var(--bad); }
.sync > svg { color: var(--good); }
.sync.salvando > svg, .sync.offline > svg { color: var(--warn); }
.sync.erro > svg { color: var(--bad); }
.banner > span:first-of-type { flex: 1 1 320px; }
.foot { padding-top: 8px; }
.loading { display: grid; place-items: center; min-height: 100vh; color: var(--muted); }

@media (max-width: 900px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .side { position: sticky; z-index: 5; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 16px; border-right: 0; border-bottom: 1px solid var(--border); }
  .nav { display: flex; order: 3; width: 100%; overflow-x: auto; gap: 4px; scrollbar-width: none; }
  .nav-item { width: auto; flex: none; height: 34px; }
  .nav-item.sub { height: 34px; padding-left: 10px; font-size: inherit; }
  .side-foot { margin: 0 0 0 auto; border: 0; padding: 0; display: flex; }
  .side-foot .nav-item span { display: none; }
  .main { padding: 16px; }
  .topbar h1 { font-size: 19px; }
}
</style>
