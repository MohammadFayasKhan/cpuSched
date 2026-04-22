export const PROCESS_STATES = {
  NEW: 'new',
  READY: 'ready',
  RUNNING: 'running',
  WAITING: 'waiting',
  TERMINATED: 'terminated',
};

export const TRANSITION_RULES = {
  fcfs: {
    'new→ready': { condition: 'arrival', trigger: 'time-based' },
    'ready→running': { condition: 'cpu-free', trigger: 'scheduler' },
    'running→terminated': { condition: 'burst-complete', trigger: 'completion' },
  },
  sjf: {
    'new→ready': { condition: 'arrival', trigger: 'time-based' },
    'ready→running': { condition: 'shortest-burst', trigger: 'scheduler' },
    'running→terminated': { condition: 'burst-complete', trigger: 'completion' },
  },
  roundRobin: {
    'new→ready': { condition: 'arrival', trigger: 'time-based' },
    'ready→running': { condition: 'queue-front', trigger: 'time-quantum' },
    'running→ready': { condition: 'quantum-expired', trigger: 'time-slice' },
    'running→terminated': { condition: 'burst-complete', trigger: 'completion' },
  },
  priority: {
    'new→ready': { condition: 'arrival', trigger: 'time-based' },
    'ready→running': { condition: 'highest-priority', trigger: 'scheduler' },
    'running→terminated': { condition: 'burst-complete', trigger: 'completion' },
  },
  srtf: {
    'new→ready': { condition: 'arrival', trigger: 'time-based' },
    'ready→running': { condition: 'shortest-remaining', trigger: 'preemption' },
    'running→ready': { condition: 'preempted', trigger: 'new-shorter-process' },
    'running→terminated': { condition: 'burst-complete', trigger: 'completion' },
  },
  priorityPreemptive: {
    'new→ready': { condition: 'arrival', trigger: 'time-based' },
    'ready→running': { condition: 'highest-priority', trigger: 'preemption' },
    'running→ready': { condition: 'preempted', trigger: 'higher-priority-arrival' },
    'running→terminated': { condition: 'burst-complete', trigger: 'completion' },
  },
};

export const TRANSITION_COLORS = {
  'new→ready': '#6B7280',
  'ready→running': '#22C55E',
  'running→ready': '#F59E0B',
  'running→terminated': '#6B7280',
  'running→waiting': '#F97316',
  'waiting→ready': '#FB923C',
  'running→new': '#6B7280',
};

export function getTransitionColor(fromState, toState) {
  return TRANSITION_COLORS[`${fromState}→${toState}`] || '#60A5FA';
}

export function getValidTransitions(fromState, algorithm) {
  const rules = TRANSITION_RULES[algorithm] || {};
  return Object.keys(rules).filter(key => key.startsWith(`${fromState}→`));
}

export function createTransitionRecord(processId, fromState, toState, metadata = {}) {
  return {
    id: `${processId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    processId,
    fromState,
    toState,
    timestamp: metadata.timestamp || 0,
    reason: metadata.reason || getTransitionReason(fromState, toState),
    queueFrom: metadata.queueFrom || null,
    queueTo: metadata.queueTo || null,
  };
}

function getTransitionReason(fromState, toState) {
  const reasons = {
    'new→ready': 'Process arrived',
    'ready→running': 'Dispatcher selected process',
    'running→ready': 'Process preempted',
    'running→terminated': 'Burst completed',
    'running→waiting': 'I/O request',
    'waiting→ready': 'I/O completed',
  };
  return reasons[`${fromState}→${toState}`] || 'State change';
}

export function getProcessStateAtTime(process, time, timeline, log) {
  const processTimeline = timeline.filter(t => t.pid === process.id);
  
  if (processTimeline.length === 0) {
    return process.arrivalTime > time ? PROCESS_STATES.NEW : PROCESS_STATES.READY;
  }

  for (const segment of processTimeline) {
    if (time >= segment.start && time < segment.end) {
      return PROCESS_STATES.RUNNING;
    }
  }

  const lastSegment = processTimeline[processTimeline.length - 1];
  if (lastSegment && time >= lastSegment.end) {
    return PROCESS_STATES.TERMINATED;
  }

  return PROCESS_STATES.READY;
}

export function getReadyQueueAtTime(time, timeline, log, processes) {
  const runningAtTime = timeline.find(
    t => t.pid !== 'idle' && t.start <= time && t.end >= time
  );
  const runningProcess = runningAtTime?.pid;

  const startedBefore = timeline.filter(
    t => t.pid !== 'idle' && t.start <= time
  );
  const completedBefore = timeline.filter(
    t => t.pid !== 'idle' && t.end <= time
  );

  const terminatedSet = new Set(completedBefore.map(t => t.pid));
  const startedSet = new Set(startedBefore.map(t => t.pid));

  return Array.from(startedSet).filter(
    pid => !terminatedSet.has(pid) && pid !== runningProcess
  );
}

export function getRunningProcessAtTime(time, timeline) {
  const runningAtTime = timeline.find(
    t => t.pid !== 'idle' && t.start <= time && t.end >= time
  );
  return runningAtTime?.pid || null;
}

export function getTerminatedProcessesAtTime(time, timeline) {
  return timeline
    .filter(t => t.pid !== 'idle' && t.end <= time)
    .map(t => t.pid);
}