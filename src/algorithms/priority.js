export function run(processes) {
  const procs = processes.map((p, idx) => ({ ...p, originalIndex: idx }));
  const completed = new Set();
  const timeline = [];
  const results = [];
  const log = [];
  let currentTime = 0;

  while (completed.size < procs.length) {
    const available = procs.filter(
      (p) => p.arrivalTime <= currentTime && !completed.has(p.id)
    );

    if (available.length === 0) {
      const nextArrival = procs
        .filter((p) => !completed.has(p.id))
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

      timeline.push({ pid: 'idle', start: currentTime, end: nextArrival });
      log.push({
        time: currentTime,
        pid: null,
        event: 'idle',
        text: `[t=${currentTime}] CPU IDLE — no process available. Waiting for t=${nextArrival}.`,
        readyQueue: [],
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by priority (lower = higher), tiebreak by arrival, then index
    available.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.originalIndex - b.originalIndex;
    });

    const selected = available[0];
    const candidates = available.map((p) => `${p.id}(p=${p.priority})`);

    // Check if there was a tiebreak
    const tiedProcesses = available.filter((p) => p.priority === selected.priority);
    if (tiedProcesses.length > 1) {
      log.push({
        time: currentTime,
        pid: selected.id,
        event: 'dispatch',
        text: `[t=${currentTime}] Candidates: [${candidates.join(', ')}]. Priority tie. FCFS tiebreak selects ${selected.id} (arrived t=${selected.arrivalTime}).`,
        readyQueue: available.filter((p) => p.id !== selected.id).map((p) => p.id),
      });
    } else {
      log.push({
        time: currentTime,
        pid: selected.id,
        event: 'dispatch',
        text: `[t=${currentTime}] Candidates: [${candidates.join(', ')}]. Priority selects ${selected.id} (priority=${selected.priority}).`,
        readyQueue: available.filter((p) => p.id !== selected.id).map((p) => p.id),
      });
    }

    const start = currentTime;
    const end = start + selected.burstTime;
    timeline.push({ pid: selected.id, start, end });
    currentTime = end;
    completed.add(selected.id);

    const completionTime = end;
    const turnaroundTime = completionTime - selected.arrivalTime;
    const waitingTime = turnaroundTime - selected.burstTime;
    const responseTime = start - selected.arrivalTime;

    log.push({
      time: currentTime,
      pid: selected.id,
      event: 'complete',
      text: `[t=${currentTime}] ${selected.id} completes. Re-evaluating by priority.`,
      readyQueue: procs
        .filter((p) => !completed.has(p.id) && p.arrivalTime <= currentTime)
        .map((p) => p.id),
    });

    results.push({
      pid: selected.id,
      arrivalTime: selected.arrivalTime,
      burstTime: selected.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  return { timeline, results, log };
}
