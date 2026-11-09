// Páginas da base de dados (diagrama e consultas) e documentação da API.
// Com o servidor ligado, tudo vem ao vivo da API. Sem servidor (ex.: GitHub Pages), o diagrama e a
// documentação usam a cópia em public/data/ (gerada por `npm run docs:api`); as consultas precisam do servidor.

import { state } from './store'
import { req, urlApi } from './api'

const copia = (arquivo) => fetch(`${import.meta.env.BASE_URL}data/${arquivo}`, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error(`Não foi possível carregar data/${arquivo}.`)
  return r.json()
})

export const aoVivo = () => state.modo === 'api'

export async function carregarEsquema() {
  if (aoVivo()) return { esquema: await req('GET', '/banco/esquema'), aoVivo: true }
  return { esquema: await copia('esquema.json'), aoVivo: false }
}

export async function carregarOpenapi() {
  if (aoVivo()) {
    const res = await fetch(`${urlApi()}/openapi.json`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`O servidor respondeu ${res.status} em /openapi.json.`)
    return { spec: await res.json(), aoVivo: true }
  }
  return { spec: await copia('openapi.json'), aoVivo: false }
}

export function linhasTabela(tabela, { limite = 50, pagina = 1, ordem = '', desc = false, busca = '' } = {}) {
  const q = new URLSearchParams({ limite, pagina, desc })
  if (ordem) q.set('ordem', ordem)
  if (busca) q.set('busca', busca)
  return req('GET', `/banco/tabelas/${encodeURIComponent(tabela)}?${q}`)
}

export const consultar = (sql, limite = 500) => req('POST', '/banco/consulta', { sql, limite })

// ---------- formatação dos valores nas grades ----------
export function textoValor(v) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'object') return JSON.stringify(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

const NUMERICOS = /^(int|float|numeric|decimal|real|double|smallint|bigint|integer|serial|money)/
// listas ("_int2" na consulta, "smallint[]" na tabela) ficam alinhadas à esquerda
export const tipoNumerico = (tipo = '') => NUMERICOS.test(tipo) && !/\[\]$/.test(tipo)

export function csv(colunas, linhas) {
  const cel = (v) => {
    const t = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  }
  return [colunas.map((c) => cel(c.nome)).join(','), ...linhas.map((l) => l.map(cel).join(','))].join('\n')
}

// ---------- perguntas em português -> SQL (Claude, no servidor) ----------
export const assistente = () => req('GET', '/banco/assistente')
export const traduzir = (pergunta, historico = [], sqlAtual = '') => req('POST', '/banco/traduzir', { pergunta, historico, sqlAtual })
