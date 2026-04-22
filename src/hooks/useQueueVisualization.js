import { useCallback, useEffect, useRef } from 'react';
import useSchedulerStore from '../store/useSchedulerStore';

export function useQueueVisualization() {
  const {
    timeline,
    log,
    processes,
    playbackTime,
    isPlaying,
    playbackSpeed,
    readyQueue,
    waitingQueue,
    runningProcess,
    terminatedQueue,
    processStates,
    hasRun,
    updateQueuesAtTime,
    recordTransition,
    setActiveTransition,
  } = useSchedulerStore();

  const lastUpdateTime = useRef(0);

  const getQueuesAtTime = useCallback((time) => {
    if (!hasRun || timeline.length === 0) {
      return {
        readyQueue: [],
        waitingQueue: [],
        runningProcess: null,
        terminatedQueue: [],
        processStates: {},
      };
    }

    const runningAtTime = timeline.find(
      t => t.pid !== 'idle' && t.start <= time && t.end >= time
    );
    
    const completedBefore = timeline.filter(
      t => t.pid !== 'idle' && t.end <= time
    );
    
    const startedBefore = timeline.filter(
      t => t.pid !== 'idle' && t.start <= time
    );

    const terminatedSet = new Set(completedBefore.map(t => t.pid));
    const startedSet = new Set(startedBefore.map(t => t.pid));

    const runningProcess = runningAtTime ? runningAtTime.pid : null;
    const terminatedQueue = Array.from(terminatedSet);
    const readyQueue = Array.from(startedSet).filter(
      pid => !terminatedSet.has(pid) && pid !== runningProcess
    );

    const runningState = {};
    if (runningProcess) runningState[runningProcess] = 'running';
    terminatedQueue.forEach(pid => { runningState[pid] = 'terminated'; });
    readyQueue.forEach(pid => { runningState[pid] = 'ready'; });

    processes.forEach(p => {
      if (!runningState[p.id]) {
        if (p.arrivalTime > time) {
          runningState[p.id] = 'new';
        } else if (p.arrivalTime <= time && !startedSet.has(p.id)) {
          runningState[p.id] = 'ready';
        }
      }
    });

    return {
      readyQueue,
      waitingQueue: [],
      runningProcess,
      terminatedQueue,
      processStates: runningState,
    };
  }, [hasRun, timeline, processes]);

  const recordStateTransition = useCallback((processId, fromState, toState, metadata = {}) => {
    const transition = {
      id: `${processId}-${Date.now()}-${Math.random()}`,
      processId,
      fromState,
      toState,
      timestamp: metadata.timestamp || playbackTime,
      reason: metadata.reason || '',
    };

    recordTransition(transition);
    setActiveTransition(transition);
  }, [playbackTime, recordTransition, setActiveTransition]);

  useEffect(() => {
    if (!hasRun || !isPlaying) return;

    const interval = setInterval(() => {
      const state = useSchedulerStore.getState();
      const currentTime = state.playbackTime;
      
      if (currentTime !== lastUpdateTime.current) {
        lastUpdateTime.current = currentTime;
        updateQueuesAtTime(currentTime, timeline, log);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasRun, isPlaying, timeline, log, updateQueuesAtTime]);

  useEffect(() => {
    if (!hasRun) return;
    
    if (!isPlaying && playbackTime > 0) {
      const state = getQueuesAtTime(playbackTime);
      Object.entries(state.processStates).forEach(([pid, state]) => {
        if (processStates[pid] !== state) {
          const fromState = processStates[pid] || 'unknown';
          if (fromState !== state) {
            recordStateTransition(pid, fromState, state, { timestamp: playbackTime });
          }
        }
      });
    }
  }, [playbackTime, hasRun, isPlaying]);

  return {
    readyQueue,
    waitingQueue,
    runningProcess,
    terminatedQueue,
    processStates,
    hasRun,
    getQueuesAtTime,
    recordStateTransition,
  };
}

export default useQueueVisualization;