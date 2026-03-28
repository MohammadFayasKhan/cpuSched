/**
 * Built-in example process sets for Load Example.
 * Each example has a name, description, recommended algorithm, and processes.
 */
const EXAMPLES = [
  {
    name: 'Basic (AT=0)',
    description: 'All processes arrive at time 0 — ideal for comparing algorithms',
    tag: 'starter',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 3 },
      { id: 'P2', arrivalTime: 0, burstTime: 4, priority: 1 },
      { id: 'P3', arrivalTime: 0, burstTime: 2, priority: 4 },
      { id: 'P4', arrivalTime: 0, burstTime: 8, priority: 2 },
    ],
  },
  {
    name: 'Convoy Effect',
    description: 'One long process blocks short ones — shows FCFS weakness',
    tag: 'fcfs',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 20, priority: 1 },
      { id: 'P2', arrivalTime: 1, burstTime: 2, priority: 2 },
      { id: 'P3', arrivalTime: 2, burstTime: 2, priority: 3 },
      { id: 'P4', arrivalTime: 3, burstTime: 2, priority: 4 },
    ],
  },
  {
    name: 'SJF Optimal',
    description: 'Mixed bursts — SJF minimizes average waiting time',
    tag: 'sjf',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 7, priority: 2 },
      { id: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
      { id: 'P3', arrivalTime: 4, burstTime: 1, priority: 4 },
      { id: 'P4', arrivalTime: 5, burstTime: 4, priority: 3 },
    ],
  },
  {
    name: 'RR Fairness',
    description: 'Equal burst times — Round Robin gives fair CPU sharing',
    tag: 'rr',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
      { id: 'P2', arrivalTime: 0, burstTime: 5, priority: 2 },
      { id: 'P3', arrivalTime: 0, burstTime: 5, priority: 3 },
      { id: 'P4', arrivalTime: 0, burstTime: 5, priority: 4 },
    ],
  },
  {
    name: 'Priority Inversion',
    description: 'Low-priority process has shortest burst — shows priority tradeoff',
    tag: 'priority',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 10, priority: 1 },
      { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 4 },
      { id: 'P3', arrivalTime: 2, burstTime: 1, priority: 5 },
      { id: 'P4', arrivalTime: 3, burstTime: 5, priority: 2 },
      { id: 'P5', arrivalTime: 4, burstTime: 2, priority: 3 },
    ],
  },
  {
    name: 'SRTF Preemption',
    description: 'Staggered arrivals with varying bursts — SRTF preempts optimally',
    tag: 'srtf',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 1 },
      { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 2 },
      { id: 'P3', arrivalTime: 2, burstTime: 2, priority: 3 },
      { id: 'P4', arrivalTime: 3, burstTime: 1, priority: 4 },
    ],
  },
  {
    name: 'Starvation Demo',
    description: 'Short jobs keep arriving — shows starvation in SJF/SRTF',
    tag: 'starvation',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 15, priority: 5 },
      { id: 'P2', arrivalTime: 1, burstTime: 2, priority: 1 },
      { id: 'P3', arrivalTime: 3, burstTime: 2, priority: 1 },
      { id: 'P4', arrivalTime: 5, burstTime: 2, priority: 1 },
      { id: 'P5', arrivalTime: 7, burstTime: 2, priority: 1 },
    ],
  },
  {
    name: 'High Quantum RR',
    description: 'Large quantum degrades Round Robin to FCFS behavior',
    tag: 'rr',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 3, priority: 1 },
      { id: 'P2', arrivalTime: 2, burstTime: 6, priority: 2 },
      { id: 'P3', arrivalTime: 4, burstTime: 4, priority: 3 },
      { id: 'P4', arrivalTime: 6, burstTime: 5, priority: 4 },
      { id: 'P5', arrivalTime: 8, burstTime: 2, priority: 5 },
    ],
  },
];

export default EXAMPLES;
