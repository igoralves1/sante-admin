<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import StatTile from '../components/StatTile.vue'
import Popover from '../components/Popover.vue'
import D3SlotGrid from '../components/d3/D3SlotGrid.vue'
import D3Columns from '../components/d3/D3Columns.vue'
import D3Lines from '../components/d3/D3Lines.vue'
import D3HBar from '../components/d3/D3HBar.vue'
import D3Gantt from '../components/d3/D3Gantt.vue'
import D3Table from '../components/d3/D3Table.vue'
import { state } from '../lib/store'
import { STATUS, UNIDADE, despesasEspaco, fimDoMes, firme, idxMes, resumoMes, valorMensal } from '../lib/calc'
import {
  DIAS_SEMANA, STATUS_AGENDA, agendaPadrao, aplicarValorTurno, ativoAg, capacidadeAgenda, chave, diasDoMes, dowDe, ocupacaoDia,
  posicoesMensais, somaDias, unidadesAg,
} from '../lib/agenda'
import { addMes, brl, brl0, brlCompact, dataBR, mesAtual, mesCurto, num, pct, uid } from '../lib/format'

const route = useRoute()
const esp = computed(() => state.data.espacos.find((e) => e.id === route.params.id))
watch(
  esp,
  (e) => {
    state.tituloPagina = e ? e.nome : ''
    document.title = `${e ? e.nome : 'Espaço'} · Santé Admin`
  },
  { immediate: true },
)

const pad = (v) => String(v).padStart(2, '0')
const hoje = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
})()
const MES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
// mês no formato do título, ex.: "Nov-2026"
const rotuloMes = (mes) => {
  const [y, m] = mes.split('-').map(Number)
  const t = MES_ABREV[m - 1]
  return `${t[0].toUpperCase()}${t.slice(1)}-${y}`
}
const mesTitulo = computed(() => rotuloMes(state.mes))
// meses para agendar: 6 para trás e 12 à frente do mês corrente (mais o escolhido, se estiver fora)
const mesesAgenda = computed(() => {
  const atual = mesAtual()
  const lista = Array.from({ length: 19 }, (_, i) => addMes(atual, i - 6))
  if (!lista.includes(state.mes)) lista.push(state.mes)
  return lista.sort().map((m) => ({ m, t: `${rotuloMes(m)}${m === atual ? ' (atual)' : ''}` }))
})

// grade de vagas × meses só para o administrativo (coworking); salas e piscina usam a agenda de turnos
const porVagas = computed(() => esp.value?.tipo === 'Administrativo')
const unidade = computed(() => UNIDADE[esp.value?.modalidade] || 'unidades')
const unidadeUm = computed(() => ({ Hora: 'hora', Turno: 'turno', Mensal: 'contrato' })[esp.value?.modalidade] || 'unidade')
const agenda = computed(() => (esp.value?.agenda?.horarios ? esp.value.agenda : agendaPadrao()))
const horarioPorChave = computed(() => Object.fromEntries(agenda.value.horarios.map((h) => [chave(h), h])))
const nomeSlot = (k) => horarioPorChave.value[k]?.nome || k.replace('-', '–')
const todosAgs = () => state.data.agendamentos || (state.data.agendamentos = [])
const ags = computed(() => (state.data.agendamentos || []).filter((a) => a.espacoId === esp.value?.id))
const contratosEsp = computed(() => state.data.contratos.filter((c) => c.espacoId === esp.value?.id))
const profissionais = computed(() => [...(state.data.profissionais || [])].sort((a, b) => a.nome.localeCompare(b.nome)))
const clientes = computed(() => [...new Set([...profissionais.value, ...state.data.contratos, ...(state.data.agendamentos || [])].map((x) => x.nome || x.cliente).filter((c) => c && !/^BASE INICIAL/.test(c)))].sort())

// ---------- mês de referência ----------
const r = computed(() => resumoMes(state.data, state.mes).espacos.find((x) => x.id === esp.value?.id))
const meta = computed(() => state.data.metas?.ocupacaoAlvo || 0)

// ---------- agenda por dia (hora / turno) ----------
const dias = computed(() => diasDoMes(state.mes))
const gCols = computed(() => dias.value.map((d) => ({ k: d.iso, l: String(d.d), s: DIAS_SEMANA[d.dow][0], fds: d.dow === 0 || d.dow === 6, hoje: d.iso === hoje })))
const gRows = computed(() => agenda.value.horarios.map((h) => ({ k: chave(h), l: h.nome, h })))
const mapaMes = computed(() => {
  const m = {}
  for (const a of ags.value) {
    if (!ativoAg(a) || !a.data.startsWith(state.mes)) continue
    m[a.data] ||= {}
    a.slots.forEach((k) => (m[a.data][k] = a))
  }
  return m
})
function celula(col, row) {
  const h = row.h
  const titulo = `${dataBR(col.k)} · ${h.nome}`
  if (!h.dias.includes(dowDe(col.k))) return { t: 'off', tip: { title: titulo, rows: [{ label: 'Fechado neste dia', value: '' }] } }
  const a = mapaMes.value[col.k]?.[row.k]
  const cm = !a && contratoMensalMes.value
  if (cm) {
    return {
      t: firme(cm) ? 'conf' : 'prop', ref: `ct:${cm.id}`, num: numDe(cm.cliente),
      tip: { title: `${numDe(cm.cliente)}. ${cm.cliente || 'Sem nome'}`, rows: [
        { label: 'Contrato mensal', value: 'todos os turnos' },
        { label: 'Valor mensal', value: brl(valorMensal(cm)) },
        { label: 'Status', value: cm.status },
      ] },
    }
  }
  if (a) {
    return {
      t: a.status === 'Confirmada' ? 'conf' : 'prop', ref: a.id, num: numDe(a.cliente),
      tip: { title: `${numDe(a.cliente)}. ${a.cliente || 'Sem nome'}`, rows: [
        { label: dataBR(a.data), value: a.slots.map(nomeSlot).join(', ') },
        { label: 'Valor', value: brl(a.valor) },
        { label: 'Status', value: a.status },
      ] },
    }
  }
  return { t: 'livre', tip: { title: titulo, rows: [{ label: 'Livre', value: `${h.ini}–${h.fim}` }, { label: 'Clique ou arraste para reservar', value: '' }] } }
}
// ---------- legenda: um número por profissional ----------
// Os quadrados mostram só o número; o nome fica na legenda (vários profissionais no mesmo dia continuam legíveis).
const chaveProf = (nome) => (nome || 'Sem nome').trim().toLowerCase()
const turnosAbertosMes = computed(() => dias.value.reduce((s, d) => s + agenda.value.horarios.filter((h) => h.dias.includes(d.dow)).length, 0))
const legenda = computed(() => {
  const m = new Map()
  const add = (nome, extra) => {
    const k = chaveProf(nome)
    if (!m.has(k)) m.set(k, { n: m.size + 1, nome: nome || 'Sem nome', turnos: 0, valor: 0, conf: false, prop: false, contrato: '' })
    const e = m.get(k)
    e.turnos += extra.turnos || 0
    e.valor += extra.valor || 0
    if (extra.conf) e.conf = true
    else e.prop = true
    if (extra.contrato) e.contrato = extra.contrato
  }
  if (porVagas.value) {
    ;[...contratosVivos.value].filter((c) => lugares.value.has(c.id)).sort((a, b) => a.inicio.localeCompare(b.inicio))
      .forEach((c) => add(c.cliente, { valor: valorMensal(c), conf: firme(c), contrato: `${dataBR(c.inicio)} a ${c.fim ? dataBR(c.fim) : 'sem término'} · ${num(c.quantidade)} vaga(s)` }))
    return [...m.values()]
  }
  const cm = contratoMensalMes.value
  if (cm) add(cm.cliente, { turnos: turnosAbertosMes.value, valor: valorMensal(cm), conf: firme(cm), contrato: 'contrato mensal, todos os turnos' })
  const ordem = Object.fromEntries(agenda.value.horarios.map((h, i) => [chave(h), i]))
  ags.value.filter((a) => ativoAg(a) && a.data.startsWith(state.mes))
    .sort((a, b) => a.data.localeCompare(b.data) || (ordem[a.slots[0]] ?? 0) - (ordem[b.slots[0]] ?? 0))
    .forEach((a) => add(a.cliente, { turnos: a.slots.length, valor: Number(a.valor) || 0, conf: a.status === 'Confirmada' }))
  return [...m.values()]
})
const numPorChave = computed(() => Object.fromEntries(legenda.value.map((l) => [chaveProf(l.nome), l.n])))
const numDe = (nome) => numPorChave.value[chaveProf(nome)]

// contrato mensal vigente: a sala inteira fica com um profissional o mês todo
const contratoMensalMes = computed(() => (r.value?.contratos || []).find((c) => c.modalidade === 'Mensal') || null)
// contratos por quantidade (horas/turnos no mês) não têm dia nem horário
const semHorario = computed(() => (porVagas.value ? [] : (r.value?.contratos || []).filter((c) => c.modalidade !== 'Mensal')))
// contratos em outra unidade depois que a sala passou a cobrar por turno
const unidadeDiferente = computed(() => (esp.value?.precoTurno ? contratosEsp.value.filter((c) => c.status !== 'Cancelada' && c.modalidade !== 'Turno' && c.modalidade !== 'Mensal') : []))

// ---------- agenda mensal (vagas × meses) ----------
const ano = computed(() => state.mes.slice(0, 4))
const mesesAno = computed(() => Array.from({ length: 12 }, (_, i) => `${ano.value}-${pad(i + 1)}`))
const vagas = computed(() => Math.min(40, Math.max(1, Math.ceil(Number(esp.value?.capacidade) || 1))))
const contratosVivos = computed(() => contratosEsp.value.filter((c) => c.status !== 'Cancelada' && c.inicio))
const lugares = computed(() => posicoesMensais(contratosVivos.value, vagas.value, mesesAno.value, idxMes))
const mapaM = computed(() => {
  const m = {}
  for (const c of contratosVivos.value) {
    const l = lugares.value.get(c.id)
    if (!l) continue
    l.linhas.forEach((ri) => l.meses.forEach((mm) => (m[`${ri}|${mm}`] = c)))
  }
  return m
})
const foraDasVagas = computed(() => contratosVivos.value.filter((c) => {
  const l = lugares.value.get(c.id)
  return l && l.linhas.length < Math.ceil(Number(c.quantidade) || 1)
}))
const mCols = computed(() => mesesAno.value.map((m, i) => ({ k: m, l: MES_ABREV[i], s: '', hoje: m === mesAtual() })))
const mRows = computed(() => Array.from({ length: vagas.value }, (_, i) => ({ k: i, l: vagas.value > 1 ? `Vaga ${i + 1}` : 'Sala' })))
function celulaM(col, row) {
  const c = mapaM.value[`${row.k}|${col.k}`]
  if (c) {
    return {
      t: firme(c) ? 'conf' : 'prop', ref: c.id, num: numDe(c.cliente),
      tip: { title: `${numDe(c.cliente)}. ${c.cliente || 'Sem nome'}`, rows: [
        { label: 'Vigência', value: `${dataBR(c.inicio)} a ${c.fim ? dataBR(c.fim) : 'sem término'}` },
        { label: 'Valor mensal', value: brl(valorMensal(c)) },
        { label: 'Status', value: c.status },
      ] },
    }
  }
  return { t: 'livre', tip: { title: `${row.l} · ${mesCurto(col.k)}`, rows: [{ label: 'Livre', value: '' }, { label: 'Arraste pelos meses', value: '' }] } }
}

// ---------- formulário (popover) ----------
const sel = ref(null)
const form = ref(null)
const fechar = () => {
  form.value = null
  sel.value = null
}
const minimo = computed(() => Math.max(1, Number(agenda.value.minimo) || 1))

function aoSelecionar(s) {
  sel.value = { c0: s.c0, c1: s.c1, r0: s.r0, r1: s.r1 }
  if (porVagas.value) {
    form.value = {
      modo: 'novoM', box: s.box, cliente: '', valor: esp.value.preco, quantidade: s.r1 - s.r0 + 1,
      inicio: mesesAno.value[s.c0], fim: mesesAno.value[s.c1], semFim: false, status: 'Confirmada', obs: '', erro: '',
    }
    return
  }
  form.value = {
    modo: 'novo', box: s.box,
    dias: gCols.value.slice(s.c0, s.c1 + 1).map((c) => c.k),
    slots: gRows.value.slice(s.r0, s.r1 + 1).map((x) => x.k),
    ...novoProf(), valorDia: null, valorTurno: null, status: 'Confirmada', obs: '', repetir: false, ate: '', erro: '',
    travado: true, // turnos vêm da seleção na agenda; os outros ficam desabilitados
  }
}
const novoProf = () => ({ profId: profissionais.value.length ? '' : '__novo', novoNome: '' })
// devolve o profissional escolhido (criando o cadastro quando é novo) ou uma mensagem de erro
function resolverProf(f) {
  if (f.profId === '__novo') {
    const nome = (f.novoNome || '').trim()
    if (!nome) return 'Escolha um profissional ou digite o nome do novo.'
    const existente = (state.data.profissionais || []).find((p) => p.nome.toLowerCase() === nome.toLowerCase())
    if (existente) return existente
    const p = { id: uid('p'), nome, profissao: '', registro: '', telefone: '', email: '', redes: {}, outras: [], obs: '', criadoEm: hoje }
    ;(state.data.profissionais ||= []).push(p)
    return p
  }
  const p = (state.data.profissionais || []).find((x) => x.id === f.profId)
  return p || 'Escolha o profissional na lista.'
}
// valor pedido por turno: vira o preço da sala e a receita potencial de todos os turnos
function definirValorTurno(v) {
  const n = Number(v)
  if (!(n > 0)) {
    esp.value.precoTurno = null
    return
  }
  aplicarValorTurno(esp.value, n)
}
function novoManual(ev) {
  const b = ev.currentTarget.getBoundingClientRect()
  const box = { left: b.left, right: b.right, top: b.bottom, bottom: b.bottom }
  sel.value = null
  if (porVagas.value) {
    form.value = { modo: 'novoM', box, cliente: '', valor: esp.value.preco, quantidade: 1, inicio: state.mes, fim: state.mes, semFim: true, status: 'Confirmada', obs: '', erro: '' }
    return
  }
  const dia = state.mes === hoje.slice(0, 7) ? hoje : `${state.mes}-01`
  form.value = { modo: 'novo', manual: true, box, dias: [dia], slots: [], ...novoProf(), valorDia: null, valorTurno: null, status: 'Confirmada', obs: '', repetir: false, ate: '', erro: '' }
}
function abrir({ ref: id, box }) {
  if (porVagas.value || String(id).startsWith('ct:')) {
    id = String(id).replace(/^ct:/, '')
    const c = state.data.contratos.find((x) => x.id === id)
    if (!c) return
    form.value = {
      modo: 'editarM', id, box, cliente: c.cliente, valor: c.preco, quantidade: c.quantidade,
      inicio: c.inicio.slice(0, 7), fim: c.fim ? c.fim.slice(0, 7) : '', semFim: !c.fim, status: c.status, obs: c.obs || '', erro: '',
    }
    return
  }
  const a = todosAgs().find((x) => x.id === id)
  if (!a) return
  const pid = a.profissionalId || (state.data.profissionais || []).find((p) => p.nome === a.cliente)?.id
  form.value = {
    modo: 'editar', id, box, data: a.data, slots: [...a.slots], profId: pid || '__novo', novoNome: pid ? '' : a.cliente,
    valor: a.valor, status: a.status, obs: a.obs || '', grupo: a.grupo || '', erro: '',
  }
}
function abrirLinha(a, ev) {
  const b = ev.currentTarget.getBoundingClientRect()
  abrir({ ref: a.id, box: { left: b.left, right: b.right, top: b.top, bottom: b.bottom } })
}

const unidadesSlots = (slots) => unidadesAg(esp.value, { slots })
const sugerido = computed(() => (form.value?.slots ? unidadesSlots(form.value.slots) * (Number(esp.value?.preco) || 0) : 0))

// dias que o novo agendamento vai ocupar, com repetição semanal e conflitos
const plano = computed(() => {
  const f = form.value
  if (!f || f.modo !== 'novo') return null
  let lista = [...f.dias]
  if (f.repetir && f.ate) {
    for (const d of f.dias) {
      let x = somaDias(d, 7)
      while (x <= f.ate) {
        lista.push(x)
        x = somaDias(x, 7)
      }
    }
  }
  lista = [...new Set(lista)].sort()
  const itens = []
  const pulados = []
  for (const d of lista) {
    const dow = dowDe(d)
    const ks = f.slots.filter((k) => horarioPorChave.value[k]?.dias.includes(dow))
    if (!ks.length) continue
    const occ = ocupacaoDia(todosAgs(), esp.value.id, d)
    const livres = ks.filter((k) => !occ[k])
    if (livres.length < minimo.value) {
      pulados.push({ d, motivo: livres.length ? `só ${livres.length} livre(s); mínimo ${minimo.value}` : 'horário ocupado' })
      continue
    }
    itens.push({ data: d, slots: livres, valor: f.valorDia ?? unidadesSlots(livres) * (Number(esp.value.preco) || 0) })
  }
  return { itens, pulados, total: itens.reduce((s, i) => s + Number(i.valor || 0), 0) }
})
// turnos no formulário de novo agendamento: fora da seleção ou fechados nos dias escolhidos ficam desabilitados
const opcoesNovo = computed(() => {
  const f = form.value
  if (!f || f.modo !== 'novo') return []
  const dows = [...new Set(f.dias.filter(Boolean).map(dowDe))]
  return agenda.value.horarios.map((h) => {
    const k = chave(h)
    const fechado = dows.length > 0 && dows.every((d) => !h.dias.includes(d))
    const fora = f.travado && !f.slots.includes(k)
    return { k, h, bloq: fechado || fora, motivo: fechado ? 'fechado' : fora ? 'não selecionado' : `${h.ini}–${h.fim}` }
  })
})
// no agendamento manual, um turno que fecha no dia escolhido sai da seleção
watch(() => form.value?.modo === 'novo' && form.value.dias.join(), () => {
  const f = form.value
  if (f?.modo !== 'novo' || f.travado) return
  const bloq = opcoesNovo.value.filter((o) => o.bloq).map((o) => o.k)
  f.slots = f.slots.filter((k) => !bloq.includes(k))
})
// horários disponíveis para marcar no formulário de edição (do próprio dia)
const opcoesEdicao = computed(() => {
  const f = form.value
  if (!f || f.modo !== 'editar') return []
  const occ = ocupacaoDia(todosAgs(), esp.value.id, f.data, f.id)
  const dow = dowDe(f.data)
  return agenda.value.horarios.filter((h) => h.dias.includes(dow)).map((h) => ({ k: chave(h), h, ocupado: !!occ[chave(h)] }))
})
function alternar(lista, k) {
  const i = lista.indexOf(k)
  if (i >= 0) lista.splice(i, 1)
  else lista.push(k)
}

function salvarNovo() {
  const f = form.value
  if (!f.slots.length) return (f.erro = 'Marque pelo menos um turno.')
  if (!esp.value.precoTurno && esp.value.modalidade === 'Mensal' && !(Number(f.valorTurno) > 0)) return (f.erro = 'Informe o valor pedido por turno desta sala.')
  const prof = resolverProf(f)
  if (typeof prof === 'string') return (f.erro = prof)
  if (Number(f.valorTurno) > 0) definirValorTurno(f.valorTurno)
  if (f.repetir && !f.ate) return (f.erro = 'Informe até quando repetir.')
  const p = plano.value
  if (!p.itens.length) return (f.erro = 'Nenhum dia livre que respeite o mínimo por reserva.')
  const grupo = p.itens.length > 1 ? uid('g') : ''
  p.itens.forEach((i) => todosAgs().push({
    id: uid('ag'), espacoId: esp.value.id, data: i.data, slots: [...i.slots].sort(), profissionalId: prof.id, cliente: prof.nome,
    valor: Number(i.valor) || 0, status: f.status, obs: f.obs, grupo,
  }))
  fechar()
}
function salvarEdicao() {
  const f = form.value
  const prof = resolverProf(f)
  if (typeof prof === 'string') return (f.erro = prof)
  if (f.slots.length < minimo.value) return (f.erro = `Mínimo de ${minimo.value} ${minimo.value > 1 ? 'horários' : 'horário'} por reserva.`)
  const a = todosAgs().find((x) => x.id === f.id)
  Object.assign(a, { profissionalId: prof.id, cliente: prof.nome, slots: [...f.slots].sort(), valor: Number(f.valor) || 0, status: f.status, obs: f.obs })
  fechar()
}
function excluir(serie = false) {
  const f = form.value
  const msg = serie ? 'Excluir este agendamento e os seguintes da mesma série?' : 'Excluir este agendamento?'
  if (!confirm(msg)) return
  state.data.agendamentos = todosAgs().filter((a) => (serie && f.grupo ? !(a.grupo === f.grupo && a.data >= f.data) : a.id !== f.id))
  fechar()
}
const serieRestante = computed(() => (form.value?.grupo ? todosAgs().filter((a) => a.grupo === form.value.grupo && a.data >= form.value.data).length : 0))

// contratos mensais
function vagasLivres(ini, fim, ignorar) {
  let menor = vagas.value
  for (let m = ini; m <= fim; m = addMes(m, 1)) {
    const usado = contratosVivos.value.filter((c) => c.id !== ignorar && idxMes(c.inicio) <= idxMes(m) && (!c.fim || idxMes(c.fim) >= idxMes(m)))
      .reduce((s, c) => s + (Number(c.quantidade) || 0), 0)
    menor = Math.min(menor, vagas.value - usado)
    if (m >= addMes(ini, 24)) break
  }
  return menor
}
function salvarMensal() {
  const f = form.value
  if (!f.cliente.trim()) return (f.erro = 'Informe o nome do profissional ou empresa.')
  if (!f.inicio) return (f.erro = 'Informe o mês de início.')
  if (!f.semFim && f.fim && f.fim < f.inicio) return (f.erro = 'O fim precisa ser depois do início.')
  const q = Number(f.quantidade) || 1
  const livre = vagasLivres(f.inicio, f.semFim || !f.fim ? addMes(f.inicio, 11) : f.fim, f.id)
  if (q > livre) return (f.erro = `Só há ${Math.max(0, livre)} vaga(s) livre(s) em todo o período.`)
  const dados = {
    cliente: f.cliente.trim(), modalidade: 'Mensal', quantidade: q, preco: Number(f.valor) || 0,
    inicio: `${f.inicio}-01`, fim: f.semFim || !f.fim ? '' : fimDoMes(`${f.fim}-01`), status: f.status, obs: f.obs,
  }
  if (f.modo === 'editarM') Object.assign(state.data.contratos.find((c) => c.id === f.id), dados)
  else state.data.contratos.push({ id: uid('ct'), espacoId: esp.value.id, campanha: '', ...dados })
  fechar()
}
function excluirContrato() {
  if (!confirm('Excluir este contrato? Ele deixa de contar na ocupação e na receita.')) return
  state.data.contratos = state.data.contratos.filter((c) => c.id !== form.value.id)
  fechar()
}

// ---------- configuração ----------
function garantirAgenda() {
  if (!esp.value.agenda?.horarios) esp.value.agenda = agendaPadrao()
  return esp.value.agenda
}
const capAgenda = computed(() => capacidadeAgenda(agenda.value, esp.value?.modalidade))
watch(() => capAgenda.value.mes, (m) => esp.value?.precoTurno && (esp.value.capacidade = m))
function mudarHora(h, campo, valor) {
  garantirAgenda()
  const antiga = chave(h)
  h[campo] = valor
  const nova = chave(h)
  if (antiga !== nova) todosAgs().forEach((a) => a.espacoId === esp.value.id && (a.slots = a.slots.map((k) => (k === antiga ? nova : k))))
}
function alternarDia(h, d) {
  garantirAgenda()
  const i = h.dias.indexOf(d)
  if (i >= 0) h.dias.splice(i, 1)
  else h.dias.push(d)
  h.dias.sort()
}
function addHorario() {
  const ag = garantirAgenda()
  const ult = ag.horarios[ag.horarios.length - 1]
  const ini = ult ? ult.fim : '08:00'
  const [H, M] = ini.split(':').map(Number)
  const fim = `${pad(Math.min(23, H + (esp.value.modalidade === 'Hora' ? 1 : 4)))}:${pad(M)}`
  ag.horarios.push({ nome: esp.value.modalidade === 'Hora' ? `${pad(H)}h` : 'Novo turno', ini, fim, dias: [1, 2, 3, 4, 5] })
}
function delHorario(h) {
  const k = chave(h)
  const n = ags.value.filter((a) => a.slots.includes(k)).length
  if (n) return alert(`Há ${n} agendamento(s) neste horário. Exclua ou mude esses agendamentos antes.`)
  const ag = garantirAgenda()
  ag.horarios.splice(ag.horarios.indexOf(h), 1)
}
function restaurar() {
  if (ags.value.length && !confirm('Restaurar os horários padrão? Agendamentos em horários que deixarem de existir somem da matriz (continuam na movimentação).')) return
  esp.value.agenda = agendaPadrao()
}
const minimoEdit = computed({
  get: () => agenda.value.minimo,
  set: (v) => (garantirAgenda().minimo = Math.max(1, Math.round(Number(v) || 1))),
})

// ---------- histórico ----------
const anos = computed(() => {
  const ys = [
    ...contratosEsp.value.map((c) => c.inicio?.slice(0, 4)),
    ...ags.value.map((a) => a.data.slice(0, 4)),
    state.mes.slice(0, 4), mesAtual().slice(0, 4),
  ].filter(Boolean).map(Number)
  const lo = Math.min(...ys)
  const hi = Math.max(...ys)
  return Array.from({ length: hi - lo + 1 }, (_, i) => String(lo + i))
})
const anoHist = ref(state.mes.slice(0, 4))
watch(() => state.mes, (m) => (anoHist.value = m.slice(0, 4)))
const mesesDe = (y) => Array.from({ length: 12 }, (_, i) => `${y}-${pad(i + 1)}`)
const linhaMes = (m) => resumoMes(state.data, m).espacos.find((x) => x.id === esp.value.id)
const serie = computed(() => mesesDe(anoHist.value).map((m) => ({ m, x: linhaMes(m) })))
const colunas = computed(() => serie.value.map(({ m, x }) => ({
  label: mesCurto(m), value: x.receitaOcupada, futuro: m > state.mes, atual: m === state.mes,
  rows: [
    { label: 'Receita bruta', value: brl(x.receitaOcupada) },
    { label: 'Custos diretos', value: brl(x.despesas) },
    { label: 'Margem de contribuição', value: brl(x.resultado) },
    { label: 'Taxa de ocupação', value: pct(x.taxa) },
  ],
})))
const refsCol = computed(() => [{ value: esp.value.capacidade * esp.value.preco, label: 'Receita potencial' }])
const linhasTaxa = computed(() => ({
  labels: serie.value.map(({ m }) => mesCurto(m)),
  series: [
    { key: 't', label: 'Taxa de ocupação', color: 'var(--s-firm)', values: serie.value.map(({ x }) => x.taxa) },
    { key: 'm', label: `Meta (${pct(meta.value)})`, color: 'var(--s-cost)', values: serie.value.map(() => meta.value) },
  ],
}))

const anuais = computed(() => anos.value.map((y) => {
  const xs = mesesDe(y).map(linhaMes)
  const agsAno = ags.value.filter((a) => ativoAg(a) && a.data.startsWith(y))
  const receita = xs.reduce((s, x) => s + x.receitaOcupada, 0)
  const custos = xs.reduce((s, x) => s + x.despesas, 0)
  const profs = new Set([
    ...agsAno.map((a) => a.cliente),
    ...contratosVivos.value.filter((c) => idxMes(c.inicio) <= idxMes(`${y}-12`) && (!c.fim || idxMes(c.fim) >= idxMes(`${y}-01`))).map((c) => c.cliente),
  ].filter(Boolean))
  return {
    ano: y, receita, custos, margem: receita - custos,
    taxa: xs.reduce((s, x) => s + x.taxa, 0) / 12,
    ocupado: xs.reduce((s, x) => s + x.ocupado, 0),
    agendamentos: agsAno.length, profissionais: profs.size,
    ticket: agsAno.length ? agsAno.reduce((s, a) => s + Number(a.valor || 0), 0) / agsAno.length : null,
  }
}))
const anuaisCols = computed(() => [
  { key: 'ano', label: 'Ano', hint: 'Ano civil, de janeiro a dezembro. Meses futuros contam pelos contratos e agendamentos já registrados.' },
  { key: 'receita', label: 'Receita bruta\n(faturamento)', num: true, format: brl0, hint: 'Soma da receita bruta dos 12 meses: contratos vigentes + agendamentos.' },
  { key: 'custos', label: 'Custos\ndiretos', num: true, format: brl0, hint: 'Custos diretos do espaço × 12 meses.' },
  { key: 'margem', label: 'Margem de\ncontribuição', num: true, format: brl0, hint: 'Receita bruta − Custos diretos no ano.' },
  { key: 'taxa', label: 'Taxa média\nde ocupação', num: true, format: pct, bar: true, hint: 'Média simples da taxa de ocupação dos 12 meses.' },
  { key: 'ocupado', label: 'Capacidade\nutilizada', num: true, format: num, hint: `Soma das ${unidade.value} locadas no ano.` },
  { key: 'agendamentos', label: 'Agendamentos', num: true, format: num, hint: 'Agendamentos feitos na agenda deste espaço no ano (sem os cancelados).' },
  { key: 'profissionais', label: 'Profissionais', num: true, format: num, hint: 'Profissionais diferentes que usaram o espaço no ano, por contrato ou agendamento.' },
  { key: 'ticket', label: 'Ticket médio', num: true, format: (v) => (v == null ? '—' : brl(v)), hint: 'Valor médio de cada agendamento no ano.' },
])

// uso por dia da semana × horário no ano
const diasUsados = computed(() => [1, 2, 3, 4, 5, 6, 0].filter((d) => agenda.value.horarios.some((h) => h.dias.includes(d))))
const ocorrencias = computed(() => {
  const n = {}
  for (let i = 0; i < 12; i++) diasDoMes(`${anoHist.value}-${pad(i + 1)}`).forEach((d) => (n[d.dow] = (n[d.dow] || 0) + 1))
  return n
})
const usoCont = computed(() => {
  const m = {}
  ags.value.filter((a) => ativoAg(a) && a.data.startsWith(anoHist.value)).forEach((a) => {
    const d = dowDe(a.data)
    a.slots.forEach((k) => (m[`${d}|${k}`] = (m[`${d}|${k}`] || 0) + 1))
  })
  return m
})
const uCols = computed(() => diasUsados.value.map((d) => ({ k: d, l: DIAS_SEMANA[d], s: '', fds: d === 0 || d === 6 })))
function celulaUso(col, row) {
  if (!row.h.dias.includes(col.k)) return { t: 'off', tip: { title: `${DIAS_SEMANA[col.k]} · ${row.l}`, rows: [{ label: 'Fechado', value: '' }] } }
  const c = usoCont.value[`${col.k}|${row.k}`] || 0
  const v = c / (ocorrencias.value[col.k] || 1)
  return { t: 'heat', v, tip: { title: `${DIAS_SEMANA[col.k]} · ${row.l}`, rows: [{ label: 'Ocupado em', value: `${c} de ${ocorrencias.value[col.k]} dias` }, { label: 'Uso', value: pct(v) }] } }
}

// receita por profissional no ano
const porProf = computed(() => {
  const m = {}
  const y = anoHist.value
  ags.value.filter((a) => ativoAg(a) && a.data.startsWith(y)).forEach((a) => (m[a.cliente] = (m[a.cliente] || 0) + Number(a.valor || 0)))
  contratosVivos.value.forEach((c) => {
    const n = mesesDe(y).filter((mm) => idxMes(c.inicio) <= idxMes(mm) && (!c.fim || idxMes(c.fim) >= idxMes(mm))).length
    if (n) m[c.cliente || 'Sem nome'] = (m[c.cliente || 'Sem nome'] || 0) + n * valorMensal(c)
  })
  return Object.entries(m).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([k, v]) => ({ label: k, value: v, rows: [{ label: `Receita bruta em ${y}`, value: brl(v) }] }))
})

// ---------- movimentação ----------
const movAno = ref('todos')
const movimentos = computed(() => {
  const y = movAno.value
  const cs = contratosEsp.value.filter((c) => y === 'todos' || (c.inicio && idxMes(c.inicio) <= idxMes(`${y}-12`) && (!c.fim || idxMes(c.fim) >= idxMes(`${y}-01`))))
    .map((c) => ({
      data: c.inicio, tipo: 'Contrato', prof: c.cliente || '—',
      detalhe: `${dataBR(c.inicio)} a ${c.fim ? dataBR(c.fim) : 'sem término'}`,
      qtd: `${num(c.quantidade)} ${UNIDADE[c.modalidade] || ''}/mês`, valor: valorMensal(c), valorTxt: `${brl(valorMensal(c))}/mês`, status: c.status,
    }))
  const as = ags.value.filter((a) => y === 'todos' || a.data.startsWith(y)).map((a) => ({
    data: a.data, tipo: 'Agendamento', prof: a.cliente || '—', detalhe: a.slots.map(nomeSlot).join(', '),
    qtd: `${num(unidadesAg(esp.value, a))} ${unidadesAg(esp.value, a) === 1 ? unidadeUm.value : unidade.value}`, valor: Number(a.valor) || 0, valorTxt: brl(a.valor), status: a.status,
  }))
  return [...cs, ...as]
})
const movCols = [
  { key: 'data', label: 'Data', format: (v) => (v ? dataBR(v) : '—'), hint: 'Data do agendamento ou início do contrato.' },
  { key: 'tipo', label: 'Tipo', hint: 'Contrato: locação recorrente por mês. Agendamento: reserva de horários num dia, feita na agenda.' },
  { key: 'prof', label: 'Profissional', hint: 'Quem alugou o espaço.' },
  { key: 'detalhe', label: 'Horários ou\nvigência', hint: 'Horários do agendamento, ou início e fim do contrato.' },
  { key: 'qtd', label: 'Quantidade', hint: 'Unidades locadas: horas, turnos ou vagas por mês.' },
  { key: 'valorTxt', label: 'Valor', num: true, hint: 'Valor do agendamento, ou valor mensal do contrato (quantidade × preço).' },
  { key: 'status', label: 'Status', hint: 'Confirmada e Base inicial contam como receita firme; Proposta conta como prevista; Cancelada não conta.' },
]

// agendamentos do mês (lista acessível abaixo da matriz)
const agsMes = computed(() => ags.value.filter((a) => a.data.startsWith(state.mes)).sort((a, b) => a.data.localeCompare(b.data) || a.slots[0].localeCompare(b.slots[0])))
const contratosAno = computed(() => contratosVivos.value.filter((c) => idxMes(c.inicio) <= idxMes(`${ano.value}-12`) && (!c.fim || idxMes(c.fim) >= idxMes(`${ano.value}-01`))))
const tomStatus = { Confirmada: 'good', 'Base inicial': 'warn', Proposta: 'info', Cancelada: 'plain' }
</script>

<template>
  <div v-if="esp" class="stack">
    <section class="card head">
      <div class="head-main">
        <RouterLink to="/espacos" class="btn sm ghost back"><Icon name="back" :size="14" /> Espaços</RouterLink>
        <div class="tags">
          <span class="chip info">{{ esp.tipo }}</span>
          <span class="chip plain">Por {{ unidadeUm }}</span>
          <span class="chip plain">{{ brl(esp.preco) }}/{{ unidadeUm }}</span>
          <span class="chip plain">Capacidade {{ num(esp.capacidade) }} {{ unidade }}/mês</span>
          <span v-if="!porVagas && minimo > 1" class="chip warn">Mínimo {{ minimo }} {{ unidade }} por reserva</span>
        </div>
        <p v-if="esp.descricao" class="muted">{{ esp.descricao }}</p>
        <div v-if="!porVagas" class="vt">
          <label class="field">Valor pedido por turno (R$)
            <input :value="esp.precoTurno ?? ''" type="number" min="0" step="0.01" placeholder="ex.: 150" @change="definirValorTurno($event.target.value)" />
          </label>
          <p v-if="esp.precoTurno" class="small">
            Receita potencial: <strong class="tnum">{{ num(capAgenda.mes) }} turnos × {{ brl(esp.precoTurno) }} = {{ brl(capAgenda.mes * esp.precoTurno) }}/mês</strong>
            <span class="muted"> ({{ num(capAgenda.semana) }} turnos por semana)</span>
          </p>
          <p v-else class="small muted">Preencha para aplicar o valor a todos os {{ num(capAgenda.mes) }} turnos do mês como receita potencial. Hoje a sala usa {{ brl(esp.preco) }}/{{ unidadeUm }}.</p>
        </div>
      </div>
      <div class="head-act">
        <select :value="esp.id" aria-label="Ir para outro espaço" @change="$router.push(`/espacos/${$event.target.value}`)">
          <option v-for="e in state.data.espacos" :key="e.id" :value="e.id">{{ e.nome }}</option>
        </select>
        <RouterLink :to="`/espacos/${esp.id}/editar`" class="btn sm"><Icon name="edit" :size="14" /> Editar cadastro</RouterLink>
      </div>
    </section>

    <section class="grid cols-4">
      <StatTile label="Taxa de ocupação" :value="pct(r.taxa)" :tone="r.taxa >= meta ? 'good' : 'bad'" :hint="`${num(r.ocupado)} de ${num(r.capacidade)} ${unidade} · meta ${pct(meta)}`" />
      <StatTile label="Receita bruta (faturamento)" :value="brl(r.receitaOcupada)" :hint="`Receita potencial ${brl0(r.potencial)}`" />
      <StatTile label="Margem de contribuição" :value="brl(r.resultado)" :tone="r.resultado > 0 ? 'good' : 'bad'" :hint="`Custos diretos ${brl(r.despesas)}`" />
      <StatTile label="Receita ociosa" :value="brl(r.receitaDisponivel)" :hint="`${num(r.disponivel)} ${unidade} livres no mês`" />
    </section>

    <!-- ===== agenda ===== -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2>{{ porVagas ? `Agenda de contratos · ${ano}` : `Agenda do mês (${mesTitulo})` }}</h2>
          <p v-if="porVagas">Cada linha é uma vaga, cada coluna um mês. Arraste sobre os meses livres para criar um contrato; clique num contrato para editar.</p>
          <p v-else>Clique num turno livre para reservar, ou arraste para marcar vários dias e turnos de uma vez, como no Google Agenda. Clique num turno ocupado para editar ou excluir.</p>
        </div>
        <div class="toolbar">
          <select v-if="!porVagas" v-model="state.mes" class="sel-mes" aria-label="Mês da agenda">
            <option v-for="o in mesesAgenda" :key="o.m" :value="o.m">{{ o.t }}</option>
          </select>
          <button class="btn primary sm" type="button" @click="novoManual"><Icon name="plus" :size="14" /> {{ porVagas ? 'Novo contrato' : 'Novo agendamento' }}</button>
        </div>
      </div>
      <div class="legend small key">
        <span><i class="k-livre" />Livre</span>
        <span><i style="background: var(--s-firm)" />{{ porVagas ? 'Confirmado' : 'Confirmada' }}</span>
        <span><i style="background: var(--s-prop)" />Proposta</span>
        <span><i class="k-off" />Fechado</span>
      </div>
      <D3SlotGrid
        v-if="!porVagas" :cols="gCols" :rows="gRows" :celula="celula" :selecao="sel" :deps="mapaMes"
        :row-h="gRows.length > 4 ? 28 : 40" aria-label="Agenda do mês" @selecionar="aoSelecionar" @abrir="abrir"
      />
      <D3SlotGrid
        v-else :cols="mCols" :rows="mRows" :celula="celulaM" :selecao="sel" :deps="mapaM" :min-col="44"
        :row-h="vagas > 6 ? 26 : 36" aria-label="Agenda de contratos mensais" @selecionar="aoSelecionar" @abrir="abrir"
      />
      <ol v-if="legenda.length" class="leg-prof" aria-label="Legenda dos profissionais">
        <li v-for="l in legenda" :key="l.n">
          <span class="num" :class="l.conf ? 'conf' : 'prop'">{{ l.n }}</span>
          <span class="txt"><span class="nome">{{ l.nome }}</span>
          <span class="muted small">
            {{ l.contrato || `${l.turnos} ${l.turnos === 1 ? 'turno' : 'turnos'}` }} · {{ brl(l.valor) }}{{ porVagas ? '/mês' : '' }}{{ l.prop && !l.conf ? ' · proposta' : '' }}
          </span></span>
        </li>
      </ol>
      <p v-else class="small muted leg-vazia">Nenhum turno agendado neste mês.</p>
      <p v-if="!porVagas && semHorario.length" class="note small sem-h">
        <strong>Contratos sem horário definido neste mês:</strong>
        <span v-for="c in semHorario" :key="c.id"> {{ c.cliente || 'Sem nome' }} · {{ num(c.quantidade) }} {{ unidade }} · {{ brl(valorMensal(c)) }};</span>
        Eles contam na ocupação, mas não aparecem na matriz. Ao passar esses horários para a agenda, encerre ou ajuste o contrato em
        <RouterLink to="/situacao">Situação atual</RouterLink> para não contar duas vezes.
      </p>
      <p v-if="unidadeDiferente.length" class="note small sem-h warnote">
        <strong>Contratos em outra unidade:</strong>
        <span v-for="c in unidadeDiferente" :key="c.id"> {{ c.cliente || 'Sem nome' }} · {{ num(c.quantidade) }} {{ UNIDADE[c.modalidade] }}/mês;</span>
        a sala agora cobra por turno, então essas quantidades passam a contar como turnos. Ajuste em <RouterLink to="/situacao">Situação atual</RouterLink>.
      </p>
      <p v-if="porVagas && foraDasVagas.length" class="note small sem-h">
        {{ foraDasVagas.length }} contrato(s) pedem mais vagas do que o espaço tem no período. Revise a capacidade ou as quantidades.
      </p>

      <details class="lista" :open="(porVagas ? contratosAno.length : agsMes.length) <= 8">
        <summary>{{ porVagas ? `Contratos em ${ano} (${contratosAno.length})` : `Agendamentos do mês (${agsMes.length})` }}</summary>
        <div class="table-wrap">
          <table v-if="!porVagas">
            <thead><tr><th>Data</th><th>Horários</th><th>Profissional</th><th class="num">Valor</th><th>Status</th><th /></tr></thead>
            <tbody>
              <tr v-for="a in agsMes" :key="a.id">
                <td>{{ dataBR(a.data) }} <span class="muted small">{{ DIAS_SEMANA[dowDe(a.data)] }}</span></td>
                <td>{{ a.slots.map(nomeSlot).join(', ') }}</td>
                <td>{{ a.cliente }}</td>
                <td class="num">{{ brl(a.valor) }}</td>
                <td><span class="chip" :class="tomStatus[a.status]">{{ a.status }}</span></td>
                <td class="num"><button class="btn sm ghost" type="button" @click="abrirLinha(a, $event)"><Icon name="edit" :size="14" /> Editar</button></td>
              </tr>
            </tbody>
          </table>
          <table v-else>
            <thead><tr><th>Profissional</th><th>Vigência</th><th class="num">Vagas</th><th class="num">Valor mensal</th><th>Status</th><th /></tr></thead>
            <tbody>
              <tr v-for="c in contratosAno" :key="c.id">
                <td>{{ c.cliente }}</td>
                <td>{{ dataBR(c.inicio) }} a {{ c.fim ? dataBR(c.fim) : 'sem término' }}</td>
                <td class="num">{{ num(c.quantidade) }}</td>
                <td class="num">{{ brl(valorMensal(c)) }}</td>
                <td><span class="chip" :class="tomStatus[c.status]">{{ c.status }}</span></td>
                <td class="num"><button class="btn sm ghost" type="button" @click="abrirLinha(c, $event)"><Icon name="edit" :size="14" /> Editar</button></td>
              </tr>
            </tbody>
          </table>
          <div v-if="!(porVagas ? contratosAno.length : agsMes.length)" class="empty">Nada registrado ainda.</div>
        </div>
      </details>
    </section>

    <!-- ===== formulário flutuante ===== -->
    <Popover
      v-if="form" :box="form.box"
      :title="{ novo: 'Novo agendamento', editar: 'Editar agendamento', novoM: 'Novo contrato mensal', editarM: 'Editar contrato' }[form.modo]"
      @close="fechar"
    >
      <!-- agendamento novo -->
      <form v-if="form.modo === 'novo'" class="pf" @submit.prevent="salvarNovo">
        <label class="field">Profissional
          <select v-model="form.profId">
            <option value="" disabled>Escolha o profissional</option>
            <option v-for="p in profissionais" :key="p.id" :value="p.id">{{ p.nome }}{{ p.profissao ? ` · ${p.profissao}` : '' }}</option>
            <option value="__novo">+ Cadastrar novo profissional</option>
          </select>
        </label>
        <label v-if="form.profId === '__novo'" class="field">Nome do novo profissional<input v-model="form.novoNome" placeholder="Nome completo" /></label>
        <label v-if="form.manual" class="field">Dia<input v-model="form.dias[0]" type="date" /></label>
        <p v-else class="small muted quando">
          <Icon name="clock" :size="14" />
          {{ form.dias.length === 1 ? `${DIAS_SEMANA[dowDe(form.dias[0])]}, ${dataBR(form.dias[0])}` : `${form.dias.length} dias: ${dataBR(form.dias[0])} a ${dataBR(form.dias[form.dias.length - 1])}` }}
        </p>
        <div class="field">
          <span>Turnos</span>
          <div class="slots">
            <button v-for="o in opcoesNovo" :key="o.k" type="button" class="slot" :class="{ on: form.slots.includes(o.k) }" :disabled="o.bloq" :aria-pressed="form.slots.includes(o.k)" @click="alternar(form.slots, o.k)">
              {{ o.h.nome }} <small>{{ o.motivo }}</small>
            </button>
          </div>
          <small v-if="form.travado" class="muted">Para incluir outros turnos, arraste sobre eles na agenda.</small>
        </div>
        <label v-if="!esp.precoTurno" class="field">Valor pedido por turno desta sala (R$)
          <input v-model.number="form.valorTurno" type="number" min="0" step="0.01" :placeholder="esp.modalidade === 'Mensal' ? 'obrigatório' : 'opcional'" />
        </label>
        <div class="row2">
          <label class="field">{{ form.dias.length > 1 || form.repetir ? 'Valor por dia (R$)' : 'Valor (R$)' }}<input v-model.number="form.valorDia" type="number" min="0" step="0.01" :placeholder="num(form.valorTurno > 0 ? form.slots.length * form.valorTurno : sugerido)" /></label>
          <label class="field">Status<select v-model="form.status"><option v-for="s in STATUS_AGENDA.slice(0, 2)" :key="s">{{ s }}</option></select></label>
        </div>
        <label class="check"><input v-model="form.repetir" type="checkbox" /> Repetir toda semana</label>
        <label v-if="form.repetir" class="field">Até<input v-model="form.ate" type="date" :min="form.dias[0]" /></label>
        <label class="field">Observação<input v-model="form.obs" /></label>
        <div v-if="plano" class="resumo small">
          <strong>{{ plano.itens.length }} agendamento(s) · {{ brl(plano.total) }}</strong>
          <span v-if="minimo > 1" class="muted"> · mínimo de {{ minimo }} {{ unidade }} por dia</span>
          <ul v-if="plano.pulados.length" class="pulados">
            <li v-for="p in plano.pulados.slice(0, 5)" :key="p.d">{{ dataBR(p.d) }}: {{ p.motivo }}</li>
            <li v-if="plano.pulados.length > 5">e mais {{ plano.pulados.length - 5 }} dia(s) pulados</li>
          </ul>
        </div>
        <p v-if="form.erro" class="erro small">{{ form.erro }}</p>
        <div class="pf-act">
          <button class="btn" type="button" @click="fechar">Cancelar</button>
          <button class="btn primary" type="submit">Salvar</button>
        </div>
      </form>

      <!-- agendamento existente -->
      <form v-else-if="form.modo === 'editar'" class="pf" @submit.prevent="salvarEdicao">
        <p class="small muted quando"><Icon name="clock" :size="14" /> {{ DIAS_SEMANA[dowDe(form.data)] }}, {{ dataBR(form.data) }}</p>
        <label class="field">Profissional
          <select v-model="form.profId">
            <option value="" disabled>Escolha o profissional</option>
            <option v-for="p in profissionais" :key="p.id" :value="p.id">{{ p.nome }}{{ p.profissao ? ` · ${p.profissao}` : '' }}</option>
            <option value="__novo">+ Cadastrar novo profissional</option>
          </select>
        </label>
        <label v-if="form.profId === '__novo'" class="field">Nome do novo profissional<input v-model="form.novoNome" placeholder="Nome completo" /></label>
        <div class="field">
          <span>Turnos</span>
          <div class="slots">
            <button v-for="o in opcoesEdicao" :key="o.k" type="button" class="slot" :class="{ on: form.slots.includes(o.k) }" :disabled="o.ocupado" :aria-pressed="form.slots.includes(o.k)" @click="alternar(form.slots, o.k)">
              {{ o.h.nome }} <small>{{ o.ocupado ? 'ocupado' : `${o.h.ini}–${o.h.fim}` }}</small>
            </button>
          </div>
        </div>
        <div class="row2">
          <label class="field">Valor (R$)<input v-model.number="form.valor" type="number" min="0" step="0.01" /></label>
          <label class="field">Status<select v-model="form.status"><option v-for="s in STATUS_AGENDA" :key="s">{{ s }}</option></select></label>
        </div>
        <label class="field">Observação<input v-model="form.obs" /></label>
        <p v-if="form.erro" class="erro small">{{ form.erro }}</p>
        <div class="pf-act">
          <button class="btn danger sm" type="button" @click="excluir(false)"><Icon name="trash" :size="14" /> Excluir</button>
          <button v-if="serieRestante > 1" class="btn danger sm" type="button" @click="excluir(true)">Excluir {{ serieRestante }} da série</button>
          <span class="grow" />
          <button class="btn primary" type="submit">Salvar</button>
        </div>
      </form>

      <!-- contrato mensal -->
      <form v-else class="pf" @submit.prevent="salvarMensal">
        <label class="field">Profissional ou empresa<input v-model="form.cliente" list="clientes" /></label>
        <div class="row2">
          <label class="field">Início<input v-model="form.inicio" type="month" /></label>
          <label class="field">Fim<input v-model="form.fim" type="month" :disabled="form.semFim" :min="form.inicio" /></label>
        </div>
        <label class="check"><input v-model="form.semFim" type="checkbox" /> Sem data de término</label>
        <div class="row2">
          <label class="field">Vagas<input v-model.number="form.quantidade" type="number" min="1" :max="vagas" step="1" /></label>
          <label class="field">Valor mensal por vaga (R$)<input v-model.number="form.valor" type="number" min="0" step="0.01" /></label>
        </div>
        <label class="field">Status<select v-model="form.status"><option v-for="s in STATUS" :key="s">{{ s }}</option></select></label>
        <label class="field">Observação<input v-model="form.obs" /></label>
        <p class="small muted">Total por mês: <strong>{{ brl((Number(form.quantidade) || 0) * (Number(form.valor) || 0)) }}</strong></p>
        <p v-if="form.erro" class="erro small">{{ form.erro }}</p>
        <div class="pf-act">
          <button v-if="form.modo === 'editarM'" class="btn danger sm" type="button" @click="excluirContrato"><Icon name="trash" :size="14" /> Excluir</button>
          <span class="grow" />
          <button class="btn" type="button" @click="fechar">Cancelar</button>
          <button class="btn primary" type="submit">Salvar</button>
        </div>
      </form>
    </Popover>
    <datalist id="clientes"><option v-for="c in clientes" :key="c" :value="c" /></datalist>

    <!-- ===== configuração ===== -->
    <section v-if="!porVagas" class="card">
      <div class="card-head">
        <div>
          <h2>Turnos e regras da agenda</h2>
          <p>Padrão da Santé: 08–12, 14–18 e 19–22 de segunda a sexta; sábado 08–12 e 14–18. Cada turno é uma linha da matriz.</p>
        </div>
        <div class="toolbar">
          <button class="btn sm" type="button" @click="addHorario"><Icon name="plus" :size="14" /> Turno</button>
          <button class="btn sm ghost" type="button" @click="restaurar">Restaurar padrão</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="cfg">
          <thead><tr><th>Nome</th><th>Início</th><th>Fim</th><th>Dias da semana</th><th /></tr></thead>
          <tbody>
            <tr v-for="(h, i) in agenda.horarios" :key="i">
              <td><input v-model="h.nome" class="in-nome" @input="garantirAgenda" /></td>
              <td><input :value="h.ini" type="time" @change="mudarHora(h, 'ini', $event.target.value)" /></td>
              <td><input :value="h.fim" type="time" @change="mudarHora(h, 'fim', $event.target.value)" /></td>
              <td>
                <div class="dias">
                  <button v-for="d in [1, 2, 3, 4, 5, 6, 0]" :key="d" type="button" class="dia" :class="{ on: h.dias.includes(d) }" :aria-pressed="h.dias.includes(d)" @click="alternarDia(h, d)">{{ DIAS_SEMANA[d] }}</button>
                </div>
              </td>
              <td class="num"><button class="btn icon sm ghost" type="button" aria-label="Remover horário" @click="delHorario(h)"><Icon name="trash" :size="14" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="regras">
        <label class="field">Mínimo de {{ unidade }} por reserva no mesmo dia<input v-model.number="minimoEdit" type="number" min="1" step="1" /></label>
        <div class="cap">
          <span class="small muted">Capacidade que esta agenda oferece</span>
          <strong class="tnum">{{ num(capAgenda.semana) }} {{ unidade }}/semana · {{ num(capAgenda.mes) }}/mês</strong>
          <span class="small muted">Cadastrada: {{ num(esp.capacidade) }}/mês</span>
          <button v-if="Math.abs(capAgenda.mes - esp.capacidade) > 0.5" class="btn sm" type="button" @click="esp.capacidade = capAgenda.mes">Usar {{ num(capAgenda.mes) }} como capacidade</button>
        </div>
      </div>
    </section>

    <!-- ===== histórico ===== -->
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Histórico</h2>
          <p>Receita bruta e taxa de ocupação mês a mês. Meses depois do de referência mostram o que já está contratado.</p>
        </div>
        <div class="seg" role="tablist" aria-label="Ano">
          <button v-for="y in anos" :key="y" type="button" role="tab" :aria-selected="anoHist === y" :class="{ on: anoHist === y }" @click="anoHist = y">{{ y }}</button>
        </div>
      </div>
      <div class="grid cols-2">
        <div>
          <h3 class="sub-h">Receita bruta por mês</h3>
          <D3Columns :points="colunas" :refs="refsCol" :axis-format="brlCompact" />
        </div>
        <div>
          <h3 class="sub-h">Taxa de ocupação por mês</h3>
          <D3Lines :labels="linhasTaxa.labels" :series="linhasTaxa.series" :format="pct" :axis-format="pct" :height="250" />
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Comparativo anual</h2><p>Passe o mouse no nome da coluna para ver o cálculo</p></div></div>
      <D3Table :columns="anuaisCols" :rows="anuais" sort-key="ano" compact />
    </section>

    <section class="grid cols-2">
      <div v-if="!porVagas" class="card">
        <h2>Uso por dia da semana e horário · {{ anoHist }}</h2>
        <p class="small muted">Parte dos dias do ano em que cada horário teve agendamento. Quanto mais escuro, mais usado.</p>
        <D3SlotGrid :cols="uCols" :rows="gRows" :celula="celulaUso" :selecionavel="false" :deps="usoCont" :min-col="44" :row-h="28" aria-label="Uso por dia da semana e horário" />
        <p v-if="!Object.keys(usoCont).length" class="small muted">Sem agendamentos neste ano. O mapa se preenche conforme a agenda for usada.</p>
      </div>
      <div class="card" :class="{ 'span-2': porVagas }">
        <h2>Receita bruta por profissional · {{ anoHist }}</h2>
        <p class="small muted">Contratos e agendamentos somados no ano</p>
        <D3HBar :items="porProf" :format="brl0" aria-label="Receita por profissional" />
      </div>
    </section>

    <section class="card">
      <h2>Linha do tempo dos contratos</h2>
      <p class="small muted">Três meses antes e doze depois do mês de referência</p>
      <D3Gantt :espacos="[esp]" :contratos="state.data.contratos" :mes="state.mes" />
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Movimentação</h2>
          <p>Tudo o que está registrado para este espaço: contratos e agendamentos</p>
        </div>
        <select v-model="movAno" aria-label="Filtrar por ano">
          <option value="todos">Todos os anos</option>
          <option v-for="y in anos" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <D3Table :columns="movCols" :rows="movimentos" sort-key="data" compact />
      <div v-if="!movimentos.length" class="empty">Nenhuma movimentação neste período.</div>
    </section>
  </div>
  <div v-else class="card empty">Espaço não encontrado. <RouterLink to="/espacos">Voltar para espaços</RouterLink></div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
.head-main { display: grid; gap: 8px; }
.head-main p { margin: 0; }
.back { justify-self: start; margin-left: -10px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.head-act { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.head-act select { height: 30px; }
.sel-mes { height: 30px; }
.key { display: flex; flex-wrap: wrap; gap: 16px; margin: -6px 0 8px; color: var(--text-2); }
.key span { display: inline-flex; align-items: center; gap: 6px; }
.key i { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.k-livre { background: var(--s-track); }
.leg-prof { list-style: none; margin: 10px 0 0; padding: 10px 0 0; border-top: 1px solid var(--border); display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 6px 16px; }
.leg-prof li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; min-width: 0; }
.leg-prof .txt { min-width: 0; line-height: 1.45; }
.leg-prof .num { flex: none; min-width: 22px; height: 22px; padding: 0 5px; border-radius: 6px; display: inline-grid; place-items: center; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.leg-prof .num.conf { background: var(--s-firm); color: #fff; }
.leg-prof .num.prop { background: var(--s-prop); color: var(--text); }
.leg-prof .nome { font-weight: 500; margin-right: 4px; }
.leg-vazia { margin: 10px 0 0; }
.k-off { border: 1px dashed var(--border); }
.sem-h { margin-top: 12px; }
.lista { margin-top: 14px; }
.lista summary { cursor: pointer; font-size: 13px; color: var(--accent-ink); margin-bottom: 6px; }
.sub-h { font-size: 13px; margin: 0 0 6px; color: var(--text-2); font-weight: 500; }
.seg { display: inline-flex; flex-wrap: wrap; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; }
.seg button { border: 0; background: transparent; color: var(--text-2); font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 8px; cursor: pointer; }
.seg button.on { background: var(--surface); color: var(--text); font-weight: 500; box-shadow: var(--shadow); }

.pf { display: grid; gap: 10px; }
.pf .quando { display: flex; align-items: center; gap: 6px; margin: -4px 0 0; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.slots { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.slot { border: 1px solid var(--border); background: var(--surface); color: var(--text-2); border-radius: 8px; padding: 4px 8px; font: inherit; font-size: 12px; cursor: pointer; display: grid; text-align: left; }
.slot small { color: var(--muted); font-size: 11px; }
.slot.on { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-ink); }
.slot:disabled { opacity: 0.4; cursor: not-allowed; border-style: dashed; background: transparent; }
.check { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; }
.check input { height: auto; }
.resumo { background: var(--surface-2); border-radius: 10px; padding: 8px 10px; }
.pulados { margin: 6px 0 0; padding-left: 16px; color: var(--warn); }
.erro { color: var(--bad); margin: 0; }
.pf-act { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.grow { flex: 1; }

.cfg td { vertical-align: middle; }
.cfg input { height: 30px; }
.in-nome { width: 120px; }
.dias { display: flex; gap: 4px; flex-wrap: wrap; }
.dia { border: 1px solid var(--border); background: transparent; color: var(--muted); border-radius: 6px; font: inherit; font-size: 12px; padding: 2px 6px; cursor: pointer; }
.dia.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-ink); }
.regras { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; align-items: end; }
.vt { display: grid; grid-template-columns: minmax(160px, 220px) minmax(0, 1fr); gap: 4px 14px; align-items: end; margin-top: 4px; }
.vt p { margin: 0 0 8px; }
@media (max-width: 640px) { .vt { grid-template-columns: minmax(0, 1fr); } }
.warnote { background: var(--warn-soft); color: var(--warn); }
.cap { display: grid; gap: 2px; justify-items: start; }
</style>
