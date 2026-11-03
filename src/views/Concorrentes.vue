<script setup>
import { computed } from 'vue'
import { mean } from 'd3'
import StatTile from '../components/StatTile.vue'
import D3Scatter from '../components/d3/D3Scatter.vue'
import D3HBar from '../components/d3/D3HBar.vue'
import D3Table from '../components/d3/D3Table.vue'
import Icon from '../components/Icon.vue'
import base from '../data/concorrentes.json'
import { brl, dataBR, num } from '../lib/format'

const players = base.players
const sante = players.find((p) => p.proprio)
const rivais = players.filter((p) => !p.proprio)
const diretos = rivais.filter((p) => p.tipo === 'direto')
const nf1 = (v) => (v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
const igUrl = (h) => `https://www.instagram.com/${h}/`

// ---------- números de topo ----------
const notaMediaRivais = mean(diretos.filter((p) => p.google), (p) => p.google.nota)
const buscasComSante = base.mapas.filter((m) => m.sante).length
const maisPosts = [...rivais].filter((p) => p.ig).sort((a, b) => b.ig.posts - a.ig.posts)[0]

// ---------- mapa de concorrentes ----------
const AMEACA = { alta: { t: 'Ameaça alta', c: 'bad' }, media: { t: 'Ameaça média', c: 'warn' }, baixa: { t: 'Ameaça baixa', c: 'plain' } }
const ordemAmeaca = { alta: 0, media: 1, baixa: 2 }
const cards = computed(() =>
  [...rivais].sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'direto' ? -1 : 1) || ordemAmeaca[a.ameaca] - ordemAmeaca[b.ameaca]),
)

// ---------- gráficos ----------
const igRows = (p) => [
  { label: 'Seguidores', value: num(p.ig.seguidores) },
  { label: 'Seguindo', value: num(p.ig.seguindo) },
  { label: 'Posts', value: num(p.ig.posts) },
  { label: 'Seguidores por post', value: num(Math.round(p.ig.seguidores / Math.max(1, p.ig.posts))) },
]
const curto = (n) => n.replace(' Consultórios', '').replace(' Saúde Integrada', '').replace(' Coworking', '').replace(' Saúde & Bem-Estar', '')
const igPts = players.filter((p) => p.ig).map((p) => ({ label: curto(p.nome), x: p.ig.posts, y: p.ig.seguidores, hl: p.proprio, rows: igRows(p) }))
const gPts = players.filter((p) => p.google && p.tipo === 'direto').map((p) => ({
  label: curto(p.nome), x: p.google.avaliacoes, y: p.google.nota, hl: p.proprio,
  rows: [{ label: 'Nota', value: nf1(p.google.nota) }, { label: 'Avaliações', value: num(p.google.avaliacoes) }, { label: 'Categoria', value: p.google.categoria }],
}))
const precoItems = [...base.precoHora].sort((a, b) => a.valor - b.valor).map((p) => ({
  label: p.label, sub: p.sub, value: p.valor, dim: p.id !== 'sante',
}))

// ---------- tabelas ----------
const canaisCols = [
  { key: 'nome', label: 'Concorrente' },
  { key: 'seguidores', label: 'Seguidores IG', num: true, format: (v) => (v == null ? '—' : num(v)) },
  { key: 'posts', label: 'Posts', num: true, format: (v) => (v == null ? '—' : num(v)) },
  { key: 'nota', label: 'Nota Google', num: true, format: nf1 },
  { key: 'avaliacoes', label: 'Avaliações', num: true, format: (v) => (v == null ? '—' : num(v)) },
  { key: 'anuncios', label: 'Anúncios Meta' },
  { key: 'reserva', label: 'Como reserva' },
]
const canaisRows = players.map((p) => ({
  nome: p.proprio ? `${p.nome} (nós)` : p.nome,
  seguidores: p.ig?.seguidores ?? null,
  posts: p.ig?.posts ?? null,
  nota: p.google?.nota ?? null,
  avaliacoes: p.google?.avaliacoes ?? null,
  anuncios: p.anunciosMeta ? 'Sim, ativos' : 'Não encontrados',
  reserva: p.reserva,
}))
const nomeDe = (id) => players.find((p) => p.id === id)?.nome || id
const sitesCols = [
  { key: 'site', label: 'Site' },
  { key: 'desempenho', label: 'Desempenho', num: true, bar: true, format: (v) => Math.round(v * 100) },
  { key: 'acessibilidade', label: 'Acessibilidade', num: true, bar: true, format: (v) => Math.round(v * 100) },
  { key: 'boasPraticas', label: 'Boas práticas', num: true, bar: true, format: (v) => Math.round(v * 100) },
  { key: 'seo', label: 'SEO', num: true, bar: true, format: (v) => Math.round(v * 100) },
  { key: 'lcp', label: 'Carregamento (LCP)', num: true, format: (v) => `${nf1(v)} s` },
  { key: 'paginas', label: 'Páginas', num: true },
  { key: 'dominio', label: 'Domínio desde', format: (v) => (v ? dataBR(v) : '—') },
]
const sitesRows = base.sites.map((s) => ({
  ...s, site: s.id === 'sante' ? `${s.site} (nós)` : s.site,
  desempenho: s.desempenho / 100, acessibilidade: s.acessibilidade / 100, boasPraticas: s.boasPraticas / 100, seo: s.seo / 100,
}))

// ---------- análise ----------
const swot = [
  {
    t: 'Forças', c: 'good', itens: [
      'Maior audiência do segmento no Instagram: 7.214 seguidores, o dobro do segundo (Transmutar, 3.553).',
      'Casa própria com estacionamento privativo. Cinco concorrentes dividem o mesmo edifício comercial (Harmony Trade Center).',
      'Mais espaços que qualquer concorrente: 10 salas, piscina e administrativo. Os concorrentes que divulgam o número de salas têm de 2 a 5.',
      'Melhor estrutura de SEO entre os sites: 23 páginas, 18 delas por especialidade, schema LocalBusiness e nota 100 em SEO.',
      'Preços publicados. Só a NutriClin e a Medicine Service fazem o mesmo.',
    ],
  },
  {
    t: 'Fraquezas', c: 'bad', itens: [
      'Instagram parado: 24 posts, contra 367 da Transmutar, 360 da Luz Saúde e 313 da Innate.',
      'Perfil no Google com a categoria “Médico” e avaliações de pacientes da antiga clínica (reclamações de médicos). Nota 4,4, abaixo da média de 4,7 dos concorrentes diretos.',
      'Não aparece no Google Maps em 3 das 4 buscas principais (“aluguel de consultório”, “aluguel de sala”, “coworking saúde”).',
      'Horário menor: fecha às 18h e no sábado ao meio-dia. Elleva vai até 23h, NutriClin funciona 24h.',
      'Sem reserva online. NutriClin, Transmutar e Ampla deixam o profissional reservar sozinho.',
      'Site lento no celular: a foto principal leva 11,6 s para aparecer (meta do Google: 2,5 s).',
    ],
  },
  {
    t: 'Oportunidades', c: 'info', itens: [
      'Nenhum concorrente oferece piscina. Hidroterapia, fisioterapia aquática e aulas para gestantes e idosos não têm alternativa na região.',
      'O pacote de 8 turnos já sai a R$ 30/hora, igual ao menor preço do mercado. Hoje a vitrine mostra R$ 50/hora.',
      'Só um concorrente (Innate) anuncia na Meta. O leilão local está barato e com pouca disputa.',
      'Plataformas gratuitas de sublocação (Sublocando) e o OLX ainda não têm a Santé.',
      'O Harmony Trade Center está saturado, com 5 operadores no mesmo prédio. Quem quer sair do “prédio cheio” é público natural para uma casa com estacionamento.',
    ],
  },
  {
    t: 'Ameaças', c: 'warn', itens: [
      'Concorrência de preço no Harmony: R$ 30 a R$ 38 por hora, com recepção e café.',
      'Concorrentes com nota 4,8 a 5,0 e avaliações recentes ganham as buscas do Google Maps.',
      'O Harmony Medical Farol (ClinTime) traz um posicionamento premium, com sala de procedimentos e esterilização.',
      'A Innate já paga anúncios para profissionais de saúde em Maceió desde 21/10/2026.',
    ],
  },
]

const acoes = [
  { p: 1, t: 'Corrigir o Perfil da Empresa no Google', d: 'Trocar a categoria principal para “Espaço de coworking”, que é a dos concorrentes que aparecem no Maps, e deixar “Consultório médico” como secundária. Na descrição, explicar que o local é aluguel de salas, não atendimento a pacientes. Responder às avaliações antigas com educação, explicando a mudança.', prazo: '1 semana', esforco: 'Baixo', kpi: 'Aparecer no top 3 do Maps nas 4 buscas' },
  { p: 1, t: 'Campanha de avaliações dos profissionais locatários', d: 'Pedir a cada profissional que atende na Santé uma avaliação no Google, com link direto pelo WhatsApp e um lembrete na recepção. Meta: 30 novas avaliações em 60 dias.', prazo: '60 dias', esforco: 'Baixo', kpi: 'Nota ≥ 4,7 e mais de 60 avaliações' },
  { p: 1, t: 'Mostrar “a partir de R$ 30/hora”', d: 'Na bio do Instagram, no Google e no topo do site, mostrar o preço por hora do pacote (R$ 960 ÷ 32 h) ao lado da hora avulsa. Assim a Santé empata com o menor preço do Harmony sem baixar a tabela.', prazo: '1 semana', esforco: 'Baixo', kpi: 'Contatos no WhatsApp por semana' },
  { p: 2, t: 'Reativar o Instagram com calendário fixo', d: '3 posts por semana e stories diários: tour das salas, “horários livres desta semana”, perfil dos profissionais que atendem aqui e bastidores. Reels curtos da piscina e do estacionamento. A Transmutar e a Luz Saúde chegaram a mais de 300 posts assim.', prazo: 'Contínuo', esforco: 'Médio', kpi: '100 posts em 6 meses; cliques no link da bio' },
  { p: 2, t: 'Lançar a piscina como produto', d: 'Uma página no site e uma campanha voltadas a fisioterapeutas, educadores físicos e terapeutas para hidroterapia, gestantes e reabilitação. Ninguém mais oferece esse espaço.', prazo: '30 dias', esforco: 'Médio', kpi: 'Contratos novos na piscina' },
  { p: 2, t: 'Agenda online de horários livres', d: 'Publicar a disponibilidade e permitir pré-reserva (a NutriClin usa Gendo). Uma alternativa mais simples: um post fixo com a grade da semana e reserva pelo WhatsApp.', prazo: '30 dias', esforco: 'Médio', kpi: 'Reservas sem ligação' },
  { p: 2, t: 'Teste de anúncios locais na Meta', d: 'Raio de 5 km da Jatiúca, público de profissionais de saúde, com destino ao WhatsApp. Começar com um orçamento diário pequeno por 30 dias e acompanhar os anúncios da Innate na Biblioteca de Anúncios.', prazo: '30 dias', esforco: 'Médio', kpi: 'Custo por conversa e por contrato' },
  { p: 3, t: 'Deixar o site rápido no celular', d: 'Converter as fotos para WebP com tamanhos responsivos (recepção e estacionamento pesam 250 a 370 KB cada). Registrar o site no Google Search Console e medir os cliques no WhatsApp como evento do GA4.', prazo: '2 semanas', esforco: 'Baixo', kpi: 'LCP < 2,5 s; cliques no WhatsApp' },
  { p: 3, t: 'Testar horário estendido', d: 'Abrir até 21h em dois dias da semana e no sábado à tarde, só para quem reserva antes. Psicólogos e nutricionistas atendem muito à noite.', prazo: '60 dias', esforco: 'Médio', kpi: 'Turnos noturnos vendidos' },
  { p: 3, t: 'Cadastro em plataformas gratuitas', d: 'Publicar as salas no Sublocando e no OLX, e pedir para entrar nas listas de sublocação dos conselhos (CRP, CRN, CREFITO).', prazo: '2 semanas', esforco: 'Baixo', kpi: 'Leads por canal' },
  { p: 3, t: 'Monitorar todo mês', d: 'Ligar o Instagram da Santé ao Metricool (plano gratuito) e adicionar os concorrentes; refazer as 4 buscas no Maps; consultar a Biblioteca de Anúncios da Meta e atualizar esta página.', prazo: 'Mensal', esforco: 'Baixo', kpi: 'Esta página atualizada' },
]
const PRIO = { 1: { t: 'Agora', c: 'bad' }, 2: { t: 'Próximos 30 dias', c: 'warn' }, 3: { t: 'Em seguida', c: 'info' } }

const ferramentasWeb = [
  { n: 'Similarweb', uso: 'Tráfego estimado, canais e palavras-chave', res: 'Sem dados para 3 dos 5 domínios e apenas “menos de 20 mil visitas” para os outros 2. O painel dele não enxerga sites locais pequenos.' },
  { n: 'Semrush', uso: 'Palavras-chave orgânicas e pagas, backlinks, tráfego estimado', res: 'Conta gratuita com poucas consultas por dia; tem base Brasil. Bom para descobrir as palavras que trazem visitas aos concorrentes.' },
  { n: 'Ahrefs', uso: 'Tráfego orgânico, autoridade do domínio, backlinks', res: 'O verificador gratuito pede validação humana. Para o próprio site, o Ahrefs Webmaster Tools é gratuito.' },
  { n: 'Ubersuggest', uso: 'Volume de busca e ideias de palavras-chave', res: 'Algumas buscas grátis por dia; útil para estimar a procura por “consultório por hora Maceió”.' },
  { n: 'Google Search Console + GA4', uso: 'Dados reais do próprio site: buscas, cliques, posição, visitas', res: 'Única fonte confiável para um site deste porte. O GA4 já está instalado no site da Santé; falta o Search Console.' },
  { n: 'Lighthouse / PageSpeed', uso: 'Velocidade e qualidade técnica de qualquer site', res: 'Usado nesta página (tabela acima), versão 12.6, simulando celular.' },
]
const ferramentasSocial = [
  { n: 'Metricool', uso: 'Analytics e agendamento de Instagram, Facebook, TikTok e YouTube, com comparação com concorrentes', res: 'Tem plano gratuito. É o melhor ponto de partida para acompanhar a Santé e os concorrentes.' },
  { n: 'Social Status', uso: 'Relatórios e benchmarking de concorrentes, orgânico e pago', res: 'Bom para relatórios mensais comparando perfis.' },
  { n: 'Sprout Social', uso: 'Suíte para equipes: publicação, demografia da audiência, sentimento', res: 'Pago e voltado a equipes. Grande demais para o tamanho atual.' },
  { n: 'Brand24', uso: 'Escuta social: menções da marca e sentimento na web e nas redes', res: 'Útil se a Santé passar a ser citada com frequência. Pago.' },
  { n: 'Hootsuite', uso: 'Gestão e agendamento multiplataforma, monitoramento', res: 'Pago; parecido com o Metricool para este uso.' },
  { n: 'Meta Business Suite + Biblioteca de Anúncios', uso: 'Insights reais do próprio Instagram/Facebook; anúncios ativos de qualquer página', res: 'Gratuitos. A biblioteca mostrou que só a Innate anuncia hoje.' },
]

const fontes = [
  { u: 'https://www.similarweb.com/', t: 'Similarweb', d: 'consulta dos 5 domínios' },
  { u: 'https://www.google.com/maps/search/aluguel+de+consult%C3%B3rio+Macei%C3%B3', t: 'Google Maps', d: '4 buscas, notas e avaliações' },
  { u: 'https://www.facebook.com/ads/library/', t: 'Biblioteca de Anúncios da Meta', d: 'anúncios ativos no Brasil' },
  { u: 'https://rdap.registro.br/', t: 'Registro.br (RDAP)', d: 'data de registro dos domínios' },
  { u: 'https://developer.chrome.com/docs/lighthouse', t: 'Lighthouse 12.6', d: 'auditoria dos sites, perfil celular' },
  { u: 'https://sublocando.com.br/espacos', t: 'Sublocando', d: 'preços de referência por hora no Brasil' },
]
</script>

<template>
  <div class="stack">
    <section class="card intro">
      <div>
        <h2>Mapa de concorrentes</h2>
        <p class="txt">
          Quem mais aluga consultórios para profissionais de saúde em Maceió e como cada um aparece na internet:
          site, Instagram, Google Maps e anúncios. No fim da página há uma lista de ações para a Santé,
          da mais urgente à menos urgente.
        </p>
        <p class="small muted">Coleta em {{ dataBR(base.coletadoEm) }}. {{ base.nota }}</p>
      </div>
    </section>

    <section class="grid cols-4 tiles">
      <StatTile label="Concorrentes diretos mapeados" :value="String(diretos.length)" hint="Mais 3 indiretos: coworkings gerais e uma clínica" />
      <StatTile label="Seguidores da Santé no Instagram" :value="num(sante.ig.seguidores)" tone="good" hint="Maior audiência do segmento" />
      <StatTile label="Posts da Santé no Instagram" :value="num(sante.ig.posts)" tone="bad" :hint="`${maisPosts.nome} tem ${num(maisPosts.ig.posts)}`" />
      <StatTile label="Buscas do Google Maps em que a Santé aparece" :value="`${buscasComSante} de ${base.mapas.length}`" tone="bad" :hint="`Nota ${nf1(sante.google.nota)}; média dos concorrentes ${nf1(notaMediaRivais)}`" />
    </section>

    <section class="card">
      <h2>Resumo</h2>
      <ul class="bullets">
        <li><strong>O mercado se concentra no Harmony Trade Center</strong> (Jatiúca): NutriClin, Transmutar, Elleva, Medicine Service e Ampla ficam no mesmo prédio, a poucos minutos da Santé, cobrando de R$ 30 a R$ 38 por hora.</li>
        <li><strong>A Santé tem a maior audiência, mas é quase invisível nas buscas.</strong> Ela tem o dobro de seguidores do segundo colocado, porém só 24 posts e aparece no Google Maps apenas na busca “consultório por hora”.</li>
        <li><strong>O preço de vitrine assusta, mas o preço real compete.</strong> R$ 50/hora contra R$ 30–38 dos vizinhos; no pacote de 8 turnos, a Santé sai a R$ 30/hora.</li>
        <li><strong>O diferencial mais forte não está sendo usado:</strong> piscina, casa própria com estacionamento privativo e 10 salas. Nenhum concorrente tem piscina.</li>
        <li><strong>O Similarweb não mede este mercado.</strong> Os sites são pequenos demais para o painel dele. Os números desta página foram medidos diretamente nas fontes públicas.</li>
      </ul>
    </section>

    <section>
      <h2 class="sec-title">Quem são</h2>
      <div class="grid cols-3">
        <article v-for="p in cards" :key="p.id" class="card comp">
          <header>
            <strong>{{ p.nome }}</strong>
            <span v-if="p.tipo === 'direto'" class="chip" :class="AMEACA[p.ameaca].c">{{ AMEACA[p.ameaca].t }}</span>
            <span v-else class="chip plain">Indireto</span>
          </header>
          <p class="loc"><Icon name="map" :size="14" /> {{ p.local }}</p>
          <dl>
            <div><dt>Modalidades</dt><dd>{{ p.modalidades }}</dd></div>
            <div><dt>Preço</dt><dd>{{ p.preco }}</dd></div>
            <div><dt>Horário</dt><dd>{{ p.horario }}</dd></div>
            <div><dt>Google</dt><dd>{{ p.google ? `${nf1(p.google.nota)} (${p.google.avaliacoes} avaliações)` : '—' }}</dd></div>
            <div><dt>Instagram</dt><dd>{{ p.ig ? `${num(p.ig.seguidores)} seguidores · ${num(p.ig.posts)} posts` : 'Não encontrado' }}</dd></div>
          </dl>
          <p class="dif">{{ p.diferenciais }}</p>
          <footer>
            <a v-if="p.site" :href="p.site" target="_blank" rel="noopener"><Icon name="link" :size="14" /> Site</a>
            <a v-if="p.instagram" :href="igUrl(p.instagram)" target="_blank" rel="noopener"><Icon name="insta" :size="14" /> @{{ p.instagram }}</a>
          </footer>
        </article>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Instagram: audiência × atividade</h2>
            <p>Seguidores pelo número de posts (eixo horizontal em escala log)</p>
          </div>
        </div>
        <D3Scatter :points="igPts" x-label="Posts publicados" y-label="Seguidores" :x-format="num" :y-format="num" x-log aria-label="Seguidores por posts no Instagram" />
        <p class="small muted foot">
          A Santé está sozinha no canto superior esquerdo: muita audiência e pouco conteúdo. Transmutar, Innate e
          Luz Saúde publicam muito e seguem milhares de perfis (Transmutar segue 5.817) para atrair seguidores.
        </p>
      </div>
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Google: reputação</h2>
            <p>Nota pelo número de avaliações · concorrentes diretos</p>
          </div>
        </div>
        <D3Scatter :points="gPts" x-label="Avaliações" y-label="Nota" :x-format="num" :y-format="nf1" x-log :y-domain="[2.5, 5]" aria-label="Nota no Google por número de avaliações" />
        <p class="small muted foot">
          A maioria dos concorrentes tem nota 5,0 com poucas avaliações. A Santé tem volume (37), mas as
          avaliações são de pacientes da antiga clínica e falam de médicos, não do aluguel de salas.
        </p>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Preço por hora equivalente</h2>
          <p>Só quem publica preço · valores divididos pelas horas de cada modalidade</p>
        </div>
      </div>
      <D3HBar :items="precoItems" :format="brl" aria-label="Preço por hora equivalente" />
      <div class="legend small key">
        <span><i style="background: var(--s-firm)" />Santé</span>
        <span><i style="background: var(--s-prop)" />Concorrentes</span>
      </div>
      <p class="small muted foot">
        Os outros concorrentes informam o preço apenas pelo WhatsApp. No Brasil, anúncios no Sublocando ficam
        entre R$ 25 e R$ 40 por hora. Os preços da Medicine Service estão no site com valores de 2023.
      </p>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Quem aparece no Google Maps</h2>
          <p>Resultados orgânicos, na ordem, abaixo do anúncio patrocinado (N3 Coworking em todas)</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Busca</th><th>Santé</th><th>Primeiros resultados</th></tr></thead>
          <tbody>
            <tr v-for="m in base.mapas" :key="m.busca">
              <td>“{{ m.busca }}”</td>
              <td><span class="chip" :class="m.sante ? 'good' : 'bad'">{{ m.sante ? `${m.sante}º lugar` : 'Não aparece' }}</span></td>
              <td class="muted">{{ m.topo.join(' · ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Canais de cada concorrente</h2>
          <p>Clique no cabeçalho para ordenar</p>
        </div>
      </div>
      <D3Table :columns="canaisCols" :rows="canaisRows" sort-key="seguidores" />
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Qualidade dos sites</h2>
          <p>Lighthouse no celular (0–100) · páginas no sitemap · data de registro do domínio</p>
        </div>
      </div>
      <D3Table :columns="sitesCols" :rows="sitesRows" sort-key="desempenho" />
      <ul class="obs small">
        <li v-for="s in base.sites" :key="s.id"><strong>{{ nomeDe(s.id) }}:</strong> {{ s.obs }}</li>
      </ul>
    </section>

    <section class="card">
      <h2>O que o Similarweb mostrou</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Site</th><th>Resultado</th></tr></thead>
          <tbody>
            <tr v-for="s in base.similarweb" :key="s.site"><td>{{ s.site }}</td><td class="muted">{{ s.resultado }}</td></tr>
          </tbody>
        </table>
      </div>
      <p class="small muted foot">
        O Similarweb estima tráfego a partir de um painel de usuários, então só tem precisão em sites com
        dezenas de milhares de visitas por mês. Para este mercado, os dados úteis vêm do Google (Maps, Search
        Console, Analytics) e das redes sociais.
      </p>
    </section>

    <section>
      <h2 class="sec-title">Análise</h2>
      <div class="grid cols-2">
        <div v-for="s in swot" :key="s.t" class="card swot">
          <h3><span class="chip" :class="s.c">{{ s.t }}</span></h3>
          <ul class="bullets"><li v-for="i in s.itens" :key="i">{{ i }}</li></ul>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Ações sugeridas</h2>
          <p>Em ordem de prioridade. As primeiras custam pouco e atacam o problema principal: a Santé não aparece no Google.</p>
        </div>
        <RouterLink to="/marketing" class="btn sm">Criar campanha</RouterLink>
      </div>
      <ol class="acoes">
        <li v-for="(a, i) in acoes" :key="a.t">
          <span class="n">{{ i + 1 }}</span>
          <div>
            <div class="ah"><strong>{{ a.t }}</strong><span class="chip" :class="PRIO[a.p].c">{{ PRIO[a.p].t }}</span></div>
            <p>{{ a.d }}</p>
            <p class="small muted">Prazo: {{ a.prazo }} · Esforço: {{ a.esforco }} · Indicador: {{ a.kpi }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Ferramentas de tráfego e SEO</h2>
        <p class="small muted">Similarweb e alternativas</p>
        <ul class="tools">
          <li v-for="f in ferramentasWeb" :key="f.n"><strong>{{ f.n }}</strong><span>{{ f.uso }}</span><span class="muted small">{{ f.res }}</span></li>
        </ul>
      </div>
      <div class="card">
        <h2>Ferramentas de redes sociais</h2>
        <p class="small muted">Instagram, Facebook, TikTok e YouTube</p>
        <ul class="tools">
          <li v-for="f in ferramentasSocial" :key="f.n"><strong>{{ f.n }}</strong><span>{{ f.uso }}</span><span class="muted small">{{ f.res }}</span></li>
        </ul>
        <div class="note small">
          <strong>TikTok e YouTube:</strong> nem a Santé nem os concorrentes têm conta ativa. A busca no YouTube por
          “aluguel de consultório Maceió” só traz imóveis residenciais. Os Reels do Instagram podem ser
          republicados lá sem custo extra, mas não é prioridade.
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Fontes</h2>
      <ul class="refs">
        <li v-for="f in fontes" :key="f.u"><a :href="f.u" target="_blank" rel="noopener">{{ f.t }}</a><span class="muted small">{{ f.d }}</span></li>
        <li><span>Sites e perfis públicos de cada concorrente</span><span class="muted small">links nos cartões acima · registro completo em docs/REFERENCIAS.md</span></li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.txt { margin: 6px 0 8px; color: var(--text-2); line-height: 1.6; max-width: 860px; }
.sec-title { font-size: 17px; margin-bottom: 12px; }
.bullets { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 8px; color: var(--text-2); line-height: 1.55; }
.bullets strong { color: var(--text); }
.comp { display: grid; gap: 10px; align-content: start; }
.comp header { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
.comp .loc { margin: 0; display: flex; gap: 6px; align-items: center; color: var(--text-2); font-size: 13px; }
.comp .loc svg { flex: none; color: var(--accent-ink); }
.comp dl { margin: 0; display: grid; gap: 6px; font-size: 13px; }
.comp dl div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; }
.comp dt { color: var(--muted); }
.comp dd { margin: 0; }
.comp .dif { margin: 0; font-size: 13px; color: var(--text-2); line-height: 1.5; }
.comp footer { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 13px; }
.comp footer a { display: inline-flex; align-items: center; gap: 5px; }
.foot { margin: 10px 0 0; line-height: 1.5; }
.key { display: flex; gap: 16px; margin-top: 6px; color: var(--text-2); }
.key span { display: inline-flex; align-items: center; gap: 6px; }
.key i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.obs { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 6px; color: var(--text-2); }
.obs strong { color: var(--text); }
.swot h3 { margin: 0 0 4px; }
.acoes { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 14px; }
.acoes li { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
.acoes li:last-child { border-bottom: 0; padding-bottom: 0; }
.acoes .n { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; font-size: 13px; }
.acoes .ah { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.acoes p { margin: 4px 0 0; color: var(--text-2); line-height: 1.55; }
.tools { list-style: none; margin: 10px 0 12px; padding: 0; display: grid; gap: 12px; }
.tools li { display: grid; gap: 2px; font-size: 13px; }
.refs { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 10px; }
.refs li { display: grid; gap: 1px; }
@media (max-width: 900px) { .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
