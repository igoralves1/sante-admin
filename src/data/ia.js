// IA e robôs no marketing da Santé: análise da Gojiberry (gojiberry.ai) e como aplicar a ideia aqui.
// Fonte da Gojiberry: site oficial (home, FAQ, cases e política de privacidade), lido em nov/2026.

export const gojiberry = {
  url: 'https://gojiberry.ai/',
  resumo: 'Agente de vendas com IA para prospecção B2B, apoiado pela Y Combinator e operado pela Superfruits SAS (Paris). Ele descobre quem está “em mercado” por sinais de intenção nas redes, pontua os contatos pelo perfil de cliente ideal (ICP) e inicia conversas personalizadas por LinkedIn e e-mail, sozinho ou com aprovação humana.',
  publico: 'Times B2B enxutos, fundadores sem equipe de pré-venda (SDR), times de vendas, agências de outbound e growth.',
  passos: [
    { t: 'Conectar', d: 'Você informa o site; a IA lê o que a empresa vende, para quem e como. Promete funcionar em minutos, sem configuração manual.' },
    { t: 'Prospectar', d: 'Os agentes rodam 24 h por dia: detectam sinais de compra, pontuam os melhores contatos e iniciam a conversa por e-mail e redes.' },
    { t: 'Converter', d: 'As respostas chegam com rascunho pronto numa caixa única; a equipe assume e marca a reunião. Toda semana a IA compara as campanhas e ajusta.' },
  ],
  sinais: [
    'Interação com a sua empresa ou o seu conteúdo (curtidas, comentários)',
    'Visitas ao seu perfil e novos seguidores da página',
    'Interação com concorrentes e com influenciadores do setor',
    'Atividade em temas do seu nicho',
    'Mudança de emprego e contratações',
    'Rodada de investimento e tecnologia usada pela empresa',
    'Parecidos com os seus melhores clientes (lookalike)',
    'Empresas que visitaram o seu site (identificação no nível de empresa)',
  ],
  recursos: [
    'Pontuação de leads pelo perfil de cliente ideal',
    'Mensagens personalizadas por IA, em vários canais, sem montar sequência',
    'Modo automático ou modo “aprovar antes de enviar” (Copilot)',
    'Enriquecimento de e-mail e telefone com mais de 15 fornecedores de dados',
    'Caixa de entrada única com respostas já rascunhadas',
    'Integração com HubSpot, Pipedrive, Attio, API e Claude (MCP)',
    'Limites de envio “parecidos com os de uma pessoa” para proteger a conta do LinkedIn',
  ],
  preco: 'Plano Pro: US$ 99 por mês (≈ R$ 500 a R$ 600, conforme o câmbio), 2 agentes, até 1.800 contatos por mês. Plano Custom sob consulta. Tem teste grátis e cancelamento a qualquer momento.',
  resultados: [
    'Diz atender mais de 3.500 times B2B',
    'Wispra: cerca de 30 demonstrações por semana e 60% das demonstrações vindas da ferramenta',
    'Mindflow: 35% de taxa de resposta em campanhas com sinais',
    'GTE Localize: mais de 100 reuniões em dois meses',
    'ChargeMate: 5 a 8 vezes mais respostas',
  ],
  limites: [
    'Feito para B2B em inglês: não cita português, Brasil nem cobertura de dados de Alagoas',
    'Centrado no LinkedIn: depende da conta pessoal e das regras da plataforma',
    'Não usa WhatsApp nem Instagram como canal de contato, que são os canais fortes da Santé',
    'Resultados divulgados pela própria empresa, sem metodologia e com números que mudam entre páginas',
    'Política de privacidade feita para a GDPR europeia; no Brasil a Santé responde pela LGPD dos contatos que abordar',
  ],
  encaixe: [
    { t: 'O que serve', d: 'A Santé também vende para profissionais (B2B). A ideia central, falar primeiro com quem mostrou sinal de interesse, em vez de anunciar para todo mundo, é exatamente o que o plano de campanha precisa.' },
    { t: 'Onde a ferramenta cabe', d: 'Prospecção no LinkedIn de médicos especialistas, dentistas, gestores de clínica e empresas para o coworking: o público que menos responde ao Instagram.' },
    { t: 'Onde não cabe', d: 'Psicólogos, nutricionistas e fisioterapeutas de Maceió decidem pelo Instagram e pelo WhatsApp. Para eles, o mesmo raciocínio de sinais precisa ser feito com ferramentas da Meta e robôs de WhatsApp.' },
    { t: 'Veredito', d: 'Vale um teste de 1 mês, no fim da fase de fundação, só para médicos, dentistas e coworking no LinkedIn, com aprovação manual de cada mensagem em português. Se trouxer menos de 3 visitas no mês, cancelar.' },
  ],
}

// Os sinais da Gojiberry traduzidos para a realidade da Santé
export const sinaisSante = [
  { sinal: 'Interagiu com o conteúdo da Santé', sante: 'Curtiu, comentou, salvou ou assistiu metade de um Reel', como: 'Público personalizado de engajamento na Meta e remarketing com convite para visita', ferramenta: 'Gerenciador de Anúncios', custo: 'Incluso na verba Meta' },
  { sinal: 'Visitou o site', sante: 'Abriu a página de preços ou de uma sala', como: 'Pixel da Meta e Google Ads: anúncio para quem visitou e não chamou no WhatsApp', ferramenta: 'Pixel + GA4 + Google Ads', custo: 'Incluso' },
  { sinal: 'Segue ou interage com concorrentes', sante: 'Profissionais que acompanham coworkings de saúde da cidade', como: 'Segmentação por interesses e público semelhante (lookalike) aos clientes atuais; conteúdo que responde às dúvidas desse público. Não raspar dados de perfis.', ferramenta: 'Meta Ads', custo: 'Incluso' },
  { sinal: 'Mudança de emprego', sante: 'Recém-formado, recém-especializado ou saindo de um emprego para abrir consultório', como: 'Alertas de “mudou de cargo” para psicólogo, médico ou dentista em Maceió no LinkedIn; listas de formandos só com consentimento (eventos, palestras)', ferramenta: 'LinkedIn Sales Navigator ou Gojiberry', custo: 'Pago' },
  { sinal: 'Atividade no nicho', sante: 'Pergunta em grupos sobre “onde atender” ou “sala por hora”', como: 'Participação ativa do gestor nos grupos de Facebook e WhatsApp das profissões; resposta útil, sem spam', ferramenta: 'Manual com apoio de IA para rascunhos', custo: 'Tempo' },
  { sinal: 'Parecido com os melhores clientes', sante: 'Mesmo perfil dos locatários que ficam mais tempo', como: 'Lista de clientes (com consentimento) como base de público semelhante na Meta', ferramenta: 'Meta Ads', custo: 'Incluso' },
  { sinal: 'Busca ativa', sante: 'Pesquisou “consultório por hora Maceió” no Google', como: 'Anúncio de busca e Perfil da Empresa completo', ferramenta: 'Google Ads + Perfil', custo: 'Verba Google' },
]

// Onde a IA e os robôs aumentam a performance do marketing da Santé
export const frentes = [
  {
    area: 'Atendimento 24 h no WhatsApp e no Instagram', prio: 1,
    faz: 'Robô responde na hora, pergunta profissão, registro no conselho, dias e turnos desejados; manda fotos, preços e localização; oferece horários de visita e já agenda. Passa para a recepção quando a pessoa pede ou quando a conversa foge do roteiro.',
    ferramentas: 'WhatsApp Business (respostas rápidas, etiquetas, mensagem de ausência); ManyChat ou BotConversa para fluxos com IA; link de agendamento do Google Agenda',
    custo: 'Grátis a cerca de R$ 150/mês',
    kpi: 'Tempo da 1ª resposta < 1 min; lead → visita de 22% para 28%+',
  },
  {
    area: 'Palavra-chave nos comentários vira conversa', prio: 1,
    faz: 'Quem comenta “SALA” num Reel recebe na hora uma mensagem no Direct com o link do WhatsApp e a tabela de preços. Transforma alcance orgânico em lead.',
    ferramentas: 'ManyChat (automação oficial do Instagram)',
    custo: 'Plano gratuito para começar',
    kpi: 'Comentários com palavra-chave → conversas',
  },
  {
    area: 'Qualificação e pontuação de leads', prio: 2,
    faz: 'Cada lead ganha nota pelo perfil: profissão, tempo de formado, turnos por semana, distância, canal. A recepção liga primeiro para quem tem nota alta. Mesmo raciocínio do “lead scoring” da Gojiberry.',
    ferramentas: 'CRM gratuito (RD Station CRM, HubSpot ou Pipedrive) ou uma tela nova no próprio sistema da Santé',
    custo: 'Grátis',
    kpi: '% de leads qualificados; tempo até a visita',
  },
  {
    area: 'Follow-up automático', prio: 2,
    faz: 'Quem não marcou visita recebe mensagem em 1, 3 e 7 dias; quem visitou e não fechou recebe convite para o open house; quem está há 60 dias recebe proposta de turno fixo.',
    ferramentas: 'Etiquetas e mensagens programadas no WhatsApp Business ou automação do CRM',
    custo: 'Grátis a baixo',
    kpi: 'Leads recuperados por mês',
  },
  {
    area: 'Conteúdo com IA', prio: 1,
    faz: 'Roteiros de Reels por profissão, legendas, carrosséis, respostas a comentários e ideias de pauta a partir das dúvidas que chegam no WhatsApp. A equipe grava e revisa; a IA acelera.',
    ferramentas: 'Claude ou ChatGPT para texto; Canva (recursos de IA) para artes; CapCut para legendas e cortes de vídeo',
    custo: 'Grátis a cerca de R$ 100/mês',
    kpi: 'Posts por semana (meta 5); engajamento ≥ 3%',
  },
  {
    area: 'Anúncios com IA das plataformas', prio: 1,
    faz: 'Deixar a Meta testar públicos e variações de criativo (Advantage+) e o Google ampliar as buscas (Performance Max ou correspondência ampla com lances inteligentes), sempre otimizando para conversa iniciada.',
    ferramentas: 'Meta Advantage+, Google Ads com lances automáticos',
    custo: 'Dentro da verba do plano',
    kpi: 'Custo por conversa ≤ R$ 18; CPL Google ≤ R$ 28',
  },
  {
    area: 'Prospecção B2B no LinkedIn', prio: 3,
    faz: 'Agente que encontra médicos, dentistas, gestores e empresas com sinal de interesse e inicia conversa personalizada, com aprovação manual.',
    ferramentas: 'Gojiberry (teste de 1 mês) ou LinkedIn Sales Navigator',
    custo: '≈ R$ 500 a R$ 600/mês',
    kpi: 'Reuniões e visitas de médicos, dentistas e coworking',
  },
  {
    area: 'Reputação no Google', prio: 2,
    faz: 'Mensagem automática pedindo avaliação no 30º dia de cada profissional; IA sugere respostas educadas para todas as avaliações.',
    ferramentas: 'WhatsApp Business + Perfil da Empresa',
    custo: 'Grátis',
    kpi: 'Avaliações novas por mês (meta 5)',
  },
  {
    area: 'Análise e relatórios', prio: 2,
    faz: 'Perguntar em português ao próprio sistema da Santé (“quantos contratos vieram do Instagram este mês?”), monitor social dos concorrentes e relatório mensal automático do plano.',
    ferramentas: 'Aba Perguntar em Tabelas e consultas (já existe), Monitor social, Metricool',
    custo: 'Já incluso no sistema (a aba Perguntar precisa da chave da API da Anthropic)',
    kpi: 'Reunião de segunda com números prontos',
  },
]

export const roteiro = [
  { f: 'Dias 1 a 30', itens: ['WhatsApp Business completo: catálogo, etiquetas, respostas rápidas, mensagem de ausência', 'ManyChat com palavra-chave nos Reels', 'Biblioteca de prompts para roteiros e legendas', 'Públicos de engajamento e remarketing na Meta'] },
  { f: 'Dias 31 a 60', itens: ['Robô de qualificação e agendamento de visita no WhatsApp', 'CRM gratuito com etapas do funil e pontuação de leads', 'Follow-up automático em 1, 3 e 7 dias', 'Pedido automático de avaliação no Google'] },
  { f: 'Dias 61 a 90', itens: ['Teste de 1 mês da Gojiberry para médicos, dentistas e coworking no LinkedIn', 'Advantage+ e lances automáticos com os criativos que já funcionaram', 'Relatório mensal automático com a aba Perguntar', 'Comparar: leads, visitas e contratos antes e depois da automação'] },
]

export const cuidadosIA = [
  { t: 'LGPD', d: 'Abordar profissionais com base em legítimo interesse exige mensagem clara de quem é a Santé, opção de sair da lista e registro de quem pediu para não ser contatado. Nada de listas compradas.' },
  { t: 'Regras das plataformas', d: 'Automação só com ferramentas oficiais ou com limites de envio. Robôs que raspam perfis ou mandam mensagens em massa podem bloquear a conta do Instagram, do WhatsApp ou do LinkedIn.' },
  { t: 'Revisão humana', d: 'IA erra preço, horário e regras. Toda resposta automática usa a tabela oficial da Santé, e mensagens de prospecção passam por aprovação antes de sair.' },
  { t: 'Tom e marca', d: 'Robô que parece robô afasta. Mensagens curtas, com o nome de quem atende, e saída fácil para falar com uma pessoa.' },
  { t: 'Medir antes e depois', d: 'Anotar tempo de resposta, lead → visita e visita → contrato do mês anterior para saber se a automação melhorou de verdade.' },
]
