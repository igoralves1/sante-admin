<script setup>
// Editor dos turnos (rascunho + Salvar). Ao salvar chama `aoSalvar({ agenda, renomes, removidos })`;
// se ela devolver um texto, é um erro e o rascunho continua aberto.
import { computed, ref, watch } from 'vue'
import Icon from './Icon.vue'
import { DIAS_SEMANA, capacidadeAgenda, chave, resumoSemana } from '../lib/agenda'

const props = defineProps({
  agenda: Object, // turnos atuais (da Santé ou da sala)
  aoSalvar: Function,
  unidade: { type: String, default: 'turnos' },
})

const pad = (v) => String(v).padStart(2, '0')
const copiar = (a) => ({
  minimo: Number(a?.minimo) || 1,
  horarios: (a?.horarios || []).map((h) => ({ ...h, dias: [...h.dias], _k: chave(h) })),
})
const draft = ref(copiar(props.agenda))
const base = ref(copiar(props.agenda)) // versão de onde o rascunho partiu
const erro = ref('')
const salvoAgora = ref(false)
const limpo = (d) => JSON.stringify({ m: Number(d.minimo) || 1, h: d.horarios.map(({ _k, ...h }) => h) })
const alterado = computed(() => limpo(draft.value) !== limpo(base.value))
// turnos mudaram por fora (Salvar em outro espaço ou outra aba): sem edição em curso, acompanha na hora
watch(() => props.agenda, (a) => {
  if (alterado.value) return
  draft.value = copiar(a)
  base.value = copiar(a)
}, { deep: true })

const porSemana = computed(() => capacidadeAgenda(draft.value, 'Turno').semana)

function alternarDia(h, d) {
  const i = h.dias.indexOf(d)
  if (i >= 0) h.dias.splice(i, 1)
  else h.dias.push(d)
  h.dias.sort()
}
function addTurno() {
  const ult = draft.value.horarios[draft.value.horarios.length - 1]
  const ini = ult ? ult.fim : '08:00'
  const [H, M] = ini.split(':').map(Number)
  draft.value.horarios.push({ nome: 'Novo turno', ini, fim: `${pad(Math.min(23, H + 3))}:${pad(M)}`, dias: [1, 2, 3, 4, 5], _k: null })
}
const remover = (i) => draft.value.horarios.splice(i, 1)
function descartar() {
  draft.value = copiar(props.agenda)
  base.value = copiar(props.agenda)
  erro.value = ''
}
function salvar() {
  erro.value = ''
  const hs = draft.value.horarios
  if (!hs.length) return (erro.value = 'Deixe pelo menos um turno.')
  for (const h of hs) {
    if (!h.nome.trim()) return (erro.value = 'Todo turno precisa de um nome.')
    if (!(h.ini < h.fim)) return (erro.value = `${h.nome}: o fim precisa ser depois do início.`)
    if (!h.dias.length) return (erro.value = `${h.nome}: marque pelo menos um dia.`)
  }
  // dois turnos não podem se sobrepor no mesmo dia
  for (let i = 0; i < hs.length; i++) {
    for (let j = i + 1; j < hs.length; j++) {
      const dia = hs[i].dias.find((d) => hs[j].dias.includes(d))
      if (dia != null && hs[i].ini < hs[j].fim && hs[j].ini < hs[i].fim) return (erro.value = `${hs[i].nome} e ${hs[j].nome} se sobrepõem.`)
    }
  }
  const renomes = {}
  hs.forEach((h) => h._k && h._k !== chave(h) && (renomes[h._k] = chave(h)))
  const ficam = new Set(hs.map((h) => h._k).filter(Boolean))
  const removidos = copiar(props.agenda).horarios.map((h) => h._k).filter((k) => !ficam.has(k))
  const agenda = { minimo: Math.max(1, Math.round(Number(draft.value.minimo) || 1)), horarios: hs.map(({ _k, ...h }) => ({ ...h, nome: h.nome.trim() })) }
  const r = props.aoSalvar?.({ agenda, renomes, removidos })
  if (typeof r === 'string' && r) return (erro.value = r)
  draft.value = copiar(agenda)
  base.value = copiar(agenda)
  salvoAgora.value = true
  setTimeout(() => (salvoAgora.value = false), 2500)
}
</script>

<template>
  <div class="te">
    <div class="table-wrap">
      <table class="cfg">
        <thead><tr><th>Turno</th><th>Início</th><th>Fim</th><th>Dias da semana</th><th /></tr></thead>
        <tbody>
          <tr v-for="(h, i) in draft.horarios" :key="i">
            <td><input v-model="h.nome" class="in-nome" aria-label="Nome do turno" /></td>
            <td><input v-model="h.ini" type="time" aria-label="Início" /></td>
            <td><input v-model="h.fim" type="time" aria-label="Fim" /></td>
            <td>
              <div class="dias">
                <button v-for="d in [1, 2, 3, 4, 5, 6, 0]" :key="d" type="button" class="dia" :class="{ on: h.dias.includes(d) }" :aria-pressed="h.dias.includes(d)" @click="alternarDia(h, d)">{{ DIAS_SEMANA[d] }}</button>
              </div>
            </td>
            <td class="num"><button class="btn icon sm ghost" type="button" aria-label="Remover turno" @click="remover(i)"><Icon name="trash" :size="14" /></button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="te-foot">
      <button class="btn sm" type="button" @click="addTurno"><Icon name="plus" :size="14" /> Turno</button>
      <label class="field mini">Mínimo de {{ unidade }} por reserva no mesmo dia<input v-model.number="draft.minimo" type="number" min="1" step="1" /></label>
      <span class="small muted resumo">{{ porSemana }} turnos por semana: {{ resumoSemana(draft) }}</span>
    </div>
    <p v-if="erro" class="erro small">{{ erro }}</p>
    <div class="te-act">
      <span v-if="alterado" class="chip warn">Alterações não salvas</span>
      <span v-else-if="salvoAgora" class="chip good">Salvo</span>
      <span class="grow" />
      <button class="btn" type="button" :disabled="!alterado" @click="descartar">Descartar</button>
      <button class="btn primary" type="button" :disabled="!alterado" @click="salvar">Salvar turnos</button>
    </div>
  </div>
</template>

<style scoped>
.te { display: grid; gap: 12px; }
.cfg td { vertical-align: middle; }
.cfg input { height: 30px; }
.in-nome { width: 130px; }
.dias { display: flex; gap: 4px; flex-wrap: wrap; }
.dia { border: 1px solid var(--border); background: transparent; color: var(--muted); border-radius: 6px; font: inherit; font-size: 12px; padding: 2px 6px; cursor: pointer; }
.dia.on { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-ink); }
.te-foot { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: end; }
.mini { max-width: 260px; }
.resumo { flex: 1; min-width: 220px; padding-bottom: 8px; }
.te-act { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 12px; }
.grow { flex: 1; }
.erro { color: var(--bad); margin: 0; }
</style>
