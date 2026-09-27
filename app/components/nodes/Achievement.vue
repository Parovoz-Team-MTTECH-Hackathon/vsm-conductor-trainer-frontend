<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "achievement-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ name: "", label: "", description: "", icon: "", score_delta: 0, next_node: null })
  }
});

const { updateNodeData } = useVueFlow();

const updateField = (key, value) => updateNodeData(props.id, { [key]: value });
</script>

<template>
  <div class="node-card achievement-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="background: #41b883;" />
    <div class="node-header">🏆 Achievement</div>
    <div class="node-body">
      <div class="field-group">
        <label>Имя (ID):</label>
        <input type="text" :value="data.name" @input="e => updateField('name', e.target.value)" />
      </div>
      <div class="field-group">
        <label>Заголовок:</label>
        <input type="text" :value="data.label" @input="e => updateField('label', e.target.value)" />
      </div>
      <div class="field-group">
        <label>Описание:</label>
        <textarea :value="data.description" @input="e => updateField('description', e.target.value)" rows="2"></textarea>
      </div>
      <div class="field-group">
        <label>Score Delta:</label>
        <input type="number" :value="data.score_delta" @input="e => updateField('score_delta', Number(e.target.value))" />
      </div>
    </div>
    <Handle id="next-source" type="source" :position="Position.Right" style="background: #eab308;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #eab308; border-radius: 8px; color: #fff; min-width: 220px; font-family: sans-serif; }
.node-header { font-weight: bold; padding: 6px 10px; background: rgba(234, 179, 8, 0.2); font-size: 12px; }
.node-body { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.field-group { display: flex; flex-direction: column; gap: 2px; }
.field-group label { font-size: 11px; color: #a0a0a0; }
.field-group input, .field-group textarea { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 5px; border-radius: 4px; font-size: 12px; outline: none; }
</style>
