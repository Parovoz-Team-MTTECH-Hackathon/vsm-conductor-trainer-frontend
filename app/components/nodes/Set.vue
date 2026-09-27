<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "set-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: { type: Object, required: true, default: () => ({ name: "", value: "", next_node: null }) }
});

const { updateNodeData } = useVueFlow();
const updateField = (key, val) => updateNodeData(props.id, { [key]: val });
</script>

<template>
  <div class="node-card set-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="background: #41b883;" />
    <div class="node-header">⚙️ Set State</div>
    <div class="node-body">
      <div class="field-group">
        <label>Имя (name):</label>
        <input type="text" :value="data.name" @input="e => updateField('name', e.target.value)" placeholder="varName" />
      </div>
      <div class="field-group">
        <label>Значение (value):</label>
        <input type="text" :value="data.value" @input="e => updateField('value', e.target.value)" placeholder="123 or 'abc'" />
      </div>
    </div>
    <Handle id="next-source" type="source" :position="Position.Right" style="background: #eab308;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #6366f1; border-radius: 8px; color: #fff; min-width: 200px; font-family: sans-serif; }
.node-header { font-weight: bold; padding: 6px 10px; background: rgba(99, 102, 241, 0.2); font-size: 12px; }
.node-body { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.field-group { display: flex; flex-direction: column; gap: 2px; }
.field-group label { font-size: 11px; color: #a0a0a0; }
.field-group input { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 5px; border-radius: 4px; font-size: 12px; outline: none; }
</style>
