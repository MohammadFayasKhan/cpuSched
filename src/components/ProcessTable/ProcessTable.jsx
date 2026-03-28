import { Plus, Play, RotateCcw, Loader2, GripVertical, X, ChevronUp, ChevronDown, BookOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import useSchedulerStore from '../../store/useSchedulerStore';
import EXAMPLES from '../../data/examples';
import { useRef, useState, useCallback, useEffect } from 'react';
import './ProcessTable.css';

function NumberStepper({ value, onChange, min = 0, max = 100, label }) {
  const val = parseInt(value) || 0;
  return (
    <div className="stepper-wrapper">
      <button
        className="stepper-btn stepper-dec"
        onClick={() => onChange(Math.max(min, val - 1))}
        disabled={val <= min}
        tabIndex={-1}
        aria-label={`Decrease ${label}`}
      >
        <ChevronDown size={10} />
      </button>
      <input
        type="number"
        className={`input-field stepper-input ${val < min ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
      />
      <button
        className="stepper-btn stepper-inc"
        onClick={() => onChange(Math.min(max, val + 1))}
        disabled={val >= max}
        tabIndex={-1}
        aria-label={`Increase ${label}`}
      >
        <ChevronUp size={10} />
      </button>
    </div>
  );
}

export default function ProcessTable() {
  const {
    processes,
    algorithm,
    addProcess,
    removeProcess,
    updateProcess,
    loadExample,
    clearProcesses,
    runSimulation,
    isRunning,
    reorderProcesses,
  } = useSchedulerStore();

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0, width: 0 });
  const tableRef = useRef(null);
  const exampleBtnRef = useRef(null);

  const showPriority = algorithm === 'priority' || algorithm === 'priorityPreemptive';

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showExamples) return;
    const handleClickOutside = (e) => {
      if (exampleBtnRef.current && !exampleBtnRef.current.contains(e.target)) {
        // Check if clicked inside the portal dropdown
        const dropdown = document.getElementById('examples-dropdown-portal');
        if (dropdown && dropdown.contains(e.target)) return;
        setShowExamples(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExamples]);

  const toggleExamples = useCallback(() => {
    if (!showExamples && exampleBtnRef.current) {
      const btnRect = exampleBtnRef.current.getBoundingClientRect();
      // Use the process-table-container for width alignment
      const container = exampleBtnRef.current.closest('.process-table-container');
      const containerRect = container ? container.getBoundingClientRect() : btnRect;
      setDropdownPos({
        x: containerRect.left,
        y: btnRect.top,
        width: containerRect.width,
      });
    }
    setShowExamples((v) => !v);
  }, [showExamples]);

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      reorderProcesses(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleLoadExample = (ex) => {
    loadExample(ex.processes);
    setShowExamples(false);
  };

  return (
    <div className="process-table-container">
      <div className="section-header">
        <span className="dot" />
        Processes
      </div>

      <div className="process-table-wrapper" ref={tableRef}>
        <table className="process-table">
          <thead>
            <tr>
              <th className="drag-col"></th>
              <th className="pid-col-header">PID</th>
              <th>Arrival</th>
              <th>Burst</th>
              {showPriority && <th className="priority-col active">Priority</th>}
              <th className="action-col"></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr
                key={p.id}
                className={`process-row ${dragIndex === i ? 'dragging' : ''} ${dragOverIndex === i ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
              >
                <td className="drag-col">
                  <GripVertical size={14} className="drag-handle" />
                </td>
                <td className="pid-col">
                  <span className="pid-dot" style={{ background: p.color }} />
                  <span className="pid-label">{p.id}</span>
                </td>
                <td>
                  <NumberStepper
                    value={p.arrivalTime}
                    onChange={(v) => updateProcess(p.id, 'arrivalTime', v)}
                    min={0}
                    max={100}
                    label="arrival time"
                  />
                </td>
                <td>
                  <NumberStepper
                    value={p.burstTime}
                    onChange={(v) => updateProcess(p.id, 'burstTime', v)}
                    min={1}
                    max={100}
                    label="burst time"
                  />
                </td>
                {showPriority && (
                  <td className="priority-col active">
                    <NumberStepper
                      value={p.priority}
                      onChange={(v) => updateProcess(p.id, 'priority', v)}
                      min={0}
                      max={20}
                      label="priority"
                    />
                  </td>
                )}
                <td className="action-col">
                  <button
                    className="remove-btn"
                    onClick={() => removeProcess(p.id)}
                    disabled={processes.length <= 1}
                    title="Remove process"
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="process-buttons">
        <div className="btn-row-left">
          <button
            className="btn"
            onClick={addProcess}
            disabled={processes.length >= 8}
          >
            <Plus size={14} />
            Add Process
          </button>

          {/* Load Example dropdown */}
          <button
            className="btn"
            onClick={toggleExamples}
            ref={exampleBtnRef}
          >
            <BookOpen size={14} />
            Examples
            <ChevronDown size={12} style={{
              transform: showExamples ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }} />
          </button>

          {showExamples && createPortal(
            <>
              {/* Invisible overlay to prevent background scroll & dismiss on click */}
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9998,
                }}
                onClick={() => setShowExamples(false)}
              />
              <div
                id="examples-dropdown-portal"
                className="example-dropdown"
                style={{
                  position: 'fixed',
                  left: `${dropdownPos.x}px`,
                  top: `${dropdownPos.y - 8}px`,
                  transform: 'translateY(-100%)',
                  width: `${dropdownPos.width}px`,
                }}
              >
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    className="example-option"
                    onClick={() => handleLoadExample(ex)}
                  >
                    <div className="example-option-name">
                      <span className={`example-tag tag-${ex.tag}`}>{ex.tag}</span>
                      {ex.name}
                    </div>
                    <div className="example-option-desc">{ex.description}</div>
                  </button>
                ))}
              </div>
            </>,
            document.body
          )}

          <button className="btn btn-danger" onClick={clearProcesses}>
            Clear
          </button>
        </div>
        <button
          className="btn btn-primary run-btn"
          onClick={runSimulation}
          disabled={isRunning}
        >
          {isRunning ? (
            <Loader2 size={14} className="spinner" />
          ) : (
            <Play size={14} />
          )}
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
}

