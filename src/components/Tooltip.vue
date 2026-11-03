<script setup>
// Tooltip posicionado dentro de um container relativo.
defineProps({ tip: Object })
</script>

<template>
  <div v-if="tip" class="tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }" role="status">
    <div class="tip-title">{{ tip.title }}</div>
    <div v-for="(r, i) in tip.rows" :key="i" class="tip-row">
      <span class="tip-key">
        <i v-if="r.color" :style="{ background: r.color }" />{{ r.label }}
      </span>
      <strong class="tnum">{{ r.value }}</strong>
    </div>
  </div>
</template>

<style scoped>
.tip {
  position: absolute; z-index: 20; pointer-events: none; transform: translate(-50%, calc(-100% - 10px));
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.14); padding: 8px 10px; min-width: 190px; font-size: 12px;
}
.tip-title { font-weight: 600; margin-bottom: 4px; }
.tip-row { display: flex; justify-content: space-between; gap: 14px; color: var(--text-2); }
.tip-row strong { color: var(--text); font-weight: 600; }
.tip-key { display: inline-flex; align-items: center; gap: 6px; }
.tip-key i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
</style>
