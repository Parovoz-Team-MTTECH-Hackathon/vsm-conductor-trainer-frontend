<script setup>
import { Handle, Position } from "@vue-flow/core";

defineOptions({ label: "start-node" });

defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    required: true,
    default: () => ({ next_node: null })
  }
});
</script>

<template>
  <div class="node-card start-node">
    <div class="node-header">🚀 СТАРТ (Begin)</div>
    <div class="node-body">
      <span class="desc">Точка входа в сценарий</span>
    </div>
    <Handle
      id="next-source"
      type="source"
      :position="Position.Right"
      style="background: #41b883;"
    />
  </div>
</template>

<style scoped>
.node-card {
  background: #1e1e24;
  border: 2px solid #41b883;
  border-radius: 8px;
  color: #fff;
  min-width: 180px;
  font-family: sans-serif;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.node-header {
  font-weight: bold;
  padding: 8px 10px;
  background: rgba(65, 184, 131, 0.2);
  font-size: 12px;
  border-bottom: 1px solid #3a3f58;
}
.node-body {
  padding: 10px;
  text-align: center;
}
.desc {
  font-size: 11px;
  color: #a0a0a0;
}
</style>
