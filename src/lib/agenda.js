// Agenda dos espaços: horários de cada espaço e agendamentos por dia.
// Um agendamento ocupa um ou mais horários de um dia e entra na ocupação e na
// receita do mês (veja resumoMes em calc.js).

export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const STATUS_AGENDA = ['Confirmada', 'Proposta', 'Cancelada']

const pad = (v) => String(v).padStart(2, '0')

// Turnos da Santé: toda sala é alugada por turno.
// Seg–sex: 08–12, 14–18 e 19–22. Sábado: 08–12 e 14–18. (17 turnos por semana → 73,61 por mês)
export const AGENDA_VERSAO = 3
export function agendaPadrao() {
  return {
    versao: AGENDA_VERSAO,
    minimo: 1,
    horarios: [
      { nome: 'Manhã', ini: '08:00', fim: '12:00', dias: [1, 2, 3, 4, 5, 6] },
      { nome: 'Tarde', ini: '14:00', fim: '18:00', dias: [1, 2, 3, 4, 5, 6] },
      { nome: 'Noite', ini: '19:00', fim: '22:00', dias: [1, 2, 3, 4, 5] },
    ],
  }
}

// Agendas salvas em versões anteriores: a v2 (turnos) ganha a tarde de sábado e mantém as
// outras mudanças; versões mais antigas (por hora) voltam ao padrão.
export function migrarAgenda(ag) {
  if (ag?.versao === AGENDA_VERSAO) return ag
  if (ag?.versao === 2 && ag.horarios) {
    const tarde = ag.horarios.find((h) => h.ini === '14:00' && h.fim === '18:00')
    if (tarde && !tarde.dias.includes(6)) tarde.dias = [...tarde.dias, 6].sort()
    return { ...ag, versao: AGENDA_VERSAO }
  }
  return agendaPadrao()
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

// Capacidade por semana e por mês que a agenda configurada permite
export function capacidadeAgenda(agenda, modalidade) {
  const sem = (agenda?.horarios || []).reduce((s, h) => s + h.dias.length * (modalidade === 'Hora' ? horasDe(chave(h)) : 1), 0)
  return { semana: sem, mes: +(sem * 4.33).toFixed(2) }
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

// Valor pedido por turno: a sala passa a cobrar por turno e todos os turnos da
// agenda viram a capacidade (receita potencial = turnos do mês × valor).
export function aplicarValorTurno(espaco, valor) {
  espaco.precoTurno = valor
  espaco.modalidade = 'Turno'
  espaco.preco = valor
  espaco.capacidade = capacidadeAgenda(espaco.agenda || agendaPadrao(), 'Turno').mes
}
