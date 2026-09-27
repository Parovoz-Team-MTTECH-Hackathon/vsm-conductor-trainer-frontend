<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "scene-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({
      image_node: null,
      label: "",
      text: "",
      next_node: null
    })
  }
});

const { updateNodeData } = useVueFlow();

const onLabelInput = (e) => updateNodeData(props.id, { label: e.target.value });
const onTextInput = (e) => updateNodeData(props.id, { text: e.target.value });
</script>

<template>
  <div class="node-card scene-node">
    <Handle
      id="flow-target"
      type="target"
      :position="Position.Left"
      style="top: 25px; background: #41b883;"
    />

    <Handle
      id="image-target"
      type="target"
      :position="Position.Left"
      style="top: 65px; background: #3b82f6;"
    />

    <div class="node-header">🎬 Сцена (Scene)</div>

    <div class="node-body">
      <div class="field-info">
        <span class="label">Image Node:</span>
        <code :class="{ active: data.image_node }">
          {{ data.image_node || 'null' }}
        </code>
      </div>

      <div class="field-group">
        <label>Заголовок (label):</label>
        <input
          type="text"
          :value="data.label"
          @input="onLabelInput"
          placeholder="Напр. {username}"
        />
      </div>

      <div class="field-group">
        <label>Текст (text):</label>
        <textarea
          :value="data.text"
          @input="onTextInput"
          rows="3"
          placeholder="Диалоговый текст..."
        ></textarea>
      </div>
    </div>

    <Handle
      id="next-source"
      type="source"
      :position="Position.Right"
      style="top: 50%; background: #eab308;"
    />
  </div>
</template>

<style scoped>
.node-card {
  background: #1e1e24;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  color: #fff;
  min-width: 250px;
  font-family: sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.node-header {
  font-weight: bold;
  padding: 8px 10px;
  background: rgba(59, 130, 246, 0.2);
  font-size: 12px;
  border-bottom: 1px solid #3a3f58;
}
.node-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-group label {
  font-size: 11px;
  color: #a0a0a0;
}
.field-group input,
.field-group textarea {
  background: #0d0e15;
  border: 1px solid #3a3f58;
  color: #fff;
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}
.field-group input:focus,
.field-group textarea:focus {
  border-color: #3b82f6;
}
.field-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.field-info code {
  background: #0d0e15;
  padding: 2px 6px;
  border-radius: 4px;
  color: #9ca3af;
  border: 1px solid #3a3f58;
}
.field-info code.active {
  color: #3b82f6;
  border-color: #3b82f6;
}
</style>
