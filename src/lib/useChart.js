// Liga um desenho D3 a um container Vue: redesenha quando a largura ou os dados mudam.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select } from 'd3'

export function useChart(draw, deps) {
  const el = ref(null)
  const width = ref(0)
  const tip = ref(null)
  let ro

  function run() {
    if (!el.value || !width.value) return
    const root = select(el.value).select('.d3-root')
    root.selectAll('*').remove()
    draw(root, width.value, tip)
  }
  onMounted(() => {
    ro = new ResizeObserver(([e]) => {
      const w = Math.floor(e.contentRect.width)
      if (w && w !== width.value) {
        width.value = w
        run()
      }
    })
    ro.observe(el.value)
  })
  onBeforeUnmount(() => ro?.disconnect())
  watch(deps, run, { deep: true })
  return { el, tip }
}

// posição do tooltip relativa ao container do gráfico
export function tipAt(container, event, title, rows) {
  const r = container.getBoundingClientRect()
  const x = event.clientX - r.left
  return {
    x: Math.min(Math.max(x, 110), r.width - 110),
    y: event.clientY - r.top - 6,
    title,
    rows,
  }
}
