<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state, baixar, descartarLocal, enviarCopiaLocal, exportarJSON, lerSalvo, substituirDados } from '../lib/store'
import { definirUrlApi, urlPadrao } from '../lib/api'

const msg = ref(null)
const xlsxInput = ref(null)
const jsonInput = ref(null)

async function importarPlanilha(ev) {
  const f = ev.target.files[0]
  ev.target.value = ''
  if (!f) return
  try {
    const { importarXLSX } = await import('../lib/excel')
    const novo = await importarXLSX(f, state.data)
    if (!confirm(`Importar ${novo.espacos.length} espaços e ${novo.contratos.length} contratos de “${f.name}”? Isso substitui espaços, contratos e custos atuais (campanhas são mantidas).`)) return
    await substituirDados(novo)
    msg.value = { ok: true, t: `Planilha importada: ${novo.espacos.length} espaços, ${novo.contratos.length} contratos.` }
  } catch (e) {
    msg.value = { ok: false, t: `Não foi possível ler a planilha: ${e.message}` }
  }
}
async function exportarPlanilha() {
  const { exportarXLSX } = await import('../lib/excel')
  baixar(`Sante_Controle_${new Date().toISOString().slice(0, 10)}.xlsx`, exportarXLSX(state.data))
}
async function importarJSON(ev) {
  const f = ev.target.files[0]
  ev.target.value = ''
  if (!f) return
  try {
    const d = JSON.parse(await f.text())
    if (!Array.isArray(d.espacos) || !(Array.isArray(d.contratos) || Array.isArray(d.reservas))) throw new Error('formato inesperado')
    d.campanhas ||= []
    d.custos ||= { fixos: [], impostos: 0, comissoes: 0 }
    d.metas ||= { ocupacaoAlvo: 0.6 }
    d.meta ||= {}
    await substituirDados(d)
    msg.value = { ok: true, t: state.modo === 'api' ? `Arquivo ${f.name} gravado no servidor.` : `Arquivo ${f.name} carregado.` }
  } catch (e) {
    msg.value = { ok: false, t: `Arquivo inválido: ${e.message}` }
  }
}
async function descartar() {
  const pergunta = state.modo === 'api'
    ? 'Substituir TUDO o que está no servidor pela versão publicada do sante.json? Locatários e agendamentos que não estão no arquivo serão apagados.'
    : 'Descartar todas as alterações deste navegador e voltar à versão publicada?'
  if (!confirm(pergunta)) return
  try {
    await descartarLocal()
    msg.value = { ok: true, t: state.modo === 'api' ? 'O servidor voltou para a versão publicada.' : 'Voltou para a versão publicada.' }
  } catch (e) {
    msg.value = { ok: false, t: `Não foi possível restaurar: ${e.message}` }
  }
}

// ---------- servidor ----------
const urlEdit = ref(state.servidor.url || urlPadrao() || 'http://localhost:8000')
const temCopiaLocal = computed(() => state.modo === 'api' && !!lerSalvo())
function conectar() {
  const u = urlEdit.value.trim().replace(/\/+$/, '')
  if (!/^https?:\/\//.test(u)) return (msg.value = { ok: false, t: 'Informe o endereço completo, por exemplo http://localhost:8000.' })
  definirUrlApi(u === urlPadrao() ? null : u)
  window.location.reload()
}
function desconectar() {
  definirUrlApi(urlPadrao() ? '' : null)
  window.location.reload()
}
async function enviarCopia() {
  if (!confirm('Substituir TUDO o que está no servidor pela cópia guardada neste navegador?')) return
  try {
    await enviarCopiaLocal()
    msg.value = { ok: true, t: 'A cópia deste navegador foi gravada no servidor.' }
  } catch (e) {
    msg.value = { ok: false, t: `Não foi possível enviar: ${e.message}` }
  }
}
</script>

<template>
  <div class="stack">
    <div v-if="msg" class="msg" :class="msg.ok ? 'ok' : 'bad'">
      <Icon :name="msg.ok ? 'check' : 'alert'" :size="16" /> {{ msg.t }}
    </div>

    <section class="card servidor">
      <div class="card-head">
        <div>
          <h2>Servidor</h2>
          <p v-if="state.modo === 'api'">
            <span class="chip good">Conectado</span>
            Os dados vêm do banco em <code>{{ state.servidor.url }}</code> e cada alteração é gravada lá na hora.
            Quem abrir o sistema conectado ao mesmo servidor vê as mesmas informações (a tela se atualiza a cada 20 segundos).
          </p>
          <p v-else-if="state.servidor.status === 'offline'">
            <span class="chip warn">Sem conexão</span>
            <code>{{ state.servidor.url }}</code> não respondeu<template v-if="state.servidor.erro"> ({{ state.servidor.erro }})</template>. Confira se o backend está rodando
            (<code>docker compose up -d</code> na pasta sante-BE).
          </p>
          <p v-else>
            <span class="chip">Sem servidor</span>
            Os dados vêm do <code>sante.json</code> publicado e as alterações ficam só neste navegador.
            Conecte ao backend (repositório sante-BE) para gravar num banco compartilhado.
          </p>
        </div>
      </div>
      <div class="toolbar">
        <label class="field url">Endereço da API<input v-model="urlEdit" placeholder="http://localhost:8000" @keyup.enter="conectar" /></label>
        <button class="btn primary" type="button" @click="conectar">{{ state.modo === 'api' ? 'Trocar servidor' : 'Conectar' }}</button>
        <button v-if="state.servidor.url" class="btn ghost" type="button" @click="desconectar">Usar sem servidor</button>
        <button v-if="temCopiaLocal" class="btn" type="button" @click="enviarCopia"><Icon name="upload" :size="16" /> Enviar cópia deste navegador</button>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Planilha Excel</h2>
            <p>Mesmo layout da “Sistema_Controle_Sante.xlsx”: abas Cadastro, Contratos (ou Reservas, da planilha original), Despesas e Custos. Na aba Reservas antiga, cada linha vale só para o mês da data.</p>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn primary" type="button" @click="xlsxInput.click()"><Icon name="upload" :size="16" /> Importar .xlsx</button>
          <button class="btn" type="button" @click="exportarPlanilha"><Icon name="download" :size="16" /> Exportar .xlsx</button>
          <input ref="xlsxInput" type="file" accept=".xlsx,.xls" hidden @change="importarPlanilha" />
        </div>
      </div>
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Arquivo do site (sante.json)</h2>
            <p>Contém tudo: espaços, despesas, contratos, custos, metas e campanhas.</p>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn primary" type="button" @click="exportarJSON"><Icon name="download" :size="16" /> Exportar sante.json</button>
          <button class="btn" type="button" @click="jsonInput.click()"><Icon name="upload" :size="16" /> Carregar .json</button>
          <button v-if="state.modo === 'api'" class="btn ghost danger" type="button" :disabled="!state.publicado" @click="descartar">Restaurar o publicado no servidor</button>
          <button v-else class="btn ghost danger" type="button" :disabled="!state.local" @click="descartar">Descartar alterações locais</button>
          <input ref="jsonInput" type="file" accept=".json,application/json" hidden @change="importarJSON" />
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head"><h2>Como o link de acompanhamento funciona</h2></div>
      <ol class="steps">
        <li>
          <strong>O link mostra o arquivo publicado.</strong>
          Todo mundo que abre o site vê os dados de <code>public/data/sante.json</code> no repositório.
        </li>
        <li>
          <strong>Editar salva no seu navegador.</strong>
          Espaços, contratos, custos e campanhas que você altera aqui ficam guardados neste navegador e
          aparecem para você na hora. Um aviso amarelo no topo lembra que ainda não foram publicados.
        </li>
        <li>
          <strong>Para publicar:</strong> clique em <em>Exportar sante.json</em>, substitua o arquivo
          <code>public/data/sante.json</code> no GitHub (botão “Add file → Upload files” na pasta
          <code>public/data</code>) e confirme o commit. Em cerca de 1 minuto o link é atualizado para todos.
        </li>
        <li>
          <strong>Prefere a planilha?</strong> Continue lançando no Excel e use <em>Importar .xlsx</em>;
          depois exporte o JSON e publique como acima.
        </li>
        <li>
          <strong>Com o servidor conectado</strong> (cartão Servidor, acima), nada disso é preciso: cada
          alteração vai direto para o banco e aparece para todos que usam o mesmo servidor.
          Exporte o <code>sante.json</code> só quando quiser atualizar o link público.
        </li>
      </ol>
    </section>

    <section class="card">
      <div class="card-head"><h2>Guia rápido de utilização</h2></div>
      <div class="table-wrap">
        <table>
          <tbody>
            <tr><td class="k">1. Confira o cadastro</td><td>Revise capacidades, preços e despesas em Centros de custo; cadastre novos em “Novo centro de custo”.</td></tr>
            <tr><td class="k">2. Revise a base inicial</td><td>Os contratos “Base inicial” (outubro/2026) são estimativas da planilha. Em Carteira de contratos, informe cliente, término e valores reais.</td></tr>
            <tr><td class="k">3. Lance os contratos</td><td>Espaço, cliente, quantidade por mês, preço, início, término, status e campanha. Duração e valor total são calculados.</td></tr>
            <tr><td class="k">4. Renove a tempo</td><td>Contratos que terminam nos próximos 3 meses aparecem em destaque; use “Renovar” para registrar a proposta.</td></tr>
            <tr><td class="k">5. Informe os custos</td><td>Em Financeiro, preencha os custos gerais e as alíquotas. As despesas de cada espaço entram no ponto de equilíbrio automaticamente.</td></tr>
            <tr><td class="k">6. Acompanhe o marketing</td><td>Cadastre campanhas para os espaços abaixo da meta, registre leads e visitas, e ligue cada novo contrato à campanha.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.servidor .toolbar { align-items: end; }
.servidor .url { flex: 1 1 280px; max-width: 420px; }
.servidor p .chip { margin-right: 6px; }
.msg { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; font-size: 13px; }
.msg.ok { background: var(--good-soft); color: var(--good); }
.msg.bad { background: var(--bad-soft); color: var(--bad); }
.steps { margin: 0; padding-left: 20px; display: grid; gap: 12px; color: var(--text-2); }
.steps strong { color: var(--text); }
code { background: var(--surface-2); padding: 1px 6px; border-radius: 6px; font-size: 12px; }
.k { font-weight: 500; white-space: nowrap; width: 1%; }
</style>
