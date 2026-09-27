<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "if-compare-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ name_a: "", name_b: "", ncp_node: null, next_node: null })
  }
});

const { updateNodeData } = useVueFlow();
const updateField = (key, val) => updateNodeData(props.id, { [key]: val });
</script>

<template>
  <div class="node-card if-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="top: 30px; background: #41b883;" />
    <div class="node-header">🔀 If Compare (A > B)</div>
    <div class="node-body">
      <div class="field-group">
        <label>Переменная A:</label>
        <input type="text" :value="data.name_a" @input="e => updateField('name_a', e.target.value)" />
      </div>
      <div class="field-group">
        <label>Переменная B:</label>
        <input type="text" :value="data.name_b" @input="e => updateField('name_b', e.target.value)" />
      </div>

      <div class="branches-info">
        <div class="branch-label true">Да (A > B):</div>
        <div class="branch-label false">Нет (A ≤ B):</div>
      </div>
    </div>

    <Handle id="next-source" type="source" :position="Position.Right" style="top: 60%; background: #22c55e;" />
    <Handle id="ncp-source" type="source" :position="Position.Right" style="top: 85%; background: #ef4444;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #8b5cf6; border-radius: 8px; color: #fff; min-width: 220px; font-family: sans-serif; position: relative; }
.node-header { font-weight: bold; padding: 6px 10px; background: rgba(139, 92, 246, 0.2); font-size: 12px; }
.node-body { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.field-group { display: flex; flex-direction: column; gap: 2px; }
.field-group label { font-size: 11px; color: #a0a0a0; }
.field-group input { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 5px; border-radius: 4px; font-size: 12px; outline: none; }
.branches-info { margin-top: 6px; display: flex; flex-direction: column; gap: 8px; text-align: right; padding-right: 12px; font-size: 10px; }
.branch-label.true { color: #22c55e; }
.branch-label.false { color: #ef4444; }
</style>
