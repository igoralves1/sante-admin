<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { select, zoom as d3zoom, zoomIdentity } from 'd3'
import Icon from '../components/Icon.vue'
import { carregarEsquema } from '../lib/banco'
import { state } from '../lib/store'

const router = useRouter()

// medidas dos cartões das tabelas
const W = 250
const HEAD = 40
const ROW = 22
const PAD = 8
const GAP_X = 90
const GAP_Y = 28
const GAP_SEC = 150
const TOPO = 44 // espaço para o nome do grupo
const PAINEL = 364 // largura do painel de detalhes + margem
const ORDEM_GRUPOS = ['cadastro', 'operacao', 'mercado', 'sistema']

const esquema = ref(null)
const aoVivo = ref(false)
const erro = ref('')
const carregando = ref(true)
const compacto = ref(false)
const busca = ref('')
const hover = ref('')
const sel = ref('')
const copiado = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const r = await carregarEsquema()
    esquema.value = r.esquema
    aoVivo.value = r.aoVivo
    await nextTick()
    ajustar(false)
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}
onMounted(carregar)
watch(() => state.modo, carregar)

// ---------- layout ----------
const linhasDe = (t) => (compacto.value ? t.colunas.filter((c) => c.pk || c.fk) : t.colunas)
const altura = (t) => HEAD + Math.max(1, linhasDe(t).length) * ROW + PAD

const area = ref({ w: 1000, h: 640 })
const GAP_LINHA = 60

// testa várias alturas de coluna e várias quebras dos grupos em duas linhas; fica com o maior zoom
const desenho = computed(() => {
  const e = esquema.value
  if (!e) return null
  const livre = area.value.w > 900 ? area.value.w - PAINEL : area.value.w
  let melhor = null
  for (let lim = 300; lim <= 2400; lim += 100) {
    const secoes = secoesLocais(e, lim)
    for (let quebra = 0; quebra < secoes.length; quebra++) {
      const d = posicionar(secoes, quebra)
      const k = Math.min((livre - 40) / d.largura, (area.value.h - 40) / (d.altura + 10))
      if (!melhor || k > melhor.k + 0.001) melhor = { ...d, k, secoes }
    }
  }
  return { ...melhor, ligacoes: ligacoes(e, melhor.pos) }
})

// cada grupo montado sozinho, a partir de (0, 0)
function secoesLocais(e, ALTURA_MAX) {
  const tabs = e.tabelas
  const por = new Map(tabs.map((t) => [t.nome, t]))
  const pais = (t) => [...new Set(t.colunas.filter((c) => c.fk && c.fk.tabela !== t.nome).map((c) => c.fk.tabela))]

  // profundidade dentro do grupo: tabelas referenciadas à esquerda, as que referenciam à direita
  const prof = new Map()
  const depth = (t, vistos = new Set()) => {
    if (prof.has(t.nome)) return prof.get(t.nome)
    if (vistos.has(t.nome)) return 0
    vistos.add(t.nome)
    const ps = pais(t).map((n) => por.get(n)).filter((p) => p && p.grupo === t.grupo)
    const d = ps.length ? 1 + Math.max(...ps.map((p) => depth(p, vistos))) : 0
    prof.set(t.nome, d)
    return d
  }

  const grupos = [...new Set([...ORDEM_GRUPOS, ...tabs.map((t) => t.grupo)])].filter((g) => tabs.some((t) => t.grupo === g))
  return grupos.map((g) => {
    const pos = new Map()
    const colunas = []
    for (const t of tabs.filter((t) => t.grupo === g)) (colunas[depth(t)] ||= []).push(t)
    let x = 0
    let h = 0
    colunas.filter(Boolean).forEach((col, i) => {
      // aproxima cada tabela das tabelas que ela referencia (menos linhas cruzadas)
      if (i > 0) {
        const centro = (t) => {
          const ys = pais(t).map((n) => pos.get(n)).filter(Boolean).map((p) => p.y + p.h / 2)
          return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : Infinity
        }
        col.sort((a, b) => centro(a) - centro(b))
      } else {
        // as mais referenciadas no meio da coluna
        const filhos = (t) => tabs.filter((o) => pais(o).includes(t.nome)).length
        const ord = [...col].sort((a, b) => filhos(b) - filhos(a))
        col.splice(0, col.length, ...ord.filter((_, k) => k % 2 === 1).reverse(), ...ord.filter((_, k) => k % 2 === 0))
      }
      // coluna alta demais vira duas ou mais
      let y = TOPO
      for (const t of col) {
        if (y > TOPO && y + altura(t) > ALTURA_MAX) {
          x += W + GAP_X / 2
          y = TOPO
        }
        pos.set(t.nome, { x, y, w: W, h: altura(t) })
        y += altura(t) + GAP_Y
        h = Math.max(h, y - GAP_Y)
      }
      x += W + GAP_X
    })
    return { grupo: g, nome: e.grupos?.[g] || g, pos, w: x - GAP_X, h }
  })
}

// grupos lado a lado; a partir de `quebra`, numa segunda linha
function posicionar(secoes, quebra) {
  const pos = new Map()
  const caixas = []
  const linhas = quebra ? [secoes.slice(0, quebra), secoes.slice(quebra)] : [secoes]
  let y0 = 0
  let largura = 0
  for (const linha of linhas) {
    let x0 = 0
    const h = Math.max(...linha.map((s) => s.h))
    for (const s of linha) {
      for (const [nome, p] of s.pos) pos.set(nome, { ...p, x: p.x + x0, y: p.y + y0 })
      caixas.push({ grupo: s.grupo, nome: s.nome, x: x0, y: y0, w: s.w, h })
      x0 += s.w + GAP_SEC
    }
    largura = Math.max(largura, x0 - GAP_SEC)
    y0 += h + GAP_LINHA
  }
  return { pos, caixas, largura, altura: y0 - GAP_LINHA }
}

function ligacoes(e, pos) {
  const por = new Map(e.tabelas.map((t) => [t.nome, t]))
  const yLinha = (tabela, coluna) => {
    const p = pos.get(tabela)
    const i = linhasDe(por.get(tabela)).findIndex((c) => c.nome === coluna)
    return p.y + HEAD + Math.max(0, i) * ROW + ROW / 2
  }
  return e.relacoes
    .filter((r) => pos.has(r.de) && pos.has(r.para))
    .map((r) => {
      const s = pos.get(r.de)
      const t = pos.get(r.para)
      const sy = yLinha(r.de, r.colunas[0])
      const ty = yLinha(r.para, r.refColunas[0])
      let d
      if (s.x === t.x) {
        const sx = s.x + W
        const tx = t.x + W
        d = `M${sx},${sy} C${sx + 60},${sy} ${tx + 60},${ty} ${tx},${ty}`
      } else {
        const paraDireita = t.x > s.x
        const sx = paraDireita ? s.x + W : s.x
        const tx = paraDireita ? t.x : t.x + W
        const k = Math.max(40, Math.abs(tx - sx) / 2)
        d = `M${sx},${sy} C${sx + (paraDireita ? k : -k)},${sy} ${tx + (paraDireita ? -k : k)},${ty} ${tx},${ty}`
      }
      return { ...r, d, id: r.nome }
    })
}

// ---------- destaque ----------
const foco = computed(() => hover.value || sel.value)
const vizinhos = computed(() => {
  if (!foco.value || !desenho.value) return null
  const s = new Set([foco.value])
  for (const l of desenho.value.ligacoes) {
    if (l.de === foco.value) s.add(l.para)
    if (l.para === foco.value) s.add(l.de)
  }
  return s
})
const termo = computed(() => busca.value.trim().toLowerCase())
const casa = (t) =>
  !termo.value || t.nome.includes(termo.value) || t.colunas.some((c) => c.nome.includes(termo.value)) || t.descricao.toLowerCase().includes(termo.value)
const apagada = (t) => (vizinhos.value ? !vizinhos.value.has(t.nome) : !casa(t))
const ligacaoOn = (l) => foco.value && (l.de === foco.value || l.para === foco.value)

// ---------- zoom ----------
const svgEl = ref(null)
const tr = ref(zoomIdentity)
let zoom = null
onMounted(() => {
  zoom = d3zoom()
    .scaleExtent([0.15, 2.5])
    .on('zoom', (ev) => (tr.value = ev.transform))
  select(svgEl.value).call(zoom).on('dblclick.zoom', null)
  medidor = new ResizeObserver(([en]) => {
    const { width, height } = en.contentRect
    if (width && height && (Math.abs(width - area.value.w) > 40 || Math.abs(height - area.value.h) > 40)) {
      area.value = { w: width, h: height }
      nextTick(() => ajustar(false))
    }
  })
  medidor.observe(svgEl.value)
})
let medidor = null
onBeforeUnmount(() => {
  medidor?.disconnect()
  if (svgEl.value) select(svgEl.value).on('.zoom', null)
})

function ajustar(animar = true) {
  const d = desenho.value
  if (!d || !svgEl.value || !zoom) return
  const { width, height } = svgEl.value.getBoundingClientRect()
  const livre = width > 900 ? width - PAINEL : width
  const k = Math.min((livre - 40) / d.largura, (height - 40) / (d.altura + 10), 1.1)
  const t = zoomIdentity.translate((livre - d.largura * k) / 2, Math.max(16, (height - d.altura * k) / 2)).scale(k)
  const alvo = select(svgEl.value)
  ;(animar ? alvo.transition().duration(350) : alvo).call(zoom.transform, t)
}
const zoomPor = (f) => select(svgEl.value).transition().duration(200).call(zoom.scaleBy, f)

function focar(nome) {
  const p = desenho.value?.pos.get(nome)
  if (!p) return
  sel.value = nome
  const { width, height } = svgEl.value.getBoundingClientRect()
  const k = Math.max(tr.value.k, 0.85)
  const livre = width > 900 ? width - PAINEL : width
  const t = zoomIdentity.translate(livre / 2 - (p.x + W / 2) * k, height / 2 - (p.y + Math.min(p.h, height / k - 80) / 2) * k).scale(k)
  select(svgEl.value).transition().duration(400).call(zoom.transform, t)
}
function buscar() {
  const t = esquema.value?.tabelas.find(casa)
  if (t && termo.value) focar(t.nome)
}
watch(compacto, () => nextTick(() => ajustar()))

// ---------- detalhes ----------
const tabela = computed(() => esquema.value?.tabelas.find((t) => t.nome === sel.value) || null)
const painel = ref(null)
watch(sel, () => painel.value && (painel.value.scrollTop = 0))
const relacoesDe = computed(() => esquema.value?.relacoes.filter((r) => r.de === sel.value) || [])
const relacoesPara = computed(() => esquema.value?.relacoes.filter((r) => r.para === sel.value) || [])
const porGrupo = computed(() => {
  const d = desenho.value
  if (!d) return []
  return d.caixas.map((s) => ({ ...s, tabelas: esquema.value.tabelas.filter((t) => t.grupo === s.grupo) }))
})

const TIPOS = [
  [/^timestamp with time zone$/, 'timestamptz'],
  [/^timestamp without time zone$/, 'timestamp'],
  [/^character varying/, 'varchar'],
  [/^integer$/, 'int'],
  [/^boolean$/, 'bool'],
  [/^double precision$/, 'float8'],
  [/^character\(/, 'char('],
]
const tipoCurto = (t) => TIPOS.reduce((s, [re, r]) => s.replace(re, r), t)
const corta = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const n = (v) => (v ?? 0).toLocaleString('pt-BR')

function verLinhas(nome) {
  router.push({ path: '/dados/consultas', query: { tabela: nome } })
}

async function copiar(texto, rotulo) {
  try {
    await navigator.clipboard.writeText(texto)
    copiado.value = rotulo
    setTimeout(() => (copiado.value = ''), 1800)
  } catch {
    /* sem permissão para a área de transferência */
  }
}

function mermaid() {
  const e = esquema.value
  const nome = (s) => s.replace(/[^A-Za-z0-9_]/g, '_')
  const tipo = (s) => tipoCurto(s).replace(/\[\]/g, '_array').replace(/[^A-Za-z0-9_]/g, '_').replace(/_+$/, '')
  const linhas = ['erDiagram']
  for (const r of e.relacoes) {
    const fk = e.tabelas.find((t) => t.nome === r.de)?.colunas.find((c) => c.nome === r.colunas[0])
    linhas.push(`  ${nome(r.para)} ${fk?.nulo ? '|o' : '||'}--o{ ${nome(r.de)} : "${r.colunas.join(', ')}"`)
  }
  for (const t of e.tabelas) {
    linhas.push(`  ${nome(t.nome)} {`)
    for (const c of t.colunas) linhas.push(`    ${tipo(c.tipo)} ${nome(c.nome)}${c.pk ? ' PK' : c.fk ? ' FK' : ''}`)
    linhas.push('  }')
  }
  return linhas.join('\n')
}
const quando = computed(() => {
  const g = esquema.value?.geradoEm
  return g ? new Date(g).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''
})
</script>

<template>
  <div class="stack">
    <section class="card topo">
      <div class="info">
        <span v-if="aoVivo" class="chip good">Ao vivo do servidor</span>
        <span v-else-if="esquema" class="chip warn">Cópia de {{ quando }}</span>
        <span v-if="esquema" class="muted small">
          {{ esquema.banco }} · {{ esquema.tabelas.length }} tabelas · {{ esquema.relacoes.length }} relações
        </span>
      </div>
      <div class="toolbar">
        <input v-model="busca" type="search" class="busca" placeholder="Procurar tabela ou coluna" aria-label="Procurar tabela ou coluna" @keydown.enter="buscar" />
        <label class="check"><input v-model="compacto" type="checkbox" /> Só chaves</label>
        <button class="btn sm icon" type="button" aria-label="Diminuir" title="Diminuir" @click="zoomPor(0.8)"><Icon name="minus" :size="16" /></button>
        <button class="btn sm icon" type="button" aria-label="Aumentar" title="Aumentar" @click="zoomPor(1.25)"><Icon name="plus" :size="16" /></button>
        <button class="btn sm" type="button" @click="ajustar()"><Icon name="fit" :size="15" /> Ajustar à tela</button>
        <button v-if="esquema" class="btn sm" type="button" @click="copiar(mermaid(), 'mermaid')">
          <Icon :name="copiado === 'mermaid' ? 'check' : 'copy'" :size="15" /> {{ copiado === 'mermaid' ? 'Copiado' : 'Copiar Mermaid' }}
        </button>
      </div>
    </section>

    <section class="card tela">
      <svg ref="svgEl" class="er" role="img" aria-label="Diagrama das tabelas do banco de dados e suas relações" @click.self="sel = ''">
        <defs>
          <marker id="er-muitos" viewBox="-16 -7 18 14" refX="0" refY="0" markerWidth="18" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path d="M-11,0 L0,-6 M-11,0 L0,0 M-11,0 L0,6 M-15,-6 L-15,6" fill="none" stroke="context-stroke" stroke-width="1.5" />
          </marker>
          <marker id="er-um" viewBox="-12 -7 14 14" refX="0" refY="0" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M-5,-6 L-5,6 M-9,-6 L-9,6" fill="none" stroke="context-stroke" stroke-width="1.5" />
          </marker>
        </defs>
        <g v-if="desenho" :transform="`translate(${tr.x},${tr.y}) scale(${tr.k})`">
          <g v-for="s in desenho.caixas" :key="s.grupo" class="secao" :class="`g-${s.grupo}`">
            <rect :x="s.x - 20" :y="s.y" :width="s.w + 40" :height="s.h + 24" rx="18" class="secao-bg" />
            <text :x="s.x" :y="s.y + 26" class="secao-nome">{{ s.nome }}</text>
          </g>

          <path
            v-for="l in desenho.ligacoes" :key="l.id" :d="l.d" class="lig"
            :class="{ on: ligacaoOn(l), off: foco && !ligacaoOn(l) }"
            marker-start="url(#er-muitos)" marker-end="url(#er-um)"
          >
            <title>{{ l.de }}.{{ l.colunas.join(', ') }} → {{ l.para }}.{{ l.refColunas.join(', ') }} (ao excluir: {{ l.aoExcluir }})</title>
          </path>

          <g
            v-for="t in esquema.tabelas" :key="t.nome" class="tab" :class="[`g-${t.grupo}`, { off: apagada(t), sel: sel === t.nome }]"
            :transform="`translate(${desenho.pos.get(t.nome).x},${desenho.pos.get(t.nome).y})`"
            tabindex="0" role="button" :aria-label="t.linhas == null ? `Tabela ${t.nome}` : `Tabela ${t.nome}, ${t.linhas} linhas`"
            @mouseenter="hover = t.nome" @mouseleave="hover = ''" @click.stop="sel = t.nome" @keydown.enter="sel = t.nome"
          >
            <rect :width="W" :height="altura(t)" rx="10" class="tab-bg" />
            <path :d="`M0,10 a10,10 0 0 1 10,-10 h${W - 20} a10,10 0 0 1 10,10 v${HEAD - 10} h-${W} z`" class="tab-head" />
            <rect :width="W" height="4" rx="2" class="tab-faixa" />
            <text x="12" y="26" class="tab-nome">{{ corta(t.nome, 24) }}</text>
            <text v-if="t.linhas != null" :x="W - 12" y="26" text-anchor="end" class="tab-qtd">{{ n(t.linhas) }}</text>
            <g v-for="(c, i) in linhasDe(t)" :key="c.nome" :transform="`translate(0,${HEAD + i * ROW})`" class="col" :class="{ chave: c.pk || c.fk }">
              <text x="12" :y="ROW / 2 + 4" class="col-tag" :class="c.pk ? 'pk' : c.fk ? 'fk' : ''">{{ c.pk ? 'PK' : c.fk ? 'FK' : '' }}</text>
              <text x="36" :y="ROW / 2 + 4" class="col-nome">{{ corta(c.nome, 19) }}</text>
              <text :x="W - 12" :y="ROW / 2 + 4" text-anchor="end" class="col-tipo">{{ corta(tipoCurto(c.tipo), 15) }}{{ c.nulo ? '?' : '' }}</text>
            </g>
          </g>
        </g>
      </svg>

      <div v-if="carregando" class="aviso">Carregando o esquema…</div>
      <div v-else-if="erro" class="aviso bad">
        <Icon name="alert" /> <span>{{ erro }}</span>
        <button class="btn sm" type="button" @click="carregar">Tentar de novo</button>
      </div>

      <aside v-if="esquema" ref="painel" class="painel" aria-live="polite">
        <template v-if="tabela">
          <div class="painel-head">
            <div>
              <span class="grupo-tag" :class="`g-${tabela.grupo}`">{{ esquema.grupos[tabela.grupo] || tabela.grupo }}</span>
              <h2 class="mono">{{ tabela.nome }}</h2>
            </div>
            <button class="btn sm icon ghost" type="button" aria-label="Fechar" @click="sel = ''"><Icon name="close" :size="16" /></button>
          </div>
          <p v-if="tabela.descricao" class="desc">{{ tabela.descricao }}</p>
          <p class="muted small">
            <template v-if="tabela.linhas != null">{{ n(tabela.linhas) }} {{ tabela.linhas === 1 ? 'linha' : 'linhas' }} · </template>{{ tabela.colunas.length }} colunas
          </p>
          <div class="toolbar">
            <button v-if="aoVivo" class="btn sm primary" type="button" @click="verLinhas(tabela.nome)"><Icon name="tabela" :size="15" /> Ver linhas</button>
            <button class="btn sm" type="button" @click="copiar(`SELECT * FROM ${tabela.nome} LIMIT 100;`, 'select')">
              <Icon :name="copiado === 'select' ? 'check' : 'copy'" :size="15" /> {{ copiado === 'select' ? 'Copiado' : 'Copiar SELECT' }}
            </button>
          </div>

          <h3>Colunas</h3>
          <table class="mini">
            <tbody>
              <tr v-for="c in tabela.colunas" :key="c.nome">
                <td class="tag"><span v-if="c.pk" class="col-tag pk">PK</span><span v-else-if="c.fk" class="col-tag fk">FK</span></td>
                <td>
                  <span class="mono">{{ c.nome }}</span>
                  <button v-if="c.fk" class="lnk small" type="button" @click="focar(c.fk.tabela)">→ {{ c.fk.tabela }}.{{ c.fk.coluna }}</button>
                  <span v-if="c.padrao" class="muted small block">padrão: <span class="mono">{{ c.padrao }}</span></span>
                </td>
                <td class="tipo mono" :title="c.tipo">{{ tipoCurto(c.tipo) }}<span class="nn">{{ c.nulo ? 'aceita NULL' : 'obrigatório' }}</span></td>
              </tr>
            </tbody>
          </table>

          <template v-if="relacoesDe.length">
            <h3>Referencia</h3>
            <ul class="rel">
              <li v-for="r in relacoesDe" :key="r.nome">
                <span class="mono">{{ r.colunas.join(', ') }}</span> →
                <button class="lnk" type="button" @click="focar(r.para)">{{ r.para }}</button>
                <span class="chip plain">ao excluir: {{ r.aoExcluir }}</span>
              </li>
            </ul>
          </template>
          <template v-if="relacoesPara.length">
            <h3>É referenciada por</h3>
            <ul class="rel">
              <li v-for="r in relacoesPara" :key="r.nome">
                <button class="lnk" type="button" @click="focar(r.de)">{{ r.de }}</button>.<span class="mono">{{ r.colunas.join(', ') }}</span>
                <span class="chip plain">ao excluir: {{ r.aoExcluir }}</span>
              </li>
            </ul>
          </template>
          <template v-if="tabela.unicas.length">
            <h3>Valores únicos</h3>
            <p class="small mono">{{ tabela.unicas.map((u) => u.join(' + ')).join(' · ') }}</p>
          </template>
          <template v-if="tabela.indices.length">
            <h3>Índices</h3>
            <ul class="idx">
              <li v-for="i in tabela.indices" :key="i.nome" class="small mono" :title="i.definicao">{{ i.definicao.replace(/^CREATE (UNIQUE )?INDEX \S+ ON public\./, '$1') }}</li>
            </ul>
          </template>
        </template>

        <template v-else>
          <h2>Tabelas</h2>
          <p class="muted small">Clique numa tabela para ver colunas, chaves e índices. Arraste para mover e use a roda do mouse para o zoom.</p>
          <div v-for="g in porGrupo" :key="g.grupo" class="lista-grupo">
            <span class="grupo-tag" :class="`g-${g.grupo}`">{{ g.nome }}</span>
            <ul>
              <li v-for="t in g.tabelas" :key="t.nome">
                <button class="lnk mono" type="button" @click="focar(t.nome)" @mouseenter="hover = t.nome" @mouseleave="hover = ''">{{ t.nome }}</button>
                <span v-if="t.linhas != null" class="muted small tnum">{{ n(t.linhas) }}</span>
              </li>
            </ul>
          </div>
          <h3>Legenda</h3>
          <ul class="legenda small">
            <li><span class="col-tag pk">PK</span> chave primária</li>
            <li><span class="col-tag fk">FK</span> chave estrangeira</li>
            <li><svg width="44" height="14" aria-hidden="true"><path d="M2,7 H42 M2,1 L13,7 L2,13 M17,1 V13" class="leg" /></svg> muitos (lado da FK)</li>
            <li><svg width="44" height="14" aria-hidden="true"><path d="M2,7 H42 M33,1 V13 M37,1 V13" class="leg" /></svg> um (tabela referenciada)</li>
            <li><span class="mono">tipo?</span> aceita vazio (NULL)</li>
          </ul>
        </template>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.topo { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 16px; }
.info { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.busca { width: 220px; height: 30px; font-size: 13px; }
.check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-2); cursor: pointer; }
.check input { height: auto; }

.tela { position: relative; padding: 0; overflow: hidden; height: max(540px, calc(100vh - 230px)); }
.er { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; user-select: none; }
.er:active { cursor: grabbing; }
.aviso { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--muted); }
.aviso.bad { color: var(--bad); }

.secao-bg { fill: var(--surface-2); opacity: 0.55; pointer-events: none; }
.secao-nome { pointer-events: none; }
.secao-nome { font-size: 15px; font-weight: 600; fill: var(--text-2); }

.lig { fill: none; stroke: var(--muted); stroke-width: 1.4; opacity: 0.55; transition: opacity 0.15s; }
.lig.on { stroke: var(--accent); stroke-width: 2.2; opacity: 1; }
.lig.off { opacity: 0.12; }

.tab { cursor: pointer; outline: none; transition: opacity 0.15s; }
.tab.off { opacity: 0.28; }
.tab-bg { fill: var(--surface); stroke: var(--border); stroke-width: 1; }
.tab:hover .tab-bg, .tab:focus-visible .tab-bg { stroke: var(--text-2); }
.tab.sel .tab-bg { stroke: var(--accent); stroke-width: 2; }
.tab-head { fill: var(--surface-2); }
.tab-nome { font-size: 13px; font-weight: 600; fill: var(--text); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.tab-qtd { font-size: 11px; fill: var(--muted); font-variant-numeric: tabular-nums; }
.col-nome { font-size: 12px; fill: var(--text); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.col.chave .col-nome { font-weight: 600; }
.col-tipo { font-size: 11px; fill: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
text.col-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.04em; }
text.col-tag.pk { fill: var(--warn); }
text.col-tag.fk { fill: var(--accent-ink); }

/* cor de cada grupo: só na faixa e na etiqueta; o nome do grupo sempre aparece em texto */
.g-cadastro { --g: var(--g-cadastro); }
.g-operacao { --g: var(--g-operacao); }
.g-mercado { --g: var(--g-mercado); }
.g-sistema, .g-outros { --g: var(--muted); }
.tab-faixa { fill: var(--g); }
.grupo-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-2); }
.grupo-tag::before { content: ''; width: 10px; height: 4px; border-radius: 2px; background: var(--g); }

.painel {
  position: absolute; top: 12px; right: 12px; bottom: 12px; width: 340px; overflow-y: auto;
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 24px rgba(16, 24, 40, 0.12);
  padding: 16px; display: grid; gap: 10px; align-content: start;
}
.painel-head { display: flex; justify-content: space-between; align-items: start; gap: 8px; }
.painel h2 { font-size: 16px; margin-top: 2px; }
.painel h3 { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 8px 0 0; }
.painel p { margin: 0; }
.desc { color: var(--text-2); font-size: 13px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.block { display: block; }
.mini td { padding: 5px 4px; border-bottom: 1px solid var(--border); vertical-align: top; }
.mini td.tag { width: 26px; }
.mini td.tipo { color: var(--text-2); text-align: right; font-size: 11px; white-space: nowrap; }
.nn { display: block; color: var(--muted); font-size: 10px; font-family: Inter, system-ui, sans-serif; }
span.col-tag { font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 4px; background: var(--surface-2); }
span.col-tag.pk { color: var(--warn); background: var(--warn-soft); }
span.col-tag.fk { color: var(--accent-ink); background: var(--accent-soft); }
.lnk { border: 0; background: none; padding: 0; font: inherit; color: var(--accent-ink); cursor: pointer; text-align: left; }
.lnk:hover { text-decoration: underline; }
.lnk.small { font-size: 11px; margin-left: 6px; }
.rel, .idx, .legenda, .lista-grupo ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.rel li { font-size: 13px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; }
.idx li { color: var(--text-2); word-break: break-word; }
.lista-grupo { display: grid; gap: 6px; margin-top: 4px; }
.lista-grupo ul { gap: 2px; }
.lista-grupo li { display: flex; justify-content: space-between; gap: 8px; }
.legenda li { display: flex; align-items: center; gap: 8px; color: var(--text-2); }
.leg { fill: none; stroke: var(--muted); stroke-width: 1.5; }

@media (max-width: 900px) {
  .tela { height: auto; overflow: visible; }
  .er { height: 460px; }
  .painel { position: static; width: auto; box-shadow: none; border-width: 1px 0 0; border-radius: 0; max-height: none; }
  .busca { width: 100%; }
}
</style>
