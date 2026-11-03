// Conteúdo da estratégia "Primeiro Consultório" (recém-formados da saúde).
// Os números de mercado são ordens de grandeza; confirme no e-MEC e nos conselhos antes de usar fora daqui.

export const tamanho = [
  { p: 'Psicologia', f: [400, 700], conselho: 'CRP-15', obs: 'Maior grupo e o que mais aluga por hora. Cerca de 79% são mulheres e metade tem até 39 anos (CensoPsi 2022).' },
  { p: 'Medicina', f: [300, 450], conselho: 'CRM-AL', obs: 'UFAL ofertava 100 vagas em Maceió e o CESMAC de 85 a 100. Muitos vão para plantão e residência, mas querem consultório particular 1 turno por semana.' },
  { p: 'Fisioterapia', f: [200, 400], conselho: 'CREFITO-1', obs: 'Muitos começam em domicílio. A piscina da Santé é o único espaço aquático entre os concorrentes mapeados.' },
  { p: 'Nutrição', f: [200, 350], conselho: 'CRN-6', obs: 'Consultas curtas e espaçadas. Ideal para pacote de horas.' },
  { p: 'Fonoaudiologia, TO e psicopedagogia', f: [50, 100], conselho: 'CREFONO / CREFITO', obs: 'Forte demanda infantil (TEA). Precisam de sala com espaço para atividades.' },
]

export const personas = [
  {
    id: 'psi', nome: 'Psicóloga recém-formada', idade: '23 a 30 anos', prio: 1,
    situacao: 'CRP recente, atende online e quer de 2 a 6 pacientes presenciais. Às vezes tem emprego CLT ou estágio de pós durante o dia.',
    dores: ['Não tem dinheiro para aluguel fixo e mobília', 'Precisa de sigilo e isolamento acústico', 'Quer atender à noite e no sábado', 'Sente-se sozinha e insegura para precificar'],
    oferta: 'Pacote Start de 10 h, sala acolhedora com isolamento, horário noturno e supervisão em grupo na Santé.',
    gancho: '“Seu primeiro consultório na Jatiúca, sem fiador e sem aluguel fixo.”',
    canais: 'Instagram, TikTok, grupos de WhatsApp da turma e da pós, supervisores clínicos',
    demanda: '8 a 16 h por mês', ticket: 'R$ 350 a R$ 600',
  },
  {
    id: 'nutri', nome: 'Nutricionista recém-formada', idade: '22 a 30 anos', prio: 2,
    situacao: 'Atende online e em academia. Quer um endereço com boa imagem para consultas e retornos.',
    dores: ['Agenda irregular', 'Precisa de balança e bioimpedância', 'Concorre com nutricionistas que já viraram influenciadoras'],
    oferta: 'Pacote de horas com balança e bioimpedância de uso compartilhado e sessão de fotos para o Instagram dela.',
    gancho: '“Atenda com cara de clínica desde a primeira consulta.”',
    canais: 'Instagram, TikTok, Pinterest, parceria com academias',
    demanda: '6 a 12 h por mês', ticket: 'R$ 250 a R$ 450',
  },
  {
    id: 'fisio', nome: 'Fisioterapeuta recém-formado', idade: '23 a 32 anos', prio: 3,
    situacao: 'Faz atendimento domiciliar e quer um lugar para pilates, RPG ou hidroterapia sem montar estrutura.',
    dores: ['Equipamento caro', 'Paciente idoso precisa de estacionamento e acessibilidade', 'Não acha piscina por turno'],
    oferta: 'Turno de piscina e sala com desconto nos 3 primeiros meses. Estacionamento privativo para o paciente.',
    gancho: '“Piscina aquecida por turno para seus pacientes de hidroterapia.”',
    canais: 'Instagram, YouTube Shorts, grupos de especialização, clínicas ortopédicas',
    demanda: '2 a 8 turnos por mês', ticket: 'R$ 500 a R$ 1.500',
  },
  {
    id: 'med', nome: 'Médico recém-formado ou residente', idade: '25 a 33 anos', prio: 4,
    situacao: 'Vive de plantão e quer construir clientela particular em um dia livre por semana.',
    dores: ['Pouco tempo para resolver estrutura', 'Precisa de recepção e boa localização', 'Regras de publicidade médica'],
    oferta: 'Turno fixo semanal com recepção, sala montada e endereço na Jatiúca. Sem fidelidade longa.',
    gancho: '“Atenda particular no seu dia livre de plantão.”',
    canais: 'Instagram, LinkedIn, grupos de plantão no WhatsApp e Telegram, ligas acadêmicas',
    demanda: '1 turno por semana', ticket: 'R$ 520 a R$ 870',
  },
  {
    id: 'fono', nome: 'Fono, TO e psicopedagoga', idade: '23 a 32 anos', prio: 5,
    situacao: 'Atende crianças, muitas com TEA, e recebe encaminhamento de escolas e pediatras.',
    dores: ['Sala precisa de tapete e material lúdico', 'Pais querem estacionamento e sala de espera', 'Agenda concentrada após a escola'],
    oferta: 'Sala com kit infantil (tatame e mesa baixa) por turno no fim da tarde.',
    gancho: '“Uma sala preparada para atender crianças, por turno.”',
    canais: 'Instagram, grupos de mães, escolas, pediatras parceiros',
    demanda: '2 a 6 turnos por mês', ticket: 'R$ 400 a R$ 1.000',
  },
]

export const lacunas = [
  { t: 'Horário', d: 'A Santé fecha às 18h e no sábado ao meio-dia. Os recém-formados trabalham de dia e atendem à noite, e a NutriClin (24 h) e a Elleva (até 23h) já ocupam esse espaço.', acao: 'Abrir até 21h às terças e quintas e oferecer acesso por senha a quem tem pacote.' },
  { t: 'Porta de entrada', d: 'Hoje a hora avulsa custa R$ 50 e o pacote de 8 turnos exige compromisso alto para quem tem 3 pacientes.', acao: 'Criar o Pacote Start: 10 h por R$ 350 (R$ 35/h), válido 60 dias, sem fidelidade.' },
  { t: 'Pacientes', d: 'O maior medo do recém-formado é não ter pacientes. Nenhum concorrente ajuda nisso.', acao: 'Página “Profissionais da Santé” no site, post de boas-vindas no Instagram (7,2 mil seguidores) e indicação cruzada entre profissionais da casa.' },
  { t: 'Comunidade', d: 'Quem começa sozinho tem dúvidas de CNPJ, impostos, preço da consulta e marketing.', acao: 'Workshop mensal gratuito na Santé com contador, advogado e profissionais experientes.' },
  { t: 'Piscina', d: 'A piscina é um diferencial único e está subaproveitada.', acao: 'Campanha própria para fisioterapeutas e educadores físicos recém-formados.' },
]

export const escada = [
  { t: 'Visita + 1ª hora grátis', p: 'R$ 0', d: 'Tour de 20 min e uma hora de teste com paciente real.' },
  { t: 'Hora avulsa', p: 'R$ 50/h', d: 'Para quem ainda tem atendimento esporádico.' },
  { t: 'Pacote Start (novo)', p: 'R$ 350 · 10 h', d: 'R$ 35/h, vale 60 dias, sem fidelidade.' },
  { t: 'Turno fixo semanal', p: 'R$ 120 a R$ 200/turno', d: '20% de desconto nos 3 primeiros meses para recém-formados.' },
  { t: 'Sala mensal', p: 'R$ 2.000 a R$ 3.000', d: 'Quando a agenda enche. É onde estão os profissionais estabelecidos.' },
]

export const pilares = [
  { t: 'Oferta', d: 'Programa Primeiro Consultório para formados há até 3 anos, com registro no conselho: escada de preços, horário noturno, vitrine para pacientes e comunidade.' },
  { t: 'Presença onde eles estão', d: 'Instagram e TikTok com conteúdo de carreira, Google para quem já procura sala, WhatsApp para fechar.' },
  { t: 'Faculdades e conselhos', d: 'Palestra “Como abrir seu consultório” no último ano dos cursos, kit formando, apoio a ligas acadêmicas e eventos do CRP, CRN e CREFITO.' },
  { t: 'Conversão rápida', d: 'Resposta no WhatsApp em até 5 minutos, roteiro fixo, convite para visita e follow-up em 1, 3 e 7 dias.' },
  { t: 'Crescer com o cliente', d: 'Subir de hora para pacote, de pacote para turno e de turno para sala mensal. Indicação premiada.' },
]

export const funilAcoes = [
  { e: 'Atrair', d: 'Reels de carreira, anúncios com gancho por profissão, Google Ads, palestras nas faculdades.', kpi: 'Alcance no público de 22 a 34 anos, CPM, CTR' },
  { e: 'Captar', d: 'Botão de WhatsApp com mensagem pronta e código do canal (#META, #TT, #GOO, #IES).', kpi: 'Leads, CPL, % qualificados' },
  { e: 'Visitar', d: 'Agendar tour em até 48 h. Oferecer a 1ª hora grátis já com paciente.', kpi: 'Lead → visita, tempo até a visita' },
  { e: 'Fechar', d: 'Proposta do Pacote Start na própria visita, com Pix ou cartão.', kpi: 'Visita → contrato, CAC' },
  { e: 'Crescer', d: 'Aos 60 dias, revisar a agenda e propor turno fixo. Pedir indicação e avaliação no Google.', kpi: 'Upgrade, churn, NPS, indicações' },
]

// prio: 1 alta, 2 média, 3 baixa, 4 não usar agora
export const redes = [
  { n: 'Instagram', prio: 1, papel: 'Vitrine principal e anúncios', formato: '3 Reels e 2 carrosséis por semana, stories diários com “salas livres hoje à noite”, collabs com os profissionais da casa, canal de transmissão', custo: 'Mídia R$ 800 a R$ 1.800/mês (Meta)', kpi: 'Alcance de não seguidores, salvamentos, conversas iniciadas' },
  { n: 'WhatsApp Business', prio: 1, papel: 'Onde a venda fecha', formato: 'Catálogo com a escada de preços, respostas rápidas, etiquetas por etapa do funil, comunidade “Primeiro Consultório Santé”', custo: 'Gratuito', kpi: 'Tempo de resposta, lead → visita' },
  { n: 'Google (Perfil da Empresa + Ads)', prio: 1, papel: 'Captar quem já procura sala', formato: 'Corrigir a categoria, postar 1 vez por semana, fotos das salas, anúncios de busca para “consultório por hora Maceió” e variações', custo: 'Ads R$ 300 a R$ 900/mês', kpi: 'Posição nas 4 buscas do Maps, cliques para ligar ou rota, CPL' },
  { n: 'TikTok', prio: 2, papel: 'Alcance barato entre 20 e 30 anos', formato: '“Meu primeiro consultório”, tour, um dia de atendimento, erros de quem começa. Spark Ads nos vídeos que vingarem', custo: 'Mídia R$ 300 a R$ 600/mês', kpi: 'Retenção do vídeo, CPM, perfil → WhatsApp' },
  { n: 'YouTube (Shorts e vídeos)', prio: 2, papel: 'Busca de longo prazo e prova', formato: 'Shorts reaproveitados dos Reels, tour completo, gravação dos workshops', custo: 'Gratuito; Ads opcional R$ 300/mês', kpi: 'Visualizações, inscritos locais' },
  { n: 'Facebook', prio: 2, papel: 'Grupos profissionais e alcance extra dos anúncios', formato: 'Participar de grupos de psicólogos, nutricionistas e fisioterapeutas de Alagoas. Anúncios saem junto com o Instagram', custo: 'Incluído na mídia Meta', kpi: 'Leads de grupos' },
  { n: 'LinkedIn', prio: 2, papel: 'Médicos, residentes e coordenadores de curso', formato: 'Página da Santé e posts do gestor sobre empreender na saúde. Contato com coordenações das faculdades', custo: 'Orgânico (anúncio caro, não vale agora)', kpi: 'Reuniões com faculdades, leads de médicos' },
  { n: 'Threads', prio: 3, papel: 'Extensão gratuita do Instagram', formato: 'Repostar dicas curtas e bastidores', custo: 'Gratuito', kpi: 'Seguidores, respostas' },
  { n: 'Pinterest', prio: 3, papel: 'Inspiração de consultório', formato: 'Pins com fotos das salas e ideias de decoração para consultório de psicologia e nutrição', custo: 'Gratuito', kpi: 'Cliques para o site' },
  { n: 'Spotify e podcast', prio: 3, papel: 'Autoridade', formato: 'Podcast mensal “Primeiro Consultório” gravado na Santé com profissionais locais, também no YouTube', custo: 'Baixo, com celular e microfone', kpi: 'Ouvintes, convidados que viram clientes' },
  { n: 'Telegram e Discord', prio: 3, papel: 'Comunidades de estudantes e residência', formato: 'Divulgar workshops gratuitos nos grupos de estudo que aceitam esse tipo de aviso', custo: 'Gratuito', kpi: 'Inscritos nos workshops' },
  { n: 'Doctoralia e plataformas de agendamento', prio: 3, papel: 'Ajudar o cliente a ter pacientes', formato: 'Orientar o profissional a cadastrar o endereço da Santé no perfil dele', custo: 'Gratuito para a Santé', kpi: 'Profissionais com o endereço da Santé publicado' },
  { n: 'E-mail', prio: 3, papel: 'Nutrir leads que ainda não estão prontos', formato: 'Newsletter mensal com agenda de workshops e horários livres', custo: 'Gratuito até poucos contatos', kpi: 'Abertura, cliques' },
  { n: 'X (Twitter)', prio: 4, papel: 'Pouco uso local para este público', formato: 'Só monitorar', custo: '—', kpi: '—' },
  { n: 'Kwai', prio: 4, papel: 'Público diferente do alvo', formato: 'Não usar agora', custo: '—', kpi: '—' },
  { n: 'Reddit e Bluesky', prio: 4, papel: 'Pouca presença local', formato: 'Não usar agora', custo: '—', kpi: '—' },
]

export const conteudo = [
  { t: 'Carreira e gestão', pct: 40, ex: 'Como abrir CNPJ, precificar a consulta, Carnê-Leão, prontuário, primeiro paciente' },
  { t: 'Estrutura e bastidores', pct: 25, ex: 'Tour, sala pronta antes do atendimento, piscina, estacionamento, recepção' },
  { t: 'Prova social', pct: 25, ex: 'Profissionais da casa contando como começaram, depoimentos, collabs' },
  { t: 'Oferta', pct: 10, ex: 'Pacote Start, horários livres da semana, open house' },
]

export const calendario = [
  { m: 'Nov/26', fase: 'Fundação', itens: ['Criar o Pacote Start e o horário até 21h', 'Corrigir a categoria do Google e comprimir as fotos do site', 'Página de destino “Primeiro Consultório” com links que têm código', 'Gravar tour e 8 Reels'] },
  { m: 'Dez/26', fase: 'Formandos', itens: ['Palestras nas faculdades antes das formaturas', 'Kit formando com 2 h grátis', '09/12, Dia do Fonoaudiólogo', 'Ligar anúncios Meta e Google'] },
  { m: 'Jan/27', fase: 'Lançamento', itens: ['Janeiro Branco: série sobre saúde mental para psicólogos', 'Open house com coffee', 'Primeiro workshop mensal', 'Ligar TikTok'] },
  { m: 'Fev/27', fase: 'Volta às aulas', itens: ['Retomada depois do Carnaval', 'Parcerias com ligas acadêmicas do semestre', 'Primeiros depoimentos'] },
  { m: 'Mar/27', fase: 'Escala', itens: ['8/3, Dia da Mulher (a maioria do público)', 'Programa Indique um colega', 'Revisar anúncios: manter os 3 melhores'] },
  { m: 'Abr/27', fase: 'Retenção', itens: ['7/4, Dia Mundial da Saúde', 'Propor turno fixo a quem tem 60 dias', 'Balanço do semestre e decisão de seguir ou ajustar'] },
]

// Métricas: meta = caminho feliz, alerta = rever a campanha
export const metricas = [
  { g: 'Atração', n: 'CPM (custo por mil impressões)', f: 'gasto ÷ impressões × 1.000', meta: '≤ R$ 25', alerta: '> R$ 40', onde: 'Gerenciador de Anúncios', freq: 'Semanal' },
  { g: 'Atração', n: 'CTR do anúncio', f: 'cliques ÷ impressões', meta: '≥ 1,2%', alerta: '< 0,6%', onde: 'Gerenciador de Anúncios', freq: 'Semanal' },
  { g: 'Atração', n: 'Alcance de não seguidores', f: 'contas alcançadas que não seguem ÷ total', meta: '≥ 40%', alerta: '< 20%', onde: 'Instagram Insights', freq: 'Semanal' },
  { g: 'Captação', n: 'Leads por mês', f: 'conversas e formulários com código de canal', meta: '≥ 135', alerta: '< 70', onde: 'WhatsApp (etiquetas) e planilha de leads', freq: 'Semanal' },
  { g: 'Captação', n: 'CPL (custo por lead)', f: 'gasto em mídia ÷ leads pagos', meta: '≤ R$ 22', alerta: '> R$ 35', onde: 'Gerenciador + planilha', freq: 'Semanal' },
  { g: 'Captação', n: 'Leads qualificados', f: 'profissional de saúde formado há até 3 anos ÷ leads', meta: '≥ 60%', alerta: '< 40%', onde: 'Pergunta no roteiro do WhatsApp', freq: 'Semanal' },
  { g: 'Conversão', n: 'Lead qualificado → visita', f: 'visitas ÷ leads qualificados', meta: '≥ 25%', alerta: '< 15%', onde: 'Planilha de leads', freq: 'Quinzenal' },
  { g: 'Conversão', n: 'Visita → contrato', f: 'contratos ÷ visitas', meta: '≥ 40%', alerta: '< 25%', onde: 'Situação atual (campanha do contrato)', freq: 'Quinzenal' },
  { g: 'Conversão', n: 'Tempo de resposta no WhatsApp', f: 'média do 1º retorno em horário comercial', meta: '≤ 5 min', alerta: '> 30 min', onde: 'WhatsApp Business', freq: 'Semanal' },
  { g: 'Conversão', n: 'CAC (custo por cliente)', f: 'investimento total ÷ novos clientes', meta: '≤ R$ 450', alerta: '> R$ 700', onde: 'Esta página e Marketing', freq: 'Mensal' },
  { g: 'Valor', n: 'Ticket médio nos 3 primeiros meses', f: 'receita dos novos ÷ novos ativos', meta: '≥ R$ 380', alerta: '< R$ 250', onde: 'Situação atual', freq: 'Mensal' },
  { g: 'Valor', n: 'LTV (valor do cliente na vida)', f: 'ticket × margem × meses que fica', meta: '≥ R$ 3.000', alerta: '< R$ 1.500', onde: 'Simulador abaixo', freq: 'Trimestral' },
  { g: 'Valor', n: 'LTV ÷ CAC', f: 'LTV ÷ CAC', meta: '≥ 3', alerta: '< 2', onde: 'Simulador abaixo', freq: 'Mensal' },
  { g: 'Valor', n: 'Payback do CAC', f: 'CAC ÷ margem do 1º mês cheio', meta: '≤ 2 meses', alerta: '> 4 meses', onde: 'Simulador abaixo', freq: 'Mensal' },
  { g: 'Valor', n: 'ROI da campanha', f: '(margem gerada − investimento) ÷ investimento', meta: '≥ 50% em 6 meses', alerta: '< 0 em 6 meses', onde: 'Marketing', freq: 'Mensal' },
  { g: 'Retenção', n: 'Churn mensal', f: 'clientes que saíram ÷ ativos no início do mês', meta: '≤ 10%', alerta: '> 15%', onde: 'Situação atual', freq: 'Mensal' },
  { g: 'Retenção', n: 'Upgrade para turno fixo', f: 'clientes com turno fixo ÷ clientes com 3+ meses', meta: '≥ 30%', alerta: '< 15%', onde: 'Situação atual', freq: 'Mensal' },
  { g: 'Retenção', n: 'NPS dos profissionais', f: '% promotores − % detratores', meta: '≥ 60', alerta: '< 30', onde: 'Formulário trimestral', freq: 'Trimestral' },
  { g: 'Retenção', n: 'Indicações por cliente', f: 'indicações recebidas ÷ clientes ativos', meta: '≥ 0,3 por semestre', alerta: '< 0,1', onde: 'Código #IND no WhatsApp', freq: 'Mensal' },
  { g: 'Ocupação', n: 'Ocupação das salas por hora e turno', f: 'horas vendidas ÷ capacidade', meta: '≥ 60% (meta da Santé)', alerta: 'Queda por 2 meses seguidos', onde: 'Painel', freq: 'Mensal' },
  { g: 'Marca', n: 'Presença no Google Maps', f: 'buscas-alvo em que a Santé aparece', meta: '4 de 4 em 90 dias', alerta: 'Menos de 2', onde: 'Página Concorrentes', freq: 'Mensal' },
  { g: 'Marca', n: 'Avaliações novas no Google', f: 'avaliações de profissionais por mês', meta: '≥ 5', alerta: '0', onde: 'Perfil da Empresa', freq: 'Mensal' },
]

export const medicao = [
  'Um link de WhatsApp por canal com mensagem pronta e código (#META, #TT, #GOO, #YT, #IES, #IND). A recepção marca a etiqueta do canal.',
  'Links com UTM no site e na bio. Ligar Google Analytics 4, Search Console e o Pixel da Meta com API de Conversões.',
  'Pergunta fixa no roteiro: “Você é formado há quanto tempo e em quê?” Assim se mede o lead qualificado.',
  'Planilha de leads com data, canal, profissão, etapa (lead, visita, contrato, perdido) e motivo da perda.',
  'Ao fechar um contrato em Situação atual, escolher a campanha de origem. O retorno aparece no Marketing.',
  'Reunião de 30 minutos toda segunda: CPL, leads, visitas e contratos da semana. Pausar o anúncio que passar do alerta duas semanas seguidas.',
]

export const riscos = [
  { t: 'Publicidade dos conselhos', d: 'A Santé divulga o espaço e os profissionais, mas não promete resultado de tratamento nem divulga preço de consulta. Siga a Resolução CFM 2.336/2023 e os códigos de ética do CFP, CFN e COFFITO.' },
  { t: 'LGPD', d: 'Formulários e listas precisam de consentimento para contato. Não use listas compradas de formandos.' },
  { t: 'Canibalizar preço', d: 'O desconto vale só para formados há até 3 anos e por 3 meses. Os clientes atuais mantêm os preços de hoje.' },
  { t: 'Capacidade', d: 'Se as horas vendidas passarem de 80% das horas livres, pausar a mídia e priorizar o upgrade para turno fixo.' },
  { t: 'Públicos dos anúncios', d: 'A Meta limita a segmentação detalhada. O criativo precisa falar direto com o público (“Psicóloga recém-formada em Maceió?”) e os públicos semelhantes partem da lista de clientes.' },
]

export const fontes = [
  { u: 'https://site.cfp.org.br/censopsi-2022-cfp-divulga-os-resultados-da-maior-pesquisa-sobre-o-exercicio-profissional-da-psicologia-brasileira/', t: 'CFP · CensoPsi 2022', d: 'perfil da psicologia brasileira' },
  { u: 'https://www.medway.com.br/conteudos/demografia-medica-no-brasil-2025-veja-os-principais-dados-do-novo-levantamento/', t: 'Demografia Médica no Brasil 2025', d: 'resumo do levantamento FMUSP, AMB e Ministério da Saúde' },
  { u: 'https://www.blogdovestibular.com/?p=29791', t: 'UFAL no Sisu 2020', d: '100 vagas de Medicina em Maceió' },
  { u: 'https://www.tribunadosertao.com.br/geral/2014/03/21/152518-cesmac-anuncia-para-maio-primeiro-vestibular-do-curso-de-medicina', t: 'CESMAC · Medicina', d: '100 vagas anuais autorizadas em 2014' },
  { u: 'https://www.superads.ai/facebook-ads-costs/cost-per-lead/brazil', t: 'SuperAds · custos da Meta no Brasil', d: 'CPM e CPC médios no país' },
  { u: 'https://emec.mec.gov.br/', t: 'e-MEC', d: 'cadastro oficial para confirmar cursos e vagas em Maceió' },
]
