// Conteúdo do Plano de campanha de 12 meses: público, redes sociais, outros canais e indicadores.
// Base: Social Media Guide da E-Commerce Nation (edições 2021, 2022 e 2023, em docs/) atualizado com
// dados do Brasil (DataReportal out/2025, TIC Domicílios 2025) e de Maceió (IBGE, CFP, CFM).
// Números de mercado mudam: confira as fontes antes de usar fora daqui.

export const mercado = [
  { v: '994.952', t: 'habitantes em Maceió', d: 'Estimativa IBGE de jul/2025. Região metropolitana: 1,35 milhão.', f: 'ibge' },
  { v: '7.348', t: 'psicólogos inscritos no CRP-15', d: 'Alagoas inteiro, com forte concentração na capital. 84% são mulheres.', f: 'cfp' },
  { v: '≈ 3,9 mil', t: 'médicos em Maceió', d: '84% dos médicos de Alagoas moram na capital (CFM). O estado tem 38% menos médicos por habitante que a média do país.', f: 'cfm' },
  { v: '5+', t: 'faculdades com cursos de saúde', d: 'UFAL, UNCISAL, CESMAC, Unit e Estácio formam psicólogos, nutricionistas, fisioterapeutas e médicos todo semestre.', f: 'ies' },
  { v: '85%', t: 'dos brasileiros com 10+ anos usam internet', d: '99% pelo celular e 65% só pelo celular. 92% mandam mensagem instantânea e 81% usam redes sociais.', f: 'tic' },
  { v: '147 mi', t: 'pessoas alcançáveis no Instagram', d: '69% da população, +8% em um ano. O Facebook alcança 109 mi (−1,3%). Adultos: 57% mulheres no Instagram.', f: 'dr' },
]

// Quem pode alugar as salas (público amplo). prio: 1 alta, 2 média, 3 baixa
export const segmentos = [
  {
    id: 'psi', nome: 'Psicólogos e neuropsicólogos', prio: 1, produto: 'Hora avulsa, pacote de horas e turno noturno',
    porque: 'Maior grupo de saúde em Alagoas (7,3 mil inscritos) e o que mais aluga por hora. Muitos atendem online e querem alguns pacientes presenciais.',
    precisa: 'Sigilo, isolamento acústico, sala acolhedora, horário à noite e no sábado.',
    mensagem: '“Sala pronta e silenciosa na Jatiúca, por hora, inclusive à noite.”',
    onde: 'Instagram, grupos de WhatsApp de supervisão e pós, CRP-15, faculdades',
  },
  {
    id: 'med', nome: 'Médicos especialistas', prio: 1, produto: 'Turno fixo semanal com recepção',
    porque: 'Cerca de 3,9 mil médicos em Maceió. Quem dá plantão ou trabalha em hospital quer 1 ou 2 turnos de consultório particular por semana sem montar estrutura.',
    precisa: 'Recepção, localização fácil, estacionamento, imagem profissional, contrato simples.',
    mensagem: '“Seu consultório particular em 1 turno por semana, com recepção e sem custo fixo.”',
    onde: 'LinkedIn, Instagram, indicação de colegas, hospitais e laboratórios próximos, CRM-AL',
  },
  {
    id: 'nutri', nome: 'Nutricionistas', prio: 2, produto: 'Pacote de horas',
    porque: 'Consultas curtas e retornos espaçados: encaixam no pacote de horas. Precisam de endereço com boa imagem para crescer no Instagram.',
    precisa: 'Balança, bioimpedância, boa iluminação para conteúdo, horário flexível.',
    mensagem: '“Atenda com cara de clínica desde a primeira consulta.”',
    onde: 'Instagram, TikTok, Pinterest, academias parceiras, CRN-6',
  },
  {
    id: 'fisio', nome: 'Fisioterapeutas e educadores físicos', prio: 1, produto: 'Turno de piscina e sala por turno',
    porque: 'A piscina da Santé é o único espaço aquático entre os concorrentes mapeados. Hidroterapia, reabilitação e hidroginástica para idosos e gestantes.',
    precisa: 'Piscina aquecida por turno, acessibilidade, estacionamento para o paciente.',
    mensagem: '“Piscina aquecida por turno para os seus pacientes.”',
    onde: 'Instagram, YouTube, clínicas ortopédicas, grupos de especialização, CREFITO',
  },
  {
    id: 'infantil', nome: 'Fono, TO e psicopedagogos (infantil e TEA)', prio: 2, produto: 'Sala por turno no fim da tarde',
    porque: 'Procura alta por atendimento a crianças com TEA, com encaminhamento de escolas e pediatras. A agenda se concentra depois da escola.',
    precisa: 'Sala com tapete e mesa baixa, sala de espera para os pais, estacionamento.',
    mensagem: '“Uma sala preparada para atender crianças, por turno.”',
    onde: 'Instagram, grupos de mães, escolas, pediatras, associações de TEA',
  },
  {
    id: 'odonto', nome: 'Outros: dermato estética, terapias integrativas, fonoaudiologia adulta', prio: 3, produto: 'Hora ou turno',
    porque: 'Profissionais que atendem poucos dias por semana e não querem sala própria. Confirmar, caso a caso, se a sala atende às normas da atividade (vigilância sanitária).',
    precisa: 'Sala limpa e bem localizada, agenda flexível.',
    mensagem: '“Atenda na Jatiúca só nos dias em que tiver pacientes.”',
    onde: 'Instagram, Google, indicação',
  },
  {
    id: 'novo', nome: 'Recém-formados de todas as áreas', prio: 2, produto: 'Pacote Start e 1ª hora grátis',
    porque: 'Ainda não têm consultório. Estratégia própria na página “Primeiro Consultório”.',
    precisa: 'Preço de entrada baixo, ajuda para ter pacientes, comunidade.',
    mensagem: '“Seu primeiro consultório na Jatiúca, sem fiador e sem aluguel fixo.”',
    onde: 'Ver página Estratégia: recém-formados',
  },
  {
    id: 'adm', nome: 'Coworking administrativo', prio: 3, produto: 'Posição mensal (15 livres)',
    porque: 'Gestores de clínicas, contadores e empresas de saúde que precisam de mesa e endereço perto dos clientes.',
    precisa: 'Internet boa, endereço comercial, sala de reunião.',
    mensagem: '“Sua mesa de trabalho dentro de um centro de saúde.”',
    onde: 'LinkedIn, Google, indicação dos profissionais da casa',
  },
]

// Ponto de partida da Santé (coleta de nov/2026 e cadastro)
export const pontoPartida = [
  { t: 'Instagram', d: '7.215 seguidores, mas só 24 posts. Base boa, pouco conteúdo: o primeiro ganho é publicar com frequência.' },
  { t: 'Facebook', d: 'A página antiga (clinicasantemaceio) não abre. É preciso recuperar ou criar a página e ligá-la ao Instagram no Gerenciador de Negócios.' },
  { t: 'YouTube e TikTok', d: 'Sem canal. Os vídeos do Instagram podem ser reaproveitados sem custo.' },
  { t: 'Google', d: 'Rever a categoria do Perfil da Empresa e as fotos; medir a posição nas buscas do Maps (ver Análise de mercado).' },
  { t: 'Horário', d: 'O site divulga seg–sex 8h–18h, mas o cadastro de turnos já tem noite (19h–22h). Se o turno da noite já vale, divulgar: NutriClin (24 h) e Elleva (até 23h) usam o horário como argumento.' },
  { t: 'Preço', d: 'Hora R$ 50 a R$ 70, turno R$ 120 a R$ 200, piscina R$ 330 o turno. Concorrentes divulgam a partir de R$ 30 a R$ 35 por hora.' },
]

// Redes sociais: o que o guia diz (global) + Brasil hoje + como a Santé usa + métricas.
// Os números "guia" são da edição 2023 (e 2021/2022 quando indicado). "brasil" = DataReportal out/2025.
export const redes = [
  {
    id: 'instagram', n: 'Instagram', prio: 1, destaque: true, papel: 'Vitrine principal, anúncios e prova social',
    guia: {
      numeros: ['2 bilhões de usuários ativos por mês (+35% em 2023)', '25% da população mundial', '48% mulheres e 52% homens; maior grupo: homens de 18 a 24 anos', 'Edição 2021: 71% dos usuários têm menos de 35 anos e 90% seguem marcas'],
      objetivos: ['Criar um universo visual em torno da marca', 'Mostrar produtos e serviços com visuais atraentes', 'Criar vínculo com um público jovem', 'Mostrar os bastidores da empresa', 'Trabalhar com influenciadores'],
      dicas: ['Ser autêntico e espontâneo em stories, Reels e lives', 'Ter identidade visual forte e coerente', 'Usar influenciadores para chegar a comunidades', 'Fotos de alta qualidade', 'Hashtags relevantes (o guia de 2021 indicava 7 a 10)'],
      quando: 'Segunda e quinta (edição 2021)',
      ferramentas: 'Instagram Business, Shopping, CapCut, InShot, Mojo, Favikon (busca de influenciadores)',
    },
    brasil: ['147 milhões de pessoas alcançáveis por anúncio (69% da população), +8% em 12 meses', '57% do público adulto é feminino: combina com a psicologia, a nutrição e a fono', 'Segunda rede em alcance no país, atrás só do YouTube'],
    hoje: ['Reels pesam mais que fotos no alcance de quem não segue a conta', 'Carrosséis rendem salvamentos e compartilhamentos, que contam muito para o algoritmo', '3 a 5 hashtags específicas bastam; palavras-chave na legenda e no nome do perfil ajudam na busca', 'Collab (post em conjunto) com o profissional da casa leva o post para os seguidores dele'],
    estrategia: [
      'Perfil: nome com palavra-chave (“Santé · Consultórios por hora em Maceió”), bio com a oferta, botão de WhatsApp com mensagem pronta e código #IG.',
      'Destaques fixos: Salas, Piscina, Preços e pacotes, Como funciona, Profissionais da casa, Localização.',
      'Linha editorial por público: semana com tema para psicologia, outra para nutrição, outra para fisioterapia e piscina, outra para médicos.',
      'Collab com cada profissional que fecha contrato: post de boas-vindas no perfil da Santé e no dele.',
      'Stories diários com “horários livres hoje à noite” e enquetes. Canal de transmissão para os profissionais da casa.',
      'Anúncios: objetivo “mensagens no WhatsApp”, raio de 10 km da Jatiúca, 24 a 55 anos, criativos que chamam a profissão no primeiro segundo (“Psicóloga em Maceió?”).',
      'Remarketing para quem viu 50% dos vídeos ou visitou o perfil, com convite para conhecer a Santé.',
    ],
    formatos: [
      ['Reels', '9:16 · 1080×1920 · até 3 min (anúncio: 15 a 30 s funciona melhor)'],
      ['Feed e carrossel', '4:5 · 1080×1350 (retrato ocupa mais tela) ou 1:1 · 1080×1080, até 20 cartões'],
      ['Stories', '9:16 · 1080×1920 · até 60 s por cartão'],
      ['Foto de perfil', '320×320 (aparece em círculo)'],
    ],
    frequencia: '3 Reels + 2 carrosséis por semana, stories todo dia',
    horario: 'Seg a sex 12h–13h e 19h–21h; sábado de manhã. Confirmar no Insights da conta depois de 30 dias.',
    conteudo: ['Tour das salas e da piscina', 'Um dia de atendimento com um profissional da casa', '“Quanto custa ter consultório?”: comparação aluguel fixo × por hora', 'Dicas de carreira (CNPJ, preço da consulta, prontuário)', 'Depoimentos dos profissionais', 'Horários livres da semana'],
    kpis: [
      { n: 'Seguidores', meta: '≈ 9,9 mil no 12º mês', fonte: 'modelo' },
      { n: 'Alcance mensal', meta: '≥ 25 mil contas a partir do 4º mês', fonte: 'modelo' },
      { n: 'Alcance de não seguidores', meta: '≥ 50% do alcance dos Reels', fonte: 'Insights' },
      { n: 'Taxa de engajamento por post', meta: '≥ 3% (curtidas + comentários + salvamentos + compartilhamentos ÷ alcance)', fonte: 'Insights' },
      { n: 'Conversas iniciadas', meta: 'ver tabela mês a mês', fonte: 'modelo' },
      { n: 'Custo por conversa', meta: '≤ R$ 18 a partir do 4º mês; alerta acima de R$ 30', fonte: 'Gerenciador' },
    ],
  },
  {
    id: 'facebook', n: 'Facebook', prio: 1, destaque: true, papel: 'Anúncios mais baratos, grupos profissionais e público acima de 35 anos',
    guia: {
      numeros: ['2,96 bilhões de usuários por mês (+1,58% em 2023)', '37% da população mundial', '43% mulheres e 57% homens; maior grupo: homens de 25 a 34', '1,8 bilhão usam grupos; 50% das pequenas empresas estão no Facebook', 'Edição 2022: 79% entram todo dia'],
      objetivos: ['Criar comunidade e fidelizar', 'Ter um canal de vendas a mais', 'Destacar produtos e serviços', 'Fazer campanhas segmentadas com a rede de anúncios'],
      dicas: ['Conteúdo visual: o vídeo é o formato mais compartilhado', 'Mensagens curtas, de impacto, que provocam reação', 'Usar os anúncios: o alcance orgânico é cada vez menor', 'Usar lives para marcar encontros com a comunidade'],
      quando: 'Segunda, sexta, sábado e domingo (edição 2021)',
      ferramentas: 'Gerenciador de Anúncios, Meta Business Suite, Insights, Pixel da Meta, Meta Foresight',
    },
    brasil: ['109 milhões de pessoas alcançáveis (51% da população, 67% dos adultos), −1,3% em 12 meses', '54% do público adulto é feminino', 'Ainda é onde estão os profissionais com mais de 35 anos, que já têm agenda cheia e podem querer um segundo endereço'],
    hoje: ['Os anúncios saem junto com os do Instagram (Advantage+); o CPM costuma ser menor', 'Grupos profissionais e de bairro continuam ativos e geram indicação', 'Reels também aparecem no Facebook'],
    estrategia: [
      'Recuperar ou criar a página, com as mesmas fotos, horário e WhatsApp do Instagram; ligar ao Instagram e ao Pixel.',
      'Publicar os mesmos Reels e carrosséis do Instagram (sem custo extra) e responder comentários e mensagens em até 1 hora.',
      'Participar dos grupos de psicólogos, nutricionistas, fisioterapeutas e médicos de Alagoas como gestor da Santé: ajudar, não só anunciar.',
      'Anúncios com 40% da verba Meta, público de 30 a 60 anos, mensagem de “segundo endereço” e “sair do aluguel fixo”.',
      'Evento do Facebook para cada open house e workshop.',
      'Pedir recomendações (avaliações) na página aos profissionais da casa.',
    ],
    formatos: [
      ['Reels', '9:16 · 1080×1920'],
      ['Feed', '4:5 · 1080×1350 ou 1:1 · 1080×1080; link: 1200×630'],
      ['Stories', '9:16 · 1080×1920'],
      ['Capa da página', '851×315 (no celular aparece cortada nas laterais)'],
    ],
    frequencia: '3 posts por semana (os mesmos do Instagram) e 2 participações por semana em grupos',
    horario: 'Seg a sex 12h–14h e 18h–20h; sábado e domingo de manhã',
    conteudo: ['Os mesmos Reels e carrosséis do Instagram', 'Eventos (open house, workshop)', 'Vagas de turno da semana', 'Post longo do gestor sobre empreender na saúde'],
    kpis: [
      { n: 'Alcance pago mensal', meta: '≥ 20 mil pessoas a partir do 4º mês', fonte: 'modelo' },
      { n: 'Conversas iniciadas', meta: 'ver tabela mês a mês', fonte: 'modelo' },
      { n: 'CTR do anúncio', meta: '≥ 1%; alerta abaixo de 0,5%', fonte: 'Gerenciador' },
      { n: 'CPM', meta: '≤ R$ 15; alerta acima de R$ 30', fonte: 'Gerenciador' },
      { n: 'Leads vindos de grupos', meta: '≥ 3 por mês', fonte: 'etiqueta #FB no WhatsApp' },
      { n: 'Recomendações na página', meta: '≥ 10 em 6 meses', fonte: 'Página' },
    ],
  },
  {
    id: 'whatsapp', n: 'WhatsApp Business', prio: 1, papel: 'Onde a locação fecha',
    guia: {
      numeros: ['2 bilhões de usuários por mês', '100 bilhões de mensagens por dia (edição 2022)'],
      objetivos: ['Ficar perto do cliente', 'Usar como plataforma de atendimento', 'Responder mais rápido e personalizar a conversa', 'Divulgar novidades e mostrar serviços'],
      dicas: ['Perfil completo: nome, logo, endereço, horário', 'Catálogo com os serviços', 'Status para novidades (dura 24 h)', 'Segmentar a lista de contatos', 'Ofertas personalizadas para os clientes fiéis'],
      quando: 'Responder na hora; Status todo dia útil',
      ferramentas: 'WhatsApp Business, catálogo, etiquetas, respostas rápidas, mensagem de ausência',
    },
    brasil: ['Sem número oficial de usuários, mas 92% dos usuários de internet mandam mensagens instantâneas (TIC 2025)', 'Está na tela inicial de 65% dos celulares (Mobile Time, 2026)', 'Todos os anúncios da campanha terminam aqui'],
    hoje: ['Anúncios “clique para o WhatsApp” são o formato mais usado por serviços locais', 'Canais e comunidades para grupos fechados'],
    estrategia: [
      'Catálogo com a escada de preços: hora, pacote, turno, piscina, sala mensal e coworking.',
      'Etiquetas por etapa (novo lead, qualificado, visita marcada, fechou, perdido) e por canal (#IG, #FB, #GOO, #TT, #IND, #EVT, #TRAD).',
      'Roteiro: pergunta a profissão e o registro, oferece horários de visita em até 48 h, envia localização e fotos.',
      'Follow-up em 1, 3 e 7 dias para quem não marcou visita.',
      'Comunidade “Profissionais da Santé” para avisar horários livres e eventos.',
    ],
    formatos: [['Catálogo', 'Foto 1:1 de cada serviço e preço'], ['Status', '9:16, mesmos vídeos dos stories']],
    frequencia: 'Resposta em até 5 minutos no horário comercial; Status diário',
    horario: 'Atendimento até 21h nos dias com turno da noite',
    conteudo: ['Fotos das salas', 'Vídeo de 30 s do tour', 'Localização e estacionamento', 'Tabela de preços'],
    kpis: [
      { n: 'Tempo da 1ª resposta', meta: '≤ 5 min; alerta acima de 30 min', fonte: 'WhatsApp Business' },
      { n: 'Lead qualificado → visita', meta: '22% no início, 28% a partir do 7º mês', fonte: 'modelo' },
      { n: 'Leads sem resposta', meta: '0', fonte: 'etiquetas' },
    ],
  },
  {
    id: 'google', n: 'Google (Perfil da Empresa, Ads e site)', prio: 1, papel: 'Captar quem já está procurando sala',
    guia: null,
    brasil: ['O Google é onde o profissional pesquisa “aluguel de consultório” quando já decidiu', 'A Análise de mercado mostra em que posição a Santé aparece no Maps'],
    hoje: ['Avaliações recentes e fotos pesam na posição do Maps', 'Anúncios de busca cobram por clique; palavras de cauda longa custam menos'],
    estrategia: [
      'Perfil da Empresa: categoria “Centro de saúde” ou “Espaço de coworking”, serviços com preço, 30+ fotos, post semanal, perguntas e respostas.',
      'Pedir avaliação a cada profissional que completa 30 dias.',
      'Google Ads de busca: “consultório por hora Maceió”, “sala para psicólogo Maceió”, “aluguel de consultório Jatiúca”, “piscina para hidroterapia Maceió”.',
      'Site: página de destino por público, com preços, fotos e botão de WhatsApp com código #GOO; Google Analytics 4 e Search Console.',
    ],
    formatos: [['Fotos do Perfil', '720×720 ou maiores, boa luz'], ['Anúncio de busca', '15 títulos e 4 descrições por grupo']],
    frequencia: '1 post por semana no Perfil; revisão semanal dos termos de busca',
    horario: 'Anúncios de seg a sáb, 7h–22h',
    conteudo: ['Fotos de cada sala', 'Ofertas do mês', 'Eventos'],
    kpis: [
      { n: 'Avaliações novas', meta: '3 por mês no início, 5 por mês depois (≈ 52 em 12 meses)', fonte: 'modelo' },
      { n: 'Ligações + rotas + cliques no site', meta: 'crescer 10% ao mês', fonte: 'Perfil da Empresa' },
      { n: 'CPL do Google Ads', meta: '≤ R$ 28 a partir do 5º mês; alerta acima de R$ 45', fonte: 'Google Ads' },
      { n: 'Posição no Maps', meta: 'Top 3 nas 4 buscas-alvo em 6 meses', fonte: 'Análise de mercado' },
    ],
  },
  {
    id: 'youtube', n: 'YouTube (Shorts e vídeos)', prio: 2, papel: 'Busca de longo prazo e prova da estrutura',
    guia: {
      numeros: ['2,51 bilhões de usuários (31% da população)', '46% mulheres e 54% homens; maior grupo: homens de 25 a 34', '46 minutos por dia em média', '9 em 10 pessoas descobrem marcas pelo YouTube'],
      objetivos: ['Desenvolver o universo da marca', 'Encontrar novos clientes', 'Dar outra dimensão aos produtos', 'Humanizar a marca'],
      dicas: ['Investir em bom equipamento de gravação', 'Identidade visual forte', 'Playlists e colaboração com criadores', 'Trabalhar palavras-chave, títulos e descrições (SEO)'],
      quando: 'Sábado e domingo, 21h–23h (edição 2021)',
      ferramentas: 'YouTube Studio, TubeBuddy, VidIQ, KineMaster, Filmora',
    },
    brasil: ['150 milhões de pessoas alcançáveis: a maior rede do país em alcance (70% da população)', '52% do público adulto é feminino'],
    hoje: ['Shorts (9:16, até 3 min) reaproveitam os Reels', 'Vídeos longos aparecem na busca do Google'],
    estrategia: [
      'Criar o canal “Santé Consultórios” e subir os Reels como Shorts.',
      'Um vídeo longo por mês: tour completo, gravação do workshop, entrevista com profissional da casa.',
      'Títulos com o que as pessoas buscam: “Como abrir consultório de psicologia em Maceió”, “Quanto custa alugar consultório por hora”.',
    ],
    formatos: [['Shorts', '9:16 · 1080×1920'], ['Vídeo', '16:9 · 1920×1080; miniatura 1280×720']],
    frequencia: '3 Shorts por semana (reaproveitados) e 1 vídeo longo por mês',
    horario: 'Publicar à tarde; o pico de consumo é à noite e no fim de semana',
    conteudo: ['Tour', 'Workshops', 'Entrevistas', 'Perguntas frequentes'],
    kpis: [
      { n: 'Visualizações por mês', meta: '≥ 3 mil a partir do 6º mês', fonte: 'YouTube Studio' },
      { n: 'Inscritos', meta: '≥ 300 em 12 meses', fonte: 'YouTube Studio' },
    ],
  },
  {
    id: 'tiktok', n: 'TikTok', prio: 2, papel: 'Alcance barato entre profissionais de 20 a 35 anos',
    guia: {
      numeros: ['1,05 bilhão de usuários (13% da população)', '54% mulheres e 46% homens; maior grupo: 18 a 24 anos', '95 minutos por dia em média', 'Millennials marcam marcas 2,3× mais que em outras redes'],
      objetivos: ['Alcançar público jovem', 'Criar desafios para viralizar', 'Fazer conteúdo nas tendências', 'Humor', 'Aproveitar o alto engajamento'],
      dicas: ['Usar os efeitos e filtros', 'Criar tendências e desafios', 'Não se levar a sério demais', 'Seguir músicas e hashtags em alta', 'Interagir com influenciadores'],
      quando: 'Todos os dias, depois do horário escolar (edição 2021)',
      ferramentas: 'TikTok for Business, TikTok Analytics, CapCut, Spark Ads',
    },
    brasil: ['131 milhões de adultos alcançáveis (80% dos adultos), +17,6% em um ano: a rede que mais cresce', 'Público adulto: 59% homens e 41% mulheres'],
    hoje: ['Spark Ads impulsiona um vídeo orgânico que já funcionou, com o perfil da Santé', 'Vídeos de 20 a 40 s com gancho nos 2 primeiros segundos'],
    estrategia: [
      'Começar no 2º mês com os mesmos vídeos do Instagram, ajustados à linguagem da rede.',
      'Séries: “meu primeiro consultório”, “um dia na Santé”, “erros de quem começa a atender”.',
      'Impulsionar com Spark Ads, a partir do 4º mês, os vídeos que passarem de 40% de retenção.',
    ],
    formatos: [['Vídeo', '9:16 · 1080×1920 · até 10 min (ideal 20 a 40 s)']],
    frequencia: '3 a 5 vídeos por semana',
    horario: '12h e 19h–22h',
    conteudo: ['Bastidores', 'Humor leve sobre a rotina do profissional de saúde', 'Antes e depois da sala montada'],
    kpis: [
      { n: 'Retenção média', meta: '≥ 40% do vídeo assistido', fonte: 'TikTok Analytics' },
      { n: 'Seguidores', meta: '≥ 1.000 em 12 meses', fonte: 'TikTok Analytics' },
      { n: 'CPL (Spark Ads)', meta: '≤ R$ 24; alerta acima de R$ 40', fonte: 'TikTok Ads' },
    ],
  },
  {
    id: 'linkedin', n: 'LinkedIn', prio: 2, papel: 'Médicos, gestores, coworking e faculdades',
    guia: {
      numeros: ['900 milhões de usuários (11% da população)', '44% mulheres e 56% homens; maior grupo: 25 a 34 anos', 'Edição 2022: 40% entram todo dia', '“Hospital e saúde” está entre os setores que mais usam'],
      objetivos: ['Fazer prospecção e ampliar a rede', 'Marca pessoal e colaboradores como embaixadores', 'Mostrar experiência no setor', 'Dar visibilidade à empresa'],
      dicas: ['3 a 5 hashtags', 'Conteúdo visual: imagem, vídeo e PDF (carrossel)', 'Storytelling', 'Caprichar nas 3 primeiras linhas', 'Marcar as pessoas citadas', 'Publicar várias vezes por semana'],
      quando: 'Segunda a sexta, em horário comercial',
      ferramentas: 'Página da empresa, Sales Navigator, Campaign Manager',
    },
    brasil: ['90 milhões de membros (55% dos adultos), +15% em um ano', 'Anúncios caros para o tamanho da Santé: usar orgânico'],
    hoje: ['Posts do perfil pessoal do gestor alcançam muito mais que os da página da empresa', 'Carrossel em PDF continua forte'],
    estrategia: [
      'Página da Santé e perfil do gestor ativos; o gestor publica sobre empreender na saúde em Maceió.',
      'Conectar com médicos, coordenadores de curso e gestores de clínicas da região; mensagem direta só depois de interagir.',
      'Oferecer o coworking administrativo para contadores e empresas de saúde.',
    ],
    formatos: [['Post', '1200×1200 ou carrossel em PDF 1080×1350'], ['Capa da página', '1128×191']],
    frequencia: '2 posts por semana (perfil do gestor) e 1 na página',
    horario: 'Ter a qui, 8h–10h e 12h–13h',
    conteudo: ['Bastidores de gestão', 'Números do mercado de saúde de Maceió', 'Profissionais da casa'],
    kpis: [
      { n: 'Reuniões com médicos, faculdades e empresas', meta: '≥ 2 por mês', fonte: 'agenda' },
      { n: 'Seguidores da página', meta: '≥ 300 em 12 meses', fonte: 'LinkedIn' },
    ],
  },
  {
    id: 'pinterest', n: 'Pinterest', prio: 3, papel: 'Inspiração de consultório (nutrição, psicologia, estética)',
    guia: {
      numeros: ['450 milhões de usuários; 76% mulheres', '97% das buscas não têm nome de marca', 'Edição 2021: 38% têm mais de 50 anos e 55% usam para comprar'],
      objetivos: ['Mostrar produtos e ganhar visibilidade', 'Gerar tráfego para o site e melhorar o SEO', 'Gerar leads'],
      dicas: ['Palavras-chave nas pastas', 'Imagens em alta definição', 'Pastas colaborativas', 'Fixar conteúdo com regularidade'],
      quando: 'Sábado e domingo, fim do dia (edição 2021)',
      ferramentas: 'Pinterest Business, Canva, Tailwind',
    },
    brasil: ['42 milhões de pessoas alcançáveis; 67% do público adulto é feminino'],
    hoje: ['Pins verticais 2:3 levam para o site'],
    estrategia: ['Pastas “Consultório de psicologia”, “Consultório de nutrição”, “Sala infantil” com fotos da Santé e link para o site.'],
    formatos: [['Pin', '2:3 · 1000×1500']],
    frequencia: '5 pins por semana, reaproveitando fotos',
    horario: 'Fim do dia e fim de semana',
    conteudo: ['Fotos das salas', 'Ideias de decoração de consultório'],
    kpis: [{ n: 'Cliques para o site', meta: '≥ 50 por mês a partir do 6º mês', fonte: 'Pinterest Analytics' }],
  },
  {
    id: 'threads', n: 'Threads', prio: 3, papel: 'Extensão gratuita do Instagram', guia: null,
    brasil: ['Usa a mesma conta do Instagram; sem número oficial de usuários no Brasil'],
    hoje: ['Bom para conversas curtas e perguntas'],
    estrategia: ['Repostar dicas curtas e responder dúvidas de profissionais.'],
    formatos: [['Texto', 'até 500 caracteres, com imagem opcional']],
    frequencia: '3 por semana', horario: 'Qualquer horário', conteudo: ['Dicas', 'Enquetes'],
    kpis: [{ n: 'Respostas', meta: 'acompanhar', fonte: 'Threads' }],
  },
  {
    id: 'x', n: 'X (Twitter)', prio: 4, papel: 'Só monitorar',
    guia: {
      numeros: ['556 milhões de usuários; 37% mulheres', '38,5% têm de 25 a 34 anos; 40% entram todo dia'],
      objetivos: ['Monitorar a reputação', 'Reagir às notícias', 'Humanizar a marca'],
      dicas: ['Atendimento ao cliente', 'Pouca publicidade direta', 'Humor'],
      quando: 'Seg a sex, de manhã e no fim do dia (edição 2021)',
      ferramentas: 'X Pro (TweetDeck), Buffer',
    },
    brasil: ['17 milhões de pessoas alcançáveis, −19% em um ano; público 60% masculino'],
    hoje: ['Pouco uso local pelos profissionais de saúde'],
    estrategia: ['Não publicar. Só acompanhar menções à Santé.'],
    formatos: [], frequencia: '—', horario: '—', conteudo: [], kpis: [],
  },
  {
    id: 'outras', n: 'Snapchat, Twitch, Discord, Kwai, Telegram', prio: 4, papel: 'Não usar agora',
    guia: {
      numeros: ['Snapchat: público de 13 a 24 anos, realidade aumentada', 'Twitch: 16 a 34 anos, transmissões ao vivo de jogos', 'Discord: comunidades, 42% de 25 a 34 anos'],
      objetivos: ['Público jovem e de nicho'], dicas: ['Exigem conteúdo próprio e frequente'], quando: '—', ferramentas: '—',
    },
    brasil: ['Snapchat: 6 milhões (−12%)', 'Kwai: 60 milhões de usuários informados pela empresa, público popular e do interior', 'Telegram: grupos de estudo de residência e concursos'],
    hoje: ['Pouca presença de profissionais de saúde em busca de sala'],
    estrategia: ['Não abrir perfil. No Telegram, só divulgar workshops gratuitos em grupos que aceitam esse tipo de aviso.'],
    formatos: [], frequencia: '—', horario: '—', conteudo: [], kpis: [],
  },
]

// Canais além das redes sociais, incluindo os tradicionais
export const outrosCanais = [
  { g: 'Relacionamento', n: 'Indicação dos profissionais da casa', prio: 1, como: 'Cada indicação que fechar dá 2 h grátis a quem indicou e 1 h ao indicado. Código #IND no WhatsApp.', custo: 'Horas cedidas', kpi: '≥ 1 lead indicado a cada 20 clientes ativos por mês' },
  { g: 'Relacionamento', n: 'Open house e workshops na Santé', prio: 1, como: 'Um evento por mês: café, tour, palestra (CNPJ, preço da consulta, marketing ético, prontuário eletrônico). Inscrição pelo WhatsApp.', custo: 'R$ 300 a R$ 400 por evento', kpi: '≥ 15 inscritos e ≥ 6 leads por evento' },
  { g: 'Relacionamento', n: 'Faculdades (UFAL, UNCISAL, CESMAC, Unit, Estácio)', prio: 1, como: 'Palestra “Como abrir seu consultório” no último ano; apoio a ligas acadêmicas e formaturas; mural e folheto nas clínicas-escola.', custo: 'Impressos e brindes', kpi: '≥ 1 palestra por mês nos semestres letivos' },
  { g: 'Relacionamento', n: 'Conselhos e associações (CRP-15, CRM-AL, CRN-6, CREFITO, CRO-AL)', prio: 2, como: 'Apoiar eventos e cursos, oferecer a sala para reuniões e encontros de comissões, anunciar em informativos quando permitido.', custo: 'Apoio a eventos', kpi: '≥ 1 ação por trimestre' },
  { g: 'Relacionamento', n: 'Clínicas, hospitais e laboratórios da Jatiúca e Ponta Verde', prio: 2, como: 'Visita do gestor com folheto e convite para conhecer; parceria de encaminhamento para profissionais que precisam de sala extra.', custo: 'Tempo do gestor', kpi: '≥ 4 visitas por mês' },
  { g: 'Relacionamento', n: 'Contadores e assessorias de profissionais de saúde', prio: 2, como: 'Eles atendem quem está abrindo CNPJ. Parceria com comissão ou workshop conjunto.', custo: 'Comissão por contrato', kpi: '≥ 2 parceiros ativos' },
  { g: 'Plataformas', n: 'Doctoralia e agendas on-line', prio: 3, como: 'Orientar os profissionais da casa a usar o endereço da Santé nos perfis: mais pacientes para eles e mais visibilidade para a Santé.', custo: 'Gratuito para a Santé', kpi: 'Nº de perfis com o endereço da Santé' },
  { g: 'Digital', n: 'E-mail marketing', prio: 3, como: 'Newsletter mensal para quem visitou ou foi a eventos: horários livres, eventos e novidades. Só com consentimento (LGPD).', custo: 'Gratuito até poucos contatos', kpi: 'Abertura ≥ 35%, cliques ≥ 4%' },
  { g: 'Tradicional', n: 'Folhetos e displays', prio: 2, como: 'Em faculdades, laboratórios, farmácias de manipulação e lojas de equipamentos de saúde. QR code com código #TRAD.', custo: 'R$ 150 a R$ 250 por mês', kpi: 'Leads com #TRAD' },
  { g: 'Tradicional', n: 'Mídia em elevadores e TVs de prédios comerciais e médicos', prio: 3, como: 'Prédios comerciais da Jatiúca, Ponta Verde e Farol onde estão consultórios. Testar 1 mês e medir pelo QR code.', custo: 'Pedir tabela local', kpi: 'Leads com código próprio' },
  { g: 'Tradicional', n: 'Rádio e jornal locais', prio: 4, como: 'Entrevista ou nota sobre a piscina e o modelo de consultório compartilhado (assessoria de imprensa, sem custo). Anúncio pago não compensa para este público.', custo: 'Gratuito (pauta)', kpi: 'Matérias publicadas' },
  { g: 'Tradicional', n: 'Fachada, placa e sinalização', prio: 2, como: 'Placa visível na rua com “Consultórios por hora” e telefone; banner no dia de open house.', custo: 'Pontual', kpi: 'Leads que dizem “passei na frente”' },
  { g: 'Tradicional', n: 'Congressos e feiras de saúde em Maceió', prio: 3, como: 'Estande dividido com parceiros ou só panfletagem autorizada; sorteio de horas grátis.', custo: 'Variável', kpi: 'Leads por evento' },
]

// Indicadores do plano: definição, fórmula, onde medir e frequência
export const indicadores = [
  { g: 'Alcance', n: 'Alcance e impressões', f: 'pessoas que viram × vezes que viram', onde: 'Meta, TikTok, Google', freq: 'Semanal' },
  { g: 'Alcance', n: 'CPM', f: 'gasto ÷ impressões × 1.000', onde: 'Gerenciadores', freq: 'Semanal' },
  { g: 'Alcance', n: 'Seguidores e crescimento', f: 'seguidores no fim do mês − no início', onde: 'Instagram, Facebook, TikTok, YouTube', freq: 'Mensal' },
  { g: 'Engajamento', n: 'Taxa de engajamento', f: '(curtidas + comentários + salvamentos + compartilhamentos) ÷ alcance', onde: 'Insights', freq: 'Semanal' },
  { g: 'Engajamento', n: 'CTR', f: 'cliques ÷ impressões', onde: 'Gerenciadores', freq: 'Semanal' },
  { g: 'Captação', n: 'Leads', f: 'conversas no WhatsApp e formulários, com código de canal', onde: 'WhatsApp (etiquetas)', freq: 'Semanal' },
  { g: 'Captação', n: 'Custo por lead (CPL)', f: 'gasto em mídia ÷ leads pagos', onde: 'Gerenciadores + etiquetas', freq: 'Semanal' },
  { g: 'Captação', n: '% de leads qualificados', f: 'profissionais de saúde com registro e interesse ÷ leads', onde: 'Roteiro do WhatsApp', freq: 'Semanal' },
  { g: 'Conversão', n: 'Lead → visita', f: 'visitas ÷ leads qualificados', onde: 'Planilha ou CRM', freq: 'Quinzenal' },
  { g: 'Conversão', n: 'Visita → contrato', f: 'contratos ÷ visitas', onde: 'Carteira de contratos', freq: 'Quinzenal' },
  { g: 'Conversão', n: 'CAC', f: 'investimento total ÷ contratos novos', onde: 'Esta página', freq: 'Mensal' },
  { g: 'Resultado', n: 'Clientes ativos novos', f: 'contratos novos que continuam ativos', onde: 'Carteira de contratos', freq: 'Mensal' },
  { g: 'Resultado', n: 'Ocupação das salas', f: 'horas vendidas ÷ horas disponíveis', onde: 'Painel', freq: 'Mensal' },
  { g: 'Resultado', n: 'Receita nova', f: 'receita mensal dos contratos vindos da campanha', onde: 'Comercial', freq: 'Mensal' },
  { g: 'Resultado', n: 'ROI acumulado', f: '(margem acumulada − investimento acumulado) ÷ investimento acumulado', onde: 'Esta página', freq: 'Mensal' },
  { g: 'Retenção', n: 'Churn', f: 'clientes que saíram ÷ ativos no início do mês', onde: 'Carteira de contratos', freq: 'Mensal' },
  { g: 'Retenção', n: 'NPS dos profissionais', f: '% promotores − % detratores', onde: 'Formulário trimestral', freq: 'Trimestral' },
  { g: 'Marca', n: 'Avaliações no Google', f: 'avaliações novas no mês', onde: 'Perfil da Empresa', freq: 'Mensal' },
]

export const rotina = [
  'Segunda, 30 min: leads, CPL, visitas e contratos da semana por canal. Pausar o anúncio que passar do alerta duas semanas seguidas.',
  'Todo mês: preencher leads e visitas nas campanhas de Comercial e escolher a campanha de origem em cada contrato novo.',
  'Todo mês: comparar o realizado com a tabela abaixo. Duas metas de resultado abaixo de 70% → rever oferta, criativo ou público.',
  'Se a ocupação passar de 85% das horas, reduzir a mídia e priorizar upgrade para turno fixo.',
  'Trimestral: NPS com os profissionais e revisão de preços.',
]

export const cuidados = [
  { t: 'Publicidade dos conselhos', d: 'A Santé divulga o espaço, não tratamentos. Não prometer resultado, não divulgar preço de consulta dos profissionais e seguir a Resolução CFM 2.336/2023 e os códigos do CFP, CFN, COFFITO e CFO nos posts com profissionais.' },
  { t: 'LGPD', d: 'Contato só com consentimento. Não comprar listas. Leads e contratos ficam no sistema, com acesso restrito.' },
  { t: 'Vigilância sanitária', d: 'Antes de aceitar atividades com procedimento (estética, odontologia), confirmar se a sala atende às exigências.' },
  { t: 'Impostos na Meta', d: 'Desde jan/2026 a Meta cobra PIS/Cofins e ISS (cerca de 12,15% a mais). O orçamento do plano já considera isso.' },
]

export const fontes = [
  { u: 'https://www.ecommerce-nation.com', t: 'E-Commerce Nation · Social Media Guide 2021, 2022 e 2023', d: 'PDF e imagens em docs/: público, objetivos, dicas, ferramentas e formatos de cada rede' },
  { u: 'https://datareportal.com/reports/digital-2026-brazil', t: 'DataReportal · Digital 2026: Brazil', d: 'alcance de anúncios por rede no Brasil (out/2025)', k: 'dr' },
  { u: 'https://www.cetic.br/media/docs/publicacoes/2/pt-br/20260511173151/tic_domicilios_2025_resumoexecutivo%20pt.pdf', t: 'Cetic.br · TIC Domicílios 2025', d: 'uso de internet, celular, mensagens e redes', k: 'tic' },
  { u: 'https://www.ibge.gov.br/cidades-e-estados/al/maceio.html', t: 'IBGE · Maceió', d: 'população estimada 2025', k: 'ibge' },
  { u: 'https://www2.cfp.org.br/infografico/quantos-somos/', t: 'CFP · A psicologia em números', d: 'inscritos no CRP-15', k: 'cfp' },
  { u: 'https://www.tnh1.com.br/noticia/nid/alagoas-tem-38-menos-medicos-do-que-a-media-nacional/', t: 'TNH1 · Médicos em Alagoas', d: 'médicos em Maceió e concentração na capital', k: 'cfm' },
  { u: 'https://viniensina.com.br/estatisticas-meta-ads-brasil-2026/', t: 'Meta Ads no Brasil em 2026', d: 'impostos de 12,15% sobre anúncios desde jan/2026' },
  { u: 'https://emec.mec.gov.br/', t: 'e-MEC', d: 'confirmar cursos e vagas das faculdades de Maceió', k: 'ies' },
]
