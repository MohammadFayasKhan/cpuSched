import { useMemo } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { hexToRgba } from '../../utils/colorUtils';

export default function ProcessDetailsTable() {
  const { results, processes, hasRun } = useSchedulerStore();

  const processColorMap = useMemo(() => {
    const map = {};
    processes.forEach((p) => {
      map[p.id] = p.color;
    });
    return map;
  }, [processes]);

  const { bestIdx, worstIdx } = useMemo(() => {
    if (!results.length) return { bestIdx: -1, worstIdx: -1 };
    let best = 0,
      worst = 0;
    results.forEach((r, i) => {
      if (r.waitingTime < results[best].waitingTime) best = i;
      if (r.waitingTime > results[worst].waitingTime) worst = i;
    });
    return { bestIdx: best, worstIdx: worst };
  }, [results]);

  if (!hasRun || !results.length) return null;

  const columns = ['PID', 'Arrival', 'Burst', 'Completion', 'Turnaround', 'Waiting', 'Response'];

  return (
    <div>
      <div className="section-header">
        <span className="dot" />
        Process Details
      </div>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    textAlign: col === 'PID' ? 'left' : 'center',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const color = processColorMap[r.pid] || '#fff';
              const isBest = i === bestIdx;
              const isWorst = i === worstIdx;

              let rowBg = 'transparent';
              if (isBest && bestIdx !== worstIdx) rowBg = 'rgba(34, 197, 94, 0.05)';
              if (isWorst && bestIdx !== worstIdx) rowBg = 'rgba(244, 63, 94, 0.05)';

              return (
                <tr
                  key={r.pid}
                  style={{
                    background: rowBg,
                    animation: 'fadeSlideUp 0.3s ease-out forwards',
                    animationDelay: `${i * 80}ms`,
                    opacity: 0,
                  }}
                >
                  <td
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: '1px solid rgba(42, 42, 61, 0.4)',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 700, color }}>{r.pid}</span>
                  </td>
                  {[r.arrivalTime, r.burstTime, r.completionTime, r.turnaroundTime, r.waitingTime, r.responseTime].map(
                    (val, j) => (
                      <td
                        key={j}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: j >= 2 ? color : 'var(--text-primary)',
                          borderBottom: '1px solid rgba(42, 42, 61, 0.4)',
                        }}
                      >
                        {val}
                      </td>
                    )
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
