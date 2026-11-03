// Cálculos equivalentes às fórmulas da planilha Sistema_Controle_Sante.xlsx
import { addMes } from './format'

export const MODALIDADES = ['Hora', 'Turno', 'Mensal']
export const UNIDADE = { Hora: 'horas', Turno: 'turnos', Mensal: 'contratos' }
export const STATUS = ['Confirmada', 'Proposta', 'Base inicial', 'Cancelada']
export const STATUS_CAMPANHA = ['Planejada', 'Ativa', 'Pausada', 'Concluída']

const mesDe = (iso) => (iso ? iso.slice(0, 7) : '')
const ativa = (r) => r.status !== 'Cancelada'
// "Receita confirmada + base inicial" do Painel
const firme = (r) => r.status === 'Confirmada' || r.status === 'Base inicial'
const total = (r) => (Number(r.quantidade) || 0) * (Number(r.preco) || 0)
const soma = (arr, f) => arr.reduce((a, x) => a + f(x), 0)

export function reservasDoMes(data, mes) {
  return data.reservas.filter((r) => mesDe(r.data) === mes)
}

export function resumoMes(data, mes) {
  const doMes = reservasDoMes(data, mes).filter(ativa)
  const espacos = data.espacos.map((e) => {
    const rs = doMes.filter((r) => r.espaco === e.nome)
    const cap = Number(e.capacidade) || 0
    const preco = Number(e.preco) || 0
    const ocupado = soma(rs, (r) => Number(r.quantidade) || 0)
    const confirmado = soma(rs.filter(firme), (r) => Number(r.quantidade) || 0)
    const disponivel = Math.max(0, cap - ocupado)
    return {
      ...e,
      ocupado,
      confirmado,
      proposta: ocupado - confirmado,
      disponivel,
      taxa: cap ? ocupado / cap : 0,
      taxaConfirmada: cap ? confirmado / cap : 0,
      potencial: cap * preco,
      receitaOcupada: soma(rs, total),
      receitaConfirmada: soma(rs.filter(firme), total),
      receitaDisponivel: disponivel * preco,
      nReservas: rs.length,
    }
  })
  const potencial = soma(espacos, (e) => e.potencial)
  const receitaOcupada = soma(espacos, (e) => e.receitaOcupada)
  const receitaConfirmada = soma(espacos, (e) => e.receitaConfirmada)
  const receitaDisponivel = soma(espacos, (e) => e.receitaDisponivel)
  return {
    mes,
    espacos,
    potencial,
    receitaOcupada,
    receitaConfirmada,
    receitaProposta: receitaOcupada - receitaConfirmada,
    receitaDisponivel,
    // Ocupação ponderada pela receita: a métrica agregada que faz sentido
    // quando horas, turnos e contratos mensais se misturam.
    taxaReceita: potencial ? receitaOcupada / potencial : 0,
    taxaConfirmada: potencial ? receitaConfirmada / potencial : 0,
    espacosVazios: espacos.filter((e) => e.ocupado === 0).length,
  }
}

export function financeiro(data) {
  const fixos = soma(data.custos.fixos, (c) => Number(c.valor) || 0)
  const margem = 1 - (Number(data.custos.impostos) || 0) - (Number(data.custos.comissoes) || 0)
  return { fixos, margem, pontoEquilibrio: margem > 0 ? fixos / margem : 0 }
}

export function serieMensal(data, ateMes, n = 6) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const mes = addMes(ateMes, -i)
    const r = resumoMes(data, mes)
    out.push({ mes, receitaOcupada: r.receitaOcupada, receitaConfirmada: r.receitaConfirmada, taxa: r.taxaReceita })
  }
  return out
}

// Resultado de cada campanha a partir das reservas atribuídas a ela
export function resultadoCampanha(data, c) {
  const rs = data.reservas.filter((r) => r.campanha === c.id && ativa(r))
  const contratos = rs.length
  const receita = soma(rs, total)
  const orc = Number(c.orcamento) || 0
  return {
    contratos,
    receita,
    conversao: c.leads ? contratos / c.leads : 0,
    cac: contratos ? orc / contratos : 0,
    roi: orc ? (receita - orc) / orc : 0,
  }
}
