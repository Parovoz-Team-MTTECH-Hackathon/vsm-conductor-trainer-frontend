<script setup>
import { Handle, Position } from '@vue-flow/core';

defineOptions({ label: "goto-node" });

defineProps({
  id: { type: String, required: true },
  data: { type: Object, required: true, default: () => ({ goto_node: null, next_node: null }) }
});
</script>

<template>
  <div class="node-card goto-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="background: #41b883;" />
    <div class="node-header">↗️ Goto</div>
    <div class="node-body">
      <div class="info-text">Указывает ноду основного потока</div>
      <div class="handles-label">
        <span>Переход в (goto_node):</span>
        <span>Текущий поток (next_node):</span>
      </div>
    </div>
    <Handle id="goto-source" type="source" :position="Position.Right" style="top: 55%; background: #a855f7;" />
    <Handle id="next-source" type="source" :position="Position.Right" style="top: 80%; background: #eab308;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #a855f7; border-radius: 8px; color: #fff; min-width: 220px; font-family: sans-serif; position: relative; }
.node-header { font-weight: bold; padding: 6px 10px; background: rgba(168, 85, 247, 0.2); font-size: 12px; }
.node-body { padding: 10px; }
.info-text { font-size: 11px; color: #9ca3af; margin-bottom: 8px; }
.handles-label { display: flex; flex-direction: column; gap: 8px; text-align: right; padding-right: 12px; font-size: 10px; }
</style>
