export const getDefaultData = (type) => {
  const defaults = {
    begin: { next_node: null },
    end: { is_completed: true },
    resource: { resource: "", fileName: "" },
    scene: { image_node: null, label: "", text: "", next_node: null },
    trigger: { name: "", next_node: null },
    clear: { next_node: null },
    choice: { topic: "", choice: [] },
    time_choice: { topic: "", choice: [], time: 10, timeout_node: null },
    notice: { text: "", next_node: null },
    loyalty: { delta: 0, next_node: null },
    safety: { delta: 0, next_node: null },
    start_timer: { name: "", label: "", time: 0, interruption_node: null, finish_node: null, next_node: null },
    interrupt_timer: { name: "", next_node: null },
    kill_timer: { name: "", next_node: null },
    kill_all_timers: { next_node: null },
    achievement: { name: "", label: "", description: "", icon: "", score_delta: 0, next_node: null },
    goto: { goto_node: null, next_node: null },
    call: { next_node: null },
    set: { name: "", value: "", next_node: null },
    if_equals: { name_a: "", name_b: "", neq_node: null, next_node: null },
    if_compare: { name_a: "", name_b: "", ncp_node: null, next_node: null }
  };
  return defaults[type] || { next_node: null };
};
