<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import GradeDados from '../components/GradeDados.vue'
import { assistente, carregarEsquema, consultar, csv, linhasTabela, traduzir } from '../lib/banco'
import { baixar } from '../lib/store'

const route = useRoute()
const router = useRouter()

const EXEMPLOS = [
  { nome: 'Espaços e preços', sql: 'SELECT nome, tipo, modalidade, preco, preco_turno\nFROM espaco\nORDER BY ordem;' },
  {
    nome: 'Contratos em vigor por espaço',
    sql: "SELECT e.nome AS espaco,\n       count(c.id) AS contratos,\n       sum(c.quantidade * c.preco) AS receita_mensal\nFROM espaco e\nLEFT JOIN contrato c ON c.espaco_id = e.id\n     AND c.status <> 'Cancelada'\n     AND (c.fim IS NULL OR c.fim >= current_date)\nGROUP BY e.nome, e.ordem\nORDER BY e.ordem;",
  },
  {
    nome: 'Agenda deste mês',
    sql: "SELECT a.data, e.nome AS espaco, a.tipo, a.slots, a.cliente, a.valor, a.status\nFROM agendamento a\nJOIN espaco e ON e.id = a.espaco_id\nWHERE date_trunc('month', a.data) = date_trunc('month', current_date)\nORDER BY a.data, e.ordem;",
  },
  {
    nome: 'Turnos não disponíveis por espaço',
    sql: "SELECT e.nome AS espaco,\n       count(*) AS dias,\n       sum(cardinality(a.slots)) AS turnos\nFROM agendamento a\nJOIN espaco e ON e.id = a.espaco_id\nWHERE a.tipo = 'bloqueio' AND a.status <> 'Cancelada'\nGROUP BY e.nome\nORDER BY turnos DESC;",
  },
  { nome: 'Turnos de cada espaço', sql: "SELECT coalesce(e.nome, 'Santé (todas as salas)') AS espaco, t.nome, t.ini, t.fim, t.dias\nFROM turno t\nLEFT JOIN espaco e ON e.id = t.espaco_id\nORDER BY e.ordem NULLS FIRST, t.ordem;" },
  { nome: 'Custos fixos', sql: 'SELECT descricao, valor\nFROM custo_fixo\nORDER BY valor DESC;' },
  { nome: 'Concorrentes por preço da hora', sql: 'SELECT nome, regiao, preco_hora_min, ameaca\nFROM concorrente\nORDER BY preco_hora_min NULLS LAST;' },
  {
    nome: 'Tamanho das tabelas',
    sql: 'SELECT relname AS tabela,\n       n_live_tup AS linhas,\n       pg_size_pretty(pg_total_relation_size(relid)) AS tamanho\nFROM pg_stat_user_tables\nORDER BY pg_total_relation_size(relid) DESC;',
  },
  { nome: 'Migrações aplicadas', sql: 'SELECT id, version, app\nFROM aerich\nORDER BY id;' },
]

// ---------- armazenamento local (rascunho e histórico) ----------
const ler = (k, padrao) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? padrao
  } catch {
    return padrao
  }
}
const gravar = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

// ---------- esquema (lista de tabelas) ----------
const esquema = ref(null)
const erroEsquema = ref('')
const filtro = ref('')
async function carregarLista() {
  try {
    esquema.value = await carregarEsquema()
    erroEsquema.value = ''
  } catch (e) {
    erroEsquema.value = e.message
  }
}
const grupos = computed(() => {
  const e = esquema.value
  if (!e) return []
  const f = filtro.value.trim().toLowerCase()
  const ordem = ['cadastro', 'operacao', 'mercado', 'sistema']
  return ordem
    .map((g) => ({ g, nome: e.grupos[g] || g, tabelas: e.tabelas.filter((t) => t.grupo === g && (!f || t.nome.includes(f))) }))
    .filter((x) => x.tabelas.length)
})
const infoTabela = computed(() => esquema.value?.tabelas.find((t) => t.nome === tabela.value))

// ---------- abas ----------
const ABAS = ['perguntar', 'tabela', 'sql']
const aba = ref(ABAS.includes(route.query.aba) ? route.query.aba : route.query.tabela ? 'tabela' : 'perguntar')
watch(aba, (a) => router.replace({ query: { ...route.query, aba: a === 'perguntar' ? undefined : a } }))

// ---------- perguntar em português ----------
const SUGESTOES = [
  'Quanto cada sala faturou com locações neste mês?',
  'Quais contratos estão em vigor e qual o valor mensal de cada um?',
  'Qual a ocupação de cada sala neste mês?',
  'Quais turnos estão marcados como não disponíveis este mês?',
  'Qual o total dos custos fixos por mês?',
  'Quais concorrentes cobram menos por hora?',
]
const ia = ref(null) // { disponivel, modelo }
const pergunta = ref('')
const conversa = ref(ler('sante-perguntas', []).map((c) => ({ ...c, resultado: null, erro: '', estado: 'pronto' })))
const fim = ref(null)
const ocupado = computed(() => conversa.value.some((c) => c.estado !== 'pronto'))
// guarda só pergunta, SQL e explicação (os resultados podem ter dados pessoais e ficam só na tela)
watch(conversa, (cs) => gravar('sante-perguntas', cs.slice(-20).map(({ pergunta, sql, explicacao, pode }) => ({ pergunta, sql, explicacao, pode }))), { deep: true })

async function perguntar(texto = pergunta.value) {
  texto = texto.trim()
  if (!texto || ocupado.value) return
  const historico = conversa.value.filter((c) => c.sql).map((c) => ({ pergunta: c.pergunta, sql: c.sql }))
  conversa.value.push({ pergunta: texto, sql: '', explicacao: '', pode: true, resultado: null, erro: '', estado: 'traduzindo', verSql: false })
  const item = conversa.value[conversa.value.length - 1]
  pergunta.value = ''
  rolar()
  try {
    const r = await traduzir(texto, historico)
    item.sql = r.sql
    item.explicacao = r.explicacao
    item.pode = r.podeResponder
    if (r.podeResponder) await rodarItem(item)
  } catch (e) {
    item.erro = e.message
  } finally {
    item.estado = 'pronto'
    rolar()
  }
}
async function rodarItem(item) {
  item.estado = 'rodando'
  item.erro = ''
  try {
    item.resultado = await consultar(item.sql, 500)
  } catch (e) {
    item.erro = e.message
    item.resultado = null
  } finally {
    item.estado = 'pronto'
  }
}
function teclasPergunta(ev) {
  if (ev.key === 'Enter' && !ev.shiftKey) {
    ev.preventDefault()
    perguntar()
  }
}
function novaConversa() {
  conversa.value = []
  pergunta.value = ''
}
function noEditor(item) {
  sql.value = item.sql
  aba.value = 'sql'
}
function rolar() {
  nextTick(() => fim.value?.scrollIntoView({ behavior: 'smooth', block: 'end' }))
}

// ---------- navegar numa tabela ----------
const tabela = ref(String(route.query.tabela || ''))
const pagina = ref(1)
const limite = ref(50)
const ordem = ref('')
const desc = ref(false)
const busca = ref('')
const res = ref(null)
const carregando = ref(false)
const erro = ref('')
let seq = 0

async function abrir() {
  if (!tabela.value) return
  const minha = ++seq
  carregando.value = true
  erro.value = ''
  try {
    const r = await linhasTabela(tabela.value, { limite: limite.value, pagina: pagina.value, ordem: ordem.value, desc: desc.value, busca: busca.value.trim() })
    if (minha === seq) res.value = r
  } catch (e) {
    if (minha === seq) {
      erro.value = e.message
      res.value = null
    }
  } finally {
    if (minha === seq) carregando.value = false
  }
}
function escolher(nome) {
  aba.value = 'tabela'
  if (nome === tabela.value) return abrir()
  tabela.value = nome
  pagina.value = 1
  ordem.value = ''
  desc.value = false
  busca.value = ''
}
watch(tabela, (t) => {
  router.replace({ query: { ...route.query, tabela: t || undefined } })
  abrir()
})
watch([pagina, limite, ordem, desc], abrir)
let espera = null
watch(busca, () => {
  clearTimeout(espera)
  espera = setTimeout(() => {
    if (pagina.value !== 1) pagina.value = 1
    else abrir()
  }, 300)
})
watch(limite, () => (pagina.value = 1))
function ordenar(col) {
  if (ordem.value === col) desc.value = !desc.value
  else {
    ordem.value = col
    desc.value = false
  }
}
const paginas = computed(() => (res.value?.total ? Math.max(1, Math.ceil(res.value.total / limite.value)) : 1))
const n = (v) => (v ?? 0).toLocaleString('pt-BR')
function abrirNoSql() {
  sql.value = `SELECT *\nFROM ${tabela.value}\n${busca.value.trim() ? `WHERE ${tabela.value}::text ILIKE '%${busca.value.trim().replace(/'/g, "''")}%'\n` : ''}${ordem.value ? `ORDER BY ${ordem.value}${desc.value ? ' DESC' : ''}\n` : ''}LIMIT ${limite.value};`
  aba.value = 'sql'
}

// ---------- consulta SQL ----------
const sql = ref(ler('sante-sql', EXEMPLOS[0].sql))
const limiteSql = ref(500)
const resSql = ref(null)
const erroSql = ref('')
const rodando = ref(false)
const historico = ref(ler('sante-sql-historico', []))
const editor = ref(null)
watch(sql, (v) => gravar('sante-sql', v))

async function executar() {
  const el = editor.value
  const trecho = el && el.selectionEnd > el.selectionStart ? sql.value.slice(el.selectionStart, el.selectionEnd) : sql.value
  const texto = trecho.trim()
  if (!texto || rodando.value) return
  rodando.value = true
  erroSql.value = ''
  try {
    resSql.value = await consultar(texto, limiteSql.value)
    historico.value = [texto, ...historico.value.filter((h) => h !== texto)].slice(0, 20)
    gravar('sante-sql-historico', historico.value)
  } catch (e) {
    erroSql.value = e.message
    resSql.value = null
  } finally {
    rodando.value = false
  }
}
function teclas(ev) {
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') {
    ev.preventDefault()
    executar()
  }
}
function usar(texto) {
  sql.value = texto
  editor.value?.focus()
}
function limparHistorico() {
  historico.value = []
  gravar('sante-sql-historico', [])
}

function exportar(r, nome) {
  baixar(`${nome}.csv`, csv(r.colunas, r.linhas), 'text/csv;charset=utf-8')
}
const ms = (v) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ms`

onMounted(async () => {
  assistente().then((r) => (ia.value = r)).catch(() => (ia.value = { disponivel: false, modelo: '' }))
  await carregarLista()
  if (tabela.value) abrir()
})
</script>

<template>
  <div class="layout">
    <aside class="card lista">
      <input v-model="filtro" type="search" placeholder="Filtrar tabelas" aria-label="Filtrar tabelas" />
      <p v-if="erroEsquema" class="erro small">{{ erroEsquema }}</p>
      <nav v-for="g in grupos" :key="g.g" class="grupo" :aria-label="g.nome">
        <span class="grupo-nome">{{ g.nome }}</span>
        <button
          v-for="t in g.tabelas" :key="t.nome" type="button" class="item"
          :class="{ on: aba === 'tabela' && tabela === t.nome }" :title="t.descricao" @click="escolher(t.nome)"
        >
          <span class="mono">{{ t.nome }}</span><span class="qtd">{{ n(t.linhas) }}</span>
        </button>
      </nav>
    </aside>

    <section class="card principal">
      <div class="abas" role="tablist">
        <button type="button" role="tab" :aria-selected="aba === 'perguntar'" :class="{ on: aba === 'perguntar' }" @click="aba = 'perguntar'">
          <Icon name="pergunta" :size="16" /> Perguntar
        </button>
        <button type="button" role="tab" :aria-selected="aba === 'tabela'" :class="{ on: aba === 'tabela' }" @click="aba = 'tabela'">
          <Icon name="tabela" :size="16" /> Navegar tabela
        </button>
        <button type="button" role="tab" :aria-selected="aba === 'sql'" :class="{ on: aba === 'sql' }" @click="aba = 'sql'">
          <Icon name="api" :size="16" /> Editor SQL
        </button>
        <span class="chip info plain so-leitura" title="As consultas rodam com um usuário do banco que só pode ler.">Só leitura</span>
      </div>

      <!-- perguntar -->
      <template v-if="aba === 'perguntar'">
        <div v-if="ia && !ia.disponivel" class="note">
          <strong>Falta configurar o assistente.</strong> Para traduzir perguntas em SQL, o servidor precisa de uma chave da
          API da Anthropic: coloque <span class="mono">ANTHROPIC_API_KEY=...</span> no arquivo <span class="mono">.env</span>
          do sante-BE e rode <span class="mono">docker compose up -d</span>. Enquanto isso, use as abas Navegar tabela e Editor SQL.
        </div>

        <div v-if="!conversa.length" class="vazio">
          <p class="muted">Pergunte em português. O assistente escreve a consulta SQL, ela roda no banco (só leitura) e o resultado aparece aqui.</p>
          <div class="sugestoes">
            <button v-for="s in SUGESTOES" :key="s" type="button" class="sugestao" :disabled="!ia?.disponivel" @click="perguntar(s)">{{ s }}</button>
          </div>
        </div>

        <div v-else class="conversa">
          <article v-for="(c, i) in conversa" :key="i" class="troca">
            <p class="eu">{{ c.pergunta }}</p>
            <div class="resposta">
              <p v-if="c.estado === 'traduzindo'" class="muted small"><span class="girando" aria-hidden="true" /> Escrevendo a consulta…</p>
              <template v-else>
                <p v-if="c.explicacao" class="explica">{{ c.explicacao }}</p>
                <div v-if="c.sql" class="sql-bloco">
                  <div class="toolbar">
                    <button class="btn sm ghost" type="button" :aria-expanded="c.verSql" @click="c.verSql = !c.verSql">
                      <Icon name="api" :size="15" /> {{ c.verSql ? 'Esconder SQL' : 'Ver SQL' }}
                    </button>
                    <button class="btn sm ghost" type="button" :disabled="c.estado !== 'pronto'" @click="rodarItem(c)"><Icon name="play" :size="14" /> Rodar de novo</button>
                    <button class="btn sm ghost" type="button" @click="noEditor(c)"><Icon name="edit" :size="14" /> Abrir no editor</button>
                    <button v-if="c.resultado?.linhas.length" class="btn sm ghost" type="button" @click="exportar(c.resultado, 'pergunta')"><Icon name="download" :size="14" /> CSV</button>
                  </div>
                  <textarea v-if="c.verSql" v-model="c.sql" class="editor pequeno" spellcheck="false" aria-label="SQL gerado" @keydown.meta.enter.prevent="rodarItem(c)" @keydown.ctrl.enter.prevent="rodarItem(c)" />
                </div>
                <div v-if="c.erro" class="erro"><Icon name="alert" :size="16" /> {{ c.erro }}</div>
                <p v-if="c.estado === 'rodando'" class="muted small"><span class="girando" aria-hidden="true" /> Consultando o banco…</p>
                <template v-if="c.resultado">
                  <p class="muted small tnum">
                    {{ n(c.resultado.quantidade) }} {{ c.resultado.quantidade === 1 ? 'linha' : 'linhas' }} · {{ ms(c.resultado.tempoMs) }}
                    <span v-if="c.resultado.truncado" class="chip warn">Mostrando as primeiras {{ n(c.resultado.quantidade) }}</span>
                  </p>
                  <GradeDados v-if="c.resultado.colunas.length" :key="i + JSON.stringify(c.resultado.colunas)" class="grade-pergunta" :colunas="c.resultado.colunas" :linhas="c.resultado.linhas" />
                </template>
                <p v-else-if="c.sql && !c.erro && c.estado === 'pronto'" class="muted small">Clique em Rodar de novo para ver o resultado.</p>
              </template>
            </div>
          </article>
          <div ref="fim" />
        </div>

        <form class="caixa-pergunta" @submit.prevent="perguntar()">
          <textarea
            v-model="pergunta" rows="2" :disabled="!ia?.disponivel" aria-label="Sua pergunta"
            :placeholder="conversa.length ? 'Continue a conversa: “agora só da Sala 1”, “ordene pelo valor”…' : 'Ex.: quanto cada sala faturou com locações neste mês?'"
            @keydown="teclasPergunta"
          />
          <div class="toolbar">
            <button class="btn primary" type="submit" :disabled="!pergunta.trim() || ocupado || !ia?.disponivel"><Icon name="play" :size="15" /> Perguntar</button>
            <button v-if="conversa.length" class="btn ghost" type="button" :disabled="ocupado" @click="novaConversa">Nova conversa</button>
            <span class="muted small aviso-ia">
              Enter envia; Shift + Enter quebra a linha. Vão para a Anthropic só a pergunta e a estrutura do banco, nunca os dados.
              <template v-if="ia?.modelo"> Modelo: {{ ia.modelo }}.</template>
            </span>
          </div>
        </form>
      </template>

      <!-- navegar -->
      <template v-else-if="aba === 'tabela'">
        <p v-if="!tabela" class="empty">Escolha uma tabela na lista.</p>
        <template v-else>
          <div class="cab">
            <div>
              <h2 class="mono">{{ tabela }}</h2>
              <p v-if="infoTabela?.descricao" class="muted small">{{ infoTabela.descricao }}</p>
            </div>
            <div class="toolbar">
              <input v-model="busca" type="search" class="filtro" placeholder="Procurar em qualquer coluna" aria-label="Procurar nas linhas" />
              <button class="btn sm" type="button" @click="abrirNoSql"><Icon name="api" :size="15" /> Abrir no SQL</button>
              <button class="btn sm" type="button" :disabled="!res?.linhas.length" @click="exportar(res, tabela)"><Icon name="download" :size="15" /> CSV</button>
              <RouterLink to="/dados/diagrama" class="btn sm ghost"><Icon name="diagrama" :size="15" /> Diagrama</RouterLink>
            </div>
          </div>
          <div v-if="erro" class="erro"><Icon name="alert" :size="16" /> {{ erro }}</div>
          <GradeDados
            v-if="res" :key="tabela" :colunas="res.colunas" :linhas="res.linhas" ordenavel
            :ordem="ordem" :desc="desc" :inicio="(pagina - 1) * limite + 1" :class="{ carregando }" @ordenar="ordenar"
          />
          <div v-if="res" class="rodape">
            <span class="muted small tnum">
              {{ n(res.total) }} {{ res.total === 1 ? 'linha' : 'linhas' }}<template v-if="busca.trim()"> com “{{ busca.trim() }}”</template> · {{ ms(res.tempoMs) }}
            </span>
            <div class="toolbar">
              <label class="small muted">Por página
                <select v-model.number="limite" class="sel"><option :value="25">25</option><option :value="50">50</option><option :value="100">100</option><option :value="500">500</option></select>
              </label>
              <button class="btn sm icon" type="button" aria-label="Página anterior" :disabled="pagina <= 1" @click="pagina--"><Icon name="left" :size="15" /></button>
              <span class="small tnum">{{ pagina }} de {{ paginas }}</span>
              <button class="btn sm icon" type="button" aria-label="Próxima página" :disabled="pagina >= paginas" @click="pagina++"><Icon name="right" :size="15" /></button>
            </div>
          </div>
        </template>
      </template>

      <!-- SQL -->
      <template v-else>
        <div class="editor-wrap">
          <textarea
            ref="editor" v-model="sql" class="editor" spellcheck="false" rows="8" aria-label="Consulta SQL"
            placeholder="SELECT * FROM espaco;" @keydown="teclas"
          />
        </div>
        <div class="cab">
          <div class="toolbar">
            <button class="btn primary" type="button" :disabled="rodando" @click="executar"><Icon name="play" :size="15" /> {{ rodando ? 'Executando…' : 'Executar' }}</button>
            <span class="muted small">⌘/Ctrl + Enter. Com um trecho selecionado, roda só o trecho.</span>
          </div>
          <div class="toolbar">
            <select class="sel" aria-label="Exemplos de consulta" @change="usar(EXEMPLOS[$event.target.value].sql); $event.target.value = ''">
              <option value="">Exemplos…</option>
              <option v-for="(e, i) in EXEMPLOS" :key="i" :value="i">{{ e.nome }}</option>
            </select>
            <select v-if="historico.length" class="sel hist" aria-label="Histórico de consultas" @change="$event.target.value === 'x' ? limparHistorico() : usar(historico[$event.target.value]); $event.target.value = ''">
              <option value="">Histórico…</option>
              <option v-for="(h, i) in historico" :key="i" :value="i">{{ h.replace(/\s+/g, ' ').slice(0, 70) }}</option>
              <option value="x">— Limpar histórico</option>
            </select>
            <label class="small muted">Até
              <select v-model.number="limiteSql" class="sel"><option :value="100">100</option><option :value="500">500</option><option :value="1000">1.000</option><option :value="5000">5.000</option></select>
              linhas
            </label>
          </div>
        </div>
        <div v-if="erroSql" class="erro"><Icon name="alert" :size="16" /> {{ erroSql }}</div>
        <template v-if="resSql">
          <div class="rodape">
            <span class="small tnum">
              <strong>{{ resSql.comando }}</strong> · {{ n(resSql.quantidade) }} {{ resSql.quantidade === 1 ? 'linha' : 'linhas' }} · {{ ms(resSql.tempoMs) }}
              <span v-if="resSql.truncado" class="chip warn">Mostrando as primeiras {{ n(resSql.quantidade) }}</span>
            </span>
            <button class="btn sm" type="button" :disabled="!resSql.linhas.length" @click="exportar(resSql, 'consulta')"><Icon name="download" :size="15" /> CSV</button>
          </div>
          <GradeDados v-if="resSql.colunas.length" :key="JSON.stringify(resSql.colunas)" :colunas="resSql.colunas" :linhas="resSql.linhas" />
          <p v-else class="note">Comando executado. Ele não devolve linhas.</p>
        </template>
        <p class="note small">
          Só leitura: o banco recusa <span class="mono">INSERT</span>, <span class="mono">UPDATE</span>, <span class="mono">DELETE</span> e
          mudanças na estrutura. Cada consulta pode levar até 5 segundos. Para alterar dados, use as telas do sistema.
        </p>
      </template>
    </section>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 16px; align-items: start; }
.lista { position: sticky; top: 16px; padding: 12px; display: grid; gap: 10px; max-height: calc(100vh - 140px); overflow-y: auto; }
.lista input { width: 100%; height: 32px; font-size: 13px; }
.grupo { display: grid; gap: 1px; }
.grupo-nome { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); padding: 4px 8px; }
.item {
  display: flex; justify-content: space-between; gap: 8px; align-items: center; border: 0; background: none; text-align: left;
  font: inherit; color: var(--text-2); padding: 4px 8px; border-radius: 8px; cursor: pointer;
}
.item:hover { background: var(--surface-2); color: var(--text); }
.item.on { background: var(--accent-soft); color: var(--accent-ink); }
.qtd { font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
h2.mono { font-size: 15px; }

.principal { display: grid; gap: 12px; min-width: 0; }
.abas { display: flex; gap: 4px; align-items: center; border-bottom: 1px solid var(--border); margin: -4px -4px 0; padding-bottom: 8px; }
.abas button {
  display: inline-flex; align-items: center; gap: 6px; border: 0; background: none; font: inherit; font-weight: 500;
  color: var(--text-2); padding: 6px 12px; border-radius: 8px; cursor: pointer;
}
.abas button:hover { background: var(--surface-2); }
.abas button.on { background: var(--accent-soft); color: var(--accent-ink); }
.so-leitura { margin-left: auto; }
.cab { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.cab p { margin: 2px 0 0; }
.filtro { width: 230px; height: 30px; font-size: 13px; }
.sel { height: 30px; font-size: 13px; padding: 0 6px; }
.sel.hist { max-width: 220px; }
.rodape { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.rodape .chip { margin-left: 6px; }
.erro { display: flex; gap: 8px; align-items: start; background: var(--bad-soft); color: var(--text); border-radius: 10px; padding: 10px 12px; font-size: 13px; white-space: pre-wrap; }
.erro > svg { color: var(--bad); flex: none; margin-top: 2px; }
p.erro { display: block; color: var(--bad); background: none; padding: 0; }
.editor {
  width: 100%; min-height: 150px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.55;
  background: var(--surface-2); tab-size: 2;
}
.carregando { opacity: 0.6; transition: opacity 0.15s; }

/* perguntar */
.vazio { display: grid; gap: 12px; padding: 8px 0; }
.vazio p { margin: 0; }
.sugestoes { display: flex; flex-wrap: wrap; gap: 8px; }
.sugestao {
  border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font: inherit; font-size: 13px;
  border-radius: 999px; padding: 6px 12px; cursor: pointer; text-align: left;
}
.sugestao:hover:not(:disabled) { border-color: var(--accent); color: var(--accent-ink); }
.sugestao:disabled { opacity: 0.5; cursor: default; }
.conversa { display: grid; gap: 18px; }
.troca { display: grid; gap: 8px; }
.eu {
  justify-self: end; max-width: 80%; margin: 0; background: var(--accent-soft); color: var(--text);
  padding: 8px 12px; border-radius: 14px 14px 4px 14px; white-space: pre-wrap;
}
.resposta { display: grid; gap: 8px; border-left: 2px solid var(--border); padding-left: 12px; min-width: 0; }
.resposta p { margin: 0; }
.explica { color: var(--text); }
.sql-bloco { display: grid; gap: 6px; }
.sql-bloco .toolbar { gap: 2px; margin-left: -8px; }
.editor.pequeno { min-height: 90px; font-size: 12px; }
.grade-pergunta :deep(.grade-wrap), .grade-pergunta { max-height: 420px; }
.caixa-pergunta { position: sticky; bottom: 0; display: grid; gap: 8px; background: var(--surface); padding-top: 8px; border-top: 1px solid var(--border); }
.caixa-pergunta textarea { width: 100%; resize: vertical; min-height: 56px; }
.aviso-ia { flex: 1 1 260px; }
.girando {
  display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: -1px; margin-right: 4px;
  border: 2px solid var(--border); border-top-color: var(--accent); animation: girar 0.8s linear infinite;
}
@keyframes girar { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .girando { animation: none; } }
.btn:disabled { opacity: 0.5; cursor: default; }

@media (max-width: 900px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .lista { position: static; max-height: 260px; }
  .filtro { width: 100%; }
}
</style>
