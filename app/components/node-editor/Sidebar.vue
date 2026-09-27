<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['add-node']);

const isCollapsed = ref(false);
const searchQuery = ref('');
const activeCategory = ref('all');
const hoveredNode = ref(null);

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'content', name: 'Контент' },
  { id: 'flow', name: 'Поток' },
  { id: 'logic', name: 'Логика' },
  { id: 'timers', name: 'Таймеры' }
];

const nodeCatalog = [
  { type: 'begin', label: 'Старт', icon: '🚀', category: 'flow', desc: 'Точка входа в сценарий' },
  { type: 'end', label: 'Конец', icon: '🏁', category: 'flow', desc: 'Завершение сценария' },
  { type: 'trigger', label: 'Триггер', icon: '⚡', category: 'flow', desc: 'Реакция на событие' },
  { type: 'goto', label: 'Переход (Goto)', icon: '↗️', category: 'flow', desc: 'Смена ветки выполнения' },
  { type: 'call', label: 'Вызов (Call)', icon: '📞', category: 'flow', desc: 'Итерация потока' },

  { type: 'scene', label: 'Сцена', icon: '🎬', category: 'content', desc: 'Диалоговый экран' },
  { type: 'choice', label: 'Выбор', icon: '🔀', category: 'content', desc: 'Варианты ответа' },
  { type: 'time_choice', label: 'Выбор по времени', icon: '⏳', category: 'content', desc: 'Варианты с таймером' },
  { type: 'resource', label: 'Ресурс', icon: '📁', category: 'content', desc: 'Изображение (base64)' },
  { type: 'notice', label: 'Уведомление', icon: '🔔', category: 'content', desc: 'Системное пуш-уведомление' },

  { type: 'set', label: 'Переменная (Set)', icon: '⚙️', category: 'logic', desc: 'Запись в state' },
  { type: 'if_equals', label: 'Условие (==)', icon: '⚖️', category: 'logic', desc: 'Проверка равенства' },
  { type: 'if_compare', label: 'Условие (>)', icon: '📊', category: 'logic', desc: 'Сравнение двух значений' },
  { type: 'loyalty', label: 'Лояльность', icon: '❤️', category: 'logic', desc: 'Модификатор лояльности' },
  { type: 'safety', label: 'Безопасность', icon: '🛡️', category: 'logic', desc: 'Уровень безопасности' },

  { type: 'start_timer', label: 'Старт таймера', icon: '⏱️', category: 'timers', desc: 'Запуск отсчёта' },
  { type: 'interrupt_timer', label: 'Пауза таймера', icon: '⏸️', category: 'timers', desc: 'Пауза активного таймера' },
  { type: 'kill_timer', label: 'Сброс таймера', icon: '🛑', category: 'timers', desc: 'Остановка таймера' },
  { type: 'kill_all_timers', label: 'Сброс всех таймеров', icon: '💣', category: 'timers', desc: 'Остановка всех процессов' },
  { type: 'achievement', label: 'Достижение', icon: '🏆', category: 'timers', desc: 'Выдача награды' },
];

const filteredNodes = computed(() => {
  return nodeCatalog.filter(node => {
    const matchesCat = activeCategory.value === 'all' || node.category === activeCategory.value;
    const matchesQuery = node.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         node.type.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesCat && matchesQuery;
  });
});

const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData('application/vueflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const handleNodeClick = (nodeType) => {
  emit('add-node', nodeType);
  if (window.innerWidth <= 768) {
    isCollapsed.value = true;
  }
};

onMounted(() => {
  if (window.innerWidth <= 768) {
    isCollapsed.value = true;
  }
});
</script>

<template>
  <aside class="m3-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <button
      class="sidebar-toggle-btn"
      :title="isCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
      @click="isCollapsed = !isCollapsed"
    >
      <span>{{ isCollapsed ? '►' : '◄' }}</span>
    </button>

    <div class="m3-sidebar-header">
      <div class="m3-search-bar">
        <span class="m3-search-icon">🔍</span>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск ноды..."
          class="m3-search-input"
        />
      </div>

      <div class="m3-chip-row">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['m3-filter-chip', { active: activeCategory === cat.id }]"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div class="m3-node-list">
      <div
        v-for="node in filteredNodes"
        :key="node.type"
        class="m3-list-item"
        draggable="true"
        @dragstart="onDragStart($event, node.type)"
        @click="handleNodeClick(node.type)"
        @mouseenter="hoveredNode = node"
        @mouseleave="hoveredNode = null"
      >
        <div class="m3-item-icon">{{ node.icon }}</div>
        <div class="m3-item-content">
          <span class="m3-item-title">{{ node.label }}</span>
          <span class="m3-item-subtitle">{{ node.type }}</span>
        </div>
      </div>
    </div>

    <transition name="m3-fade">
      <div v-if="hoveredNode" class="m3-preview-sheet">
        <div class="m3-preview-title">{{ hoveredNode.icon }} {{ hoveredNode.label }}</div>
        <div class="m3-preview-desc">{{ hoveredNode.desc }}</div>
      </div>
    </transition>
  </aside>
</template>

<style scoped>
.m3-sidebar {
  width: 270px;
  height: calc(100% - 24px);
  background: var(--md-sys-color-surface-container-low, #1d1b20);
  border: 1px solid var(--md-sys-color-outline-variant, #49454f);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  font-family: Roboto, system-ui, -apple-system, sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  box-sizing: border-box;
}

.m3-sidebar.is-collapsed {
  transform: translateX(calc(-100% - 16px));
}

.sidebar-toggle-btn {
  position: absolute;
  right: -28px;
  top: 16px;
  width: 28px;
  height: 38px;
  background: var(--md-sys-color-surface-container-high, #2b2930);
  border: 1px solid var(--md-sys-color-outline-variant, #49454f);
  border-left: none;
  border-radius: 0 8px 8px 0;
  color: var(--md-sys-color-primary, #d0bcff);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  box-shadow: 4px 2px 8px rgba(0, 0, 0, 0.3);
  transition: background 0.2s, color 0.2s;
}

.sidebar-toggle-btn:hover {
  background: var(--md-sys-color-surface-container-highest, #36343b);
  color: #ffffff;
}

.m3-sidebar-header {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #49454f);
}

.m3-search-bar {
  background: var(--md-sys-color-surface-container-high, #2b2930);
  border-radius: var(--md-sys-shape-corner-full, 9999px);
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 38px;
  border: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}

.m3-search-bar:focus-within {
  border-color: var(--md-sys-color-primary, #d0bcff);
  background: var(--md-sys-color-surface-container-highest, #36343b);
}

.m3-search-icon {
  font-size: 13px;
  opacity: 0.6;
  margin-right: 8px;
}

.m3-search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #e6e1e5;
  font-size: 12px;
  outline: none;
}

.m3-chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.m3-filter-chip {
  background: transparent;
  border: 1px solid var(--md-sys-color-outline-variant, #49454f);
  color: var(--md-sys-color-outline, #938f99);
  padding: 4px 10px;
  border-radius: var(--md-sys-shape-corner-small, 8px);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.m3-filter-chip:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e6e1e5;
}

.m3-filter-chip.active {
  background: var(--md-sys-color-secondary-container, #4a4458);
  color: var(--md-sys-color-on-secondary-container, #e8def8);
  border-color: transparent;
}

.m3-node-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m3-list-item {
  background: var(--md-sys-color-surface-container, #211f26);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: grab;
  transition: background 0.15s ease, transform 0.15s ease;
  user-select: none;
}

.m3-list-item:hover {
  background: var(--md-sys-color-surface-container-high, #2b2930);
  transform: translateX(2px);
}

.m3-item-icon {
  font-size: 16px;
}

.m3-item-content {
  display: flex;
  flex-direction: column;
}

.m3-item-title {
  font-size: 12px;
  font-weight: 500;
  color: #e6e1e5;
}

.m3-item-subtitle {
  font-size: 10px;
  color: var(--md-sys-color-outline, #938f99);
  font-family: monospace;
}

.m3-preview-sheet {
  padding: 12px;
  background: var(--md-sys-color-surface-container-highest, #36343b);
  border-top: 1px solid var(--md-sys-color-outline-variant, #49454f);
}

.m3-preview-title {
  font-weight: 500;
  font-size: 12px;
  color: var(--md-sys-color-primary, #d0bcff);
  margin-bottom: 4px;
}

.m3-preview-desc {
  font-size: 11px;
  color: #cac4d0;
  line-height: 1.3;
}

.m3-fade-enter-active, .m3-fade-leave-active {
  transition: opacity 0.15s ease;
}
.m3-fade-enter-from, .m3-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .m3-sidebar {
    width: calc(100vw - 48px);
    max-width: 280px;
    height: calc(100% - 16px);
    top: 8px;
    left: 8px;
  }

  .sidebar-toggle-btn {
    width: 32px;
    height: 44px;
    right: -32px;
    font-size: 13px;
  }
}
</style>
