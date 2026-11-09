<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icon from '../components/Icon.vue'
import { carregarOpenapi } from '../lib/banco'
import { urlApi } from '../lib/api'
import { baixar, state } from '../lib/store'

const alvo = ref(null)
const spec = ref(null)
const aoVivo = ref(false)
const erro = ref('')
const carregando = ref(true)

const operacoes = computed(() =>
  spec.value ? Object.values(spec.value.paths).reduce((n, p) => n + Object.keys(p).length, 0) : 0,
)
const servidor = computed(() => urlApi())

// o Swagger UI tem tema escuro próprio: liga a classe dark-mode no <html> enquanto a página está aberta
const escuroSistema = window.matchMedia('(prefers-color-scheme: dark)')
function aplicarTema() {
  const tema = document.documentElement.getAttribute('data-theme')
  const escuro = tema ? tema === 'dark' : escuroSistema.matches
  document.documentElement.classList.toggle('dark-mode', escuro)
}
const observador = new MutationObserver(aplicarTema)

async function montar() {
  carregando.value = true
  erro.value = ''
  try {
    const [r, mod] = await Promise.all([
      carregarOpenapi(),
      import('swagger-ui-dist/swagger-ui-es-bundle.js'),
      import('swagger-ui-dist/swagger-ui.css'),
    ])
    spec.value = r.spec
    aoVivo.value = r.aoVivo
    const SwaggerUI = mod.default || mod
    const doc = r.aoVivo ? { ...r.spec, servers: [{ url: servidor.value, description: 'Servidor conectado' }] } : r.spec
    SwaggerUI({
      spec: doc,
      domNode: alvo.value,
      deepLinking: false, // o site usa o # da URL para as páginas
      docExpansion: 'list',
      defaultModelsExpandDepth: 0,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: false,
      persistAuthorization: false,
      // a cópia publicada não tem servidor: só leitura
      supportedSubmitMethods: r.aoVivo ? ['get', 'put', 'post', 'delete', 'patch'] : [],
      syntaxHighlight: { activated: true, theme: 'agate' },
    })
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  aplicarTema()
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  escuroSistema.addEventListener('change', aplicarTema)
  montar()
})
onBeforeUnmount(() => {
  observador.disconnect()
  escuroSistema.removeEventListener('change', aplicarTema)
  document.documentElement.classList.remove('dark-mode')
})
watch(() => state.modo, () => {
  if (alvo.value) alvo.value.innerHTML = ''
  montar()
})

const baixarSpec = () => baixar('openapi.json', JSON.stringify(spec.value, null, 2))
</script>

<template>
  <div class="stack">
    <section class="card topo">
      <div class="info">
        <span v-if="aoVivo" class="chip good">Ao vivo do servidor</span>
        <span v-else-if="spec" class="chip warn">Cópia publicada</span>
        <span v-if="spec" class="muted small">
          {{ spec.info.title }} {{ spec.info.version }} · OpenAPI {{ spec.openapi }} · {{ Object.keys(spec.paths).length }} rotas, {{ operacoes }} operações
        </span>
      </div>
      <div class="toolbar">
        <template v-if="aoVivo">
          <a class="btn sm" :href="`${servidor}/docs`" target="_blank" rel="noopener"><Icon name="link" :size="15" /> Swagger no servidor</a>
          <a class="btn sm" :href="`${servidor}/redoc`" target="_blank" rel="noopener"><Icon name="link" :size="15" /> ReDoc</a>
        </template>
        <button v-if="spec" class="btn sm" type="button" @click="baixarSpec"><Icon name="download" :size="15" /> openapi.json</button>
      </div>
    </section>

    <p v-if="!aoVivo && spec" class="note">
      Sem servidor conectado, esta página mostra a cópia da documentação publicada com o site, e o botão
      <strong>Try it out</strong> fica desligado. Para testar as rotas, suba o sante-BE e conecte em
      <RouterLink to="/dados">Base de dados → Servidor</RouterLink>.
    </p>
    <p v-else-if="aoVivo" class="note">
      <strong>Try it out</strong> chama o servidor conectado (<span class="mono">{{ servidor }}</span>) de verdade:
      <span class="mono">PUT</span>, <span class="mono">POST</span> e <span class="mono">DELETE</span> alteram os dados do sistema.
    </p>

    <section class="card swagger-card">
      <div v-if="carregando" class="empty">Carregando a documentação…</div>
      <div v-else-if="erro" class="empty erro">
        <Icon name="alert" /> {{ erro }}
        <button class="btn sm" type="button" @click="montar">Tentar de novo</button>
      </div>
      <div ref="alvo" class="swagger" />
    </section>
  </div>
</template>

<style scoped>
.topo { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 16px; }
.info { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.note { margin: 0; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.swagger-card { padding: 4px 8px; }
.erro { color: var(--bad); display: flex; gap: 8px; align-items: center; justify-content: center; }

/* encaixa o Swagger UI no cartão e nas cores do site */
.swagger :deep(.swagger-ui) { font-family: inherit; color: var(--text); }
.swagger :deep(.swagger-ui .info) { margin: 24px 0; }
.swagger :deep(.swagger-ui .info .title) { font-family: inherit; color: var(--text); }
.swagger :deep(.swagger-ui .scheme-container) { background: transparent; box-shadow: none; padding: 8px 0 16px; }
.swagger :deep(.swagger-ui .wrapper) { padding: 0 12px; max-width: none; }
.swagger :deep(.swagger-ui .opblock-tag) { font-family: inherit; }
.swagger :deep(.swagger-ui .opblock .opblock-summary-description) { font-family: inherit; }
.swagger :deep(.swagger-ui .filter-container) { margin: 0; }
.swagger :deep(.swagger-ui .filter .operation-filter-input) { border: 1px solid var(--border); border-radius: 10px; }
</style>
