<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "loyalty-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ delta: 0, next_node: null })
  }
});

const { updateNodeData } = useVueFlow();
const onDeltaInput = (e) => updateNodeData(props.id, { delta: Number(e.target.value) });
</script>

<template>
  <div class="node-card loyalty-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="background: #41b883;" />
    <div class="node-header">❤️ Loyalty Delta</div>
    <div class="node-body">
      <div class="field-group">
        <label>Изменение (delta):</label>
        <input type="number" :value="data.delta" @input="onDeltaInput" placeholder="10 или -5" />
      </div>
    </div>
    <Handle id="next-source" type="source" :position="Position.Right" style="background: #eab308;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #84cc16; border-radius: 8px; color: #fff; min-width: 200px; font-family: sans-serif; }
.node-header { font-weight: bold; padding: 6px 10px; background: rgba(132, 204, 22, 0.2); font-size: 12px; }
.node-body { padding: 10px; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group label { font-size: 11px; color: #a0a0a0; }
.field-group input { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 6px; border-radius: 4px; font-size: 12px; outline: none; }
</style>
