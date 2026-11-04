// Agenda dos espaços: horários de cada espaço e agendamentos por dia.
// Um agendamento ocupa um ou mais horários de um dia e entra na ocupação e na
// receita do mês (veja resumoMes em calc.js).

export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const STATUS_AGENDA = ['Confirmada', 'Proposta', 'Cancelada']

const pad = (v) => String(v).padStart(2, '0')

// Turnos da Santé. A fonte de verdade é o bloco `turnos` do sante.json (state.data.turnos):
// todas as salas usam esses turnos, a não ser que tenham turnos próprios em `espaco.agenda`.
// TURNOS_INICIAIS só serve para criar o bloco num sante.json antigo que ainda não o tenha.
export const AGENDA_VERSAO = 3
const TURNOS_INICIAIS = {
  versao: AGENDA_VERSAO,
  minimo: 1,
  horarios: [
    { nome: 'Manhã', ini: '08:00', fim: '12:00', dias: [1, 2, 3, 4, 5, 6] },
    { nome: 'Tarde', ini: '14:00', fim: '18:00', dias: [1, 2, 3, 4, 5, 6] },
    { nome: 'Noite', ini: '19:00', fim: '22:00', dias: [1, 2, 3, 4, 5] },
  ],
}
const copia = (v) => JSON.parse(JSON.stringify(v))
export const turnosIniciais = () => copia(TURNOS_INICIAIS)

// O store informa onde estão os turnos da Santé (state.data.turnos), para as contas serem reativas.
let fonte = () => null
export function definirFonteTurnos(fn) {
  fonte = fn
}
export const agendaPadrao = () => fonte() || TURNOS_INICIAIS
// turnos que valem para um espaço: os próprios, se houver, ou os da Santé
export const agendaDe = (e) => (e?.agenda?.horarios ? e.agenda : agendaPadrao())
export const usaTurnosDaSante = (e) => !e?.agenda?.horarios

export function mesmaAgenda(a, b) {
  const n = (x) => JSON.stringify({ m: Number(x?.minimo) || 1, h: (x?.horarios || []).map((h) => [h.nome, h.ini, h.fim, [...h.dias].sort()]) })
  return n(a) === n(b)
}

// Bloco `turnos` do sante.json (cria a partir dos iniciais se faltar)
export function normalizarTurnos(t) {
  if (!t?.horarios) return turnosIniciais()
  return { versao: AGENDA_VERSAO, minimo: Number(t.minimo) || 1, horarios: t.horarios }
}

// Turnos próprios de uma sala salvos em versões anteriores. Devolve null quando são iguais
// aos da Santé (a sala passa a usar o bloco central). A v2 ganha a tarde de sábado.
export function migrarAgenda(ag, turnos) {
  if (!ag?.horarios) return null
  let a = ag
  if (ag.versao === 2) {
    a = copia(ag)
    const tarde = a.horarios.find((h) => h.ini === '14:00' && h.fim === '18:00')
    if (tarde && !tarde.dias.includes(6)) tarde.dias = [...tarde.dias, 6].sort()
  } else if (ag.versao !== AGENDA_VERSAO) return null
  a = { ...a, versao: AGENDA_VERSAO }
  return mesmaAgenda(a, turnos) ? null : a
}

// Textos gerados a partir dos turnos (nada fixo no código)
const NOMES_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const ORDEM = [1, 2, 3, 4, 5, 6, 0]
const curto = (s) => s.replace(/:00$/, '')
function faixaDias(dias) {
  const ds = ORDEM.filter((d) => dias.includes(d))
  const grupos = []
  ds.forEach((d) => {
    const g = grupos[grupos.length - 1]
    if (g && ORDEM.indexOf(d) === ORDEM.indexOf(g[g.length - 1]) + 1) g.push(d)
    else grupos.push([d])
  })
  return grupos.map((g) => (g.length > 2 ? `${NOMES_DIA[g[0]]} a ${NOMES_DIA[g[g.length - 1]]}` : g.map((d) => NOMES_DIA[d]).join(' e '))).join(', ')
}
// "Manhã 08–12 (segunda a sábado) · Tarde 14–18 (...)"
export const listaTurnos = (agenda) => (agenda?.horarios || []).map((h) => `${h.nome} ${curto(h.ini)}–${curto(h.fim)} (${faixaDias(h.dias)})`).join(' · ')
// "segunda a sexta com 3 turnos, sábado com 2, domingo fechado"
export function resumoSemana(agenda) {
  const n = (d) => (agenda?.horarios || []).filter((h) => h.dias.includes(d)).length
  const grupos = []
  ORDEM.forEach((d) => {
    const g = grupos[grupos.length - 1]
    if (g && g.n === n(d)) g.dias.push(d)
    else grupos.push({ n: n(d), dias: [d] })
  })
  return grupos.map((g) => `${faixaDias(g.dias)} ${g.n ? `com ${g.n} ${g.n === 1 ? 'turno' : 'turnos'}` : 'fechado'}`).join(', ')
}
// duração média de um turno, em horas
export const horasMediasTurno = (agenda) => {
  const hs = agenda?.horarios || []
  return hs.length ? hs.reduce((s, h) => s + horasDe(chave(h)), 0) / hs.length : 0
}

export const chave = (h) => `${h.ini}-${h.fim}`
const minutos = (s) => {
  const [H, M] = s.split(':').map(Number)
  return H * 60 + (M || 0)
}
export function horasDe(k) {
  const [a, b] = k.split('-')
  return Math.max(0, (minutos(b) - minutos(a)) / 60)
}

// Unidades que um agendamento consome: horas (modalidade Hora) ou turnos
export function unidadesAg(espaco, ag) {
  if (!ag?.slots) return 0
  return espaco?.modalidade === 'Hora' ? ag.slots.reduce((s, k) => s + horasDe(k), 0) : ag.slots.length
}

export const ativoAg = (a) => a.status !== 'Cancelada'
// Turno marcado como "Não disponível" pela administração: não é locado, não gera receita
// e sai da capacidade do mês.
export const ehBloqueio = (a) => a?.tipo === 'bloqueio'
export const ehLocacao = (a) => ativoAg(a) && !ehBloqueio(a)

export function diasDoMes(mes) {
  const [y, m] = mes.split('-').map(Number)
  const n = new Date(y, m, 0).getDate()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(y, m - 1, i + 1)
    return { iso: `${mes}-${pad(i + 1)}`, d: i + 1, dow: d.getDay() }
  })
}

export const dowDe = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}
export function somaDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const x = new Date(y, m - 1, d + n)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

// Turnos (ou horas) que a agenda oferece por semana
export function capacidadeAgenda(agenda, modalidade) {
  const sem = (agenda?.horarios || []).reduce((s, h) => s + h.dias.length * (modalidade === 'Hora' ? horasDe(chave(h)) : 1), 0)
  return { semana: sem }
}

// Mapa horário -> agendamento ocupando, para um espaço e um dia
export function ocupacaoDia(agendamentos, espacoId, iso, ignorarId = null) {
  const m = {}
  for (const a of agendamentos) {
    if (a.espacoId !== espacoId || a.data !== iso || !ativoAg(a) || a.id === ignorarId) continue
    a.slots.forEach((k) => (m[k] = a))
  }
  return m
}

// Posição de cada contrato mensal nas vagas do espaço ao longo de um ano (para a matriz mensal):
// cada contrato fica sempre na mesma linha, na primeira vaga livre durante todo o período.
export function posicoesMensais(contratos, vagas, meses, idxMes) {
  const ocup = Array.from({ length: vagas }, () => new Set())
  const lugar = new Map()
  const ord = [...contratos].sort((a, b) => a.inicio.localeCompare(b.inicio))
  for (const c of ord) {
    const ms = meses.filter((m) => idxMes(c.inicio) <= idxMes(m) && (!c.fim || idxMes(c.fim) >= idxMes(m)))
    if (!ms.length) continue
    const q = Math.max(1, Math.ceil(Number(c.quantidade) || 1))
    const linhas = []
    for (let r = 0; r < vagas && linhas.length < q; r++) if (ms.every((m) => !ocup[r].has(m))) linhas.push(r)
    linhas.forEach((r) => ms.forEach((m) => ocup[r].add(m)))
    lugar.set(c.id, { linhas, meses: ms })
  }
  return lugar
}

// Valor pedido por turno: a sala passa a cobrar por turno; a capacidade vem da agenda
// (receita potencial = turnos abertos no mês × valor, veja capacidadeMes).
export function aplicarValorTurno(espaco, valor) {
  espaco.precoTurno = valor
  espaco.modalidade = 'Turno'
  espaco.preco = valor
}

// Salas e piscina que alugam por hora ou turno têm a capacidade tirada da agenda.
// Contrato mensal e administrativo (vagas) seguem com a capacidade cadastrada.
export const usaAgenda = (e) => !!e && e.tipo !== 'Administrativo' && e.modalidade !== 'Mensal'

// Capacidade do mês: turnos abertos na agenda em cada dia do mês (ou as horas desses
// turnos, se a sala cobra por hora), contados no calendário real do mês.
// Turnos marcados como "Não disponível" (agendamentos do tipo bloqueio) são descontados.
export function capacidadeMes(e, mes, agendamentos = []) {
  if (!usaAgenda(e)) return Number(e?.capacidade) || 0
  const hs = agendaDe(e).horarios
  const abertos = diasDoMes(mes).reduce((s, d) => s + hs.filter((h) => h.dias.includes(d.dow))
    .reduce((t, h) => t + (e.modalidade === 'Hora' ? horasDe(chave(h)) : 1), 0), 0)
  // só descontam bloqueios em turnos que existem e abrem naquele dia
  const porChave = Object.fromEntries(hs.map((h) => [chave(h), h]))
  const bloqueados = (agendamentos || []).filter((a) => ehBloqueio(a) && ativoAg(a) && a.espacoId === e.id && a.data?.startsWith(mes))
    .reduce((s, a) => {
      const dow = dowDe(a.data)
      const validos = a.slots.filter((k) => porChave[k]?.dias.includes(dow))
      return s + unidadesAg(e, { slots: validos })
    }, 0)
  return Math.max(0, abertos - bloqueados)
}

// Datas que um novo agendamento ocupa, conforme a repetição escolhida:
// 'nao' · 'semana' (toda semana até `ate`) · 'mes' / 'ano' (mesmo dia da semana no resto do mês / ano).
// Datas antes de `desde` (hoje) ficam de fora, para não mexer no que já passou; os dias escolhidos sempre entram.
export function expandirDatas(dias, repetir, ate, desde = '') {
  const out = new Set(dias)
  for (const d of dias) {
    if (repetir === 'semana' && ate) {
      for (let x = somaDias(d, 7); x <= ate; x = somaDias(x, 7)) out.add(x)
    } else if (repetir === 'mes' || repetir === 'ano') {
      const ini = repetir === 'mes' ? `${d.slice(0, 7)}-01` : `${d.slice(0, 4)}-01-01`
      const fim = repetir === 'mes' ? `${d.slice(0, 7)}-31` : `${d.slice(0, 4)}-12-31`
      const dow = dowDe(d)
      let x = ini
      while (dowDe(x) !== dow) x = somaDias(x, 1)
      for (; x <= fim && x.slice(0, 4) === d.slice(0, 4); x = somaDias(x, 7)) {
        if (x >= desde && (repetir === 'ano' || x.slice(0, 7) === d.slice(0, 7))) out.add(x)
      }
    }
  }
  return [...out].sort()
}
