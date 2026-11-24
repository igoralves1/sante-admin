// Plano de tráfego: tudo o que o especialista de tráfego (gestor de tráfego) faz e acompanha,
// em todas as mídias do Plano de campanha. Metas alinhadas a src/lib/campanha.js.
// Metas são o caminho esperado; alerta = ponto em que o especialista age (pausa, troca, revisa).

export const escopo = {
  resumo: 'O especialista de tráfego cuida de tudo que faz a pessoa certa ver a Santé e chegar ao WhatsApp: rastreamento, anúncios pagos, páginas de destino, públicos, criativos em teste, orçamento e relatórios. Ele não produz o conteúdo orgânico nem atende os leads, mas acompanha os números dessas etapas, porque eles definem o que otimizar.',
  responde: [
    'Configurar e manter o rastreamento (Pixel, API de Conversões, GA4, Tag Manager, UTMs, conversões offline)',
    'Criar, testar, otimizar e escalar campanhas em Meta, Google, TikTok, YouTube e LinkedIn',
    'Montar e atualizar públicos: remarketing, semelhantes, interesses, palavras-chave, negativas',
    'Pedir e testar criativos (com a equipe de conteúdo) e definir o que pausar',
    'Controlar o orçamento de cada canal e o ritmo de gasto do mês',
    'Garantir que as páginas de destino carregam rápido e convertem',
    'Relatório semanal e mensal com a comparação contra as metas do plano',
  ],
  naoResponde: [
    'Produção de posts orgânicos, stories e gravação (equipe de conteúdo)',
    'Atendimento no WhatsApp e visitas (recepção), mas ele acompanha o tempo de resposta e a conversão de lead em visita',
    'Preço, oferta e contratos (gestão da Santé)',
  ],
}

// Base técnica antes de gastar o primeiro real
export const fundacao = [
  { t: 'Gerenciador de Negócios da Meta', d: 'Página do Facebook recuperada ou nova, Instagram ligado, conta de anúncios com forma de pagamento, domínio do site verificado, dois administradores.', kpi: 'Conta sem restrição; domínio verificado' },
  { t: 'Pixel e API de Conversões', d: 'Pixel no site com eventos: visualização de página, clique no WhatsApp (Contact), envio de formulário (Lead). API de Conversões para não perder eventos.', kpi: 'Qualidade da correspondência de eventos ≥ 6/10' },
  { t: 'GA4 + Google Tag Manager', d: 'Eventos de clique no WhatsApp, telefone e rota; conversões marcadas; ligação com o Google Ads e o Search Console.', kpi: '100% dos cliques no WhatsApp registrados' },
  { t: 'Google Ads', d: 'Conta com conversões importadas do GA4, extensão de local ligada ao Perfil da Empresa, chamada e WhatsApp como recursos.', kpi: 'Status de conversão “ativo”' },
  { t: 'UTMs e links com código', d: 'Padrão utm_source / utm_medium / utm_campaign / utm_content para todo link; link de WhatsApp com mensagem pronta e código do canal (#IG, #FB, #GOO, #TT, #YT, #LI, #TRAD, #EVT, #IND).', kpi: '≥ 90% dos leads com origem identificada' },
  { t: 'Conversões offline', d: 'Etiqueta do WhatsApp ou CRM marca “visita” e “contrato”; toda semana o especialista sobe essas conversões para a Meta e o Google, que passam a otimizar para quem vira cliente, não só para quem conversa.', kpi: 'Upload semanal feito' },
  { t: 'Páginas de destino', d: 'Uma página por público (psicologia, médicos, nutrição, piscina, odontologia, coworking) com preço, fotos, mapa e botão de WhatsApp.', kpi: 'LCP < 2,5 s no celular; conversão da página ≥ 8%' },
  { t: 'Padrão de nomes', d: 'Campanha: CANAL_OBJETIVO_PUBLICO_AAAAMM. Conjunto: PUBLICO_SEGMENTACAO. Anúncio: FORMATO_GANCHO_V1. Facilita relatório e comparação.', kpi: 'Todas as campanhas no padrão' },
  { t: 'Painel de acompanhamento', d: 'Looker Studio (gratuito) juntando Meta, Google Ads, GA4 e a planilha de leads, com as metas do plano.', kpi: 'Painel atualizado toda segunda' },
]

// Ações por mídia. fase: Setup, Mês 1–3, Mês 4–9, Mês 10–12, Contínuo
export const midias = [
  {
    id: 'meta-ig', n: 'Instagram (Meta Ads)', verba: 'meta', parte: 0.6, destaque: true,
    acoes: [
      { fase: 'Mês 1–3', a: 'Campanha de mensagens para o WhatsApp por profissão', como: 'Objetivo Engajamento › Mensagens (WhatsApp). Um conjunto por público (psicologia, médicos, nutrição, fisio/piscina), raio de 10 km da Jatiúca, 24 a 55 anos. 3 a 5 criativos por conjunto: Reels de 15–30 s com a profissão chamada no 1º segundo.', freq: 'Revisão diária, otimização 2× por semana', kpis: [['Custo por conversa iniciada', 'valor do mês na aba Metas (≈ R$ 26 no teste, R$ 18 a partir do 4º mês)', '> 30% acima da meta do mês'], ['CTR no link', '≥ 1%', '< 0,6%'], ['CPM', '≤ R$ 25', '> R$ 40'], ['Frequência (7 dias)', '≤ 2,5', '> 3,5']] },
      { fase: 'Mês 1–3', a: 'Teste de criativos', como: 'Regra: cada criativo recebe pelo menos 2× o custo por conversa alvo antes de julgar. Pausar quem fica 30% pior que a média do conjunto. Toda semana entram 2 novos.', freq: 'Semanal', kpis: [['Taxa de gancho (3 s ÷ impressões)', '≥ 30%', '< 20%'], ['Retenção (ThruPlay ÷ 3 s)', '≥ 25%', '< 15%'], ['Criativos novos por semana', '2', '0']] },
      { fase: 'Mês 1–3', a: 'Remarketing de engajamento', como: 'Público de quem interagiu com o perfil, assistiu 50% dos vídeos ou visitou o site nos últimos 30 dias, excluindo quem já conversou. Criativo de convite para visita e prova social.', freq: 'Semanal', kpis: [['Custo por conversa', '≤ R$ 15', '> R$ 25'], ['Tamanho do público', '≥ 1.000 pessoas', '< 300']] },
      { fase: 'Mês 4–9', a: 'Públicos semelhantes e escala', como: 'Semelhante 1% da lista de clientes (com consentimento) e de quem fechou contrato. Escalar os conjuntos vencedores em 20% a cada 3 dias; duplicar quando passar de R$ 60/dia.', freq: '2× por semana', kpis: [['Custo por visita agendada', '≤ R$ 90', '> R$ 150'], ['Custo por contrato (CAC de mídia)', '≤ R$ 300', '> R$ 500']] },
      { fase: 'Mês 4–9', a: 'Otimizar para conversão offline', como: 'Com as visitas e contratos subidos toda semana, testar campanha otimizada para “Lead” qualificado e comparar com a de mensagens.', freq: 'Mensal', kpis: [['Lead qualificado (% dos leads)', '≥ 55%', '< 40%']] },
      { fase: 'Contínuo', a: 'Collabs impulsionados', como: 'Impulsionar o post em collab com o profissional novo da casa para o público semelhante e os seguidores dele.', freq: 'A cada contrato novo', kpis: [['Custo por mil alcançados', '≤ R$ 12', '> R$ 25']] },
    ],
  },
  {
    id: 'meta-fb', n: 'Facebook (Meta Ads)', verba: 'meta', parte: 0.4, destaque: true,
    acoes: [
      { fase: 'Mês 1–3', a: 'Mensagens para profissionais acima de 35 anos', como: 'Mesmo objetivo de mensagens, posicionamentos Feed e Reels do Facebook, 30 a 60 anos, mensagem de “segundo endereço” e “sair do aluguel fixo”.', freq: 'Diária', kpis: [['Custo por conversa', 'valor do mês na aba Metas (mesma meta do Instagram)', '> 30% acima da meta do mês'], ['CPM', '≤ R$ 15', '> R$ 30'], ['CTR no link', '≥ 1%', '< 0,5%']] },
      { fase: 'Mês 1–3', a: 'Eventos do Facebook para open house e workshops', como: 'Evento criado na página e impulsionado 10 dias antes para profissionais de saúde em 15 km.', freq: 'Mensal', kpis: [['Respostas “vou”', '≥ 30 por evento', '< 10'], ['Custo por resposta', '≤ R$ 5', '> R$ 12']] },
      { fase: 'Contínuo', a: 'Advantage+ de posicionamento', como: 'Depois de 50 conversões por semana na conta, deixar a Meta distribuir entre Instagram e Facebook e comparar com a divisão 60/40 manual.', freq: 'Mensal', kpis: [['Custo por conversa combinado', 'menor que o manual', 'maior por 2 semanas']] },
    ],
  },
  {
    id: 'google-search', n: 'Google Ads (busca)', verba: 'google', parte: 1, destaque: true,
    acoes: [
      { fase: 'Mês 1–3', a: 'Campanha de busca por intenção', como: 'Grupos: consultório por hora, sala para psicólogo, aluguel de consultório Jatiúca/Maceió, coworking saúde, piscina hidroterapia, consultório odontológico por turno. Correspondência de frase e exata, 15 títulos por anúncio, lance por conversões depois de 15 conversões.', freq: 'Diária no 1º mês, depois 3× por semana', kpis: [['CPL (custo por lead)', 'valor do mês na aba Metas (≈ R$ 38 no teste, R$ 28 a partir do 5º mês)', '> 30% acima da meta do mês'], ['CTR da busca', '≥ 6%', '< 3%'], ['Índice de qualidade médio', '≥ 7', '< 5'], ['Parcela de impressões', '≥ 50%', '< 30%']] },
      { fase: 'Contínuo', a: 'Palavras negativas', como: 'Toda semana, revisar o relatório de termos de busca e negativar: “apartamento”, “casa”, “emprego”, “vaga”, “curso”, “grátis” e afins.', freq: 'Semanal', kpis: [['Gasto com termos irrelevantes', '< 10% do gasto', '> 20%']] },
      { fase: 'Mês 4–9', a: 'Recursos e extensões', como: 'Local, chamada, sitelinks por público, preços (hora, turno, piscina) e formulário de lead; programar anúncios de seg a sáb, 7h–22h.', freq: 'Mensal', kpis: [['Conversão do clique em lead', '≥ 10%', '< 5%']] },
      { fase: 'Mês 10–12', a: 'Performance Max com sinais de público', como: 'Testar PMax com a lista de clientes e os melhores termos como sinal, sem canibalizar a busca de marca.', freq: 'Teste de 4 semanas', kpis: [['CPL comparado à busca', '≤ busca', '> 1,3× a busca']] },
    ],
  },
  {
    id: 'google-local', n: 'Google Perfil da Empresa (Maps)', verba: null,
    acoes: [
      { fase: 'Setup', a: 'Otimizar o perfil', como: 'Categoria principal correta, serviços com preço, horário com a noite, 30+ fotos, atributos (acessibilidade, estacionamento), link do WhatsApp com #GOO.', freq: 'Uma vez + revisão mensal', kpis: [['Perfil completo', '100%', '< 80%']] },
      { fase: 'Contínuo', a: 'Posts, avaliações e respostas', como: '1 post por semana; pedir avaliação aos profissionais no 30º dia; responder todas as avaliações em até 48 h.', freq: 'Semanal', kpis: [['Avaliações novas', '3/mês no início, 5/mês depois', '0'], ['Posição nas 4 buscas-alvo', 'Top 3 em 6 meses', 'fora do top 10'], ['Ações no perfil (ligar, rota, site)', '+10% ao mês', 'queda 2 meses seguidos']] },
    ],
  },
  {
    id: 'tiktok', n: 'TikTok Ads', verba: 'tiktok', parte: 1,
    acoes: [
      { fase: 'Mês 4–9', a: 'Spark Ads dos vídeos orgânicos que funcionaram', como: 'Só impulsionar vídeos com retenção ≥ 40% no orgânico. Objetivo tráfego para a página de destino ou mensagens, 22 a 40 anos, Maceió.', freq: '2× por semana', kpis: [['CPL', 'valor do mês na aba Metas (≈ R$ 32 no teste, R$ 24 depois)', '> 30% acima da meta do mês'], ['Visualização de 6 s', '≥ 25%', '< 15%'], ['CPC', '≤ R$ 1,50', '> R$ 3']] },
      { fase: 'Mês 10–12', a: 'Decidir continuar ou cortar', como: 'Comparar o custo por visita do TikTok com o da Meta. Se for mais de 1,5× maior por 2 meses, mover a verba para a Meta.', freq: 'Mensal', kpis: [['Custo por visita', '≤ 1,5× o da Meta', '> 1,5×']] },
    ],
  },
  {
    id: 'youtube', n: 'YouTube', verba: null,
    acoes: [
      { fase: 'Mês 4–9', a: 'Remarketing em vídeo (opcional)', como: 'Se sobrar verba do Google: anúncio in-stream pulável do tour da Santé para quem visitou o site, 30 dias.', freq: 'Mensal', kpis: [['Custo por visualização', '≤ R$ 0,10', '> R$ 0,25'], ['Taxa de visualização', '≥ 25%', '< 15%']] },
      { fase: 'Contínuo', a: 'SEO dos vídeos', como: 'Títulos e descrições com “consultório por hora Maceió”, link com UTM na descrição.', freq: 'A cada vídeo', kpis: [['Cliques no link do vídeo', '≥ 30/mês a partir do 6º mês', '0']] },
    ],
  },
  {
    id: 'linkedin', n: 'LinkedIn', verba: null,
    acoes: [
      { fase: 'Mês 4–9', a: 'Prospecção com sinais (teste Gojiberry ou Sales Navigator)', como: 'Médicos, dentistas, gestores e empresas para o coworking em Maceió; mensagens em português aprovadas uma a uma; limite de envios por dia.', freq: 'Teste de 1 mês', kpis: [['Taxa de aceite de conexão', '≥ 30%', '< 15%'], ['Taxa de resposta', '≥ 10%', '< 4%'], ['Visitas agendadas', '≥ 3 no mês', '< 3 → cancelar']] },
      { fase: 'Contínuo', a: 'Posts do gestor', como: 'O especialista só mede: links com UTM e cliques para o WhatsApp.', freq: 'Mensal', kpis: [['Leads com #LI', '≥ 2/mês', '0']] },
    ],
  },
  {
    id: 'site', n: 'Site e páginas de destino', verba: null,
    acoes: [
      { fase: 'Setup', a: 'Páginas por público', como: 'Uma página por público com título que repete o anúncio, preço, fotos, mapa e WhatsApp com código; imagens em WebP.', freq: 'Uma vez', kpis: [['LCP no celular', '< 2,5 s', '> 4 s'], ['Taxa de conversão da página', '≥ 8%', '< 4%']] },
      { fase: 'Contínuo', a: 'Testes A/B', como: 'Testar título, primeira foto e texto do botão, um de cada vez, com pelo menos 300 visitas por versão.', freq: 'Mensal', kpis: [['Melhora de conversão por teste', '≥ 10%', 'sem teste no mês']] },
    ],
  },
  {
    id: 'whatsapp', n: 'WhatsApp (destino dos anúncios)', verba: null,
    acoes: [
      { fase: 'Contínuo', a: 'Acompanhar a passagem para a recepção', como: 'O especialista não atende, mas mede: se a conversa não vira visita, o problema pode ser o atendimento e não o anúncio.', freq: 'Semanal', kpis: [['Tempo da 1ª resposta', '≤ 5 min (meta < 1 min com robô)', '> 30 min'], ['Lead qualificado → visita', '22% no início; 28% a partir do 7º mês', '< 15%'], ['Visita → contrato', '30% no início; 38% depois', '< 20%'], ['Leads sem etiqueta de canal', '< 10%', '> 25%']] },
    ],
  },
  {
    id: 'offline', n: 'Mídia tradicional e eventos (medição)', verba: 'tradicional', parte: 1,
    acoes: [
      { fase: 'Contínuo', a: 'QR codes com UTM e código', como: 'Um QR por peça e local (folheto da faculdade, elevador, fachada, evento), apontando para a página de destino com UTM ou para o WhatsApp com #TRAD/#EVT.', freq: 'A cada peça', kpis: [['Leads por peça', '≥ 3 por mês por local', '0 por 2 meses → retirar'], ['Custo por lead offline', '≤ R$ 40', '> R$ 80']] },
    ],
  },
  {
    id: 'odonto', n: 'Sala de odontologia (quando abrir)', verba: null,
    acoes: [
      { fase: 'Mês 4–9', a: 'Campanha para dentistas', como: 'Meta Ads para dentistas em 15 km (interesses de odontologia e HOF), Google para “consultório odontológico por turno Maceió”, remarketing de quem viu o tour da sala.', freq: '2× por semana', kpis: [['Custo por conversa de dentista', '≤ R$ 25', '> R$ 40'], ['Visitas de dentistas', '≥ 4 por mês', '< 2'], ['Turnos vendidos por semana', '2 → 4 (meta do estudo)', '< 2']] },
    ],
  },
]

// Indicadores que o especialista acompanha (glossário)
export const kpis = [
  { g: 'Entrega', n: 'Impressões e alcance', f: 'vezes exibido / pessoas únicas', por: 'Mostra se a verba está sendo gasta e chegando ao público.' },
  { g: 'Entrega', n: 'CPM', f: 'gasto ÷ impressões × 1.000', por: 'Preço do leilão; sobe com público pequeno ou criativo fraco.' },
  { g: 'Entrega', n: 'Frequência', f: 'impressões ÷ alcance', por: 'Acima de 3,5 em 7 dias o público cansa: trocar criativo ou ampliar público.' },
  { g: 'Criativo', n: 'Taxa de gancho', f: 'reproduções de 3 s ÷ impressões', por: 'Se o começo do vídeo prende a atenção.' },
  { g: 'Criativo', n: 'Retenção', f: 'ThruPlay (15 s) ÷ reproduções de 3 s', por: 'Se a mensagem segura até o convite.' },
  { g: 'Criativo', n: 'CTR', f: 'cliques no link ÷ impressões', por: 'Se o anúncio faz agir.' },
  { g: 'Busca', n: 'Índice de qualidade', f: 'nota de 1 a 10 do Google por palavra', por: 'Nota alta = clique mais barato.' },
  { g: 'Busca', n: 'Parcela de impressões', f: 'impressões recebidas ÷ possíveis', por: 'Quanto da procura a Santé está pegando.' },
  { g: 'Custo', n: 'CPC', f: 'gasto ÷ cliques', por: 'Preço de cada visita ao site ou ao WhatsApp.' },
  { g: 'Custo', n: 'Custo por conversa / CPL', f: 'gasto ÷ conversas ou leads', por: 'Indicador principal de cada canal, comparado às metas do plano.' },
  { g: 'Custo', n: 'Custo por visita', f: 'gasto ÷ visitas agendadas que aconteceram', por: 'Junta anúncio e atendimento; o melhor comparador entre canais.' },
  { g: 'Custo', n: 'CAC de mídia', f: 'gasto em mídia ÷ contratos novos', por: 'Quanto a mídia custou por cliente.' },
  { g: 'Qualidade', n: '% de leads qualificados', f: 'profissional de saúde com registro e interesse ÷ leads', por: 'Lead barato que não é profissional não serve.' },
  { g: 'Qualidade', n: 'Taxa de conversão da página', f: 'cliques no WhatsApp ÷ visitas da página', por: 'Se a página convence.' },
  { g: 'Resultado', n: 'Retorno sobre a mídia', f: 'receita dos contratos do canal (3 meses) ÷ gasto do canal', por: 'Se o canal se paga; meta ≥ 3 no 6º mês.' },
  { g: 'Rastreamento', n: '% de leads com origem', f: 'leads com código ou UTM ÷ leads', por: 'Sem origem não dá para otimizar.' },
  { g: 'Orçamento', n: 'Ritmo de gasto', f: 'gasto até hoje ÷ verba do mês × dias do mês ÷ dia de hoje', por: 'Entre 0,9 e 1,1: nem sobra nem estoura.' },
]

export const rotina = [
  { f: 'Todo dia (15 min)', itens: ['Conferir se todas as campanhas estão rodando e gastando', 'Conferir reprovações de anúncio e problemas de pagamento', 'Olhar custo por conversa do dia anterior e pausar o que passou do alerta 2× seguidas', 'Conferir se as conversas estão chegando ao WhatsApp'] },
  { f: 'Toda semana (2 h)', itens: ['Relatório: gasto, leads, CPL, visitas e contratos por canal contra a meta da semana', 'Pausar os criativos piores e subir 2 novos', 'Termos de busca e palavras negativas no Google', 'Subir visitas e contratos como conversões offline', 'Reunião de 30 min às segundas com a gestão'] },
  { f: 'Todo mês', itens: ['Relatório mensal com comparação às metas do Plano de campanha', 'Redistribuir a verba para o canal com menor custo por visita', 'Atualizar públicos semelhantes com os novos clientes', 'Um teste A/B de página de destino', 'Revisar frequência e cansaço de criativos'] },
  { f: 'Todo trimestre', itens: ['Revisar a estrutura de campanhas e o padrão de nomes', 'Auditoria do rastreamento (eventos, UTMs, conversões)', 'Revisar metas do plano com os números reais', 'Testar um canal ou formato novo'] },
]

export const regras = [
  { t: 'Pausa', d: 'Anúncio ou conjunto acima do alerta por 2 avaliações seguidas é pausado.' },
  { t: 'Escala', d: 'Conjunto abaixo da meta por 7 dias recebe +20% de verba a cada 3 dias, até piorar.' },
  { t: 'Aprendizado', d: 'Não mexer em conjunto com menos de 50 conversões na semana além de verba; mudanças grandes reiniciam o aprendizado.' },
  { t: 'Teto de capacidade', d: 'Se a ocupação das salas passar de 85%, reduzir a verba e priorizar remarketing e upgrade de turno.' },
  { t: 'Sazonalidade', d: 'Seguir os pesos de cada mês do Plano de campanha: subir verba em jan, mar, ago e set; reduzir em dez, fev e jun.' },
]

export const contratacao = {
  perfil: [
    'Experiência comprovada com Meta Ads e Google Ads para negócios locais de serviço, de preferência saúde',
    'Domina Pixel, API de Conversões, GA4, Tag Manager e conversões offline',
    'Sabe trabalhar com campanhas de mensagem para WhatsApp',
    'Conhece as regras de publicidade em saúde e da LGPD',
    'Entrega relatório claro, em português simples, com recomendação',
  ],
  entregas: [
    'Fundação de rastreamento pronta antes do 1º anúncio',
    'Campanhas no ar em até 15 dias',
    'Relatório semanal (segunda) e mensal (até o 5º dia útil)',
    'Painel no Looker Studio atualizado',
    'Plano de testes do mês',
  ],
  avaliacao: [
    ['Custo por visita', 'dentro da meta do plano em 3 meses'],
    ['% de leads com origem', '≥ 90%'],
    ['Leads e contratos por canal', '≥ 70% da meta do mês'],
    ['Relatórios no prazo', '100%'],
    ['Testes rodados por mês', '≥ 2'],
  ],
  custo: 'Gestor de tráfego freelancer ou agência pequena cobra por mês, fora a verba de mídia. Pedir 3 propostas em Maceió com cases de negócios locais e acesso às contas sempre em nome da Santé.',
}
