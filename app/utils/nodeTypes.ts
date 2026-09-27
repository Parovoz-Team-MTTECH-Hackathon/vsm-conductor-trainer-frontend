import { markRaw } from 'vue';

import NodesStart from '~/components/nodes/Start.vue';
import NodesEnd from '~/components/nodes/End.vue';
import NodesResource from '~/components/nodes/Resource.vue';
import NodesScene from '~/components/nodes/Scene.vue';
import NodesTrigger from '~/components/nodes/Trigger.vue';
import NodesChoice from '~/components/nodes/Choice.vue';
import NodesTimeChoice from '~/components/nodes/TimeChoice.vue';
import NodesNotice from '~/components/nodes/Notice.vue';
import NodesLoyalty from '~/components/nodes/Loyalty.vue';
import NodesSafety from '~/components/nodes/Safety.vue';
import NodesStartTimer from '~/components/nodes/StartTimer.vue';
import NodesInterruptTimer from '~/components/nodes/InterruptTimer.vue';
import NodesKillTimer from '~/components/nodes/KillTimer.vue';
import NodesKillAllTimers from '~/components/nodes/KillAllTimers.vue';
import NodesAchievement from '~/components/nodes/Achievement.vue';
import NodesGoto from '~/components/nodes/Goto.vue';
import NodesCall from '~/components/nodes/Call.vue';
import NodesSet from '~/components/nodes/Set.vue';
import NodesIfEquals from '~/components/nodes/IfEquals.vue';
import NodesIfCompare from '~/components/nodes/IfCompare.vue';

export const nodeTypes = {
  begin: markRaw(NodesStart),
  start: markRaw(NodesStart),
  end: markRaw(NodesEnd),
  resource: markRaw(NodesResource),
  image: markRaw(NodesResource),
  scene: markRaw(NodesScene),
  trigger: markRaw(NodesTrigger),
  choice: markRaw(NodesChoice),
  time_choice: markRaw(NodesTimeChoice),
  notice: markRaw(NodesNotice),
  loyalty: markRaw(NodesLoyalty),
  safety: markRaw(NodesSafety),
  start_timer: markRaw(NodesStartTimer),
  interrupt_timer: markRaw(NodesInterruptTimer),
  kill_timer: markRaw(NodesKillTimer),
  kill_all_timers: markRaw(NodesKillAllTimers),
  achievement: markRaw(NodesAchievement),
  goto: markRaw(NodesGoto),
  call: markRaw(NodesCall),
  set: markRaw(NodesSet),
  if_equals: markRaw(NodesIfEquals),
  if_compare: markRaw(NodesIfCompare),
};
