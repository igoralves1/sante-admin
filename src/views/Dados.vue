<script setup>
import { ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state, baixar, descartarLocal, exportarJSON, substituirDados } from '../lib/store'

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
    if (!confirm(`Importar ${novo.espacos.length} espaços e ${novo.reservas.length} reservas de “${f.name}”? Isso substitui espaços, reservas e custos atuais (campanhas são mantidas).`)) return
    substituirDados(novo)
    msg.value = { ok: true, t: `Planilha importada: ${novo.espacos.length} espaços, ${novo.reservas.length} reservas.` }
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
    if (!Array.isArray(d.espacos) || !Array.isArray(d.reservas)) throw new Error('formato inesperado')
    d.campanhas ||= []
    d.custos ||= { fixos: [], impostos: 0, comissoes: 0 }
    d.metas ||= { ocupacaoAlvo: 0.6 }
    d.meta ||= {}
    substituirDados(d)
    msg.value = { ok: true, t: `Arquivo ${f.name} carregado.` }
  } catch (e) {
    msg.value = { ok: false, t: `Arquivo inválido: ${e.message}` }
  }
}
function descartar() {
  if (confirm('Descartar todas as alterações deste navegador e voltar à versão publicada?')) {
    descartarLocal()
    msg.value = { ok: true, t: 'Voltou para a versão publicada.' }
  }
}
</script>

<template>
  <div class="stack">
    <div v-if="msg" class="msg" :class="msg.ok ? 'ok' : 'bad'">
      <Icon :name="msg.ok ? 'check' : 'alert'" :size="16" /> {{ msg.t }}
    </div>

    <section class="grid cols-2">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Planilha Excel</h2>
            <p>Mesmo layout da “Sistema_Controle_Sante.xlsx”: abas Cadastro, Reservas e Custos.</p>
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
            <p>Contém tudo: espaços, reservas, custos, metas e campanhas.</p>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn primary" type="button" @click="exportarJSON"><Icon name="download" :size="16" /> Exportar sante.json</button>
          <button class="btn" type="button" @click="jsonInput.click()"><Icon name="upload" :size="16" /> Carregar .json</button>
          <button class="btn ghost danger" type="button" :disabled="!state.local" @click="descartar">Descartar alterações locais</button>
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
          Reservas, espaços, custos e campanhas que você altera aqui ficam guardados neste navegador e
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
      </ol>
    </section>

    <section class="card">
      <div class="card-head"><h2>Guia rápido de utilização</h2></div>
      <div class="table-wrap">
        <table>
          <tbody>
            <tr><td class="k">1. Confira o cadastro</td><td>Revise capacidades e preços em Espaços. Os dados vieram da planilha original; valide as hipóteses.</td></tr>
            <tr><td class="k">2. Revise a base inicial</td><td>As reservas marcadas como “Base inicial” em outubro/2026 são estimativas importadas. Confirme, edite ou exclua.</td></tr>
            <tr><td class="k">3. Lance as reservas</td><td>Data, espaço, cliente, modalidade, quantidade, preço, status e campanha de origem. O total é calculado.</td></tr>
            <tr><td class="k">4. Replique os mensais</td><td>No fim do mês, use “Replicar mensais” em Reservas para copiar os contratos fixos para o mês seguinte.</td></tr>
            <tr><td class="k">5. Informe os custos</td><td>Em Financeiro, preencha os custos fixos e as alíquotas para ver o ponto de equilíbrio.</td></tr>
            <tr><td class="k">6. Acompanhe o marketing</td><td>Cadastre campanhas para os espaços abaixo da meta, registre leads e visitas, e ligue cada nova reserva à campanha.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.msg { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; font-size: 13px; }
.msg.ok { background: var(--good-soft); color: var(--good); }
.msg.bad { background: var(--bad-soft); color: var(--bad); }
.steps { margin: 0; padding-left: 20px; display: grid; gap: 12px; color: var(--text-2); }
.steps strong { color: var(--text); }
code { background: var(--surface-2); padding: 1px 6px; border-radius: 6px; font-size: 12px; }
.k { font-weight: 500; white-space: nowrap; width: 1%; }
</style>
