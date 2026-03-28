import useSchedulerStore from '../../store/useSchedulerStore';
import { GitCompareArrows } from 'lucide-react';
import './AlgorithmSelector.css';

const ALGORITHMS = [
  { key: 'fcfs', label: 'FCFS' },
  { key: 'sjf', label: 'SJF' },
  { key: 'roundRobin', label: 'ROUND ROBIN' },
  { key: 'priority', label: 'PRIORITY' },
  { key: 'priorityPreemptive', label: 'PRIORITY (P)' },
  { key: 'srtf', label: 'SRTF' },
];

export default function AlgorithmSelector() {
  const { algorithm, setAlgorithm, quantum, setQuantum, runCompare, isRunning } =
    useSchedulerStore();

  return (
    <div className="algo-selector">
      <div className="section-header">
        <span className="dot" />
        Algorithm
      </div>

      <div className="algo-grid">
        {ALGORITHMS.map((a) => (
          <button
            key={a.key}
            className={`algo-btn ${algorithm === a.key ? 'active' : ''}`}
            onClick={() => setAlgorithm(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Time Quantum — visible for RR */}
      <div className={`quantum-row ${algorithm === 'roundRobin' ? 'visible' : ''}`}>
        <label className="quantum-label">Time Quantum</label>
        <input
          type="number"
          className="input-field quantum-input"
          value={quantum}
          onChange={(e) => setQuantum(e.target.value)}
          min={1}
          max={100}
        />
      </div>

      <button
        className="btn compare-btn"
        onClick={runCompare}
        disabled={isRunning}
      >
        <GitCompareArrows size={14} />
        Compare All
      </button>
    </div>
  );
}
