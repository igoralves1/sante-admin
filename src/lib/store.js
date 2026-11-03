import { reactive, watch } from 'vue'
import { clone, mesAtual } from './format'

const KEY = 'sante-ocupacao:v1'

// data: dados em uso (publicados ou editados neste navegador)
// publicado: conteúdo de public/data/sante.json, o que todos veem no link
export const state = reactive({
  loaded: false,
  erro: '',
  data: null,
  publicado: null,
  local: false,
  salvoEm: null,
  mes: mesAtual(),
})

let pularProximo = false

export async function carregar() {
  let salvo = null
  try {
    salvo = JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    salvo = null
  }
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/sante.json`, { cache: 'no-store' })
    state.publicado = await res.json()
  } catch (e) {
    state.erro = 'Não foi possível carregar data/sante.json.'
    if (!salvo) return
  }
  if (salvo?.data) {
    state.data = salvo.data
    state.local = true
    state.salvoEm = salvo.salvoEm
  } else {
    state.data = clone(state.publicado)
  }
  state.mes = state.data.meta?.mesPadrao || mesAtual()
  state.loaded = true

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
        /* armazenamento indisponível: segue só em memória */
      }
    },
    { deep: true },
  )
}

export function descartarLocal() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  pularProximo = true
  state.data = clone(state.publicado)
  state.local = false
  state.salvoEm = null
}

export function substituirDados(novo) {
  state.data = novo
}

// A versão publicada é mais nova que a cópia local?
export function publicadoMaisNovo() {
  const pub = state.publicado?.meta?.atualizadoEm
  if (!state.local || !pub || !state.salvoEm) return false
  return pub > state.salvoEm.slice(0, 10)
}

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
