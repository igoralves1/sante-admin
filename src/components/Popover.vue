<script setup>
// Cartão flutuante ao lado de uma seleção (como o do Google Agenda). Em telas
// estreitas vira uma folha presa embaixo. Fecha com Esc ou clique fora.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  box: Object, // { left, right, top, bottom } em coordenadas da janela
  title: String,
  width: { type: Number, default: 360 },
})
const emit = defineEmits(['close'])
const el = ref(null)
const altura = ref(380)
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)

const pos = computed(() => {
  if (vw.value < 640) return { sheet: true, style: {} }
  const w = props.width
  const b = props.box || { left: vw.value / 2, right: vw.value / 2, top: 120, bottom: 120 }
  let left = b.right + 12
  if (left + w > vw.value - 12) left = b.left - 12 - w
  if (left < 12) left = Math.min(Math.max(12, (b.left + b.right) / 2 - w / 2), vw.value - 12 - w)
  const top = Math.min(Math.max(12, b.top - 8), vh.value - 12 - altura.value)
  return { sheet: false, style: { left: `${left}px`, top: `${Math.max(12, top)}px`, width: `${w}px` } }
})

let ro
const tecla = (e) => e.key === 'Escape' && emit('close')
const fora = (e) => el.value && !el.value.contains(e.target) && emit('close')
const medir = () => {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}
onMounted(() => {
  document.addEventListener('keydown', tecla)
  setTimeout(() => document.addEventListener('pointerdown', fora), 0)
  window.addEventListener('resize', medir)
  ro = new ResizeObserver(([e]) => (altura.value = e.contentRect.height + 32))
  ro.observe(el.value)
  el.value.querySelector('input, select, textarea')?.focus()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', tecla)
  document.removeEventListener('pointerdown', fora)
  window.removeEventListener('resize', medir)
  ro?.disconnect()
})
</script>

<template>
  <Teleport to="body">
    <div ref="el" class="pop card" :class="{ sheet: pos.sheet }" :style="pos.style" role="dialog" :aria-label="title">
      <div class="pop-head">
        <strong>{{ title }}</strong>
        <button class="btn icon sm ghost" type="button" aria-label="Fechar" @click="emit('close')"><Icon name="close" :size="16" /></button>
      </div>
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.pop { position: fixed; z-index: 60; max-height: calc(100vh - 24px); overflow: auto; box-shadow: 0 12px 32px rgba(16, 24, 40, 0.22); padding: 16px; }
.pop.sheet { left: 0; right: 0; bottom: 0; top: auto; width: auto; border-radius: 16px 16px 0 0; max-height: 85vh; }
.pop-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 15px; }
</style>
