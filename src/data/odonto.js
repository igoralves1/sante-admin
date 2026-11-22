// Estudo: sala de odontologia estética na Santé (em estudo, nov/2026).
// Concorrentes vindos de busca na internet (diretórios e sites); confirmar endereço e registro no CRO-AL.

export const resumo = {
  ideia: 'Transformar uma das salas em consultório odontológico de estética, montado pela Santé (cerca de R$ 70 mil), para harmonização orofacial (HOF) e pequenas cirurgias estéticas orofaciais com anestesia local. Começar com 1 ou 2 dias por semana, de 2 a 4 turnos.',
  novidade: 'Maceió já tem aluguel de turno em consultório odontológico comum, de R$ 130 a R$ 200, na Jatiúca, no Farol, na Ponta Verde e em outros bairros. O que não encontramos foi sala montada para estética orofacial (maca reclinável, foco cirúrgico, kit de emergência) nem sala anunciada no padrão da Resolução CFO 286/2026 para cirurgia Tipo I. Esse é o espaço que a Santé pode ocupar, cobrando acima do turno comum.',
  recomendacao: 'Seguir com o modelo de aluguel por turno (A), posicionado como sala de estética e cirurgia Tipo I (não como consultório comum, que já custa R$ 130 a R$ 200 o turno na cidade). Só comprar os equipamentos depois de ter 3 dentistas com carta de intenção para pelo menos 4 turnos por semana no total, e preço de R$ 220 ou mais confirmado. Deixar a cirurgia Tipo II (com sedação) para depois do 1º ano.',
}

// Serviços que a sala pode receber
export const servicos = [
  { g: 'Harmonização orofacial (consultório)', itens: ['Toxina botulínica (rugas, bruxismo, sorriso gengival)', 'Preenchimento com ácido hialurônico (lábios, mento, olheiras, mandíbula)', 'Bioestimuladores de colágeno', 'Microagulhamento e skinbooster', 'Fios de sustentação'], status: 'Especialidade odontológica reconhecida pelo CFO (Res. 198/2019) e já feita por muitos dentistas em Maceió.' },
  { g: 'Cirurgia estética orofacial Tipo I (anestesia local, sala ≥ 9 m²)', itens: ['Bichectomia', 'Lip lift e corner lift', 'Lipoaspiração de papada (cervical e facial)', 'Elevação de sobrancelha', 'Queiloplastia'], status: 'Especialidade criada pela Res. CFO 286/2026 (mar/2026). Exige especialista registrado (3.000 h de formação ou transição para quem tem HOF e bucomaxilo). Especializações e residências já acontecem pelo país.' },
  { g: 'Cirurgia Tipo II e III (sedação ou centro cirúrgico)', itens: ['Blefaroplastia, otoplastia, lipoenxertia, platismoplastia (Tipo II)', 'Rinoplastia, ritidoplastia (Tipo III)'], status: 'Não cabe na montagem de R$ 70 mil: exige sala de 12 m² ou mais, oxigênio e vácuo canalizados, recuperação pós-anestésica, energia de emergência e, no Tipo III, centro cirúrgico.' },
  { g: 'Odontologia geral (para encher os outros dias)', itens: ['Clínica geral e prevenção', 'Clareamento e facetas', 'Manutenção de ortodontia', 'Dor orofacial e DTM'], status: 'Ajuda a ocupar a sala nos dias sem estética e é a porta de entrada dos recém-formados.' },
]

// Quem já aluga consultório odontológico em Maceió (anúncios e sites, nov/2026; vários anúncios são antigos)
export const alugueis = [
  { n: 'Turno em consultório odontológico', onde: 'Jatiúca · empresarial com portaria e estacionamento', preco: 'R$ 130 o turno avulso; R$ 500/mês por 1 turno semanal; R$ 960/mês por 2 turnos semanais', inclui: 'Consultório equipado', u: 'https://al.olx.com.br/alagoas/comercio-e-industria/alugo-turno-em-consultorio-odontologico-1430565780' },
  { n: 'Turno ou diária em consultório', onde: 'Farol', preco: 'R$ 160 o turno avulso; pacotes de 4 ou 8 turnos por mês', inclui: 'Sala de espera climatizada, wi-fi, TV e autoclave', u: 'https://al.olx.com.br/alagoas/servicos/alugo-turno-em-consultorio-odontologico-1421552928' },
  { n: 'Consultório odontológico por período', onde: 'Ponta Verde', preco: 'Sob consulta; manhã, tarde, noite ou madrugada', inclui: 'Autoclave e fotopolimerizador; sem recepcionista', u: 'https://al.olx.com.br/alagoas/imoveis/consultorio-odontologico-ponta-verde-1102187911' },
  { n: 'Consultório de alto padrão', onde: 'Mangabeiras', preco: 'Sob consulta; horários flexíveis', inclui: 'Recepção e esterilização', u: 'https://al.olx.com.br/alagoas/servicos/aluguel-de-consultorio-odontologico-1428957345' },
  { n: 'Turnos no Empresarial Delman', onde: 'Poço / Pajuçara', preco: 'Turnos diários, quinzenais e mensais', inclui: 'Consultório equipado', u: 'https://al.olx.com.br/alagoas/comercio-e-industria/aluguel-de-consultorio-odontologico-1436865146' },
  { n: 'Três consultórios equipados', onde: 'Serraria', preco: 'Sob consulta, impostos e taxas inclusos', inclui: 'Segurança 24 h', u: 'https://al.olx.com.br/alagoas/beleza-e-saude/alugo-consultorio-odontologico-1302049598' },
  { n: 'Evolution Medical Center', onde: 'Ponta Verde', preco: 'Só período integral (uso exclusivo)', inclui: 'Cadeira completa, ultrassom e raio X', u: 'https://www.chavesnamao.com.br/imovel/sala-comercial-para-alugar-al-maceio-ponta-verde-RS5500/id-44590075/' },
  { n: 'Medicine Service Coworking', onde: 'Harmony Trade Center · Jatiúca', preco: 'R$ 30/h, mínimo de 4 turnos por mês (levantamento de mercado da Santé)', inclui: 'Salas de saúde por turno, manhã, tarde e noite; não é consultório odontológico', u: 'https://medicineservice.com.br/' },
  { n: 'Busca geral no OLX', onde: 'Alagoas', preco: 'Lista atualizada de anúncios', inclui: 'Conferir quais ainda estão ativos', u: 'https://www.olx.com.br/anuncios/aluguel-consultorio-odontologico' },
]

// Concorrentes encontrados (nov/2026)
export const concorrentes = [
  { n: 'Renova Odontologia', tipo: 'Clínica odontológica com HOF', onde: 'Harmony Trade Center, sala 708 · Jatiúca', oferta: 'Odontologia integrada e harmonização orofacial', u: 'https://www.renovaodontologiaintegrada.com.br/' },
  { n: 'Clínica Integrar', tipo: 'Estética e reabilitação oral', onde: 'The Square Park Office, sala 410 · Jatiúca', oferta: 'Estética dental, reabilitação e HOF; diz ter mais de 30 anos de experiência', u: 'https://integrarodontologiaestetica.com/' },
  { n: 'Harmoniza Mais', tipo: 'Odontologia e psicologia', onde: 'The Square Park Office, sala 413 · Jatiúca', oferta: 'Harmonização facial; seg a sex 8h–18h', u: 'https://harmonizamais.com/' },
  { n: 'Dr. Maylton Marciel (CRO-AL 3675)', tipo: 'Dentista autônomo', onde: 'Harmony Trade Center, sala 219 · Jatiúca', oferta: 'Toxina, preenchimento, microagulhamento e bichectomia', u: 'https://www.ident.com.br/mayltonmarciel' },
  { n: 'Dra. Aideê Fernandes (CRO-AL 4820)', tipo: 'Dentista autônoma', onde: 'Harmony Trade Center, sala 703 · Jatiúca', oferta: 'Odontologia e estética', u: 'https://www.doctoralia.com.br/aidee-mayara-silva-fernandes/dentista/maceio?address-id=959460' },
  { n: 'Dra. Hortência Vieira (CRO-AL 4467)', tipo: 'Dentista autônoma', onde: 'Rua Dep. Elizeu Teixeira, 70 · Ponta Verde', oferta: 'Harmonização orofacial e full face', u: 'https://www.doctoralia.com.br/dentista/maceio/ponta-verde' },
  { n: 'Diretório Rede Harmoniza (Maceió)', tipo: 'Lista de clínicas', onde: 'Ponta Verde e Jatiúca', oferta: 'Lista várias clínicas de harmonização da cidade (dados não verificados)', u: 'https://redeharmoniza.com/cidade/maceio-al/' },
  { n: 'Dermatologistas e cirurgiões plásticos', tipo: 'Concorrência médica', onde: 'Toda a orla', oferta: 'Toxina, preenchimento, lipo de papada e blefaroplastia para o mesmo público', u: 'https://www.doctoralia.com.br/servicos-de-tratamento/preenchimento-facial/maceio' },
]

export const precos = [
  { t: 'Toxina botulínica (por região)', v: 'R$ 600 a R$ 1.500 em Maceió; R$ 20 a R$ 40 por unidade no país' },
  { t: 'Preenchimento com ácido hialurônico', v: 'R$ 900 a R$ 2.500 por seringa ou região em Maceió' },
  { t: 'Preenchimento labial', v: 'R$ 1.500 a R$ 4.000 (tabelas nacionais 2026)' },
  { t: 'Botox full face', v: 'R$ 1.200 a R$ 3.500 (tabelas nacionais 2026)' },
  { t: 'Turno em consultório odontológico comum', v: 'R$ 130 a R$ 200 o turno avulso; cerca de R$ 110 a R$ 125 por turno em pacote mensal' },
  { t: 'Sala comercial de 33 a 50 m² na região', v: 'R$ 3.000 a R$ 4.500 por mês, sem equipamento' },
]

export const swot = {
  forcas: [
    'Localização na Jatiúca, o bairro onde a harmonização se concentra, com estacionamento e recepção já funcionando',
    'A Santé paga a montagem: o dentista começa sem investir nada e paga só os turnos que usa',
    'Modelo por turno combina com o dentista de estética, que atende 1 ou 2 dias por semana e muitas vezes em mais de um lugar',
    'Sala no padrão da Resolução 286 para cirurgia Tipo I: diferencial que não encontramos para alugar na cidade',
    'Base de 7,2 mil seguidores no Instagram e experiência da casa em alugar por hora e por turno',
    'Biossegurança, esterilização e resíduos feitos pela casa: menos trabalho para o dentista',
  ],
  fraquezas: [
    'A Santé não tem experiência em odontologia: precisa de responsável técnico, registro no CRO-AL e rotina de esterilização',
    'Investimento de R$ 70 mil em uma sala só; com 2 turnos por semana a sala quase não se paga',
    'A sala fica ociosa nos dias sem estética e não serve bem para outras profissões depois de montada',
    'Marca conhecida como “consultórios de saúde”, não como estética',
    'Sem histórico de procura: a demanda de dentistas por sala de estética ainda precisa ser confirmada',
  ],
  oportunidades: [
    'Cirurgia estética orofacial virou especialidade em mar/2026: há dentistas se especializando e faltam salas adequadas',
    'Especializações e residências em HOF e cirurgia orofacial crescem pelo país: cada turma forma dentistas que precisam de onde atender',
    'Cursos de HOF e de cirurgia precisam de sala para aulas práticas e imersões: aluguel por diária',
    'Procura alta por toxina, preenchimento e lipo de papada; público feminino grande (57% do Instagram adulto)',
    'Pacotes com outros profissionais da casa (nutricionista, psicólogo) e com a fisioterapia',
    'Odontologia geral nos outros dias para ocupar a sala',
    'Maceió atrai turistas o ano todo; procedimentos rápidos de consultório podem ser agendados na viagem',
  ],
  ameacas: [
    'Concorrência densa no Harmony Trade Center e no The Square, a poucas quadras, e de dermatologistas e plásticos',
    'Turno em consultório odontológico comum já é oferecido de R$ 130 a R$ 200 em vários bairros: se a sala da Santé for vista como “mais um consultório”, o preço cai',
    'Risco de reputação por complicações de terceiros (há caso de dentista afastado em Arapiraca por silicone industrial)',
    'Exigências da Vigilância Sanitária e do CRO podem atrasar a abertura ou exigir mais obra',
    'Guerra de preço de franquias de toxina e venda em pacotes',
  ],
}

// Cruzamento da SWOT: estratégias
export const estrategiasSwot = [
  { q: 'Forças × oportunidades (atacar)', d: 'Lançar a “sala de estética orofacial por turno” para dentistas recém-especializados em HOF e CEOF, com cirurgia Tipo I e esterilização inclusas; alugar por diária para cursos práticos.' },
  { q: 'Forças × ameaças (defender)', d: 'Contrato que exige registro ativo no CRO, especialidade compatível, seguro do profissional e produtos com registro na Anvisa; protocolo de emergência e DEA na sala. A Santé aluga espaço; o ato é do profissional.' },
  { q: 'Fraquezas × oportunidades (reforçar)', d: 'Contratar um dentista responsável técnico com experiência em estética, que também pode ser o primeiro locatário âncora; preencher os outros dias com odontologia geral.' },
  { q: 'Fraquezas × ameaças (evitar)', d: 'Não comprar nada antes das cartas de intenção; montar primeiro só o Tipo I; deixar o Tipo II para quando houver demanda comprovada.' },
]

// Planejamento
export const etapas = [
  { f: 'Mês 0', t: 'Decidir', itens: ['Conversa com o CRO-AL e com a Vigilância Sanitária de Maceió', 'Pesquisa ativa: ligar para os anúncios de turno odontológico (Jatiúca, Farol, Ponta Verde) e para 15 dentistas de HOF: preço, ocupação, o que falta nas salas de hoje', 'Escolher a sala: 9 m² ou mais, com ponto de água para pia exclusiva'] },
  { f: 'Mês 1', t: 'Pré-venda', itens: ['Cartas de intenção de pelo menos 3 dentistas (meta: 3 turnos/semana no total)', 'Definir o responsável técnico', 'Fechar 3 cotações de cada equipamento'] },
  { f: 'Meses 2 e 3', t: 'Montagem e licenças', itens: ['Obra de adequação e instalação dos equipamentos', 'Licença sanitária, registro da Santé no CRO-AL como estabelecimento odontológico', 'PGRSS, POPs de esterilização e de emergência, contrato de coleta de resíduos', 'Seguro e contrato de locação por turno'] },
  { f: 'Mês 4', t: 'Abertura', itens: ['Open house para dentistas e professores de cursos de HOF', '2 turnos por semana com os dentistas âncora', 'Fotos e vídeo da sala para o Instagram e o Google'] },
  { f: 'Meses 5 a 9', t: 'Crescer', itens: ['Chegar a 4 turnos por semana', 'Primeiras cirurgias Tipo I', 'Diárias para cursos práticos', 'Odontologia geral nos dias livres'] },
  { f: 'Meses 10 a 12', t: 'Avaliar', itens: ['Comparar com as metas: ocupação da sala, resultado mensal, payback', 'Decidir sobre a sala Tipo II (sedação) e um segundo dia fixo de estética'] },
]

// Critérios para seguir (go / no-go)
export const criterios = [
  { t: 'Demanda', d: '3 ou mais dentistas com carta de intenção, somando pelo menos 4 turnos por semana.' },
  { t: 'Preço', d: 'Turno a R$ 220 ou mais, confirmado na pesquisa ativa (o turno comum na cidade custa R$ 130 a R$ 200).' },
  { t: 'Licenças', d: 'Vigilância Sanitária e CRO-AL confirmam que a sala escolhida pode ser licenciada sem obra maior que a prevista.' },
  { t: 'Retorno', d: 'No cenário base, o investimento se paga em até 24 meses.' },
]

// Regras e exigências
export const exigencias = [
  { t: 'Registro no CRO-AL', d: 'Estabelecimento que presta serviço odontológico precisa de inscrição no conselho e de cirurgião-dentista responsável técnico.' },
  { t: 'Licença sanitária', d: 'Projeto físico conforme a RDC 50/2002, boas práticas (RDC 63/2011), processamento de artigos e esterilização (RDC 15/2012) e licença da Vigilância Sanitária de Maceió.' },
  { t: 'Resíduos', d: 'Plano de gerenciamento de resíduos de saúde (RDC 222/2018) e contrato de coleta de infectante e perfurocortante.' },
  { t: 'Sala Tipo I (Res. CFO 286/2026)', d: '9 m² ou mais e 2,20 m de largura mínima, lavatório exclusivo para as mãos, dispensador de álcool, bancada e elétrica dimensionada. O equipo pode ser dispensado se não houver aerossol, com maca e foco cirúrgico registrados na Anvisa.' },
  { t: 'Sala Tipo II', d: '12 m² ou mais, oxigênio e vácuo, energia de emergência, recuperação de 10 m² por leito, monitores e carro de emergência com DEA. Fora do orçamento inicial.' },
  { t: 'Publicidade', d: 'Seguir o código de ética do CFO para anúncios: sem promessa de resultado e com regras para antes e depois. A Santé anuncia a sala aos dentistas, não procedimentos ao paciente.' },
  { t: 'Trabalho e segurança', d: 'NR-32 (segurança em serviços de saúde) para a equipe de limpeza e esterilização da Santé.' },
]

export const marketing = [
  { c: 'Instagram e LinkedIn', d: 'Reels da sala pronta, “um turno na sala de estética”, depoimento dos dentistas âncora. Anúncio para dentistas num raio de 15 km. Mensagem: “Sala de estética orofacial pronta, por turno, na Jatiúca. Você traz o paciente; a Santé cuida da estrutura.”' },
  { c: 'Cursos de HOF e de cirurgia', d: 'Parceria com professores: diária da sala para aulas práticas e desconto para alunos recém-formados.' },
  { c: 'CRO-AL e eventos de odontologia', d: 'Apoio à Semana Odontológica e a cursos do conselho; palestra sobre a Res. 286 e estrutura de sala.' },
  { c: 'Distribuidores e dentais', d: 'Folheto e QR code nas lojas de produtos odontológicos e com representantes de toxina e ácido hialurônico.' },
  { c: 'Indicação', d: 'Dentista que indicar um colega que fechar turno fixo ganha 1 turno grátis.' },
]

export const fontes = [
  { u: 'https://cassianooliveira.com.br/blog/gestao-de-risco/resolucao-cfo-286-2026-estruturas-obrigatorias-cirurgias-esteticas-orofaciais/', t: 'Resolução CFO 286/2026: estruturas obrigatórias', d: 'tipos de sala I, II e III e exigências' },
  { u: 'https://website.cfo.org.br/cirurgia-estetica-orofacial-e-oficialmente-regulamentada/', t: 'CFO · Cirurgia Estética Orofacial regulamentada', d: 'lançamento da especialidade (20/03/2026)' },
  { u: 'https://www.olx.com.br/anuncios/aluguel-consultorio-odontologico', t: 'OLX · aluguel de consultório odontológico', d: 'anúncios de turno em Maceió (Jatiúca R$ 130, Farol R$ 160)' },
  { u: 'https://maceio.al.gov.br/uploads/documentos/Legislacao-O_basico_da_VISA_na_odontologia.pdf', t: 'Prefeitura de Maceió · O básico da Vigilância Sanitária na odontologia', d: 'exigências para licenciar consultório' },
  { u: 'https://maceio.al.gov.br/uploads/documentos/ODONTOLOGIA.pdf', t: 'Prefeitura de Maceió · licença de consultório odontológico', d: 'documentos para a licença inicial' },
  { u: 'https://redeharmoniza.com/cidade/maceio-al/', t: 'Rede Harmoniza · Maceió', d: 'profissionais de harmonização na cidade e faixas de preço' },
  { u: 'https://www.tnh1.com.br/noticia/nid/conselho-afasta-dentista-que-teria-aplicado-silicone-industrial-em-pacientes-em-arapiraca/', t: 'TNH1 · CRO-AL afasta dentista em Arapiraca', d: 'risco de reputação no setor' },
  { u: 'https://clinicaestetica.click/quanto-custa-harmonizacao-facial-2026/', t: 'Tabela de preços de harmonização 2026', d: 'referência nacional de preços' },
]

// ---------- recém-formados e a Santé como policlínica ----------
export const recemFormados = {
  intro: 'O dentista recém-formado em Maceió sai da UFAL, do CESMAC e de outras faculdades (confirmar cursos e vagas no e-MEC) sem dinheiro para montar consultório. Um consultório próprio custa cerca de R$ 70 mil em equipamentos, mais R$ 3.000 a R$ 4.500 por mês de sala. Hoje ele escolhe entre ser contratado por porcentagem, alugar turno num consultório comum ou adiar o próprio atendimento.',
  dores: [
    'Não tem capital para equipamento, obra e licenças',
    'Precisa começar com poucos pacientes, 1 ou 2 turnos por semana',
    'Não sabe licenciar consultório nem montar esterilização e resíduos',
    'Precisa de pacientes: ninguém ainda o conhece',
    'Quer fazer cursos de estética (HOF), mas não tem onde aplicar o que aprendeu',
    'Insegurança sobre preço, CRO, publicidade e impostos',
  ],
}

// Comparativo: o que o recém-formado encontra em cada alternativa. n: 2 = sim, 1 = parcial, 0 = não
export const alternativas = ['Santé (policlínica)', 'Turno em consultório comum', 'Contratado por porcentagem', 'Consultório próprio', 'Coworking de saúde sem odonto']
export const comparativo = [
  { c: 'Investimento inicial', v: [[2, 'Zero'], [2, 'Zero'], [2, 'Zero'], [0, '≈ R$ 70 mil + obra'], [2, 'Zero']] },
  { c: 'Custo com 2 turnos por semana', v: [[1, 'R$ 180 a R$ 240 o turno'], [2, 'R$ 110 a R$ 200 o turno'], [2, 'Sem custo; perde 50% a 70% da produção'], [0, 'R$ 3 a 4,5 mil/mês de sala + custos'], [1, 'Barato, mas sem cadeira odontológica']] },
  { c: 'Licença, CRO e responsável técnico', v: [[2, 'Resolvidos pela casa'], [1, 'Depende do anunciante'], [2, 'Da clínica'], [0, 'Por conta dele'], [0, 'Não atende odontologia']] },
  { c: 'Esterilização e resíduos inclusos', v: [[2, 'Sim'], [1, 'Às vezes (autoclave)'], [2, 'Sim'], [0, 'Por conta dele'], [0, 'Não']] },
  { c: 'Recepção e agendamento', v: [[2, 'Recepção da casa'], [0, 'Geralmente não'], [2, 'Sim'], [0, 'Precisa contratar'], [1, 'Recepção geral']] },
  { c: 'Pacientes vindos da casa', v: [[2, 'Indicação de 12 salas e várias áreas'], [0, 'Não'], [1, 'Sim, mas o paciente é da clínica'], [0, 'Não'], [1, 'Pouco']] },
  { c: 'Paciente e marca são dele', v: [[2, 'Sim'], [2, 'Sim'], [0, 'Não'], [2, 'Sim'], [2, 'Sim']] },
  { c: 'Estrutura para estética e cirurgia Tipo I', v: [[2, 'Maca, foco e kit de emergência'], [0, 'Não'], [1, 'Em algumas clínicas'], [1, 'Se investir mais'], [0, 'Não']] },
  { c: 'Horário noturno e flexível', v: [[2, 'Até 22h, por turno'], [1, 'Alguns'], [0, 'Agenda da clínica'], [2, 'Livre'], [2, 'Sim']] },
  { c: 'Estacionamento e endereço na Jatiúca', v: [[2, 'Sim'], [1, 'Varia'], [1, 'Varia'], [1, 'Depende do ponto'], [2, 'Harmony Trade Center']] },
  { c: 'Mentoria, comunidade e cursos', v: [[2, 'Workshops mensais e RT experiente'], [0, 'Não'], [1, 'Às vezes'], [0, 'Não'], [0, 'Não']] },
]

// Por que ser policlínica faz diferença: encaminhamentos entre áreas da casa
export const sinergias = [
  { a: 'Fonoaudiologia', d: 'Respiração oral, deglutição atípica e frênulo lingual: fono e dentista tratam juntos, principalmente crianças.' },
  { a: 'Fisioterapia', d: 'Disfunção da ATM e dor orofacial: dentista e fisioterapeuta dividem o tratamento.' },
  { a: 'Psicologia', d: 'Bruxismo e apertamento ligados à ansiedade: encaminhamento nos dois sentidos.' },
  { a: 'Nutrição', d: 'Pacientes de emagrecimento procuram estética facial; dentista indica nutrição para quem tem perda óssea, cárie ou erosão.' },
  { a: 'Medicina', d: 'Pacientes de cardiologia, endocrinologia (diabetes) e oncologia precisam de avaliação odontológica antes e durante o tratamento.' },
  { a: 'Terapias infantis (TEA)', d: 'Crianças com TEA precisam de dentista com paciência e ambiente conhecido: a mesma casa das terapias facilita.' },
]

export const vantagens = [
  { t: 'Começar sem investir', d: 'O recém-formado paga só os turnos que usa, numa sala licenciada, com esterilização, resíduos e responsável técnico resolvidos pela Santé.' },
  { t: 'Pacientes da própria casa', d: 'Os pacientes dos psicólogos, fisioterapeutas, fonoaudiólogos, nutricionistas e médicos já frequentam a Santé. Um consultório comum de turno não tem esse fluxo.' },
  { t: 'O paciente é dele', d: 'Diferente de ser contratado por porcentagem: a marca, o prontuário e o paciente são do dentista. Ele cresce e continua na casa.' },
  { t: 'Porta para a estética', d: 'Quem faz curso de HOF tem onde atender desde o primeiro paciente, numa sala montada para isso, sem esperar ter consultório próprio.' },
  { t: 'Escada de crescimento', d: 'Turno avulso → turno fixo semanal → mais dias → estética e cirurgia Tipo I. É a mesma escada que a Santé já usa nas outras áreas.' },
  { t: 'Imagem de clínica completa', d: 'Para o paciente, um endereço com várias especialidades passa mais confiança que uma sala isolada num empresarial.' },
]

export const ofertaRecem = [
  { t: 'Turno clínico geral', p: 'R$ 180', d: 'Preço próximo do mercado (R$ 130 a R$ 200), com recepção, esterilização e estacionamento.' },
  { t: 'Primeiros 3 meses', p: '20% de desconto', d: 'Para formados há até 3 anos com CRO ativo, como no programa Primeiro Consultório.' },
  { t: 'Turno de estética e Tipo I', p: 'R$ 240 a R$ 280', d: 'Para quem já tem formação em HOF ou CEOF; inclui maca, foco cirúrgico e kit de emergência.' },
  { t: 'Vitrine e indicação', p: 'Incluso', d: 'Perfil na página “Profissionais da Santé”, collab no Instagram e indicação pelos outros profissionais.' },
  { t: 'Mentoria', p: 'Incluso', d: 'Encontro mensal com o responsável técnico sobre preço, CRO, publicidade ética e gestão.' },
]

export const cuidadosPoli = [
  { t: 'Dois preços na mesma sala', d: 'Turno clínico (mais barato) e turno de estética (mais caro) precisam de regras claras: o que muda é a estrutura usada (maca, kit cirúrgico) e o horário.' },
  { t: 'Indicação sem comissão', d: 'O código de ética do CFO e dos outros conselhos proíbe pagar por encaminhamento de paciente. A indicação entre profissionais da casa é por confiança, sem dinheiro envolvido.' },
  { t: 'Prontuário e LGPD', d: 'Cada profissional tem seu prontuário. Compartilhar informação de saúde entre áreas só com consentimento do paciente.' },
  { t: 'Desgaste do equipamento', d: 'Mais turnos de clínica geral significam mais manutenção. Rever o custo por turno depois de 6 meses.' },
]

// ---------- marketing: crescimento e buzz positivo ----------
export const buzz = {
  tese: 'A sala de odontologia estética faz mais pela marca do que pela receita da própria sala. Ela traz um público novo (estética), dá à Santé uma história para contar (“a policlínica que abre as portas para quem está começando”) e coloca cada dentista da casa como divulgador para os seguidores e pacientes dele.',
  ciclo: [
    { t: 'Mais profissionais', d: 'Dentistas, inclusive recém-formados, alugam turnos sem investir.' },
    { t: 'Mais pacientes passando pela casa', d: 'Cada turno traz de 3 a 4 pacientes que conhecem a Santé e as outras áreas.' },
    { t: 'Mais conteúdo e marcações', d: 'Profissionais e pacientes publicam, marcam a localização e fazem collabs com o perfil da Santé.' },
    { t: 'Mais reputação', d: 'Avaliações no Google, matérias e indicação boca a boca.' },
    { t: 'Mais procura por sala', d: 'A reputação atrai os próximos profissionais, e o ciclo recomeça.' },
  ],
  alavancas: [
    { t: 'História para a imprensa', d: 'Pauta para TNH1, Gazeta e rádios: “policlínica na Jatiúca abre consultório odontológico por turno para recém-formados” e “sala preparada para a nova norma do CFO”. Matéria gratuita vale mais que anúncio para credibilidade.' },
    { t: 'Inauguração com a comunidade odontológica', d: 'Open house com professores de HOF, coordenadores dos cursos de odontologia e o CRO-AL; aula prática na sala no mesmo dia. Gera fotos, stories e marcações de dezenas de dentistas.' },
    { t: 'Os dentistas como canal', d: 'Cada dentista tem seus seguidores. Collab de boas-vindas, Reels “um dia atendendo na Santé” e marcação da localização multiplicam o alcance sem pagar mídia.' },
    { t: 'Estética engaja nas redes', d: 'Bastidores da sala, cuidados antes e depois do procedimento e explicações dos profissionais (dentro das regras do CFO) costumam render mais comentários e compartilhamentos que fotos de consultório.' },
    { t: 'Programa para recém-formados', d: 'Turma “Primeiro Consultório Odonto” por semestre, com certificado de mentoria e formatura na Santé: boa notícia todo semestre e conteúdo pronto.' },
    { t: 'Policlínica completa', d: 'Pacotes e campanhas entre áreas (sorriso e fala com a fono, ATM com a fisio, bruxismo com a psicologia) mostram a Santé como polo de saúde, não só aluguel de salas.' },
    { t: 'Datas', d: '25/10 Dia do Dentista; formaturas de odontologia em dez/jan e jun/jul; 8/3 Dia da Mulher para a estética; Setembro Amarelo ligado ao bruxismo e à ansiedade.' },
    { t: 'Avaliações e indicação', d: 'Pedir avaliação no Google aos profissionais e incentivar que eles peçam aos pacientes do jeito que o conselho permite. Indicação de colega dá turno grátis.' },
  ],
  indicadores: [
    { n: 'Pacientes novos passando pela Santé por causa da odontologia', meta: 'calculado pelo cenário escolhido', onde: 'Agenda da recepção' },
    { n: 'Marcações da localização e menções ao perfil', meta: '≥ 30 por mês a partir do 3º mês de sala aberta', onde: 'Instagram' },
    { n: 'Alcance das collabs com dentistas', meta: '≥ 20% do alcance total do perfil', onde: 'Instagram Insights' },
    { n: 'Seguidores novos no mês da inauguração', meta: '≥ 400', onde: 'Instagram' },
    { n: 'Matérias e entrevistas', meta: '≥ 2 no 1º semestre', onde: 'Clipping' },
    { n: 'Avaliações novas no Google', meta: '≥ 8 por mês com a odontologia aberta', onde: 'Perfil da Empresa' },
    { n: 'Encaminhamentos entre áreas da casa', meta: '≥ 10 por mês no 6º mês', onde: 'Pergunta na recepção: “quem indicou?”' },
    { n: 'Dentistas na lista de espera por turno', meta: '≥ 3 no 6º mês', onde: 'WhatsApp' },
  ],
  riscos: [
    { t: 'Complicação em procedimento', d: 'Uma complicação estética de um dentista locatário pode virar notícia ligada à Santé. Exigir registro, especialidade, seguro e protocolo de emergência; ter plano de resposta pronto.' },
    { t: 'Publicidade fora das regras', d: 'Antes e depois, preços e promessas de resultado seguem regras do CFO. A Santé revisa o que publica sobre os profissionais da casa.' },
    { t: 'Imagem de “clínica de botox”', d: 'Manter a estética como uma parte da policlínica: comunicar saúde, cuidado e o conjunto de especialidades.' },
  ],
}
