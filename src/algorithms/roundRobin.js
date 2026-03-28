export function run(processes, quantum = 2) {
  const procs = processes.map((p) => ({
    ...p,
    remaining: p.burstTime,
    firstRun: -1,
  }));

  const timeline = [];
  const results = [];
  const log = [];
  const queue = [];
  let currentTime = 0;

  // Sort by arrival time
  const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let nextArrivalIdx = 0;

  // Add all processes arriving at time 0
  while (nextArrivalIdx < sorted.length && sorted[nextArrivalIdx].arrivalTime <= currentTime) {
    queue.push(sorted[nextArrivalIdx]);
    nextArrivalIdx++;
  }

  const completed = new Set();

  while (completed.size < procs.length) {
    if (queue.length === 0) {
      // CPU idle — find next arrival
      if (nextArrivalIdx < sorted.length) {
        const nextArrival = sorted[nextArrivalIdx].arrivalTime;
        timeline.push({ pid: 'idle', start: currentTime, end: nextArrival });
        log.push({
          time: currentTime,
          pid: null,
          event: 'idle',
          text: `[t=${currentTime}] CPU IDLE — queue empty.`,
          readyQueue: [],
        });
        currentTime = nextArrival;

        // Add newly arrived
        while (nextArrivalIdx < sorted.length && sorted[nextArrivalIdx].arrivalTime <= currentTime) {
          queue.push(sorted[nextArrivalIdx]);
          nextArrivalIdx++;
        }
      } else {
        break;
      }
      continue;
    }

    const current = queue.shift();
    const execTime = Math.min(quantum, current.remaining);
    const start = currentTime;
    const end = start + execTime;

    if (current.firstRun === -1) {
      current.firstRun = start;
    }

    log.push({
      time: start,
      pid: current.id,
      event: 'dispatch',
      text: `[t=${start}] ${current.id} dispatched. Quantum = ${quantum}. Remaining burst = ${current.remaining}.`,
      readyQueue: queue.map((p) => p.id),
    });

    timeline.push({ pid: current.id, start, end });
    current.remaining -= execTime;
    currentTime = end;

    // Add newly arrived processes to queue (they arrive before preempted process re-enqueues)
    while (nextArrivalIdx < sorted.length && sorted[nextArrivalIdx].arrivalTime <= currentTime) {
      queue.push(sorted[nextArrivalIdx]);
      nextArrivalIdx++;
    }

    if (current.remaining > 0) {
      // Preempted — re-enqueue
      queue.push(current);

      const nextPid = queue.length > 0 ? queue[0].id : 'none';
      log.push({
        time: currentTime,
        pid: current.id,
        event: 'preempt',
        text: `[t=${currentTime}] Quantum expired. ${current.id} preempted (rem=${current.remaining}) → back of queue. Next → ${nextPid}.`,
        readyQueue: queue.map((p) => p.id),
      });
    } else {
      // Completed
      completed.add(current.id);
      const completionTime = end;
      const turnaroundTime = completionTime - current.arrivalTime;
      const waitingTime = turnaroundTime - current.burstTime;
      const responseTime = current.firstRun - current.arrivalTime;

      const nextPid = queue.length > 0 ? queue[0].id : 'none';
      log.push({
        time: currentTime,
        pid: current.id,
        event: 'complete',
        text: `[t=${currentTime}] ${current.id} finishes within quantum. Next → ${nextPid}.`,
        readyQueue: queue.map((p) => p.id),
      });

      results.push({
        pid: current.id,
        arrivalTime: current.arrivalTime,
        burstTime: current.burstTime,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime,
      });
    }
  }

  return { timeline, results, log };
}
