// Modelo da estratégia "Primeiro Consultório" (recém-formados).
// Orçamento -> leads -> visitas -> contratos -> clientes ativos -> receita.
// Os números padrão são o caminho feliz: metas plausíveis se a execução sair bem.
import { addMes, uid } from './format.js'

export const INICIO = '2026-11'

// Itens de cada cenário. `midia: true` = compra de mídia (gera leads pagos pelo CPL).
export const CENARIOS = {
  enxuto: {
    nome: 'Enxuto',
    resumo: 'Só anúncios básicos e visitas às faculdades. Conteúdo feito no celular pela equipe.',
    organicos: 15,
    itens: [
      { k: 'meta', c: 'Meta Ads', t: 'Anúncios Meta (Instagram e Facebook)', v: 800, midia: true },
      { k: 'google', c: 'Google Ads', t: 'Google Ads (busca)', v: 300, midia: true },
      { k: 'eventos', c: 'Workshops e IES', t: 'Workshops e visitas às faculdades', v: 200 },
      { k: 'ferr', c: 'Ferramentas', t: 'Ferramentas (Canva, Metricool, CRM)', v: 100 },
      { k: 'brindes', c: 'Impressos', t: 'Impressos e brindes', v: 100 },
    ],
  },
  recomendado: {
    nome: 'Recomendado',
    resumo: 'Anúncios em três redes, uma diária de videomaker por mês, um workshop mensal e parcerias.',
    organicos: 35,
    itens: [
      { k: 'meta', c: 'Meta Ads', t: 'Anúncios Meta (Instagram e Facebook)', v: 1400, midia: true },
      { k: 'google', c: 'Google Ads', t: 'Google Ads (busca)', v: 500, midia: true },
      { k: 'tiktok', c: 'TikTok Ads', t: 'TikTok Ads (Spark Ads)', v: 300, midia: true },
      { k: 'conteudo', c: 'Foto e vídeo', t: 'Foto e vídeo profissional (1 diária/mês)', v: 600 },
      { k: 'eventos', c: 'Workshops', t: 'Workshop mensal e open house', v: 400 },
      { k: 'parcerias', c: 'Faculdades e ligas', t: 'Ligas acadêmicas, CAs e formaturas', v: 150 },
      { k: 'ferr', c: 'Ferramentas', t: 'Ferramentas (Canva, Metricool, CRM)', v: 150 },
    ],
  },
  acelerado: {
    nome: 'Acelerado',
    resumo: 'Tudo do recomendado, mais YouTube, microinfluenciadores e mais eventos.',
    organicos: 55,
    itens: [
      { k: 'meta', c: 'Meta Ads', t: 'Anúncios Meta (Instagram e Facebook)', v: 1800, midia: true },
      { k: 'google', c: 'Google Ads', t: 'Google Ads (busca)', v: 900, midia: true },
      { k: 'tiktok', c: 'TikTok Ads', t: 'TikTok Ads (Spark Ads)', v: 600, midia: true },
      { k: 'youtube', c: 'YouTube Ads', t: 'YouTube Ads (Shorts e vídeo)', v: 300, midia: true },
      { k: 'conteudo', c: 'Foto e vídeo', t: 'Foto e vídeo profissional (2 diárias/mês)', v: 1000 },
      { k: 'eventos', c: 'Workshops e eventos', t: 'Workshops, open house e congresso', v: 600 },
      { k: 'parcerias', c: 'Faculdades e ligas', t: 'Ligas acadêmicas, CAs e formaturas', v: 300 },
      { k: 'influ', c: 'Influenciadores', t: 'Microinfluenciadores da saúde (cachê)', v: 300 },
      { k: 'ferr', c: 'Ferramentas', t: 'Ferramentas (Canva, Metricool, CRM)', v: 200 },
    ],
  },
}

// Caminho feliz
export const PADRAO = {
  cpl: 22, // custo por lead pago (conversa no WhatsApp ou formulário)
  qualif: 0.6, // leads que são de fato profissionais de saúde formados há até 3 anos
  visita: 0.25, // lead qualificado que visita a Santé
  contrato: 0.4, // visita que fecha a primeira reserva
  ticket0: 380, // gasto mensal nos 3 primeiros meses (pacote de horas)
  ticket1: 740, // gasto de quem passa a ter 1 turno fixo por semana
  upgrade: 0.3, // parte dos clientes que sobe para turno fixo a partir do 4º mês
  churn: 0.1, // clientes que saem por mês
  margem: 0.75, // margem de contribuição (sobra depois de energia, limpeza, impostos, taxas)
  meses: 6,
}

export const HORA_PACOTE = 35 // R$/h do pacote Start proposto
export const HORAS_TURNO_MES = 4.33 * 4 // 1 turno de 4 h por semana

const ticket = (a, p) => (a < 3 ? p.ticket0 : p.ticket0 * (1 - p.upgrade) + p.ticket1 * p.upgrade)
const horas = (a, p) => {
  const h0 = p.ticket0 / HORA_PACOTE
  return a < 3 ? h0 : h0 * (1 - p.upgrade) + HORAS_TURNO_MES * p.upgrade
}
// no mês de entrada o cliente usa, em média, metade do mês
const entrada = (a) => (a === 0 ? 0.5 : 1)

export function custoMensal(cen) {
  return cen.itens.reduce((s, i) => s + i.v, 0)
}
export function midiaMensal(cen) {
  return cen.itens.filter((i) => i.midia).reduce((s, i) => s + i.v, 0)
}

// LTV em margem de contribuição, horizonte de 36 meses
export function ltv(p) {
  let v = 0
  for (let a = 0; a < 36; a++) v += ticket(a, p) * entrada(a) * p.margem * (1 - p.churn) ** a
  return v
}

export function simular(cen, p = PADRAO) {
  const invest = custoMensal(cen)
  const leadsPagos = midiaMensal(cen) / p.cpl
  const leads = leadsPagos + cen.organicos
  const qualificados = leads * p.qualif
  const visitas = qualificados * p.visita
  const novos = visitas * p.contrato
  const rows = []
  let receitaAcum = 0
  let margemAcum = 0
  let investAcum = 0
  let equilibrio = null
  for (let i = 0; i < p.meses; i++) {
    let ativos = 0
    let receita = 0
    let hrs = 0
    for (let j = 0; j <= i; j++) {
      const a = i - j
      const s = novos * (1 - p.churn) ** a
      ativos += s
      receita += s * ticket(a, p) * entrada(a)
      hrs += s * horas(a, p) * entrada(a)
    }
    receitaAcum += receita
    margemAcum += receita * p.margem
    investAcum += invest
    if (equilibrio === null && margemAcum >= investAcum) equilibrio = i + 1
    rows.push({
      mes: addMes(INICIO, i), leads, visitas, novos, ativos, receita, horas: hrs,
      receitaAcum, margemAcum, investAcum,
    })
  }
  const L = ltv(p)
  const cac = novos ? invest / novos : 0
  const fim = rows[rows.length - 1]
  const novosTotal = novos * p.meses
  return {
    invest, leadsPagos, leads, qualificados, visitas, novos, rows, fim, novosTotal,
    investTotal: investAcum,
    cac,
    ltv: L,
    ltvCac: cac ? L / cac : 0,
    payback: p.ticket0 * p.margem ? cac / (p.ticket0 * p.margem) : 0,
    roiPeriodo: investAcum ? (margemAcum - investAcum) / investAcum : 0,
    roiVida: investAcum ? (novosTotal * L - investAcum) / investAcum : 0,
    equilibrio,
  }
}

// Horas livres hoje nos consultórios por hora e por turno (turno = 4 h)
export function horasLivres(resumo) {
  return resumo.espacos
    .filter((e) => e.tipo === 'Consultório' && (e.modalidade === 'Hora' || e.modalidade === 'Turno'))
    .reduce((s, e) => s + e.disponivel * (e.modalidade === 'Turno' ? 4 : 1), 0)
}

// Campanhas que o botão "Adicionar ao plano" cria na lista do Marketing
export function campanhasDoPlano(cen, p = PADRAO) {
  const fim = `${addMes(INICIO, p.meses - 1)}-28`
  const ini = `${INICIO}-01`
  const v = (k) => (cen.itens.find((i) => i.k === k)?.v || 0) * p.meses
  const salas = ['e2', 'e8', 'e1', 'e9', 'e10']
  const lista = [
    { nome: 'Primeiro Consultório · Instagram e Facebook', canal: 'Instagram (anúncios)', orcamento: v('meta') + v('conteudo') + v('influ') + v('ferr'), espacos: salas,
      obs: 'Anúncios Meta, produção de foto e vídeo, ferramentas e influenciadores. Reels e carrosséis para recém-formados, raio de 15 km, 22–34 anos, objetivo conversa no WhatsApp. Link com código #META.' },
    { nome: 'Primeiro Consultório · Google Ads', canal: 'Google Ads', orcamento: v('google'), espacos: salas,
      obs: 'Busca: consultório por hora, sala para psicólogo, aluguel de consultório Maceió. Página de destino com a escada de preços.' },
    { nome: 'Primeiro Consultório · TikTok e YouTube', canal: 'TikTok + YouTube Shorts', orcamento: v('tiktok') + v('youtube'), espacos: salas,
      obs: 'Vídeos “meu primeiro consultório”, tour e bastidores. Impulsionar os que passarem de 40% de retenção.' },
    { nome: 'Faculdades, ligas e workshops', canal: 'Parcerias', orcamento: v('eventos') + v('parcerias') + v('brindes'), espacos: salas,
      obs: 'Palestra “Como abrir seu consultório” nas IES, kit formando com 2 h grátis, workshop mensal na Santé.' },
    { nome: 'Indique um colega', canal: 'Indicação', orcamento: 0, espacos: salas,
      obs: 'Cada indicação que fechar dá 2 h grátis a quem indicou e 1 h grátis ao indicado.' },
    { nome: 'Piscina · fisioterapeutas recém-formados', canal: 'Instagram + parcerias', orcamento: 0, espacos: ['e11'],
      obs: 'Turno de piscina com desconto nos 3 primeiros meses para quem leva os próprios pacientes de hidroterapia.' },
  ]
  return lista.map((c) => ({ ...c, inicio: ini, fim, leads: 0, visitas: 0, status: 'Planejada', plano: 'primeiro-consultorio' }))
}

// Coloca as campanhas do plano na lista do Marketing (uma vez só)
export function adicionarAoPlano(data, cen, p = PADRAO) {
  if (data.campanhas.some((c) => c.plano === 'primeiro-consultorio')) return 0
  const novas = campanhasDoPlano(cen, p).map((c) => ({ ...c, id: uid('k') }))
  data.campanhas.push(...novas)
  return novas.length
}
