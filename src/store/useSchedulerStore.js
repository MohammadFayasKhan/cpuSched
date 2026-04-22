import { create } from 'zustand';
import { getProcessColor } from '../utils/colorUtils';
import { runAlgorithm } from '../algorithms';
import { computeMetrics } from '../utils/metrics';

export const PROCESS_STATES = {
  NEW: 'new',
  READY: 'ready',
  RUNNING: 'running',
  WAITING: 'waiting',
  TERMINATED: 'terminated',
};

const DEFAULT_PROCESSES = [
  { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 3 },
  { id: 'P4', arrivalTime: 3, burstTime: 3, priority: 4 },
  { id: 'P5', arrivalTime: 5, burstTime: 2, priority: 5 },
];

function assignColors(processes) {
  return processes.map((p, i) => ({ ...p, color: getProcessColor(i) }));
}

const useSchedulerStore = create((set, get) => ({
  // Algorithm
  algorithm: 'fcfs',
  quantum: 2,

  // Processes
  processes: assignColors(DEFAULT_PROCESSES),
  nextProcessNum: 6,

  // Results
  timeline: [],
  results: [],
  log: [],
  metrics: null,
  hasRun: false,
  isRunning: false,
  firstRun: true,

  // Compare mode
  compareMode: false,
  compareResults: null,

  // Playback
  isPlaying: false,
  playbackTime: 0,
  playbackSpeed: 1,

  // Queue Visualization State
  readyQueue: [],
  waitingQueue: [],
  terminatedQueue: [],
  runningProcess: null,
  processStates: {},
  stateTransitions: [],
  activeTransition: null,
  showQueueVisualizer: true,

  // Actions
  setAlgorithm: (algo) => {
    set({ algorithm: algo, hasRun: false, timeline: [], results: [], log: [], metrics: null, compareMode: false });
  },

  setQuantum: (q) => set({ quantum: Math.max(1, parseInt(q) || 1) }),

  addProcess: () => {
    const { processes, nextProcessNum } = get();
    if (processes.length >= 8) return;
    const newProcess = {
      id: `P${nextProcessNum}`,
      arrivalTime: 0,
      burstTime: 1,
      priority: 1,
    };
    set({
      processes: assignColors([...processes, newProcess]),
      nextProcessNum: nextProcessNum + 1,
      hasRun: false,
    });
  },

  removeProcess: (id) => {
    const { processes } = get();
    if (processes.length <= 1) return;
    set({
      processes: assignColors(processes.filter((p) => p.id !== id)),
      hasRun: false,
    });
  },

  updateProcess: (id, field, value) => {
    const { processes } = get();
    set({
      processes: processes.map((p) =>
        p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p
      ),
      hasRun: false,
    });
  },

  reorderProcesses: (fromIndex, toIndex) => {
    const { processes } = get();
    const updated = [...processes];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    set({ processes: assignColors(updated), hasRun: false });
  },

  loadExample: (exampleData) => {
    set({
      processes: assignColors(exampleData),
      nextProcessNum: exampleData.length + 1,
      hasRun: false,
      timeline: [],
      results: [],
      log: [],
      metrics: null,
    });
  },

  clearProcesses: () => {
    const singleProcess = [{ id: 'P1', arrivalTime: 0, burstTime: 4, priority: 1 }];
    set({
      processes: assignColors(singleProcess),
      nextProcessNum: 2,
      hasRun: false,
      timeline: [],
      results: [],
      log: [],
      metrics: null,
    });
  },

  runSimulation: (autoPlay = false) => {
    const { algorithm, processes, quantum, firstRun } = get();
    set({ isRunning: true });

    setTimeout(() => {
      try {
        const { timeline, results, log } = runAlgorithm(algorithm, processes, quantum);
        const metrics = computeMetrics(results, timeline);

        set({
          timeline,
          results,
          log,
          metrics,
          hasRun: true,
          isRunning: false,
          firstRun: false,
          playbackTime: 0,
          isPlaying: autoPlay,
          compareMode: false,
          readyQueue: [],
          waitingQueue: [],
          terminatedQueue: [],
          runningProcess: null,
          processStates: {},
          stateTransitions: [],
          activeTransition: null,
        });
      } catch (err) {
        console.error('Simulation error:', err);
        set({ isRunning: false });
      }
    }, 300);
  },

  // Compare all algorithms
  runCompare: () => {
    const { processes, quantum } = get();
    set({ isRunning: true });

    setTimeout(() => {
      const algos = ['fcfs', 'sjf', 'roundRobin', 'priority', 'priorityPreemptive', 'srtf'];
      const compareResults = {};

      algos.forEach((algo) => {
        const result = runAlgorithm(algo, processes, quantum);
        const metrics = computeMetrics(result.results, result.timeline);
        compareResults[algo] = { ...result, metrics };
      });

      set({
        compareResults,
        compareMode: true,
        isRunning: false,
        hasRun: false,
      });
    }, 300);
  },

  exitCompare: () => set({ compareMode: false, compareResults: null }),

  // Playback
  setPlaybackTime: (t) => set({ playbackTime: t }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setPlaybackSpeed: (s) => set({ playbackSpeed: s }),

  // Queue Visualization Actions
  updateProcessState: (pid, newState, metadata = {}) => set((state) => ({
    processStates: { ...state.processStates, [pid]: newState },
    runningProcess: newState === 'running' ? pid : 
                    (state.runningProcess === pid ? null : state.runningProcess),
  })),

  addToReadyQueue: (pid) => set((state) => {
    if (state.readyQueue.includes(pid)) return state;
    return { readyQueue: [...state.readyQueue, pid] };
  }),

  removeFromReadyQueue: (pid) => set((state) => ({
    readyQueue: state.readyQueue.filter((id) => id !== pid),
  })),

  addToWaitingQueue: (pid) => set((state) => {
    if (state.waitingQueue.includes(pid)) return state;
    return { waitingQueue: [...state.waitingQueue, pid] };
  }),

  removeFromWaitingQueue: (pid) => set((state) => ({
    waitingQueue: state.waitingQueue.filter((id) => id !== pid),
  })),

  addToTerminatedQueue: (pid) => set((state) => {
    if (state.terminatedQueue.includes(pid)) return state;
    return { terminatedQueue: [...state.terminatedQueue, pid] };
  }),

  recordTransition: (transition) => set((state) => ({
    stateTransitions: [...state.stateTransitions, transition],
  })),

  setActiveTransition: (transition) => set({ activeTransition: transition }),

  clearActiveTransition: () => set({ activeTransition: null }),

  toggleQueueVisualizer: () => set((state) => ({ showQueueVisualizer: !state.showQueueVisualizer })),

  clearQueues: () => set({
    readyQueue: [],
    waitingQueue: [],
    terminatedQueue: [],
    runningProcess: null,
    processStates: {},
    stateTransitions: [],
    activeTransition: null,
  }),

  // Initialize queues from timeline/log data
  initializeQueuesFromLog: (log, processes) => {
    const processStates = {};
    processes.forEach(p => { processStates[p.id] = 'new'; });
    
    const readyQueue = [];
    const waitingQueue = [];
    const terminatedQueue = [];
    let runningProcess = null;
    
    log.forEach((entry) => {
      if (entry.pid && entry.event === 'dispatch') {
        processStates[entry.pid] = 'running';
        readyQueue.forEach(id => { processStates[id] = 'ready'; });
        runningProcess = entry.pid;
      } else if (entry.pid && entry.event === 'complete') {
        processStates[entry.pid] = 'terminated';
        if (runningProcess === entry.pid) runningProcess = null;
      }
    });
    
    processes.forEach(p => {
      if (processStates[p.id] === 'new') {
        readyQueue.push(p.id);
        processStates[p.id] = 'ready';
      }
    });
    
    set({
      processStates,
      readyQueue,
      waitingQueue,
      terminatedQueue,
      runningProcess,
    });
  },

  // Update queues based on playback time
  updateQueuesAtTime: (time, timeline, log) => {
    const runningAtTime = timeline.find(t => t.pid !== 'idle' && t.start <= time && t.end >= time);
    const completedBefore = timeline.filter(t => t.pid !== 'idle' && t.end <= time);
    const startedBefore = timeline.filter(t => t.pid !== 'idle' && t.start <= time);
    
    const terminatedSet = new Set(completedBefore.map(t => t.pid));
    const startedSet = new Set(startedBefore.map(t => t.pid));
    
    const runningProcess = runningAtTime ? runningAtTime.pid : null;
    const terminatedQueue = Array.from(terminatedSet);
    const readyQueue = Array.from(startedSet).filter(pid => 
      !terminatedSet.has(pid) && pid !== runningProcess
    );
    
    const runningState = {};
    if (runningProcess) runningState[runningProcess] = 'running';
    terminatedQueue.forEach(pid => { runningState[pid] = 'terminated'; });
    readyQueue.forEach(pid => { runningState[pid] = 'ready'; });
    
    set({
      readyQueue,
      runningProcess,
      terminatedQueue,
      processStates: runningState,
    });
  },
}));

export default useSchedulerStore;
