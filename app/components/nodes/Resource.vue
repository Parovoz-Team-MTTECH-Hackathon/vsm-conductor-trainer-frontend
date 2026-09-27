<script setup>
import { ref } from 'vue';
import { Handle, Position, useVueFlow } from '@vue-flow/core';

defineOptions({ label: "resource-node" });

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ resource: "", fileName: "" })
  }
});

const { updateNodeData } = useVueFlow();
const fileName = ref(props.data.fileName || '');

const onFileUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  fileName.value = file.name;
  const reader = new FileReader();

  reader.onload = () => {
    updateNodeData(props.id, {
      resource: reader.result,
      fileName: file.name
    });
  };

  reader.readAsDataURL(file);
};

const clearImage = () => {
  fileName.value = '';
  updateNodeData(props.id, { resource: '', fileName: '' });
};
</script>

<template>
  <div class="node-card resource-node">
    <div class="node-header">
      <span>📁 Ресурс изображения</span>
      <button
        v-if="data.resource"
        class="clear-btn"
        @click="clearImage"
        title="Удалить изображение"
      >
        ✕
      </button>
    </div>

    <div class="node-body">
      <label class="file-button">
        <span>{{ fileName || data.fileName || 'Загрузить файл' }}</span>
        <input type="file" accept="image/*" @change="onFileUpload" hidden />
      </label>

      <div v-if="data.resource" class="preview-box">
        <img :src="data.resource" alt="Preview" />
      </div>
    </div>

    <Handle
      id="resource-source"
      type="source"
      :position="Position.Right"
      style="background: #3b82f6;"
    />
  </div>
</template>

<style scoped>
.node-card {
  background: #1e1e24;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  color: #fff;
  width: 260px; /* Четкая ширина, чтобы ноду не растягивало */
  font-family: sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.node-header {
  font-weight: bold;
  padding: 8px 10px;
  background: rgba(59, 130, 246, 0.2);
  font-size: 12px;
  border-bottom: 1px solid #3a3f58;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 12px;
  padding: 0 4px;
  line-height: 1;
}

.clear-btn:hover {
  color: #f87171;
}

.node-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-button {
  background: #0d0e15;
  border: 1px dashed #3a3f58;
  color: #9ca3af;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-button:hover {
  border-color: #3b82f6;
  color: #fff;
}

.preview-box {
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0e15;
  border-radius: 4px;
  border: 1px solid #3a3f58;
  overflow: hidden;
  padding: 4px;
  box-sizing: border-box;
}

.preview-box img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* Картинка сохранит пропорции и встанет по центру */
  display: block;
}
</style>
