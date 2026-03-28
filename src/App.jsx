import { useEffect, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import AlgorithmSelector from './components/AlgorithmSelector/AlgorithmSelector';
import ProcessTable from './components/ProcessTable/ProcessTable';
import GanttChart from './components/GanttChart/GanttChart';
import MetricsPanel from './components/MetricsPanel/MetricsPanel';
import ProcessDetailsTable from './components/ProcessTable/ProcessDetailsTable';
import ExplanationFeed from './components/ExplanationFeed/ExplanationFeed';
import AlgoInfoBox from './components/AlgoInfoBox/AlgoInfoBox';
import CompareMode from './components/CompareMode/CompareMode';
import useSchedulerStore from './store/useSchedulerStore';
import { loadFromURL } from './utils/exportUtils';
import { getProcessColor } from './utils/colorUtils';
import { useRef, useState } from 'react';

function Confetti() {
  const colors = ['#00e5ff', '#ff6b35', '#a855f7', '#22c55e', '#eab308', '#ec4899', '#38bdf8', '#f97316'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </>
  );
}

function ArrivalTimeline() {
  const { processes, hasRun, timeline } = useSchedulerStore();

  if (!hasRun || !timeline.length) return null;

  const maxArrival = Math.max(...processes.map((p) => p.arrivalTime));
  const totalTime = timeline[timeline.length - 1].end;
  // Use maxArrival as the scale so last dot is at the edge; fallback to totalTime if all arrive at 0
  const scaleTime = maxArrival > 0 ? maxArrival : totalTime;

  const PADDING = 20; // px padding on left and right
  const DOT_SIZE = 10;
  // Label height (~12px) + gap (4px) + marginTop (2px) = 18px offset from top
  // Dot center is at top: 6px + 12 + 4 + 2 + 5 = 29px
  const LINE_TOP = 30; // center of dots

  return (
    <div>
      <div className="section-header">
        <span className="dot" style={{ background: 'var(--accent-gold)' }} />
        Process Arrival Timeline
      </div>
      <div
        style={{
          position: 'relative',
          height: '54px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: `0 ${PADDING}px`,
        }}
      >
        {/* Horizontal track line — behind dots, at their vertical center */}
        <div
          style={{
            position: 'absolute',
            top: `${LINE_TOP}px`,
            left: `${PADDING}px`,
            right: `${PADDING}px`,
            height: '2px',
            background: 'var(--border)',
            zIndex: 1,
          }}
        />

        {/* Process markers: label above + dot on line */}
        {processes.map((p, i) => {
          // Position as fraction of scaleTime; if all at 0, space evenly
          let fraction;
          if (scaleTime > 0) {
            fraction = p.arrivalTime / scaleTime;
          } else {
            fraction = processes.length > 1 ? i / (processes.length - 1) : 0;
          }

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `calc(${PADDING}px + (100% - ${PADDING * 2}px) * ${fraction})`,
                top: '6px',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                animation: 'fadeSlideUp 0.3s ease-out forwards',
                animationDelay: `${i * 80}ms`,
                opacity: 0,
                zIndex: 5,
              }}
              title={`${p.id} arrives at t=${p.arrivalTime}`}
            >
              {/* Process label */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: p.color,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {p.id}
              </span>
              {/* Dot on line */}
              <div
                style={{
                  width: `${DOT_SIZE}px`,
                  height: `${DOT_SIZE}px`,
                  borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 6px ${p.color}50`,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
            </div>
          );
        })}

        {/* Time labels at edges */}
        <span
          style={{
            position: 'absolute',
            left: `${PADDING}px`,
            bottom: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--text-muted)',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          0
        </span>
        {scaleTime > 0 && (
          <span
            style={{
              position: 'absolute',
              right: `${PADDING}px`,
              bottom: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              color: 'var(--text-muted)',
              transform: 'translateX(50%)',
              zIndex: 2,
            }}
          >
            {scaleTime}
          </span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { hasRun, compareMode, firstRun } = useSchedulerStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevFirstRun = useRef(true);
  const [leftPercent, setLeftPercent] = useState(34.5); // 34.5% left : 65.5% right
  const isDragging = useRef(false);
  const layoutRef = useRef(null);

  // Load shared state from URL
  useEffect(() => {
    const shared = loadFromURL();
    if (shared) {
      if (shared.processes) {
        const colored = shared.processes.map((p, i) => ({
          ...p,
          color: getProcessColor(i),
        }));
        useSchedulerStore.setState({
          processes: colored,
          algorithm: shared.algorithm || 'fcfs',
          quantum: shared.quantum || 2,
        });
      }
    }
  }, []);

  // Confetti on first run
  useEffect(() => {
    if (prevFirstRun.current && !firstRun && hasRun) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevFirstRun.current = firstRun;
  }, [firstRun, hasRun]);

  // Drag handlers for the resize divider
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e) => {
      if (!isDragging.current || !layoutRef.current) return;
      const layoutRect = layoutRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - layoutRect.left) / layoutRect.width) * 100;
      // Clamp between 20% and 55%
      setLeftPercent(Math.max(20, Math.min(55, newPercent)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {showConfetti && <Confetti />}

      <div className="main-layout" ref={layoutRef}>
        {/* Left Panel */}
        <div className="left-panel" style={{ width: `${leftPercent}%` }}>
          <AlgorithmSelector />
          <ProcessTable />
          {/* AlgoInfoBox on left panel below process table on desktop */}
          <div className="left-algo-info">
            <AlgoInfoBox />
          </div>
        </div>

        {/* Draggable Resize Handle */}
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
        >
          <div className="resize-handle-grip">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {compareMode ? (
            <CompareMode />
          ) : (
            <>
              <ArrivalTimeline />
              <GanttChart />
              <MetricsPanel />
              <ProcessDetailsTable />
              <ExplanationFeed />
              {/* AlgoInfoBox on right for mobile/tablet */}
              <div className="right-algo-info">
                <AlgoInfoBox />
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .main-layout {
          flex: 1;
          display: flex;
          padding: 16px 20px;
          gap: 0;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
          align-items: flex-start;
        }

        .left-panel {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
          position: sticky;
          top: 60px;
          max-height: calc(100vh - 76px);
          overflow-y: auto;
          padding-right: 4px;
        }

        /* Hide scrollbar on left panel but keep scrollable */
        .left-panel::-webkit-scrollbar {
          width: 3px;
        }
        .left-panel::-webkit-scrollbar-thumb {
          background: transparent;
        }
        .left-panel:hover::-webkit-scrollbar-thumb {
          background: var(--border);
        }

        /* ===== Resize Handle ===== */
        .resize-handle {
          width: 12px;
          flex-shrink: 0;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 20;
          margin: 0 4px;
          align-self: stretch;
        }

        .resize-handle::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          background: var(--border);
          border-radius: 2px;
          transition: background 0.2s ease, width 0.2s ease, box-shadow 0.2s ease;
        }

        .resize-handle:hover::before,
        .resize-handle:active::before {
          width: 3px;
          background: var(--accent-cyan);
          box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
        }

        .resize-handle-grip {
          display: flex;
          flex-direction: column;
          gap: 3px;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .resize-handle:hover .resize-handle-grip,
        .resize-handle:active .resize-handle-grip {
          opacity: 1;
        }

        .resize-handle-grip span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent-cyan);
        }

        .right-panel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-left: 8px;
        }

        /* Desktop: show algo info in left panel, hide from right */
        .left-algo-info {
          display: block;
        }
        .right-algo-info {
          display: none;
        }

        @media (max-width: 1023px) {
          .main-layout {
            flex-direction: column;
            padding: 12px 16px;
            gap: 16px;
          }
          .left-panel {
            width: 100% !important;
            position: static;
            max-height: none;
            overflow-y: visible;
            padding-right: 0;
          }
          .resize-handle {
            display: none;
          }
          .right-panel {
            width: 100%;
            padding-left: 0;
          }
          /* Mobile/tablet: show algo info in right panel, hide from left */
          .left-algo-info {
            display: none;
          }
          .right-algo-info {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .main-layout {
            padding: 10px 12px;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
