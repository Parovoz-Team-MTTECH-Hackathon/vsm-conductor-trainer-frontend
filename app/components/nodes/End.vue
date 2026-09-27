<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "end-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ is_completed: true })
  }
});

const { updateNodeData } = useVueFlow();

const onCheckboxChange = (e) => {
  updateNodeData(props.id, { is_completed: e.target.checked });
};
</script>

<template>
  <div class="node-card end-node">
    <Handle
      id="flow-target"
      type="target"
      :position="Position.Left"
      style="background: #41b883;"
    />
    <div class="node-header">🏁 КОНЕЦ (End)</div>
    <div class="node-body">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="data.is_completed"
          @change="onCheckboxChange"
        />
        <span>Успешное завершение</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.node-card {
  background: #1e1e24;
  border: 2px solid #ef4444;
  border-radius: 8px;
  color: #fff;
  min-width: 200px;
  font-family: sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.node-header {
  font-weight: bold;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.2);
  font-size: 12px;
  border-bottom: 1px solid #3a3f58;
}
.node-body {
  padding: 10px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  cursor: pointer;
  color: #e2e8f0;
}
.checkbox-label input {
  accent-color: #ef4444;
  cursor: pointer;
}
</style>
