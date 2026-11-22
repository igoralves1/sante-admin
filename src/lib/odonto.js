// Estudo de viabilidade da sala de odontologia estética (HOF e cirurgia estética orofacial Tipo I).
// Dois modelos:
//  A) aluguel: a Santé monta a sala e aluga por turno a dentistas (o negócio de sempre da casa);
//  B) serviço próprio: a Santé contrata dentistas e vende os procedimentos ao paciente.
// Todos os valores são estimativas para decidir; troque pelos números das cotações e da pesquisa ativa.

export const SEMANAS_MES = 52 / 12

// Montagem estimada (total ≈ R$ 70 mil). Pedir 3 cotações por item.
export const MONTAGEM = [
  { k: 'cadeira', t: 'Cadeira odontológica com equipo, unidade auxiliar, refletor e mocho', v: 28000 },
  { k: 'esteril', t: 'Autoclave, seladora, cuba ultrassônica e área de esterilização', v: 7500 },
  { k: 'ar', t: 'Compressor isento de óleo e bomba a vácuo (casa de máquinas)', v: 7000 },
  { k: 'estetica', t: 'Maca estética reclinável e foco cirúrgico com registro na Anvisa', v: 6500 },
  { k: 'emergencia', t: 'Kit de emergência: DEA, ressuscitador, oxímetro, oxigênio portátil, medicamentos', v: 6000 },
  { k: 'obra', t: 'Adequação da sala: pia exclusiva, revestimentos laváveis, elétrica e ar-condicionado', v: 9000 },
  { k: 'moveis', t: 'Armários, bancada, carrinho auxiliar e instrumental básico', v: 3500 },
  { k: 'legal', t: 'Projeto, licença sanitária, registro no CRO-AL, PGRSS e POPs', v: 2500 },
]
export const investimentoPadrao = () => MONTAGEM.reduce((s, i) => s + i.v, 0)

// Custos mensais fixos da sala (R$)
export const FIXOS = [
  { t: 'Responsável técnico (cirurgião-dentista)', v: 800 },
  { t: 'Manutenção preventiva dos equipamentos', v: 250 },
  { t: 'Coleta de resíduos de saúde (infectante e perfurocortante)', v: 200 },
  { t: 'Seguro de responsabilidade e dos equipamentos', v: 150 },
  { t: 'Licenças, taxas e anuidade do CRO (rateado)', v: 100 },
]
export const fixoPadrao = () => FIXOS.reduce((s, i) => s + i.v, 0)

export const CENARIOS = {
  conservador: {
    nome: 'Conservador', resumo: '2 turnos por semana o ano todo, sem cirurgia, preço perto do turno comum.',
    precoTurno: 200, turnosIni: 2, turnosFim: 2, rampa: 1, cirurgias: 0, taxaCirurgia: 0,
  },
  base: {
    nome: 'Base', resumo: 'Começa com 2 turnos por semana e chega a 4 no 6º mês; 2 cirurgias Tipo I por mês a partir do 4º mês.',
    precoTurno: 240, turnosIni: 2, turnosFim: 4, rampa: 6, cirurgias: 2, taxaCirurgia: 350,
  },
  policlinica: {
    nome: 'Policlínica', resumo: 'Estética de 2 a 4 turnos por semana mais clínica geral de recém-formados nos outros dias: de 3 a 7 turnos por semana no 6º mês, preço médio entre os dois turnos; 2 cirurgias Tipo I por mês.',
    precoTurno: 215, turnosIni: 3, turnosFim: 7, rampa: 6, cirurgias: 2, taxaCirurgia: 350,
  },
  otimista: {
    nome: 'Otimista', resumo: 'Chega a 6 turnos por semana no 6º mês (estética + odontologia geral) e 4 cirurgias Tipo I por mês.',
    precoTurno: 280, turnosIni: 2, turnosFim: 6, rampa: 6, cirurgias: 4, taxaCirurgia: 400,
  },
}

export const PADRAO = {
  investimento: 70000,
  fixo: 1500,
  variavelTurno: 45, // limpeza, esterilização, energia, descartáveis da casa por turno
  oportunidade: 0, // receita que a sala daria como consultório comum (R$/mês); hoje a ocupação é baixa
  meses: 36,
}

// Modelo A: aluguel por turno
export function simularAluguel(c, p = PADRAO) {
  const rows = []
  let acum = -p.investimento
  let payback = null
  for (let i = 0; i < p.meses; i++) {
    const t = i + 1 >= c.rampa ? c.turnosFim : c.turnosIni + ((c.turnosFim - c.turnosIni) * i) / Math.max(1, c.rampa - 1)
    const turnos = t * SEMANAS_MES
    const cir = i >= 3 ? c.cirurgias : 0
    const receita = turnos * c.precoTurno + cir * c.taxaCirurgia
    const custo = p.fixo + turnos * p.variavelTurno + p.oportunidade
    const resultado = receita - custo
    acum += resultado
    if (payback === null && acum >= 0) payback = i + 1
    rows.push({ i, turnosSemana: t, turnos, cirurgias: cir, receita, custo, resultado, acum })
  }
  const r12 = rows.slice(0, 12)
  return {
    rows, payback,
    receitaAno1: r12.reduce((s, r) => s + r.receita, 0),
    resultadoAno1: r12.reduce((s, r) => s + r.resultado, 0),
    resultadoMes12: rows[11]?.resultado || 0,
    roi36: (rows[p.meses - 1].acum) / p.investimento,
    ocupacaoSala: rows[11].turnos / (SEMANAS_MES * 13), // 13 turnos por semana na agenda da casa
    receitaPorTurnoEquilibrio: (p.fixo + p.oportunidade) / Math.max(1, c.turnosFim * SEMANAS_MES) + p.variavelTurno,
  }
}

// Modelo B: serviço próprio (a Santé vende o procedimento e repassa ao dentista)
export const SERVICO = {
  procedimentosTurno: 3, // atendimentos de estética por turno de 4 h
  ticket: 1200, // valor médio por procedimento (toxina, preenchimento, bioestimulador)
  insumos: 0.3, // produto (toxina, ácido hialurônico) sobre o preço
  repasse: 0.4, // parte do dentista
  impostosTaxas: 0.12, // impostos e taxa de cartão
  marketingMes: 2500, // anúncios para paciente final (custo por paciente bem maior que no B2B)
}
export function simularServico(turnosSemana, s = SERVICO, p = PADRAO) {
  const turnos = turnosSemana * SEMANAS_MES
  const receita = turnos * s.procedimentosTurno * s.ticket
  const margem = receita * (1 - s.insumos - s.repasse - s.impostosTaxas)
  const resultado = margem - p.fixo - turnos * p.variavelTurno - s.marketingMes
  return { turnos, receita, margem, resultado, payback: resultado > 0 ? Math.ceil(p.investimento / resultado) : null }
}
