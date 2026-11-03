const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const brl0Fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const numFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const pctFmt = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })

export const brl = (v) => brlFmt.format(v || 0)
export const brl0 = (v) => brl0Fmt.format(v || 0)
export const num = (v) => numFmt.format(v || 0)
export const pct = (v) => pctFmt.format(v || 0)

// Eixos: "R$ 0", "R$ 5 mil", "R$ 1,2 mi"
export function brlCompact(v) {
  const a = Math.abs(v)
  if (a >= 1e6) return `R$ ${numFmt.format(+(v / 1e6).toFixed(1))} mi`
  if (a >= 1e3) return `R$ ${numFmt.format(+(v / 1e3).toFixed(1))} mil`
  return `R$ ${numFmt.format(Math.round(v))}`
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export function mesCurto(ym) {
  const [y, m] = ym.split('-').map(Number)
  return `${MESES[m - 1]}/${String(y).slice(2)}`
}
export function mesLongo(ym) {
  const [y, m] = ym.split('-').map(Number)
  return `${MESES_LONGOS[m - 1]} de ${y}`
}
export function dataBR(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function addMes(ym, n) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const uid = (p = 'id') => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

// Cópia profunda que também funciona com objetos reativos do Vue
export const clone = (v) => JSON.parse(JSON.stringify(v))
