import { reactive, watch } from 'vue'
import { clone, mesAtual } from './format'
import { normalizar } from './calc'
import { definirFonteTurnos } from './agenda'
import { planejar, req, urlApi } from './api'

const KEY = 'sante-admin:v2'
const KEY_ANTIGA = 'sante-ocupacao:v1'

// data: dados em uso (do servidor, ou publicados / editados neste navegador)
// publicado: conteúdo de public/data/sante.json, o que todos veem no link
// modo: 'api' = os dados vivem no servidor (sante-BE); 'local' = sante.json + cópia no navegador
export const state = reactive({
  loaded: false,
  erro: '',
  data: null,
  publicado: null,
  local: false,
  salvoEm: null,
  mes: mesAtual(),
  tituloPagina: '', // título da página quando ele depende dos dados (ex.: nome do espaço)
  modo: 'local',
  servidor: {
    url: '',
    status: '', // ok | salvando | erro | offline
    erro: '',
    salvoEm: null,
  },
})

// as contas de turnos leem state.data.turnos (o bloco central do sante.json)
definirFonteTurnos(() => state.data?.turnos)

let pularProximo = false

export function lerSalvo() {
  try {
    const v2 = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (v2?.data) return v2
    const v1 = JSON.parse(localStorage.getItem(KEY_ANTIGA) || 'null')
    if (v1?.data) return { salvoEm: v1.salvoEm, data: normalizar(v1.data) }
  } catch {
    /* armazenamento indisponível ou corrompido */
  }
  return null
}

export async function carregar() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/sante.json`, { cache: 'no-store' })
    state.publicado = normalizar(await res.json())
  } catch {
    state.erro = 'Não foi possível carregar data/sante.json.'
  }

  state.servidor.url = urlApi()
  if (state.servidor.url && (await conectar())) {
    state.loaded = true
    return
  }

  const salvo = lerSalvo()
  if (!state.publicado && !salvo) return
  if (salvo) {
    state.data = normalizar(salvo.data)
    state.local = true
    state.salvoEm = salvo.salvoEm
  } else {
    state.data = clone(state.publicado)
  }
  state.loaded = true
  iniciarModoLocal()
}

// ---------- modo local: sante.json + cópia no navegador ----------
function iniciarModoLocal() {
  watch(
    () => state.data,
    (v) => {
      if (pularProximo) {
        pularProximo = false
        return
      }
      state.salvoEm = new Date().toISOString()
      state.local = true
      try {
        localStorage.setItem(KEY, JSON.stringify({ salvoEm: state.salvoEm, data: v }))
      } catch {
        /* segue só em memória */
      }
    },
    { deep: true },
  )

  // outra aba do mesmo navegador salvou (ex.: turnos editados): atualiza esta na hora
  window.addEventListener('storage', (ev) => {
    if (ev.key !== KEY) return
    try {
      const novo = ev.newValue ? JSON.parse(ev.newValue) : null
      pularProximo = true
      if (novo?.data) {
        state.data = normalizar(novo.data)
        state.local = true
        state.salvoEm = novo.salvoEm
      } else if (state.publicado) {
        state.data = clone(state.publicado)
        state.local = false
        state.salvoEm = null
      }
    } catch {
      /* ignora conteúdo inválido */
    }
  })
}

// ---------- modo servidor ----------
let base = null // última versão que o servidor confirmou, no formato do front
let ultimoServidor = '' // resposta crua do último GET, para perceber mudanças de outras pessoas
let timer = null
let rodando = false
let pendente = false

async function conectar() {
  try {
    aplicar(await req('GET', '/dados'))
  } catch (e) {
    state.servidor.status = 'offline'
    state.servidor.erro = e.message === 'Failed to fetch' ? '' : e.message
    return false
  }
  state.modo = 'api'
  state.servidor.status = 'ok'
  state.servidor.erro = ''

  watch(
    () => state.data,
    () => {
      if (pularProximo) {
        pularProximo = false
        return
      }
      state.servidor.status = 'salvando'
      clearTimeout(timer)
      timer = setTimeout(sincronizar, 400)
    },
    { deep: true },
  )
  // outra pessoa (ou outra aba) mudou algo: busca a versão nova ao voltar para a aba e a cada 20 s
  window.addEventListener('focus', atualizar)
  setInterval(atualizar, 20000)
  return true
}

function aplicar(doc) {
  ultimoServidor = JSON.stringify(doc)
  pularProximo = state.data !== null
  state.data = normalizar(clone(doc))
  base = clone(state.data)
}

async function sincronizar() {
  timer = null
  if (rodando) {
    pendente = true
    return
  }
  rodando = true
  try {
    const alvo = clone(state.data)
    const ops = planejar(base, alvo)
    for (const [metodo, caminho, corpo] of ops) await req(metodo, caminho, corpo)
    base = alvo
    if (ops.length) ultimoServidor = JSON.stringify(await req('GET', '/dados'))
    state.servidor.status = 'ok'
    state.servidor.erro = ''
    state.servidor.salvoEm = new Date().toISOString()
  } catch (e) {
    state.servidor.status = 'erro'
    state.servidor.erro = e.message === 'Failed to fetch' ? 'o servidor não respondeu' : e.message
    // a tela volta para o que está gravado, para não mostrar algo que não foi salvo
    try {
      aplicar(await req('GET', '/dados'))
    } catch {
      /* servidor fora do ar: mantém a tela e tenta de novo na próxima mudança */
    }
  } finally {
    rodando = false
    if (pendente) {
      pendente = false
      sincronizar()
    }
  }
}

async function atualizar() {
  if (state.modo !== 'api' || rodando || timer) return
  try {
    const doc = await req('GET', '/dados')
    if (rodando || timer) return
    if (JSON.stringify(doc) !== ultimoServidor) aplicar(doc)
    if (state.servidor.status === 'offline') state.servidor.status = 'ok'
  } catch {
    if (state.servidor.status !== 'erro') {
      state.servidor.status = 'offline'
      state.servidor.erro = 'o servidor não respondeu'
    }
  }
}

// substitui tudo no servidor (importar planilha ou arquivo, restaurar o publicado)
async function enviarTudo(doc) {
  clearTimeout(timer)
  timer = null
  await req('PUT', '/dados', doc)
  aplicar(await req('GET', '/dados'))
  state.servidor.status = 'ok'
  state.servidor.salvoEm = new Date().toISOString()
}

// manda a cópia guardada neste navegador para o servidor (migração do modo local)
export async function enviarCopiaLocal() {
  const salvo = lerSalvo()
  if (!salvo) throw new Error('Não há cópia neste navegador.')
  await enviarTudo(normalizar(salvo.data))
  esquecerCopiaLocal()
}

function esquecerCopiaLocal() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(KEY_ANTIGA)
  } catch {
    /* ignore */
  }
}

// ---------- ações usadas pelas telas ----------
export async function descartarLocal() {
  if (state.modo === 'api') return enviarTudo(clone(state.publicado))
  esquecerCopiaLocal()
  pularProximo = true
  state.data = clone(state.publicado)
  state.local = false
  state.salvoEm = null
}

export async function substituirDados(novo) {
  if (state.modo === 'api') return enviarTudo(normalizar(novo))
  state.data = normalizar(novo)
}

export function publicadoMaisNovo() {
  const pub = state.publicado?.meta?.atualizadoEm
  if (!state.local || !pub || !state.salvoEm) return false
  return pub > state.salvoEm.slice(0, 10)
}

export const espacoPorId = (id) => state.data.espacos.find((e) => e.id === id)

export function baixar(nome, conteudo, tipo = 'application/json') {
  const blob = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportarJSON() {
  const d = clone(state.data)
  d.meta.atualizadoEm = new Date().toISOString().slice(0, 10)
  baixar('sante.json', JSON.stringify(d, null, 2))
}
