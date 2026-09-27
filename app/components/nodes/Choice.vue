<script setup>
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({
  label: "choice-node"
});

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ topic: "", choice: [] })
  }
});

const { updateNodeData } = useVueFlow();

const onTopicInput = (e) => {
  updateNodeData(props.id, { topic: e.target.value });
};

const addChoice = () => {
  const currentChoices = props.data.choice || [];
  updateNodeData(props.id, {
    choice: [...currentChoices, { text: "", next_node: null }]
  });
};

const updateChoiceText = (index, value) => {
  const newChoices = [...(props.data.choice || [])];
  newChoices[index] = { ...newChoices[index], text: value };
  updateNodeData(props.id, { choice: newChoices });
};

const removeChoice = (index) => {
  const newChoices = [...(props.data.choice || [])];
  newChoices.splice(index, 1);
  updateNodeData(props.id, { choice: newChoices });
};
</script>

<template>
  <div class="node-card choice-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="top: 20px; background: #41b883;" />

    <div class="node-body">
      <div class="field-group">
        <label>Предмет выбора (topic):</label>
        <input type="text" :value="data.topic" @input="onTopicInput" placeholder="Что ответишь?" />
      </div>

      <div class="choices-list">
        <label>Варианты:</label>
        <div v-for="(item, index) in data.choice" :key="index" class="choice-item">
          <input
            type="text"
            :value="item.text"
            @input="(e) => updateChoiceText(index, e.target.value)"
            placeholder="Вариант ответа..."
          />
          <button @click="removeChoice(index)" class="btn-del">✕</button>
          <Handle
            :id="`choice-source-${index}`"
            type="source"
            :position="Position.Right"
            :style="{ top: `${85 + index * 34}px`, background: '#eab308' }"
          />
        </div>
      </div>

      <button @click="addChoice" class="btn-add">+ Добавить выбор</button>
    </div>
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #ec4899; border-radius: 8px; color: #fff; min-width: 260px; font-family: sans-serif; position: relative; }
.node-body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group label, .choices-list label { font-size: 11px; color: #a0a0a0; }
.field-group input, .choice-item input { background: #0d0e15; border: 1px solid #3a3f58; color: #fff; padding: 6px; border-radius: 4px; font-size: 12px; outline: none; }
.choices-list { display: flex; flex-direction: column; gap: 6px; }
.choice-item { display: flex; align-items: center; gap: 6px; position: relative; }
.choice-item input { flex: 1; }
.btn-del { background: #ef4444; border: none; color: white; border-radius: 4px; width: 22px; height: 26px; cursor: pointer; }
.btn-add { background: #ec4899; border: none; color: white; padding: 6px; border-radius: 4px; font-size: 11px; cursor: pointer; }
</style>
