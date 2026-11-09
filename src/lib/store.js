import { reactive, watch } from 'vue'
import { clone, mesAtual } from './format'
import { normalizar } from './calc'
import { definirFonteTurnos } from './agenda'
import { planejar, req, urlApi } from './api'

// Todos os dados vêm do banco PostgreSQL, pela API do sante-BE. Nada fica guardado em arquivo
// nem no navegador: cada alteração vai para o servidor na hora.
export const state = reactive({
  loaded: false,
  erro: '',
  data: null, // sante.json vindo de GET /api/dados
  mercado: null, // { concorrentes, social } de /api/mercado/*
  mes: mesAtual(),
  tituloPagina: '', // título da página quando ele depende dos dados (ex.: nome do espaço)
  servidor: {
    url: '',
    status: '', // ok | salvando | erro | offline
    erro: '',
    salvoEm: null,
  },
})

// as contas de turnos leem state.data.turnos (o bloco central do sante.json)
definirFonteTurnos(() => state.data?.turnos)

// restos das versões que guardavam dados no navegador
for (const k of ['sante-admin:v2', 'sante-ocupacao:v1', 'sante-api', 'sante-diagrama-posicoes']) {
  try {
    localStorage.removeItem(k)
  } catch {
    /* armazenamento indisponível */
  }
}

let base = null // última versão que o servidor confirmou, no formato do front
let ultimoServidor = '' // resposta crua do último GET, para perceber mudanças de outras pessoas
let timer = null
let rodando = false
let pendente = false
let pularProximo = false
let iniciado = false

export async function carregar() {
  state.servidor.url = urlApi() || window.location.origin
  state.erro = ''
  try {
    const [doc, concorrentes, social] = await Promise.all([
      req('GET', '/dados'),
      req('GET', '/mercado/concorrentes'),
      req('GET', '/mercado/social'),
    ])
    state.mercado = { concorrentes, social }
    aplicar(doc)
  } catch (e) {
    state.servidor.status = 'offline'
    state.erro = e.message === 'Failed to fetch' || e.message.startsWith('Erro 50')
      ? 'O servidor não respondeu.'
      : e.message
    return
  }
  state.servidor.status = 'ok'
  state.servidor.erro = ''
  state.loaded = true
  if (iniciado) return
  iniciado = true

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
  if (rodando || timer) return
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

// ---------- ações usadas pelas telas ----------
// substitui tudo no banco (importar planilha ou arquivo de backup)
export async function substituirDados(novo) {
  clearTimeout(timer)
  timer = null
  await req('PUT', '/dados', normalizar(novo))
  aplicar(await req('GET', '/dados'))
  state.servidor.status = 'ok'
  state.servidor.salvoEm = new Date().toISOString()
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

// backup: baixa uma cópia de tudo o que está no banco
export function baixarBackup() {
  baixar(`sante-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state.data, null, 2))
}
