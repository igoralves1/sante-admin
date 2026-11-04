// Regras de negócio. As fórmulas de ocupação e ponto de equilíbrio seguem a planilha
// Sistema_Controle_Sante.xlsx; contratos passam a ter início e fim (vigência).
import { addMes, mesAtual } from './format'
import { AGENDA_VERSAO, agendaPadrao, ativoAg, unidadesAg } from './agenda'

export const MODALIDADES = ['Hora', 'Turno', 'Mensal']
export const UNIDADE = { Hora: 'horas', Turno: 'turnos', Mensal: 'contratos' }
export const TIPOS = ['Consultório', 'Piscina', 'Administrativo', 'Sala de procedimentos', 'Outro']
export const STATUS = ['Confirmada', 'Proposta', 'Base inicial', 'Cancelada']
export const STATUS_CAMPANHA = ['Planejada', 'Ativa', 'Pausada', 'Concluída']
export const SEMANAS_MES = 4.33

const n = (v) => Number(v) || 0
const soma = (arr, f) => arr.reduce((a, x) => a + f(x), 0)
export const idxMes = (iso) => {
  const [y, m] = iso.slice(0, 7).split('-').map(Number)
  return y * 12 + (m - 1)
}

// ---------- contratos ----------
export const firme = (c) => c.status === 'Confirmada' || c.status === 'Base inicial'
export const valorMensal = (c) => n(c.quantidade) * n(c.preco)
export function duracaoMeses(c) {
  if (!c.inicio || !c.fim) return null
  return Math.max(1, idxMes(c.fim) - idxMes(c.inicio) + 1)
}
export function valorTotal(c) {
  const d = duracaoMeses(c)
  return d === null ? null : d * valorMensal(c)
}
export function ativoEm(c, mes) {
  if (c.status === 'Cancelada' || !c.inicio) return false
  const m = idxMes(mes)
  return idxMes(c.inicio) <= m && (!c.fim || idxMes(c.fim) >= m)
}
// Situação do contrato em relação ao mês de referência
export function vigencia(c, mes = mesAtual()) {
  if (c.status === 'Cancelada') return { k: 'cancelado', label: 'Cancelado', tom: 'bad' }
  const m = idxMes(mes)
  if (idxMes(c.inicio) > m) return { k: 'futuro', label: 'Começa depois', tom: 'info' }
  if (c.fim && idxMes(c.fim) < m) return { k: 'encerrado', label: 'Encerrado', tom: 'plain' }
  if (!c.fim) return { k: 'vigente', label: 'Vigente · sem término', tom: 'warn' }
  const resta = idxMes(c.fim) - m + 1
  if (resta <= 2) return { k: 'vigente', label: resta === 1 ? 'Vence este mês' : 'Vence no próximo mês', tom: 'warn', resta }
  return { k: 'vigente', label: `Vigente · ${resta} meses restantes`, tom: 'good', resta }
}

// ---------- espaços ----------
export const despesasEspaco = (e) => soma(e.despesas || [], (d) => n(d.valor))

export function resumoMes(data, mes) {
  const ativos = data.contratos.filter((c) => ativoEm(c, mes))
  // agendamentos da agenda (por dia e horário) somam-se aos contratos do mês
  const ags = (data.agendamentos || []).filter((a) => ativoAg(a) && a.data?.startsWith(mes))
  const espacos = data.espacos.map((e) => {
    const cs = ativos.filter((c) => c.espacoId === e.id)
    const as = ags.filter((a) => a.espacoId === e.id)
    const asConf = as.filter((a) => a.status === 'Confirmada')
    const cap = n(e.capacidade)
    const preco = n(e.preco)
    const ocupado = soma(cs, (c) => n(c.quantidade)) + soma(as, (a) => unidadesAg(e, a))
    const confirmado = soma(cs.filter(firme), (c) => n(c.quantidade)) + soma(asConf, (a) => unidadesAg(e, a))
    const disponivel = Math.max(0, cap - ocupado)
    const receitaOcupada = soma(cs, valorMensal) + soma(as, (a) => n(a.valor))
    const despesas = despesasEspaco(e)
    return {
      ...e,
      contratos: cs,
      agendamentos: as,
      ocupado,
      confirmado,
      proposta: ocupado - confirmado,
      disponivel,
      taxa: cap ? ocupado / cap : 0,
      taxaConfirmada: cap ? confirmado / cap : 0,
      potencial: cap * preco,
      receitaOcupada,
      receitaConfirmada: soma(cs.filter(firme), valorMensal) + soma(asConf, (a) => n(a.valor)),
      receitaDisponivel: disponivel * preco,
      despesas,
      resultado: receitaOcupada - despesas,
    }
  })
  const potencial = soma(espacos, (e) => e.potencial)
  const receitaOcupada = soma(espacos, (e) => e.receitaOcupada)
  const receitaConfirmada = soma(espacos, (e) => e.receitaConfirmada)
  return {
    mes,
    espacos,
    potencial,
    receitaOcupada,
    receitaConfirmada,
    receitaProposta: receitaOcupada - receitaConfirmada,
    receitaDisponivel: soma(espacos, (e) => e.receitaDisponivel),
    despesasEspacos: soma(espacos, (e) => e.despesas),
    // ponderada pela receita: horas, turnos e contratos não se somam diretamente
    taxaReceita: potencial ? receitaOcupada / potencial : 0,
    taxaConfirmada: potencial ? receitaConfirmada / potencial : 0,
    espacosVazios: espacos.filter((e) => e.ocupado === 0).length,
    nContratos: ativos.length,
  }
}

// ---------- financeiro ----------
export function financeiro(data) {
  const fixosGerais = soma(data.custos.fixos, (c) => n(c.valor))
  const despesasEspacos = soma(data.espacos, despesasEspaco)
  const fixos = fixosGerais + despesasEspacos
  const margem = 1 - n(data.custos.impostos) - n(data.custos.comissoes)
  return { fixosGerais, despesasEspacos, fixos, margem, pontoEquilibrio: margem > 0 ? fixos / margem : 0 }
}

// Receita por mês a partir dos contratos (passado e futuro)
export function serieMensal(data, centro, antes = 5, depois = 6) {
  const fin = financeiro(data)
  const out = []
  for (let i = -antes; i <= depois; i++) {
    const mes = addMes(centro, i)
    const r = resumoMes(data, mes)
    out.push({
      mes,
      offset: i,
      receitaOcupada: r.receitaOcupada,
      receitaConfirmada: r.receitaConfirmada,
      potencial: r.potencial,
      taxa: r.taxaReceita,
      custos: fin.fixos,
      resultado: r.receitaOcupada * fin.margem - fin.fixos,
    })
  }
  return out
}

// Receita que deixa de existir quando contratos com término vencem
export function receitaEmRisco(data, mes, meses = 3) {
  const lim = idxMes(mes) + meses - 1
  const cs = data.contratos.filter((c) => ativoEm(c, mes) && c.fim && idxMes(c.fim) <= lim)
  return { contratos: cs, valor: soma(cs, valorMensal) }
}

// Cenário: todos os espaços abaixo de `alvo` passam a ter `alvo` de ocupação
export function cenario(data, mes, alvo) {
  const r = resumoMes(data, mes)
  const fin = financeiro(data)
  const espacos = r.espacos.map((e) => {
    const taxa = Math.max(e.taxa, alvo)
    return { ...e, taxaCenario: taxa, receitaCenario: e.potencial ? Math.max(e.receitaOcupada, taxa * e.potencial) : e.receitaOcupada }
  })
  const receita = soma(espacos, (e) => e.receitaCenario)
  return {
    espacos,
    receita,
    adicional: receita - r.receitaOcupada,
    resultado: receita * fin.margem - fin.fixos,
    resultadoAtual: r.receitaOcupada * fin.margem - fin.fixos,
  }
}

// Curva resultado × ocupação (ocupação uniforme por receita)
export function curvaEquilibrio(data, mes) {
  const r = resumoMes(data, mes)
  const fin = financeiro(data)
  const pts = []
  for (let t = 0; t <= 1.0001; t += 0.02) pts.push({ t, resultado: r.potencial * t * fin.margem - fin.fixos })
  const tEquilibrio = r.potencial && fin.margem > 0 ? fin.fixos / (r.potencial * fin.margem) : null
  return { pts, tEquilibrio, atual: { t: r.taxaReceita, resultado: r.receitaOcupada * fin.margem - fin.fixos } }
}

// ---------- marketing ----------
export function resultadoCampanha(data, c, mes = mesAtual()) {
  const cs = data.contratos.filter((x) => x.campanha === c.id && x.status !== 'Cancelada')
  const contratos = cs.length
  const receitaMensal = soma(cs.filter((x) => ativoEm(x, mes)), valorMensal)
  const receitaTotal = soma(cs, (x) => valorTotal(x) ?? valorMensal(x))
  const orc = n(c.orcamento)
  return {
    contratos,
    receitaMensal,
    receitaTotal,
    conversao: c.leads ? contratos / c.leads : 0,
    cac: contratos ? orc / contratos : 0,
    roi: orc ? (receitaTotal - orc) / orc : 0,
  }
}

// ---------- migração / validação de arquivos ----------
// Aceita o formato antigo (reservas por mês, espaços por nome) e completa campos faltantes.
export function normalizar(d) {
  d.meta ||= {}
  d.metas ||= { ocupacaoAlvo: 0.6 }
  d.custos ||= { fixos: [], impostos: 0, comissoes: 0 }
  d.campanhas ||= []
  d.espacos = (d.espacos || []).map((e, i) => ({
    id: e.id || `e${i + 1}`,
    nome: e.nome,
    tipo: e.tipo || (/^sala/i.test(e.nome) ? 'Consultório' : TIPOS.includes(e.nome) ? e.nome : 'Outro'),
    modalidade: e.modalidade || 'Turno',
    capacidade: n(e.capacidade),
    preco: n(e.preco),
    descricao: e.descricao || '',
    obs: e.obs || '',
    despesas: e.despesas || [],
    // agenda em turnos; versões antigas (por hora) voltam ao padrão de turnos
    agenda: e.agenda?.versao === AGENDA_VERSAO ? e.agenda : agendaPadrao(),
    precoTurno: e.precoTurno ?? null,
  }))
  const porNome = Object.fromEntries(d.espacos.map((e) => [e.nome, e.id]))
  if (!d.contratos && d.reservas) {
    // planilha original: cada linha vale para o mês da data
    d.contratos = d.reservas.map((r, i) => ({
      id: `ct${i + 1}`,
      espacoId: porNome[r.espaco] || '',
      cliente: r.cliente || '',
      modalidade: r.modalidade,
      quantidade: n(r.quantidade),
      preco: n(r.preco),
      inicio: r.data,
      fim: fimDoMes(r.data),
      status: r.status || 'Confirmada',
      campanha: r.campanha || '',
      obs: r.obs || '',
    }))
  }
  delete d.reservas
  d.contratos ||= []
  d.agendamentos ||= []
  d.profissionais ||= []
  d.campanhas.forEach((c) => (c.espacos = (c.espacos || []).map((x) => porNome[x] || x)))
  d.meta.versao = 2
  return d
}

export function fimDoMes(iso) {
  const [y, m] = iso.slice(0, 7).split('-').map(Number)
  const d = new Date(y, m, 0).getDate()
  return `${iso.slice(0, 7)}-${String(d).padStart(2, '0')}`
}
// fim de um contrato que começa em `inicio` e dura `meses`
export function fimApos(inicio, meses) {
  return fimDoMes(`${addMes(inicio.slice(0, 7), meses - 1)}-01`)
}
