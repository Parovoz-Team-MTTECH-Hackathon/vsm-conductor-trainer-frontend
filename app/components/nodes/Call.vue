<script setup>
import { Handle, Position } from '@vue-flow/core';

defineOptions({ label: "call-node" });

defineProps({
  id: { type: String, required: true },
  data: { type: Object, required: true, default: () => ({ next_node: null }) }
});
</script>

<template>
  <div class="node-card call-node">
    <Handle id="flow-target" type="target" :position="Position.Left" style="background: #41b883;" />
    <div class="node-body">📞 Call Main Stream</div>
    <Handle id="next-source" type="source" :position="Position.Right" style="background: #eab308;" />
  </div>
</template>

<style scoped>
.node-card { background: #1e1e24; border: 2px solid #0284c7; border-radius: 8px; color: #fff; min-width: 180px; font-family: sans-serif; text-align: center; }
.node-body { padding: 12px; font-weight: bold; font-size: 12px; }
</style>
