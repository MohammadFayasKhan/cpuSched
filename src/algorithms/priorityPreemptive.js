export function run(processes) {
  const procs = processes.map((p, idx) => ({
    ...p,
    remaining: p.burstTime,
    originalIndex: idx,
    firstRun: -1,
  }));

  const timeline = [];
  const results = [];
  const log = [];
  const completed = new Set();
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
        text: `[t=${currentTime}] CPU IDLE — waiting for next arrival at t=${nextArrival}.`,
        readyQueue: [],
      });
      currentTime = nextArrival;
      continue;
    }

    // Pick highest priority (lowest number), tiebreak by arrival, then index
    available.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.originalIndex - b.originalIndex;
    });

    const selected = available[0];

    if (selected.firstRun === -1) {
      selected.firstRun = currentTime;
    }

    // Find next event: either a new arrival or completion of selected
    const nextArrivals = procs
      .filter((p) => p.arrivalTime > currentTime && !completed.has(p.id))
      .map((p) => p.arrivalTime);
    const completionTime = currentTime + selected.remaining;
    const nextEvent = nextArrivals.length > 0
      ? Math.min(Math.min(...nextArrivals), completionTime)
      : completionTime;

    const execTime = nextEvent - currentTime;
    const start = currentTime;
    const end = start + execTime;

    // Merge with previous segment if same process
    const lastSegment = timeline[timeline.length - 1];
    if (lastSegment && lastSegment.pid === selected.id && lastSegment.end === start) {
      lastSegment.end = end;
    } else {
      timeline.push({ pid: selected.id, start, end });
    }

    const candidates = available.map((p) => `${p.id}(p=${p.priority},rem=${p.remaining})`);
    log.push({
      time: start,
      pid: selected.id,
      event: 'dispatch',
      text: `[t=${start}] Candidates: [${candidates.join(', ')}]. Preemptive priority selects ${selected.id} (priority=${selected.priority}, remaining=${selected.remaining}). Running until t=${end}.`,
      readyQueue: available.filter((p) => p.id !== selected.id).map((p) => p.id),
    });

    selected.remaining -= execTime;
    currentTime = end;

    if (selected.remaining === 0) {
      completed.add(selected.id);
      const ct = end;
      const tat = ct - selected.arrivalTime;
      const wt = tat - selected.burstTime;
      const rt = selected.firstRun - selected.arrivalTime;

      log.push({
        time: currentTime,
        pid: selected.id,
        event: 'complete',
        text: `[t=${currentTime}] ${selected.id} completes (burst=${selected.burstTime}). Re-evaluating by priority.`,
        readyQueue: procs
          .filter((p) => !completed.has(p.id) && p.arrivalTime <= currentTime)
          .map((p) => p.id),
      });

      results.push({
        pid: selected.id,
        arrivalTime: selected.arrivalTime,
        burstTime: selected.burstTime,
        completionTime: ct,
        turnaroundTime: tat,
        waitingTime: wt,
        responseTime: rt,
      });
    }
  }

  return { timeline, results, log };
}
