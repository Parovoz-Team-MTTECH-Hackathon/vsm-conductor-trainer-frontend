<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { VueFlow, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

import NodeEditorSidebar from "./Sidebar.vue";

const props = defineProps({
  scenarioMeta: {
    type: Object,
    default: () => ({
      name: "new_scenario",
      label: "Новый сценарий",
      description: "",
      icon: ""
    })
  },
  initialNodes: {
    type: Object,
    default: () => ({})
  }
});

const nodes = ref([
  { id: "node-start", type: "begin", position: { x: 350, y: 100 }, data: { next_node: null } }
]);

const edges = ref([]);

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  nodeId: null
});

const {
  onConnect,
  addEdges,
  onEdgeClick,
  removeEdges,
  findNode,
  addNodes,
  removeNodes,
  screenToFlowPosition,
  project,
  getNodes,
  getEdges
} = useVueFlow();


const getCurrentNodes = () => {
  const flowNodes = getNodes?.value;
  return Array.isArray(flowNodes) && flowNodes.length > 0 ? flowNodes : nodes.value;
};

const getCurrentEdges = () => {
  const flowEdges = getEdges?.value;
  return Array.isArray(flowEdges) && flowEdges.length > 0 ? flowEdges : edges.value;
};


const exportScenarioJson = () => {
  const formattedNodes = {};
  const activeNodes = getCurrentNodes();

  activeNodes.forEach((node) => {
    const { label, name, ...contentData } = node.data || {};

    formattedNodes[node.id] = {
      label: label || name || node.id,
      content_type: node.type,
      content: { ...contentData }
    };
  });

  return {
    name: props.scenarioMeta?.name || "scenario",
    label: props.scenarioMeta?.label || "",
    description: props.scenarioMeta?.description || "",
    icon: props.scenarioMeta?.icon || "",
    nodes: formattedNodes,
    creation_time: Math.floor(Date.now() / 1000)
  };
};


const exportFlowJson = () => {
  const activeNodes = getCurrentNodes();
  const activeEdges = getCurrentEdges();

  return {
    meta: { ...(props.scenarioMeta || {}) },
    nodes: activeNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data || {}
    })),
    edges: activeEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    }))
  };
};

// Загрузка нод и связей из внешних данных
const loadNodesData = async (data) => {
  if (!data || Object.keys(data).length === 0) return;

  if (Array.isArray(data.nodes)) {
    nodes.value = data.nodes;
    await nextTick();
    edges.value = data.edges || [];
    return;
  }


  const targetObj = data.nodes || data;
  const newNodes = [];
  const newEdges = [];

  Object.entries(targetObj).forEach(([id, nodeObj]) => {
    const nodeType = nodeObj.content_type || nodeObj.type || "scene";
    const nodeData = nodeObj.content || nodeObj.data || {};

    newNodes.push({
      id,
      type: nodeType,
      position: nodeObj.position || { x: 100 + Math.random() * 80, y: 100 + Math.random() * 80 },
      data: nodeData
    });

    if (nodeData.next_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.next_node}-next`,
        source: id,
        target: nodeData.next_node,
        sourceHandle: "next-source"
      });
    }

    if (nodeData.timeout_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.timeout_node}-timeout`,
        source: id,
        target: nodeData.timeout_node,
        sourceHandle: "timeout-source"
      });
    }

    if (nodeData.interruption_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.interruption_node}-interruption`,
        source: id,
        target: nodeData.interruption_node,
        sourceHandle: "interruption-source"
      });
    }

    if (nodeData.finish_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.finish_node}-finish`,
        source: id,
        target: nodeData.finish_node,
        sourceHandle: "finish-source"
      });
    }

    if (nodeData.neq_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.neq_node}-neq`,
        source: id,
        target: nodeData.neq_node,
        sourceHandle: "neq-source"
      });
    }

    if (nodeData.ncp_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.ncp_node}-ncp`,
        source: id,
        target: nodeData.ncp_node,
        sourceHandle: "ncp-source"
      });
    }

    if (nodeData.goto_node) {
      newEdges.push({
        id: `e-${id}-${nodeData.goto_node}-goto`,
        source: id,
        target: nodeData.goto_node,
        sourceHandle: "goto-source"
      });
    }

    if (nodeData.image_node) {
      newEdges.push({
        id: `e-${nodeData.image_node}-${id}-image`,
        source: nodeData.image_node,
        target: id,
        targetHandle: "image-target"
      });
    }

    if (Array.isArray(nodeData.choice)) {
      nodeData.choice.forEach((ch, idx) => {
        if (ch.next_node) {
          newEdges.push({
            id: `e-${id}-choice-${idx}-${ch.next_node}`,
            source: id,
            target: ch.next_node,
            sourceHandle: `choice-source-${idx}`
          });
        }
      });
    }
  });

  nodes.value = newNodes;
  await nextTick();
  edges.value = newEdges;
};

const onNodeContextMenu = ({ event, node }) => {
  event.preventDefault();
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    nodeId: node.id
  };
};

const closeContextMenu = () => {
  contextMenu.value.show = false;
};

const deleteNodeFromContextMenu = () => {
  if (contextMenu.value.nodeId) {
    removeNodes([contextMenu.value.nodeId]);
  }
  closeContextMenu();
};

const handleAddNode = (type) => {
  const newNode = {
    id: `${type}-${Date.now()}`,
    type,
    position: { x: 380 + Math.random() * 40, y: 150 + Math.random() * 40 },
    data: getDefaultData(type) // Автоимпорт из utils/nodeDefaults.js
  };
  addNodes([newNode]);
};

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const onDrop = (event) => {
  const type = event.dataTransfer?.getData('application/vueflow');
  if (!type) return;

  const position = screenToFlowPosition
    ? screenToFlowPosition({ x: event.clientX, y: event.clientY })
    : project({ x: event.clientX, y: event.clientY });

  const newNode = {
    id: `${type}-${Date.now()}`,
    type,
    position,
    data: getDefaultData(type) // Автоимпорт из utils/nodeDefaults.js
  };

  addNodes([newNode]);
};

onConnect((connection) => {
  addEdges(connection);

  const sourceNode = findNode(connection.source);
  const targetNode = findNode(connection.target);
  if (!sourceNode || !targetNode) return;

  const handleId = connection.sourceHandle;

  if (connection.targetHandle === "image-target") {
    targetNode.data = { ...(targetNode.data || {}), image_node: connection.source };
    return;
  }

  if (handleId && handleId.startsWith("choice-source-")) {
    const choiceIndex = parseInt(handleId.replace("choice-source-", ""), 10);
    const newChoices = [...(sourceNode.data.choice || [])];
    if (newChoices[choiceIndex]) {
      newChoices[choiceIndex].next_node = connection.target;
      sourceNode.data = { ...sourceNode.data, choice: newChoices };
    }
    return;
  }

  const handleToDataKey = {
    "next-source": "next_node",
    "timeout-source": "timeout_node",
    "interruption-source": "interruption_node",
    "finish-source": "finish_node",
    "neq-source": "neq_node",
    "ncp-source": "ncp_node",
    "goto-source": "goto_node"
  };

  const key = handleToDataKey[handleId] || "next_node";
  sourceNode.data = { ...(sourceNode.data || {}), [key]: connection.target };
});

onEdgeClick(({ edge }) => {
  removeEdges(edge);

  const sourceNode = findNode(edge.source);
  const targetNode = findNode(edge.target);

  if (edge.targetHandle === "image-target" && targetNode) {
    targetNode.data = { ...(targetNode.data || {}), image_node: null };
    return;
  }

  if (sourceNode) {
    const handleId = edge.sourceHandle;

    if (handleId && handleId.startsWith("choice-source-")) {
      const choiceIndex = parseInt(handleId.replace("choice-source-", ""), 10);
      const newChoices = [...(sourceNode.data.choice || [])];
      if (newChoices[choiceIndex]) {
        newChoices[choiceIndex].next_node = null;
        sourceNode.data = { ...sourceNode.data, choice: newChoices };
      }
      return;
    }

    const handleToDataKey = {
      "next-source": "next_node",
      "timeout-source": "timeout_node",
      "interruption-source": "interruption_node",
      "finish-source": "finish_node",
      "neq-source": "neq_node",
      "ncp-source": "ncp_node",
      "goto-source": "goto_node"
    };

    const key = handleToDataKey[handleId] || "next_node";
    sourceNode.data = { ...(sourceNode.data || {}), [key]: null };
  }
});

onMounted(() => {
  window.addEventListener('click', closeContextMenu);
  if (props.initialNodes && Object.keys(props.initialNodes).length > 0) {
    loadNodesData(props.initialNodes);
  }
});

watch(
  () => props.initialNodes,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      loadNodesData(newVal);
    }
  },
  { deep: true }
);

onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu);
});

defineExpose({
  exportScenarioJson,
  exportFlowJson,
  exportProjectJson: exportFlowJson,
  loadNodesData
});
</script>

<template>
  <div class="graph-view" @dragover="onDragOver" @drop="onDrop" @click="closeContextMenu">
    <NodeEditorSidebar @add-node="handleAddNode" />

    <ClientOnly>
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :fit-view-on-init="true"
        :connection-mode="ConnectionMode.Loose"
        :delete-key-code="['Delete', 'Backspace']"
        @node-context-menu="onNodeContextMenu"
      >
        <Background />
      </VueFlow>
    </ClientOnly>

    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <div class="context-item danger" @click="deleteNodeFromContextMenu">
        <span>🗑️</span> Удалить ноду
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-view {
  width: 100%;
  height: 100%;
  background: #121214;
  position: relative;
  overflow: hidden;
}

:deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background: var(--md-sys-color-surface-container-highest, #36343b);
  border: 1px solid var(--md-sys-color-outline-variant, #49454f);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  padding: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  min-width: 150px;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #e6e1e5;
  border-radius: var(--md-sys-shape-corner-small, 8px);
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
}

.context-item:hover {
  background: var(--md-sys-color-surface-container-high, #2b2930);
}

.context-item.danger {
  color: var(--md-sys-color-error, #f2b8b5);
}

.context-item.danger:hover {
  background: var(--md-sys-color-error-container, #8c1d18);
  color: var(--md-sys-color-on-error-container, #f9dedc);
}
</style>
