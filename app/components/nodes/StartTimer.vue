<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "start-timer-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({
      name: "",
      label: "",
      time: 0,
      interruption_node: null,
      finish_node: null,
      next_node: null
    })
  }
});

const { updateNodeData } = useVueFlow();

const onNameInput = (e) => updateNodeData(props.id, { name: e.target.value });
const onLabelInput = (e) => updateNodeData(props.id, { label: e.target.value });
const onTimeInput = (e) => updateNodeData(props.id, { time: Number(e.target.value) });
</script>

<template>
  <div class="node-card timer-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="top: 30px; background: #41b883;" />

    <div class="node-header">⏱️ Start Timer</div>
    <div class="node-body">
      <div class="field-group">
        <label>Имя таймера (name):</label>
        <input type="text" :value="data.name" @input="onNameInput" placeholder="timer_1" />
      </div>
      <div class="field-group">
        <label>Заголовок (label):</label>
        <input type="text" :value="data.label" @input="onLabelInput" placeholder="До взрыва..." />
      </div>
      <div class="field-group">
        <label>Время (сек):</label>
        <input type="number" :value="data.time" @input="onTimeInput" />
      </div>

      <div class="outputs-info">
        <div class="out-label">Далее (Async):</div>
        <div class="out-label">При прерывании:</div>
        <div class="out-label">При завершении:</div>
      </div>
    </div>

    <!-- Output Handles -->
    <Handle id="next-source" type="source" :position="Position.Right" style="top: 30%; background: #eab308;" />
    <Handle id="interruption-source" type="source" :position="Position.Right" style="top: 60%; background: #f97316;" />
    <Handle id="finish-source" type="source" :position="Position.Right" style="top: 85%; background: #ef4444;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #f59e0b; border-radius: 8px; color: #fff; min-width: 240px; font-family: sans-serif; position: relative; }
.node-header { font-weight: bold; padding: 6px 10px; background: rgba(245, 158, 11, 0.2); font-size: 12px; }
.node-body { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.field-group { display: flex; flex-direction: column; gap: 2px; }
.field-group label { font-size: 11px; color: #a0a0a0; }
.field-group input { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 5px; border-radius: 4px; font-size: 12px; outline: none; }
.outputs-info { margin-top: 6px; display: flex; flex-direction: column; gap: 8px; text-align: right; padding-right: 12px; font-size: 10px; color: #d1d5db; }
</style>
