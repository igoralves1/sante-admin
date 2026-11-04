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
// turnos, se a sala cobra por hora). Ex.: nov/2026 = 21 dias úteis × 3 + 4 sábados × 2 = 71 turnos.
// Turnos marcados como "Não disponível" (agendamentos do tipo bloqueio) são descontados.
export function capacidadeMes(e, mes, agendamentos = []) {
  if (!usaAgenda(e)) return Number(e?.capacidade) || 0
  const hs = (e.agenda?.horarios ? e.agenda : agendaPadrao()).horarios
  const abertos = diasDoMes(mes).reduce((s, d) => s + hs.filter((h) => h.dias.includes(d.dow))
    .reduce((t, h) => t + (e.modalidade === 'Hora' ? horasDe(chave(h)) : 1), 0), 0)
  const bloqueados = (agendamentos || []).filter((a) => ehBloqueio(a) && ativoAg(a) && a.espacoId === e.id && a.data?.startsWith(mes))
    .reduce((s, a) => s + unidadesAg(e, a), 0)
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
