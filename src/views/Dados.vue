<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { state, baixar, baixarBackup, substituirDados } from '../lib/store'

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
    if (!confirm(`Importar ${novo.espacos.length} espaços e ${novo.contratos.length} contratos de “${f.name}”? Isso substitui no banco os espaços, contratos e custos atuais (campanhas são mantidas).`)) return
    await substituirDados(novo)
    msg.value = { ok: true, t: `Planilha importada no banco: ${novo.espacos.length} espaços, ${novo.contratos.length} contratos.` }
  } catch (e) {
    msg.value = { ok: false, t: `Não foi possível importar a planilha: ${e.message}` }
  }
}
async function exportarPlanilha() {
  const { exportarXLSX } = await import('../lib/excel')
  baixar(`Sante_Controle_${new Date().toISOString().slice(0, 10)}.xlsx`, exportarXLSX(state.data))
}
async function restaurarBackup(ev) {
  const f = ev.target.files[0]
  ev.target.value = ''
  if (!f) return
  try {
    const d = JSON.parse(await f.text())
    if (!Array.isArray(d.espacos) || !(Array.isArray(d.contratos) || Array.isArray(d.reservas))) throw new Error('formato inesperado')
    if (!confirm(`Substituir TUDO o que está no banco pelo backup “${f.name}”? Espaços, contratos, agenda, locatários, custos e campanhas atuais serão apagados.`)) return
    d.campanhas ||= []
    d.custos ||= { fixos: [], impostos: 0, comissoes: 0 }
    d.metas ||= { ocupacaoAlvo: 0.6 }
    d.meta ||= {}
    await substituirDados(d)
    msg.value = { ok: true, t: `Backup ${f.name} restaurado no banco.` }
  } catch (e) {
    msg.value = { ok: false, t: `Não foi possível restaurar: ${e.message}` }
  }
}

const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const status = computed(() => {
  const s = state.servidor
  if (s.status === 'offline') return { cls: 'warn', t: 'Sem conexão' }
  if (s.status === 'erro') return { cls: 'bad', t: 'Erro ao salvar' }
  if (s.status === 'salvando') return { cls: 'info', t: 'Salvando…' }
  return { cls: 'good', t: 'Conectado' }
})
</script>

<template>
  <div class="stack">
    <div v-if="msg" class="msg" :class="msg.ok ? 'ok' : 'bad'">
      <Icon :name="msg.ok ? 'check' : 'alert'" :size="16" /> {{ msg.t }}
    </div>

    <section class="card servidor">
      <div class="card-head">
        <div>
          <h2>Banco de dados</h2>
          <p>
            <span class="chip" :class="status.cls">{{ status.t }}</span>
            Todos os dados ficam no PostgreSQL e chegam pela API em <code>{{ state.servidor.url }}/api</code>.
            Cada alteração é gravada na hora, e quem usa o sistema vê as mesmas informações (a tela se atualiza a cada 20 segundos).
            <template v-if="state.servidor.salvoEm"> Última gravação às {{ hora(state.servidor.salvoEm) }}.</template>
          </p>
        </div>
      </div>
      <div class="toolbar">
        <RouterLink to="/dados/diagrama" class="btn"><Icon name="diagrama" :size="16" /> Diagrama do banco</RouterLink>
        <RouterLink to="/dados/consultas" class="btn"><Icon name="tabela" :size="16" /> Tabelas e consultas</RouterLink>
        <RouterLink to="/documentacao-api" class="btn"><Icon name="api" :size="16" /> Documentação da API</RouterLink>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>Planilha Excel</h2>
            <p>Mesmo layout da “Sistema_Controle_Sante.xlsx”: abas Cadastro, Contratos (ou Reservas, da planilha original), Despesas e Custos. Importar grava no banco; na aba Reservas antiga, cada linha vale só para o mês da data.</p>
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
            <h2>Backup</h2>
            <p>Baixa uma cópia de tudo o que está no banco (espaços, despesas, contratos, agenda, locatários, custos, metas e campanhas). Restaurar substitui tudo no banco pelo conteúdo do arquivo.</p>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn primary" type="button" @click="baixarBackup"><Icon name="download" :size="16" /> Baixar backup</button>
          <button class="btn ghost danger" type="button" @click="jsonInput.click()"><Icon name="upload" :size="16" /> Restaurar backup</button>
          <input ref="jsonInput" type="file" accept=".json,application/json" hidden @change="restaurarBackup" />
        </div>
      </div>
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
.servidor p .chip { margin-right: 6px; }
.msg { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; font-size: 13px; }
.msg.ok { background: var(--good-soft); color: var(--good); }
.msg.bad { background: var(--bad-soft); color: var(--bad); }
code { background: var(--surface-2); padding: 1px 6px; border-radius: 6px; font-size: 12px; }
.k { font-weight: 500; white-space: nowrap; width: 1%; }
</style>
