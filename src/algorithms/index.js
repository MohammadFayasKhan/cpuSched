import { run as fcfs } from './fcfs';
import { run as sjf } from './sjf';
import { run as roundRobin } from './roundRobin';
import { run as priority } from './priority';
import { run as srtf } from './srtf';
import { run as priorityPreemptive } from './priorityPreemptive';

const algorithms = {
  fcfs,
  sjf,
  roundRobin,
  priority,
  srtf,
  priorityPreemptive,
};

export function runAlgorithm(algo, processes, quantum = 2) {
  const fn = algorithms[algo];
  if (!fn) {
    throw new Error(`Unknown algorithm: ${algo}`);
  }
  return fn(processes, quantum);
}

export { fcfs, sjf, roundRobin, priority, srtf, priorityPreemptive };
