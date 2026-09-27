<template>
  <div class="editor-page">
    <header class="editor-header">
      <div class="header-left">
          <NuxtLink to="/admin/panel" class="exit-btn">
                <span>←</span> Выйти в панель
          </NuxtLink>
        <button class="m3-btn primary" @click="openNewFileModal">
          📄 <span class="btn-text">Новый файл</span>
        </button>

        <template v-if="isFileActive">
          <button class="m3-btn success" @click="saveProject">
            💾 <span class="btn-text">Сохранить проект</span>
          </button>
          <button class="m3-btn warning" @click="exportPackage">
            📦 <span class="btn-text">Экспорт пакета</span>
          </button>
        </template>

        <button class="m3-btn info" @click="triggerFileInput">
          📂 <span class="btn-text">Загрузить</span>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          style="display: none"
          @change="loadFromFile"
        />
      </div>

      <div class="header-title">
        <span>Редактор сценариев</span>
      </div>
    </header>

    <main class="editor-main">
      <GraphEditor v-show="isFileActive" ref="graphRef" />


      <div v-if="!isFileActive" class="placeholder-container">
        <div class="placeholder-card">
          <div class="placeholder-icon">📂</div>
          <h2>Файл сценария не выбран</h2>
          <p>Создайте новый пакет сценария или загрузите существующий проект / пакет JSON.</p>
          <div class="placeholder-actions">
            <button class="m3-btn primary lg" @click="openNewFileModal">
              📄 Создать новый файл
            </button>
            <button class="m3-btn info lg" @click="triggerFileInput">
              📂 Загрузить из JSON
            </button>
          </div>
        </div>
      </div>
    </main>


    <div v-if="showNewFileModal" class="m3-modal-overlay" @click.self="closeNewFileModal">
      <div class="m3-modal">
        <h3 class="modal-title">Создание нового файла сценария</h3>

        <div class="form-group">
          <label>Имя пакета (name)*</label>
          <input
            v-model="newFileForm.name"
            type="text"
            placeholder="например: scenario_pack_01"
            class="m3-input"
          />
        </div>

        <div class="form-group">
          <label>Заголовок (label)*</label>
          <input
            v-model="newFileForm.label"
            type="text"
            placeholder="например: Глава 1. Начало"
            class="m3-input"
          />
        </div>

        <div class="form-group">
          <label>Описание (description)</label>
          <textarea
            v-model="newFileForm.description"
            placeholder="Описание вашего сценария..."
            class="m3-input textarea"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Иконка сценария (icon)</label>
          <div class="icon-picker-controls">
            <input
              ref="iconInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleIconSelect"
            />
            <button type="button" class="m3-btn secondary" @click="iconInputRef?.click()">
              🖼️ Выбрать изображение
            </button>
            <button
              v-if="newFileForm.icon"
              type="button"
              class="m3-btn danger-sm"
              @click="removeIcon"
              title="Удалить иконку"
            >
              ✕
            </button>
          </div>

          <div v-if="newFileForm.icon" class="icon-preview">
            <img :src="newFileForm.icon" alt="Icon preview" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="m3-btn secondary" @click="closeNewFileModal">Отмена</button>
          <button class="m3-btn primary" @click="confirmCreateNewFile">Создать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import GraphEditor from "~/components/node-editor/graph.vue";

const graphRef = ref(null);
const fileInputRef = ref(null);
const iconInputRef = ref(null);

const isFileActive = ref(false);
const showNewFileModal = ref(false);

const newFileForm = ref({
  name: "",
  label: "",
  description: "",
  icon: ""
});

const openNewFileModal = () => {
  newFileForm.value = {
    name: "new_scenario",
    label: "Новый сценарий",
    description: "",
    icon: ""
  };
  showNewFileModal.value = true;
};

const closeNewFileModal = () => {
  showNewFileModal.value = false;
};

const handleIconSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Пожалуйста, выберите файл изображения!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    newFileForm.value.icon = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeIcon = () => {
  newFileForm.value.icon = "";
  if (iconInputRef.value) iconInputRef.value.value = "";
};

const confirmCreateNewFile = async () => {
  if (!newFileForm.value.name.trim()) {
    alert("Пожалуйста, укажите name пакета!");
    return;
  }

  const metaData = {
    name: newFileForm.value.name.trim(),
    label: newFileForm.value.label.trim(),
    description: newFileForm.value.description.trim(),
    icon: newFileForm.value.icon,
    creation_time: Math.floor(Date.now() / 1000)
  };

  isFileActive.value = true;
  await nextTick();

  if (graphRef.value?.createNewGraph) {
    graphRef.value.createNewGraph(metaData);
  }

  closeNewFileModal();
};

const saveProject = () => {
  if (!graphRef.value) return;

  const data = graphRef.value.exportProjectJson();
  downloadJson(data, `${data.meta?.name || 'project'}.project.json`);
};

const exportPackage = () => {
  if (!graphRef.value) return;

  const data = graphRef.value.exportScenarioJson();
  downloadJson(data, `${data.name || 'scenario'}.json`);
};

const downloadJson = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const loadFromFile = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsedData = JSON.parse(e.target.result);

      isFileActive.value = true;
      await nextTick();

      if (graphRef.value?.loadNodesData) {
        graphRef.value.loadNodesData(parsedData);
      }
    } catch (err) {
      alert("Ошибка при чтении JSON-файла: " + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
};
</script>

<style scoped>
.exit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--md-sys-color-surface-container-high, #2b2930);
  color: #e6e1e5;
  border: 1px solid var(--md-sys-color-outline-variant, #49454f);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exit-btn:hover {
  background: var(--md-sys-color-surface-container-highest, #36343b);
  border-color: var(--md-sys-color-outline, #79747e);
}
.editor-page {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: #121214;
  color: #e6e1e5;
  overflow: hidden;
  font-family: Roboto, system-ui, -apple-system, sans-serif;
}

/* Верхняя панель с горизонтальным скроллом для мобильных устройств */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #1d1b20;
  border-bottom: 1px solid #49454f;
  z-index: 30;
  min-height: 48px;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: thin;
  padding: 2px 0;
  -webkit-overflow-scrolling: touch;
}

.header-left::-webkit-scrollbar {
  height: 3px;
}
.header-left::-webkit-scrollbar-thumb {
  background: #49454f;
  border-radius: 4px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #cac4d0;
  white-space: nowrap;
  margin-left: 12px;
}

.m3-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #49454f;
  background: #2b2930;
  color: #e6e1e5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.m3-btn:hover {
  background: #36343b;
  border-color: #938f99;
}

.m3-btn.lg {
  padding: 10px 20px;
  font-size: 14px;
}

.m3-btn.primary {
  background: #4a4458;
  color: #e8def8;
  border-color: transparent;
}
.m3-btn.primary:hover {
  background: #5e5770;
}

.m3-btn.success {
  background: #2d4a3e;
  color: #a8f0d0;
  border-color: transparent;
}
.m3-btn.success:hover {
  background: #3a5f50;
}

.m3-btn.warning {
  background: #52432a;
  color: #ffdfb0;
  border-color: transparent;
}
.m3-btn.warning:hover {
  background: #695637;
}

.m3-btn.info {
  background: #3a4856;
  color: #c0e0ff;
  border-color: transparent;
}
.m3-btn.info:hover {
  background: #4a5c6e;
}

.m3-btn.secondary {
  background: transparent;
  border-color: #49454f;
}

.m3-btn.danger-sm {
  background: #8c1d18;
  color: #f9dedc;
  border: none;
  padding: 6px 10px;
}

.editor-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.placeholder-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #121214;
  padding: 16px;
  box-sizing: border-box;
}

.placeholder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #1d1b20;
  border: 1px solid #49454f;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.placeholder-card h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #e6e1e5;
}

.placeholder-card p {
  margin: 0 0 24px 0;
  font-size: 13px;
  color: #938f99;
  line-height: 1.4;
}

.placeholder-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.m3-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 12px;
  box-sizing: border-box;
}

.m3-modal {
  background: #211f26;
  border: 1px solid #49454f;
  border-radius: 16px;
  padding: 20px;
  width: 420px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #d0bcff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  color: #938f99;
}

.m3-input {
  background: #2b2930;
  border: 1px solid #49454f;
  border-radius: 8px;
  padding: 8px 12px;
  color: #e6e1e5;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.m3-input:focus {
  border-color: #d0bcff;
}

.m3-input.textarea {
  resize: vertical;
}

.icon-picker-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-preview {
  margin-top: 8px;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #49454f;
  background: #1a1a1e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .header-title {
    display: none; /* Скрываем заголовок на телефонах для максимального пространства под кнопки */
  }

  .m3-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .placeholder-card {
    padding: 24px 16px;
  }

  .placeholder-actions {
    flex-direction: column;
  }

  .placeholder-actions .m3-btn {
    width: 100%;
  }
}
</style>
