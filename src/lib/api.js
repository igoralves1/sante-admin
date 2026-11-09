// Conexão com o backend (repositório sante-BE: FastAPI + PostgreSQL).
//
// As telas continuam mexendo em state.data como sempre. Esta camada compara state.data com a
// última versão que veio do servidor e manda só o que mudou (criar, editar ou excluir),
// na ordem que o banco exige. Sem servidor configurado, o site funciona como antes
// (sante.json + cópia no navegador).

const CHAVE_URL = 'sante-api'

// endereço do servidor: o salvo na página Base de dados vale mais que o do build (VITE_API_URL)
export function urlApi() {
  let salvo = null
  try {
    salvo = localStorage.getItem(CHAVE_URL)
  } catch {
    /* armazenamento indisponível */
  }
  if (salvo === 'off') return ''
  return (salvo || import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
}

export function definirUrlApi(url) {
  try {
    if (url === null) localStorage.removeItem(CHAVE_URL)
    else localStorage.setItem(CHAVE_URL, url || 'off')
  } catch {
    /* ignore */
  }
}

export const urlPadrao = () => (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export async function req(metodo, caminho, corpo) {
  const res = await fetch(`${urlApi()}/api${caminho}`, {
    method: metodo,
    headers: corpo === undefined ? {} : { 'content-type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    cache: 'no-store',
  })
  if (res.status === 204) return null
  const dados = await res.json().catch(() => null)
  if (!res.ok) throw new Error(mensagem(dados) || `Erro ${res.status} em ${metodo} ${caminho}`)
  return dados
}

function mensagem(d) {
  if (!d?.detail) return ''
  if (typeof d.detail === 'string') return d.detail
  // erros de validação do FastAPI: [{ loc, msg }]
  return d.detail.map((e) => e.msg.replace(/^Value error, /, '')).join(' ')
}

// ---------- o que mudou entre duas versões do documento ----------
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const porId = (xs) => new Map((xs || []).map((x) => [x.id, x]))

function mudancas(antes, depois, colecao) {
  const a = porId(antes[colecao])
  const d = porId(depois[colecao])
  return {
    novos: [...d.values()].filter((x) => !a.has(x.id)),
    editados: [...d.values()].filter((x) => a.has(x.id) && !igual(a.get(x.id), x)),
    excluidos: [...a.keys()].filter((id) => !d.has(id)),
  }
}

// Lista de chamadas para levar o servidor de `antes` para `depois`. A ordem importa:
// turnos antes da agenda; locatários e espaços antes de contratos e agendamentos;
// agendamentos e contratos excluídos antes dos novos (liberam turnos) e antes dos espaços.
export function planejar(antes, depois) {
  const ops = []
  const add = (m, c, corpo) => ops.push([m, c, corpo])

  if (!igual(antes.meta, depois.meta) || !igual(antes.metas, depois.metas)) add('PUT', '/clinica', { meta: depois.meta, metas: depois.metas })
  if (!igual(antes.turnos, depois.turnos)) add('PUT', '/turnos', depois.turnos)
  if (!igual(antes.custos, depois.custos)) add('PUT', '/custos', depois.custos)

  const ch = Object.fromEntries(['profissionais', 'espacos', 'campanhas', 'contratos', 'agendamentos'].map((k) => [k, mudancas(antes, depois, k)]))

  ch.agendamentos.excluidos.forEach((id) => add('DELETE', `/agendamentos/${id}`))
  ch.contratos.excluidos.forEach((id) => add('DELETE', `/contratos/${id}`))
  for (const [k, rota] of [['profissionais', '/profissionais'], ['espacos', '/espacos'], ['campanhas', '/campanhas'], ['contratos', '/contratos']]) {
    ch[k].novos.forEach((x) => add('POST', rota, x))
    ch[k].editados.forEach((x) => add('PUT', `${rota}/${x.id}`, x))
  }
  ch.agendamentos.editados.forEach((x) => add('PUT', `/agendamentos/${x.id}`, x))
  // "repetir no mês/ano" cria muitos de uma vez: vai num lote só (tudo ou nada)
  if (ch.agendamentos.novos.length) add('POST', '/agendamentos/lote', ch.agendamentos.novos)
  ch.campanhas.excluidos.forEach((id) => add('DELETE', `/campanhas/${id}`))
  ch.espacos.excluidos.forEach((id) => add('DELETE', `/espacos/${id}`))
  ch.profissionais.excluidos.forEach((id) => add('DELETE', `/profissionais/${id}`))
  return ops
}
