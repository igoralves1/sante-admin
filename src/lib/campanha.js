// Plano de campanha de 12 meses para encher as salas da Santé (todos os profissionais de saúde).
// Orçamento por canal -> leads -> visitas -> contratos -> clientes ativos -> horas vendidas -> receita.
// Os valores são metas: o caminho esperado se a execução sair como planejada. Revise todo mês.
import { addMes, uid } from './format.js'
import { agendaDe, horasMediasTurno } from './agenda.js'

export const INICIO = '2026-12'
export const MESES = 12

// Sazonalidade da procura por sala em Maceió (1 = mês normal)
export const SAZONAL = [
  { f: 0.8, nota: 'Festas de fim de ano e formaturas: agenda curta, bom para recém-formados' },
  { f: 1.15, nota: 'Janeiro Branco e planejamento do ano: pico de procura por consultório' },
  { f: 0.85, nota: 'Carnaval: semana parada' },
  { f: 1.1, nota: 'Volta das aulas e da rotina: agenda dos profissionais enche' },
  { f: 1.05, nota: '2/4 Autismo e 7/4 Dia Mundial da Saúde' },
  { f: 1.05, nota: 'Mês cheio, sem feriados longos' },
  { f: 0.85, nota: 'São João: Maceió esvazia na última semana' },
  { f: 0.9, nota: 'Férias escolares: menos pacientes infantis' },
  { f: 1.1, nota: '27/8 Dia do Psicólogo e 31/8 Dia do Nutricionista' },
  { f: 1.1, nota: 'Setembro Amarelo: procura por saúde mental' },
  { f: 1.0, nota: '13/10 Fisioterapia e TO, 18/10 Dia do Médico, Outubro Rosa' },
  { f: 0.95, nota: 'Novembro Azul; planejamento do próximo ano' },
]

// Fases do plano (meses 1-3, 4-9 e 10-12)
export const FASES = [
  { de: 0, ate: 2, nome: 'Fundação e teste', d: 'Arrumar a casa (perfis, Google, WhatsApp, fotos), testar criativos e públicos com verba moderada.' },
  { de: 3, ate: 8, nome: 'Escala', d: 'Aumentar a verba nos anúncios que trazem contrato, ligar TikTok, eventos mensais e parcerias.' },
  { de: 9, ate: 11, nome: 'Eficiência e retenção', d: 'Cortar o que não converte, focar em indicação, upgrade para turno fixo e renovação.' },
]
export const faseDe = (i) => FASES.find((f) => i >= f.de && i <= f.ate)

// Orçamento mensal por canal em cada fase (R$). midia = compra de anúncio
export const CANAIS = [
  { k: 'meta', t: 'Meta Ads (Instagram + Facebook)', midia: true, v: [1200, 1600, 1500], cpl: [26, 18], nota: 'Objetivo "mensagens no WhatsApp". 60% Instagram, 40% Facebook. Já inclui os 12,15% de impostos que a Meta cobra desde jan/2026.' },
  { k: 'google', t: 'Google Ads (busca)', midia: true, v: [500, 700, 700], cpl: [38, 28], nota: 'Busca por "consultório por hora", "sala para psicólogo", "aluguel de consultório Maceió".' },
  { k: 'tiktok', t: 'TikTok Ads (Spark Ads)', midia: true, v: [0, 300, 300], cpl: [32, 24], nota: 'Só a partir do 4º mês, impulsionando os vídeos orgânicos que já foram bem.' },
  { k: 'conteudo', t: 'Foto e vídeo profissional', midia: false, v: [800, 600, 500], nota: 'Ensaio das salas e da piscina no 1º mês; depois 1 diária de vídeo por mês.' },
  { k: 'eventos', t: 'Open house, workshops e faculdades', midia: false, v: [300, 400, 400], nota: 'Um evento por mês na Santé e palestras nas faculdades.' },
  { k: 'tradicional', t: 'Mídia tradicional e impressos', midia: false, v: [400, 350, 250], nota: 'Folhetos e displays em clínicas, laboratórios e faculdades; mídia em elevador de prédios comerciais; fachada.' },
  { k: 'ferr', t: 'Ferramentas (Canva, agendador, CRM)', midia: false, v: [150, 150, 150], nota: 'Canva, Metricool ou mLabs, planilha ou CRM de leads.' },
]
const fase = (i) => (i < 3 ? 0 : i < 9 ? 1 : 2)
export const verba = (c, i) => c.v[fase(i)]
// custo por lead cai do valor de teste ao valor otimizado em 4 meses
const cplDe = (c, i) => c.cpl[0] + (c.cpl[1] - c.cpl[0]) * Math.min(1, i / 4)

// Premissas do funil (caminho esperado)
export const PREMISSAS = {
  qualif: [0.5, 0.6], // leads que são profissionais de saúde com registro e interesse real
  visita: [0.22, 0.28], // lead qualificado que visita a Santé
  contrato: [0.3, 0.38], // visita que fecha a primeira locação
  ticket: 560, // gasto mensal médio de um cliente novo (mistura de horas, turnos e piscina)
  churn: 0.1, // clientes novos que saem por mês
  margem: 0.75, // margem de contribuição
  precoHora: 45, // R$ por hora vendida, em média (turno de 4 h por R$ 120 a R$ 200, hora por R$ 50 a R$ 70)
  indicacao: 0.05, // indicações que viram lead por cliente ativo por mês
  seguidores0: 7215, // Instagram da Santé na coleta de nov/2026
}
const rampa = ([a, b], i) => a + (b - a) * Math.min(1, i / 6)

// Horas de sala por mês na Santé (consultórios por hora e por turno), a partir do resumo do mês
export function capacidadeSalas(resumo) {
  const salas = resumo.espacos.filter((e) => e.tipo === 'Consultório' && (e.modalidade === 'Hora' || e.modalidade === 'Turno'))
  const h = (e, v) => v * (e.modalidade === 'Turno' ? horasMediasTurno(agendaDe(e)) : 1)
  return {
    total: salas.reduce((s, e) => s + h(e, e.capacidade), 0),
    ocupadas: salas.reduce((s, e) => s + h(e, Math.min(e.ocupado, e.capacidade)), 0),
  }
}

export function simularPlano({ total = 0, ocupadas = 0 } = {}, p = PREMISSAS) {
  const rows = []
  const coortes = []
  let investAcum = 0
  let margemAcum = 0
  let seguidores = p.seguidores0
  let avaliacoes = 0
  let ativosAnt = 0
  for (let i = 0; i < MESES; i++) {
    const s = SAZONAL[i].f
    const porCanal = {}
    let invest = 0
    let midia = 0
    let leadsPagos = 0
    for (const c of CANAIS) {
      const v = verba(c, i)
      invest += v
      if (c.midia) {
        midia += v
        const l = v ? (v / cplDe(c, i)) * s : 0
        porCanal[c.k] = l
        leadsPagos += l
      }
    }
    // orgânicos: Instagram (cresce com a base), Google Perfil, eventos, mídia tradicional e indicação
    const organicoIG = (6 + (seguidores - p.seguidores0) / 120) * s
    const googlePerfil = (4 + Math.min(10, i * 1.2)) * s
    const eventos = (i < 3 ? 4 : 6) * s
    const tradicional = (i < 3 ? 4 : 3) * s
    const indicacao = ativosAnt * p.indicacao
    porCanal.organico = organicoIG
    porCanal.perfil = googlePerfil
    porCanal.eventos = eventos
    porCanal.tradicional = tradicional
    porCanal.indicacao = indicacao
    const leads = leadsPagos + organicoIG + googlePerfil + eventos + tradicional + indicacao
    const qualificados = leads * rampa(p.qualif, i)
    const visitas = qualificados * rampa(p.visita, i)
    const novos = visitas * rampa(p.contrato, i)
    coortes.push(novos)
    let ativos = 0
    let receita = 0
    coortes.forEach((n, j) => {
      const a = i - j
      const sob = n * (1 - p.churn) ** a
      ativos += sob
      receita += sob * p.ticket * (a === 0 ? 0.5 : 1) // no mês de entrada usa metade do mês
    })
    const horas = receita / p.precoHora
    const ocupacao = total ? Math.min(1, (ocupadas + horas) / total) : 0
    investAcum += invest
    margemAcum += receita * p.margem
    // Instagram: seguidores ganhos com anúncios (≈ 1 a cada R$ 6 de Meta no Instagram) + orgânico
    const meta = verba(CANAIS[0], i)
    const ganhos = (meta * 0.6) / 6 * 0.35 + (110 + i * 12) * s
    seguidores += ganhos
    avaliacoes += Math.round((i < 3 ? 3 : 5) * s)
    // alcance pago: verba ÷ CPM × 1.000 ÷ frequência média
    const cpmIG = 16
    const cpmFB = 12
    const alcanceIG = ((meta * 0.6) / cpmIG) * 1000 / 2.5 + seguidores * 0.35
    const alcanceFB = ((meta * 0.4) / cpmFB) * 1000 / 2.5
    rows.push({
      i, mes: addMes(INICIO, i), fase: faseDe(i).nome, sazonal: s, nota: SAZONAL[i].nota,
      invest, midia, investAcum, leads, leadsPagos, porCanal, qualificados, visitas, novos, ativos, receita, horas,
      ocupacao, margemAcum, cpl: leadsPagos ? midia / leadsPagos : 0, cac: novos ? invest / novos : 0,
      roi: investAcum ? (margemAcum - investAcum) / investAcum : 0,
      seguidores, ganhos, alcanceIG, alcanceFB, avaliacoes,
      conversasIG: porCanal.meta * 0.6 + organicoIG, conversasFB: porCanal.meta * 0.4,
      excedeCapacidade: total ? ocupadas + horas > total * 0.85 : false,
    })
    ativosAnt = ativos
  }
  const fim = rows[rows.length - 1]
  const novosTotal = rows.reduce((a, r) => a + r.novos, 0)
  const leadsTotal = rows.reduce((a, r) => a + r.leads, 0)
  return {
    rows, fim, novosTotal, leadsTotal,
    investTotal: fim.investAcum,
    receitaTotal: rows.reduce((a, r) => a + r.receita, 0),
    cacMedio: novosTotal ? fim.investAcum / novosTotal : 0,
    equilibrio: (rows.find((r) => r.margemAcum >= r.investAcum)?.i ?? -1) + 1,
    ocupacaoInicial: total ? ocupadas / total : 0,
  }
}

// ---------- campanhas do plano na lista de Comercial ----------
const ESPACOS_SALAS = (data) => data.espacos.filter((e) => e.tipo === 'Consultório' && e.modalidade !== 'Mensal').map((e) => e.id)
const somaCanal = (k) => {
  const c = CANAIS.find((x) => x.k === k)
  let t = 0
  for (let i = 0; i < MESES; i++) t += verba(c, i)
  return t
}
export function campanhasDoPlano(data) {
  const ini = `${INICIO}-01`
  const fim = `${addMes(INICIO, MESES - 1)}-28`
  const salas = ESPACOS_SALAS(data)
  const piscina = data.espacos.filter((e) => e.tipo === 'Piscina').map((e) => e.id)
  const adm = data.espacos.filter((e) => e.tipo === 'Administrativo').map((e) => e.id)
  return [
    { nome: 'Plano 12 meses · Instagram e Facebook', canal: 'Instagram + Facebook (Meta Ads)', orcamento: somaCanal('meta') + somaCanal('conteudo'), espacos: [...salas, ...piscina],
      obs: 'Anúncios “mensagens no WhatsApp” (60% Instagram, 40% Facebook), Reels e carrosséis por profissão, collabs com os profissionais da casa. Código #IG ou #FB.' },
    { nome: 'Plano 12 meses · Google', canal: 'Google Ads + Perfil da Empresa', orcamento: somaCanal('google'), espacos: [...salas, ...piscina],
      obs: 'Busca por consultório por hora e sala para psicólogo em Maceió; avaliações e posts semanais no Perfil. Código #GOO.' },
    { nome: 'Plano 12 meses · TikTok e YouTube', canal: 'TikTok + YouTube', orcamento: somaCanal('tiktok'), espacos: salas,
      obs: 'Vídeos reaproveitados dos Reels; Spark Ads a partir do 4º mês. Código #TT ou #YT.' },
    { nome: 'Plano 12 meses · Eventos, faculdades e parcerias', canal: 'Eventos + parcerias', orcamento: somaCanal('eventos'), espacos: [...salas, ...piscina],
      obs: 'Open house e workshop mensal, palestras nas faculdades, clínicas, contadores e conselhos. Código #EVT.' },
    { nome: 'Plano 12 meses · Mídia tradicional', canal: 'Impressos, elevador e fachada', orcamento: somaCanal('tradicional'), espacos: [...salas, ...adm],
      obs: 'Folhetos e displays com QR code, mídia em elevadores de prédios comerciais, placa na fachada. Código #TRAD.' },
    { nome: 'Plano 12 meses · Indicação', canal: 'Indicação', orcamento: 0, espacos: [...salas, ...piscina, ...adm],
      obs: 'Indicação que fechar: 2 h grátis para quem indicou e 1 h para o indicado. Código #IND.' },
  ].map((c) => ({ ...c, inicio: ini, fim, leads: 0, visitas: 0, status: 'Planejada', plano: 'campanha-12m' }))
}

// Cria as campanhas do plano em Comercial (uma vez só; o banco não guarda `plano`, então compara pelo nome)
export function adicionarPlano(data) {
  const novas = campanhasDoPlano(data).filter((c) => !data.campanhas.some((x) => x.nome === c.nome))
  data.campanhas.push(...novas.map(({ plano, ...c }) => ({ ...c, id: uid('k') })))
  return novas.length
}
