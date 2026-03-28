export function run(processes) {
  const procs = processes.map((p, idx) => ({ ...p, originalIndex: idx }));
  const completed = new Set();
  const timeline = [];
  const results = [];
  const log = [];
  let currentTime = 0;

  while (completed.size < procs.length) {
    // Get all arrived, non-completed processes
    const available = procs.filter(
      (p) => p.arrivalTime <= currentTime && !completed.has(p.id)
    );

    if (available.length === 0) {
      // Find next arrival
      const nextArrival = procs
        .filter((p) => !completed.has(p.id))
        .reduce((min, p) => Math.min(min, p.arrivalTime), Infinity);

      timeline.push({ pid: 'idle', start: currentTime, end: nextArrival });
      log.push({
        time: currentTime,
        pid: null,
        event: 'idle',
        text: `[t=${currentTime}] CPU IDLE — no arrived process. Waiting for t=${nextArrival}.`,
        readyQueue: [],
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by burst time (shortest first), tiebreak by arrival time, then original index
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.originalIndex - b.originalIndex;
    });

    const selected = available[0];
    const readyQueue = available
      .filter((p) => p.id !== selected.id)
      .map((p) => `${p.id}(b=${p.burstTime})`);

    log.push({
      time: currentTime,
      pid: selected.id,
      event: 'dispatch',
      text: `[t=${currentTime}] Ready queue: [${available.map((p) => `${p.id}(b=${p.burstTime})`).join(', ')}]. SJF selects ${selected.id} (shortest burst = ${selected.burstTime}).`,
      readyQueue: available.filter((p) => p.id !== selected.id).map((p) => p.id),
    });

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
      text: `[t=${currentTime}] ${selected.id} completes (burst=${selected.burstTime}). Re-evaluating ready queue.`,
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
