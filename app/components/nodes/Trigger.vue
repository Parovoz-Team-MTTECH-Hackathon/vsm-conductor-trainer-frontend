<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({
  label: "trigger-node"
});

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ name: "", next_node: null })
  }
});

const { updateNodeData } = useVueFlow();

const onNameInput = (e) => {
  updateNodeData(props.id, { name: e.target.value });
};
</script>

<template>
  <div class="node-card trigger-node">
    <div class="node-header">⚡ Trigger</div>
    <div class="node-body">
      <div class="field-group">
        <label>Имя переменной (name):</label>
        <input type="text" :value="data.name" @input="onNameInput" placeholder="loyalty" />
      </div>
    </div>
    <Handle id="next-source" type="source" :position="Position.Right" style="background: #eab308;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #a855f7; border-radius: 8px; color: #fff; min-width: 220px; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.node-header { font-weight: bold; padding: 8px 10px; background: rgba(168, 85, 247, 0.2); font-size: 13px; border-bottom: 1px solid #3a3f58; }
.node-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group label { font-size: 11px; color: #a0a0a0; }
.field-group input { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 6px; border-radius: 4px; font-size: 12px; outline: none; }
.field-group input:focus { border-color: #a855f7; }
</style>
