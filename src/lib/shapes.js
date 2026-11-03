// Barras com 4px de canto arredondado só na ponta de dados (base reta).

// barra horizontal de x0 a x1, ponta arredondada à direita quando `round`
export function barH(x0, x1, y, h, round = true) {
  const w = Math.max(0, x1 - x0)
  const r = round ? Math.min(4, w, h / 2) : 0
  return `M${x0},${y}H${x0 + w - r}Q${x0 + w},${y} ${x0 + w},${y + r}V${y + h - r}Q${x0 + w},${y + h} ${x0 + w - r},${y + h}H${x0}Z`
}

// coluna vertical de base yb até topo yt, topo arredondado
export function barV(x, w, yt, yb) {
  const h = Math.max(0, yb - yt)
  const r = Math.min(4, h, w / 2)
  return `M${x},${yb}V${yt + r}Q${x},${yt} ${x + r},${yt}H${x + w - r}Q${x + w},${yt} ${x + w},${yt + r}V${yb}Z`
}

// valor "bonito" para o topo do eixo
export function niceMax(v) {
  if (!(v > 0)) return 1000
  const p = 10 ** Math.floor(Math.log10(v))
  const k = v / p
  return (k <= 1 ? 1 : k <= 2 ? 2 : k <= 2.5 ? 2.5 : k <= 5 ? 5 : 10) * p
}
