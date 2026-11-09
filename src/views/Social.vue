<script setup>
// Monitor social no estilo do Social Bearing (tomelliott.com), para Instagram, Facebook e YouTube.
// Busca por palavra, @perfil ou #hashtag sobre a coleta pública guardada no banco (GET /api/mercado/social).
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import StatTile from '../components/StatTile.vue'
import D3TimeDots from '../components/d3/D3TimeDots.vue'
import D3HBar from '../components/d3/D3HBar.vue'
import D3Table from '../components/d3/D3Table.vue'
import D3SlotGrid from '../components/d3/D3SlotGrid.vue'
import { state } from '../lib/store'
import { DIAS, TEMAS, curtidasValidas, diaDaSemana, filtrarPosts, hashtagsDe, palavras, porGrupo, porPerfil, temaDe, tomDe } from '../lib/social'
import { dataBR, num, pct } from '../lib/format'

const base = state.mercado.social
const ref0 = base.coletadoEm
const REDES = { instagram: { nome: 'Instagram', icon: 'insta' }, facebook: { nome: 'Facebook', icon: 'users' }, youtube: { nome: 'YouTube', icon: 'stats' } }
const perfilPorId = Object.fromEntries(base.perfis.map((p) => [p.id, p]))
const ehSante = (id) => perfilPorId[id]?.empresa === 'sante'
const n1 = (v) => (v == null ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }))

// ---------- busca ----------
const q = ref('')
const redes = ref(['instagram', 'facebook', 'youtube'])
const dias = ref(0)
const tipo = ref('')
const SUGESTOES = ['@santeconsultoriosmaceio', '@clintimesaude', '#alugueldesalas', 'profissionais da casa', 'preço', 'Harmony', 'tour']
function alternarRede(r) {
  redes.value = redes.value.includes(r) ? redes.value.filter((x) => x !== r) : [...redes.value, r]
}
const posts = computed(() => filtrarPosts(base.posts, base.perfis, { q: q.value, redes: redes.value, dias: dias.value, tipo: tipo.value, ref: ref0 }))
const comCurtidas = computed(() => curtidasValidas(posts.value))

// ---------- resumo ----------
const resumo = computed(() => {
  const ps = posts.value
  const cs = comCurtidas.value
  // ritmo: posts dos 90 dias antes da coleta, por semana (90 dias ≈ 12,9 semanas)
  const [y, m, d] = ref0.split('-').map(Number)
  const lim = new Date(y, m - 1, d - 90).toISOString().slice(0, 10)
  const recentes = ps.filter((p) => p.data >= lim).length
  return {
    posts: ps.length,
    perfis: new Set(ps.map((p) => p.perfil)).size,
    curtidas: cs.reduce((s, x) => s + x, 0),
    media: cs.length ? cs.reduce((s, x) => s + x, 0) / cs.length : null,
    reels: ps.length ? ps.filter((p) => p.tipo === 'reel').length / ps.length : 0,
    recentes,
    porSemana: recentes / (90 / 7),
    semCurtidas: ps.length - cs.length,
  }
})

// ---------- linha do tempo ----------
const pontos = computed(() => posts.value.map((p) => ({
  t: p.data, y: p.curtidas, hl: ehSante(p.perfil), url: p.url,
  label: `${perfilPorId[p.perfil].nome} · ${dataBR(p.data)}`,
  rows: [
    { label: 'Curtidas', value: p.curtidas == null ? 'ocultas' : num(p.curtidas) },
    { label: 'Tipo', value: p.tipo === 'reel' ? 'Reel' : 'Foto' },
    { label: 'Tema', value: temaDe(p) },
    { label: p.legenda.slice(0, 60) + (p.legenda.length > 60 ? '…' : ''), value: '' },
  ],
})))

// ---------- perfis ----------
const lim60 = (() => {
  const [y, m, d] = ref0.split('-').map(Number)
  return new Date(y, m - 1, d - 60).toISOString().slice(0, 10)
})()
const linhasPerfis = computed(() => {
  const f = q.value.trim()
  const ids = new Set(posts.value.map((p) => p.perfil))
  return porPerfil(base.perfis.filter((p) => redes.value.includes(p.rede)), base.posts, ref0)
    .filter((p) => !f || ids.has(p.id) || (f.startsWith('@') && (p.handle || '').includes(f.slice(1))))
    .map((p) => ({
      ...p,
      // vazio vira -1 para a ordenação funcionar; o formato mostra "—"
      seguidores: p.seguidores ?? -1,
      mediaCurtidas: p.mediaCurtidas ?? -1,
      engajamento: p.engajamento ?? -1,
      ultimo: p.ultimo || '',
      perfilTxt: `${p.nome}${p.handle ? ` (@${p.handle})` : ''}`,
      redeTxt: REDES[p.rede].nome,
      // com posts analisados, a situação sai da data do último post: ativo se postou nos 60 dias antes da coleta
      statusTxt: p.analisados ? (p.ultimo >= lim60 ? 'Ativo' : 'Parado') : { ativo: 'Ativo', parado: 'Parado', 'nao-encontrado': 'Não encontrado', 'perfil-pessoal': 'Perfil pessoal' }[p.status] || p.status,
    }))
})
const colPerfis = [
  { key: 'perfilTxt', label: 'Perfil', link: (r) => r.url || '#', hint: 'Nome e @ do perfil. Clique para abrir a página pública.' },
  { key: 'redeTxt', label: 'Rede', hint: 'Instagram, Facebook ou YouTube.' },
  { key: 'seguidores', label: 'Seguidores', num: true, format: (v) => (v < 0 ? '—' : num(v)), hint: 'Seguidores (Instagram e Facebook) ou inscritos (YouTube) na data da coleta.' },
  { key: 'analisados', label: 'Posts\nanalisados', num: true, format: (v) => (v ? num(v) : '—'), hint: 'Posts recentes lidos um a um na coleta (só Instagram).' },
  { key: 'mediaCurtidas', label: 'Curtidas\npor post', num: true, format: (v) => (v < 0 ? '—' : n1(v)), hint: 'Média de curtidas dos posts analisados que mostram o número.' },
  { key: 'engajamento', label: 'Engajamento', num: true, format: (v) => (v < 0 ? '—' : pct(v)), hint: 'Curtidas por post ÷ seguidores. Mostra quanto da audiência reage a cada post.' },
  { key: 'ult90', label: 'Posts em\n90 dias', num: true, format: (v) => num(v || 0), hint: 'Posts analisados nos 90 dias antes da coleta.' },
  { key: 'ultimo', label: 'Último\npost', format: (v) => (v ? dataBR(v) : '—'), hint: 'Data do post mais recente encontrado.' },
  { key: 'statusTxt', label: 'Situação', hint: 'Ativo: postou nos 60 dias antes da coleta. Parado: sem post nesse período. Não encontrado: sem página pública.' },
]

// ---------- temas, hashtags, palavras, dia da semana, tom ----------
const temas = computed(() => porGrupo(posts.value, temaDe).filter((g) => g.media != null)
  .sort((a, b) => b.media - a.media)
  .map((g) => ({ label: g.k, sub: `${g.n} posts`, value: Math.round(g.media), rows: [{ label: 'Curtidas por post', value: n1(g.media) }, { label: 'Posts', value: g.n }] })))
const hashtags = computed(() => porGrupo(posts.value.filter((p) => hashtagsDe(p.legenda).length), (p) => hashtagsDe(p.legenda))
  .sort((a, b) => b.n - a.n).slice(0, 10)
  .map((g) => ({ label: g.k, sub: g.media != null ? `${n1(g.media)} curtidas por post` : '', value: g.n, dim: !g.posts.some((p) => ehSante(p.perfil)), rows: [{ label: 'Usada em', value: `${g.n} posts` }] })))
const nuvem = computed(() => {
  const ws = palavras(posts.value, 36)
  const mx = ws[0]?.n || 1
  return ws.map((w) => ({ ...w, size: 12 + Math.round(18 * Math.sqrt(w.n / mx)) }))
})
const porDia = computed(() => {
  const g = Object.fromEntries(porGrupo(posts.value, (p) => diaDaSemana(p.data)).map((x) => [x.k, x]))
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({ d, n: g[d]?.n || 0, media: g[d]?.media ?? null }))
})
const diaCols = [1, 2, 3, 4, 5, 6, 0].map((d) => ({ k: d, l: DIAS[d], s: '', fds: d === 0 || d === 6 }))
const diaRows = [{ k: 'posts', l: 'Posts' }, { k: 'media', l: 'Curtidas' }]
function celulaDia(col, row) {
  const x = porDia.value.find((v) => v.d === col.k)
  const maxN = Math.max(1, ...porDia.value.map((v) => v.n))
  const maxM = Math.max(1, ...porDia.value.map((v) => v.media || 0))
  const v = row.k === 'posts' ? x.n / maxN : (x.media || 0) / maxM
  return { t: 'heat', v, tip: { title: DIAS[col.k], rows: [{ label: 'Posts', value: num(x.n) }, { label: 'Curtidas por post', value: n1(x.media) }] } }
}
const tons = computed(() => {
  const g = porGrupo(posts.value, tomDe)
  const tot = posts.value.length || 1
  return ['Positivo', 'Neutro', 'Dor do cliente'].map((k) => {
    const x = g.find((v) => v.k === k)
    return { k, n: x?.n || 0, p: (x?.n || 0) / tot, media: x?.media ?? null }
  })
})

// ---------- tabela de posts ----------
const linhasPosts = computed(() => posts.value.map((p) => ({
  ...p, perfilTxt: perfilPorId[p.perfil].nome, tipoTxt: p.tipo === 'reel' ? 'Reel' : 'Foto', tema: temaDe(p), tom: tomDe(p),
  trecho: p.legenda.length > 90 ? `${p.legenda.slice(0, 90)}…` : p.legenda, curt: p.curtidas ?? -1,
})))
const colPosts = [
  { key: 'data', label: 'Data', format: dataBR, hint: 'Data de publicação.' },
  { key: 'perfilTxt', label: 'Perfil', hint: 'Quem publicou.' },
  { key: 'tipoTxt', label: 'Tipo', hint: 'Reel (vídeo) ou foto/carrossel.' },
  { key: 'tema', label: 'Tema', hint: 'Classificado pela legenda: profissionais da casa, preço, tour, conteúdo, data comemorativa ou institucional.' },
  { key: 'curt', label: 'Curtidas', num: true, format: (v) => (v < 0 ? 'ocultas' : num(v)), hint: 'Curtidas na data da coleta. "Ocultas" quando o perfil esconde o número.' },
  { key: 'trecho', label: 'Legenda', link: (r) => r.url, hint: 'Início da legenda. Clique para abrir o post.' },
]

// ---------- destaques calculados ----------
const tudo = porGrupo(base.posts, temaDe)
const mediaTema = (k) => tudo.find((g) => g.k === k)?.media || 0
const destaque = {
  casa: mediaTema(TEMAS[0]),
  tour: mediaTema(TEMAS[2]),
  sante: porPerfil(base.perfis.filter((p) => p.id === 'ig-sante'), base.posts, ref0)[0],
  transmutar: porPerfil(base.perfis.filter((p) => p.id === 'ig-transmutar'), base.posts, ref0)[0],
  clintime: porPerfil(base.perfis.filter((p) => p.id === 'ig-clintime'), base.posts, ref0)[0],
}
const fb = base.perfis.filter((p) => p.rede === 'facebook')
const fbMax = Math.max(...fb.map((p) => p.seguidores || 0))
</script>

<template>
  <div class="stack">
    <section class="card intro">
      <div class="intro-top">
        <RouterLink to="/marketing" class="btn sm ghost"><Icon name="back" :size="14" /> Comercial</RouterLink>
        <span class="chip info">Coleta de {{ dataBR(base.coletadoEm) }}</span>
      </div>
      <h2>Monitor social: Santé e concorrentes</h2>
      <p class="txt">
        Inspirado no Social Bearing, que buscava tweets e mostrava volume, perfis, hashtags, palavras, tom e
        engajamento. Aqui a busca é no Instagram, no Facebook e no YouTube, a rede pública mais usada no Brasil
        ({{ base.redes[2].contasBR }} de contas). Digite uma palavra, um <code>@perfil</code> ou uma <code>#hashtag</code>.
      </p>
      <p class="small muted">{{ base.nota }}</p>
    </section>

    <section class="card busca">
      <div class="search">
        <Icon name="target" :size="18" />
        <input v-model="q" type="search" placeholder="Buscar: palavra, @perfil ou #hashtag" aria-label="Buscar posts" />
        <button v-if="q" class="btn sm ghost" type="button" @click="q = ''">Limpar</button>
      </div>
      <div class="filtros">
        <div class="redes" role="group" aria-label="Redes">
          <button v-for="(r, k) in REDES" :key="k" type="button" class="rede" :class="{ on: redes.includes(k) }" :aria-pressed="redes.includes(k)" @click="alternarRede(k)">
            <Icon :name="r.icon" :size="14" /> {{ r.nome }}
          </button>
        </div>
        <select v-model.number="dias" aria-label="Período">
          <option :value="0">Todo o período</option><option :value="30">Últimos 30 dias</option><option :value="90">Últimos 90 dias</option>
          <option :value="180">Últimos 6 meses</option><option :value="365">Último ano</option>
        </select>
        <select v-model="tipo" aria-label="Tipo de post"><option value="">Reels e fotos</option><option value="reel">Só reels</option><option value="foto">Só fotos</option></select>
      </div>
      <div class="sug small">
        <span class="muted">Experimente:</span>
        <button v-for="s in SUGESTOES" :key="s" type="button" class="chip plain" @click="q = s">{{ s }}</button>
      </div>
    </section>

    <section class="grid cols-4">
      <StatTile label="Posts encontrados" :value="num(resumo.posts)" :hint="`${resumo.perfis} ${resumo.perfis === 1 ? 'perfil' : 'perfis'} · ${resumo.semCurtidas} com curtidas ocultas`" />
      <StatTile label="Curtidas somadas" :value="num(resumo.curtidas)" :hint="`${n1(resumo.media)} por post`" />
      <StatTile label="Reels" :value="pct(resumo.reels)" hint="Parte dos posts que são vídeo" />
      <StatTile label="Ritmo recente" :value="`${n1(resumo.porSemana)}/semana`" :hint="`${resumo.recentes} posts nos 90 dias antes da coleta, somando os perfis`" />
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Posts ao longo do tempo</h2><p>Cada ponto é um post: data × curtidas. Passe o mouse para ver a legenda.</p></div></div>
      <D3TimeDots :points="pontos" />
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Perfis</h2><p>Audiência, atividade e engajamento por rede. Clique no cabeçalho para ordenar.</p></div></div>
      <D3Table :columns="colPerfis" :rows="linhasPerfis" sort-key="seguidores" compact />
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>O que dá curtida: temas</h2>
        <p class="small muted">Curtidas por post em cada tema, classificado pela legenda</p>
        <D3HBar :items="temas" :format="(v) => `${v} por post`" aria-label="Curtidas por tema" />
      </div>
      <div class="card">
        <h2>Hashtags</h2>
        <p class="small muted">Mais usadas nos posts encontrados · azul forte = usada pela Santé</p>
        <D3HBar v-if="hashtags.length" :items="hashtags" :format="(v) => `${v} posts`" aria-label="Hashtags mais usadas" />
        <p v-else class="muted small">Nenhuma hashtag nesta busca.</p>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Palavras mais usadas</h2>
        <p class="small muted">Clique numa palavra para buscar por ela</p>
        <div class="nuvem">
          <button v-for="w in nuvem" :key="w.w" type="button" class="palavra" :style="{ fontSize: `${w.size}px` }" :title="`${w.n} vezes`" @click="q = w.w">{{ w.w }}</button>
        </div>
      </div>
      <div class="card">
        <h2>Dia da semana e tom</h2>
        <p class="small muted">Quando os perfis postam e quanto cada dia rende · mais escuro = maior</p>
        <D3SlotGrid :cols="diaCols" :rows="diaRows" :celula="celulaDia" :selecionavel="false" :deps="porDia" :min-col="38" :row-h="30" aria-label="Posts e curtidas por dia da semana" />
        <div class="tons">
          <div v-for="t in tons" :key="t.k" class="tom">
            <div class="tom-h"><span>{{ t.k }}</span><strong class="tnum">{{ pct(t.p) }}</strong></div>
            <div class="f-track"><div class="f-bar" :class="{ dor: t.k === 'Dor do cliente' }" :style="{ width: `${t.p * 100}%` }" /></div>
            <span class="muted small">{{ t.n }} posts · {{ n1(t.media) }} curtidas por post</span>
          </div>
        </div>
        <p class="small muted">Tom pelo vocabulário da legenda: “Dor do cliente” = fala de custo, burocracia ou cansaço.</p>
      </div>
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Posts</h2><p>Resultado da busca · clique na legenda para abrir o post</p></div></div>
      <D3Table :columns="colPosts" :rows="linhasPosts" sort-key="curt" compact />
      <div v-if="!linhasPosts.length" class="empty">Nenhum post do Instagram nesta busca. Facebook e YouTube aparecem na tabela de perfis e nos quadros abaixo.</div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Facebook</h2>
        <p class="small muted">Páginas públicas encontradas (sem login)</p>
        <ul class="lista">
          <li v-for="p in fb" :key="p.id">
            <strong>{{ p.nome }}</strong>
            <span v-if="p.seguidores != null" class="tnum">{{ num(p.seguidores) }} seguidores<template v-if="p.checkins"> · {{ num(p.checkins) }} check-ins</template></span>
            <span v-else class="muted">{{ p.obs || 'Sem página pública encontrada' }}</span>
            <span v-if="p.seguidores != null" class="barra"><i :style="{ width: `${(p.seguidores / fbMax) * 100}%` }" :class="{ hl: p.empresa === 'sante' }" /></span>
          </li>
        </ul>
        <p class="small nota">Ninguém do setor usa o Facebook de verdade: a maior página é a do Rather, um coworking geral, com {{ num(fbMax) }} seguidores. A Santé não tem página pública ativa.</p>
      </div>
      <div class="card">
        <h2>YouTube</h2>
        <p class="small muted">Busca no YouTube por termos do negócio, em {{ dataBR(base.coletadoEm) }}</p>
        <div v-for="b in base.buscasYoutube" :key="b.termo" class="yt">
          <div class="yt-h"><strong>“{{ b.termo }}”</strong><span class="chip bad">{{ b.doSetor }} de {{ b.analisados }} do setor</span></div>
          <p class="small muted">{{ b.resumo }}</p>
          <ul class="small">
            <li v-for="d in b.destaques" :key="d.titulo">{{ d.titulo }} · <span class="muted">{{ d.canal }} · {{ d.views }} visualizações</span></li>
          </ul>
        </div>
        <p class="small nota">Canais do setor: Rather (13 inscritos, 3 vídeos) e Ampla (3 inscritos). Nenhum concorrente direto. O espaço está livre.</p>
      </div>
    </section>

    <section class="card">
      <h2>O que a coleta mostra</h2>
      <ul class="bullets">
        <li><strong>Profissionais da casa rendem {{ n1(destaque.casa / destaque.tour) }}× mais que tour de sala.</strong> Posts com depoimento ou chegada de um profissional têm {{ n1(destaque.casa) }} curtidas em média; tours e estrutura, {{ n1(destaque.tour) }}. Os três melhores posts da Santé (151, 125 e 56) são depoimentos.</li>
        <li><strong>A Santé tem a maior audiência e posta pouco.</strong> {{ num(destaque.sante.seguidores) }} seguidores, mas o último post é de {{ dataBR(destaque.sante.ultimo) }} e houve {{ destaque.sante.ult90 }} {{ destaque.sante.ult90 === 1 ? 'post' : 'posts' }} nos 90 dias antes da coleta. A ClinTime fez {{ destaque.clintime.ult90 }} e a Transmutar {{ destaque.transmutar.ult90 }}.</li>
        <li><strong>A ClinTime é quem engaja melhor:</strong> {{ pct(destaque.clintime.engajamento) }} dos seguidores reagem a cada post, contra {{ pct(destaque.sante.engajamento) }} da Santé. A receita dela: anunciar cada profissional novo e mostrar a equipe.</li>
        <li><strong>A Transmutar posta muito e engaja pouco</strong> ({{ pct(destaque.transmutar.engajamento) }}): textos sobre custo do consultório próprio e tours. Ela também segue 5.817 perfis para atrair seguidores.</li>
        <li><strong>Preço explícito funciona:</strong> os reels da NutriClin com “R$ 35 por 55 minutos” chegaram a 133 curtidas, mesmo com perfil pequeno.</li>
        <li><strong>Facebook e YouTube estão vazios no setor.</strong> Os vídeos nacionais “tour pelo meu consultório” e “como abrir seu consultório” têm milhares de visualizações, e não há nenhum de Maceió.</li>
      </ul>
      <h3 class="sub-h">Ações sugeridas</h3>
      <ol class="acoes small">
        <li>Uma série mensal “Quem atende na Santé”, com reel de 30 segundos de cada profissional, em collab com o perfil dele.</li>
        <li>Postar 2 vezes por semana: 1 profissional da casa + 1 de preço, oferta ou horário livre (“terça à noite livre na sala 5”).</li>
        <li>Publicar o preço por turno nos reels, como a NutriClin. Com o valor visível, quem vê o post já sabe se cabe no orçamento.</li>
        <li>Reaproveitar os reels no YouTube Shorts e criar o vídeo “Tour pela Santé: como é alugar um consultório em Maceió”. Ninguém ocupa essa busca.</li>
        <li>Reativar uma página no Facebook só para anúncios e check-ins. É barato e nenhum concorrente direto está lá.</li>
      </ol>
    </section>

    <section class="card">
      <h2>Como esta coleta foi feita</h2>
      <ul class="bullets small">
        <li>Instagram: contagens do perfil e os posts mais recentes de cada um, abertos um a um sem login. A busca do Instagram, o alcance e os comentários exigem login ou a API da Meta.</li>
        <li>Facebook: páginas encontradas pelo link no site de cada empresa ou pelo mesmo @ do Instagram. Sem login, só aparecem seguidores, check-ins e “falando sobre isso”.</li>
        <li>YouTube: canais citados nos sites e duas buscas por termos do negócio.</li>
        <li>Para ter dados ao vivo, como o Social Bearing tinha, seria preciso um servidor com acesso às APIs da Meta e do YouTube. Por enquanto, refaça a coleta a cada mês.</li>
        <li>Terceira rede: {{ base.redes[2].porque }} Fonte: {{ base.redes[2].fonte }}.</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.intro-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: -6px 0 10px -10px; }
.intro h2 { font-size: 19px; }
.txt { margin: 8px 0 6px; color: var(--text-2); line-height: 1.6; max-width: 900px; }
.busca { display: grid; gap: 12px; }
.search { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 12px; padding: 0 12px; background: var(--surface-2); }
.search input { flex: 1; border: 0; background: transparent; height: 46px; font-size: 16px; outline: none; }
.search:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.filtros { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.filtros select { height: 34px; }
.redes { display: inline-flex; gap: 4px; background: var(--surface-2); padding: 3px; border-radius: 10px; }
.rede { border: 0; background: transparent; color: var(--muted); font: inherit; font-size: 13px; padding: 5px 10px; border-radius: 8px; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
.rede.on { background: var(--surface); color: var(--text); font-weight: 500; box-shadow: var(--shadow); }
.sug { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.sug .chip { cursor: pointer; border: 0; font: inherit; font-size: 12px; }
.nuvem { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; margin-top: 10px; line-height: 1.3; }
.palavra { border: 0; background: none; padding: 0; font-family: inherit; color: var(--accent-ink); cursor: pointer; font-weight: 500; }
.palavra:hover { text-decoration: underline; }
.tons { display: grid; gap: 10px; margin-top: 14px; }
.tom { display: grid; gap: 3px; }
.tom-h { display: flex; justify-content: space-between; font-size: 13px; }
.f-track { height: 8px; background: var(--s-track); border-radius: 4px; }
.f-bar { height: 100%; background: var(--s-firm); border-radius: 4px; }
.f-bar.dor { background: var(--s-cost); }
.lista { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 10px; font-size: 13px; }
.lista li { display: grid; gap: 2px; }
.barra { height: 6px; background: var(--s-track); border-radius: 3px; display: block; }
.barra i { display: block; height: 100%; background: var(--s-prop); border-radius: 3px; }
.barra i.hl { background: var(--s-firm); }
.nota { margin: 12px 0 0; color: var(--text-2); }
.yt { margin-top: 12px; }
.yt-h { display: flex; justify-content: space-between; gap: 8px; align-items: center; flex-wrap: wrap; }
.yt p { margin: 2px 0 4px; }
.yt ul { margin: 0; padding-left: 18px; display: grid; gap: 2px; }
.bullets { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 8px; color: var(--text-2); line-height: 1.55; }
.bullets strong { color: var(--text); }
.sub-h { font-size: 14px; margin: 18px 0 6px; }
.acoes { margin: 0; padding-left: 20px; display: grid; gap: 6px; color: var(--text-2); }
</style>
