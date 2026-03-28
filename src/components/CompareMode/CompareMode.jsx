import { useMemo } from 'react';
import { X, Star, TrendingDown, TrendingUp } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';
import algoInfo from '../../data/algoInfo';
import { hexToRgba } from '../../utils/colorUtils';

function MiniGantt({ timeline, processes }) {
  const processColorMap = {};
  processes.forEach((p) => {
    processColorMap[p.id] = p.color;
  });

  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 1;

  return (
    <div
      style={{
        display: 'flex',
        gap: '1px',
        width: '100%',
        height: '32px',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {timeline.map((seg, i) => {
        const isIdle = seg.pid === 'idle';
        const color = isIdle ? '#2a2a3d' : processColorMap[seg.pid] || '#555';
        const widthPercent = ((seg.end - seg.start) / totalTime) * 100;

        return (
          <div
            key={i}
            style={{
              width: `${widthPercent}%`,
              minWidth: '4px',
              height: '100%',
              background: isIdle
                ? 'repeating-linear-gradient(45deg, #1e1e2e, #1e1e2e 2px, #252538 2px, #252538 4px)'
                : hexToRgba(color, 0.25),
              borderLeft: `2px solid ${isIdle ? '#3a3a4d' : color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {widthPercent > 8 && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  color: isIdle ? 'var(--text-muted)' : color,
                }}
              >
                {seg.pid === 'idle' ? '—' : seg.pid}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CompareMode() {
  const { compareResults, processes, exitCompare, quantum } = useSchedulerStore();

  const algoKeys = ['fcfs', 'sjf', 'roundRobin', 'priority', 'srtf'];
  const algoNames = {
    fcfs: 'FCFS',
    sjf: 'SJF',
    roundRobin: `Round Robin (q=${quantum})`,
    priority: 'Priority',
    srtf: 'SRTF',
  };

  // Find best and worst for each metric
  const metricKeys = ['avgWaitingTime', 'avgTurnaroundTime', 'cpuUtilization', 'throughput'];
  const bestWorst = useMemo(() => {
    const bw = {};
    metricKeys.forEach((mk) => {
      // Lower is better for WT and TAT, higher is better for util and throughput
      const lowerIsBetter = mk === 'avgWaitingTime' || mk === 'avgTurnaroundTime';

      let best = null,
        worst = null,
        bestVal = lowerIsBetter ? Infinity : -Infinity,
        worstVal = lowerIsBetter ? -Infinity : Infinity;

      algoKeys.forEach((ak) => {
        const v = compareResults[ak]?.metrics?.[mk] ?? 0;
        if (lowerIsBetter) {
          if (v < bestVal) { bestVal = v; best = ak; }
          if (v > worstVal) { worstVal = v; worst = ak; }
        } else {
          if (v > bestVal) { bestVal = v; best = ak; }
          if (v < worstVal) { worstVal = v; worst = ak; }
        }
      });
      bw[mk] = { best, worst, bestVal, worstVal };
    });
    return bw;
  }, [compareResults]);

  // Generate insight text
  const insight = useMemo(() => {
    const bestWT = bestWorst.avgWaitingTime;
    const worstWT = bestWorst.avgWaitingTime;
    const bestAlgo = algoNames[bestWT.best] || 'N/A';
    const worstAlgo = algoNames[worstWT.worst] || 'N/A';
    const improvement = worstWT.worstVal > 0 && isFinite(worstWT.worstVal)
      ? ((1 - bestWT.bestVal / worstWT.worstVal) * 100).toFixed(0)
      : 0;

    const cpuBest = bestWorst.cpuUtilization;
    const allSameUtil = cpuBest.best && cpuBest.worst && cpuBest.bestVal === cpuBest.worstVal;

    return `${bestAlgo} achieves the lowest average waiting time (${bestWT.bestVal.toFixed(2)}) — ${improvement}% better than ${worstAlgo} for this process set. ${
      allSameUtil
        ? 'All algorithms achieve the same CPU utilization.'
        : cpuBest.best
          ? `${algoNames[cpuBest.best]} has the highest CPU utilization at ${cpuBest.bestVal}%.`
          : 'CPU utilization varies across algorithms.'
    }`;
  }, [bestWorst, compareResults]);

  if (!compareResults) return null;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div className="section-header" style={{ margin: 0 }}>
          <span className="dot" style={{ background: 'var(--accent-orange)' }} />
          Algorithm Comparison
        </div>
        <button className="btn" onClick={exitCompare}>
          <X size={14} />
          Close
        </button>
      </div>

      {/* Mini Gantt Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {algoKeys.map((ak) => (
          <div
            key={ak}
            className="card"
            style={{ padding: '12px' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              {algoNames[ak]}
            </div>
            <MiniGantt
              timeline={compareResults[ak]?.timeline || []}
              processes={processes}
            />
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          marginBottom: '16px',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          }}
        >
          <thead>
            <tr>
              {['Algorithm', 'Avg WT', 'Avg TAT', 'CPU Util', 'Throughput'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    textAlign: h === 'Algorithm' ? 'left' : 'center',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {algoKeys.map((ak) => {
              const m = compareResults[ak]?.metrics;
              if (!m) return null;

              return (
                <tr key={ak}>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid rgba(42, 42, 61, 0.4)',
                    }}
                  >
                    {algoNames[ak]}
                  </td>
                  {[
                    { key: 'avgWaitingTime', val: m.avgWaitingTime, suffix: '' },
                    { key: 'avgTurnaroundTime', val: m.avgTurnaroundTime, suffix: '' },
                    { key: 'cpuUtilization', val: m.cpuUtilization, suffix: '%' },
                    { key: 'throughput', val: m.throughput, suffix: '/u' },
                  ].map(({ key, val, suffix }) => {
                    const isBest = bestWorst[key]?.best === ak;
                    const isWorst = bestWorst[key]?.worst === ak;

                    return (
                      <td
                        key={key}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontWeight: 700,
                          borderBottom: '1px solid rgba(42, 42, 61, 0.4)',
                          color: isBest
                            ? 'var(--accent-gold)'
                            : isWorst
                              ? 'var(--error)'
                              : 'var(--text-primary)',
                          background: isBest
                            ? 'rgba(234, 179, 8, 0.05)'
                            : isWorst
                              ? 'rgba(244, 63, 94, 0.05)'
                              : 'transparent',
                        }}
                      >
                        {val.toFixed(2)}{suffix}
                        {isBest && ' ★'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Insight Box */}
      <div
        className="card"
        style={{
          borderColor: 'rgba(0, 229, 255, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '14px 18px',
        }}
      >
        <TrendingUp size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.85,
          }}
        >
          {insight}
        </p>
      </div>
    </div>
  );
}
