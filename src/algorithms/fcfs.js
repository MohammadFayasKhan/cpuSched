export function run(processes) {
  const procs = processes
    .map((p) => ({ ...p }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime || processes.indexOf(processes.find(pp => pp.id === a.id)) - processes.indexOf(processes.find(pp => pp.id === b.id)));

  const timeline = [];
  const results = [];
  const log = [];
  let currentTime = 0;

  for (let i = 0; i < procs.length; i++) {
    const p = procs[i];

    // Handle idle gap
    if (currentTime < p.arrivalTime) {
      const idleStart = currentTime;
      const idleEnd = p.arrivalTime;
      timeline.push({ pid: 'idle', start: idleStart, end: idleEnd });
      log.push({
        time: idleStart,
        pid: null,
        event: 'idle',
        text: `[t=${idleStart}] CPU IDLE — ready queue empty. Next arrival at t=${p.arrivalTime}.`,
        readyQueue: [],
      });
      currentTime = idleEnd;
    }

    const start = currentTime;
    const end = start + p.burstTime;

    // Ready queue at this point (processes that have arrived but not yet started)
    const readyQueue = procs
      .filter((pp, idx) => idx > i && pp.arrivalTime <= start)
      .map((pp) => pp.id);

    log.push({
      time: start,
      pid: p.id,
      event: 'dispatch',
      text: `[t=${start}] ${p.id} dispatched. FCFS: first in ready queue (arrived t=${p.arrivalTime}).`,
      readyQueue: [...readyQueue],
    });

    timeline.push({ pid: p.id, start, end });
    currentTime = end;

    const completionTime = end;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = start - p.arrivalTime;

    const nextProcess = procs[i + 1] ? procs[i + 1].id : 'none';
    const queueAtComplete = procs
      .filter((pp, idx) => idx > i && pp.arrivalTime <= currentTime)
      .map((pp) => pp.id);

    log.push({
      time: currentTime,
      pid: p.id,
      event: 'complete',
      text: `[t=${currentTime}] ${p.id} completes. Ready queue: [${queueAtComplete.join(', ')}]. Next → ${nextProcess}.`,
      readyQueue: queueAtComplete,
    });

    results.push({
      pid: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  return { timeline, results, log };
}
