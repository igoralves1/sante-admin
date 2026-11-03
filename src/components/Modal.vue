<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import Icon from './Icon.vue'

defineProps({ title: String })
const emit = defineEmits(['close'])
const esc = (e) => e.key === 'Escape' && emit('close')
onMounted(() => document.addEventListener('keydown', esc))
onBeforeUnmount(() => document.removeEventListener('keydown', esc))
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @mousedown.self="emit('close')">
      <div class="modal card" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-head">
          <h2>{{ title }}</h2>
          <button class="btn icon ghost" type="button" aria-label="Fechar" @click="emit('close')"><Icon name="close" /></button>
        </div>
        <slot />
        <div v-if="$slots.footer" class="modal-foot"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(10, 14, 20, 0.45); display: grid; place-items: center; padding: 16px; z-index: 50; }
.modal { width: min(640px, 100%); max-height: calc(100vh - 32px); overflow: auto; }
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
</style>
