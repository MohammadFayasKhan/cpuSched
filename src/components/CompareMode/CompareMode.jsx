import { useMemo, useState } from 'react';
import { X, Star, TrendingDown, TrendingUp } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { hexToRgba } from '../../utils/colorUtils';

const ALL_ALGO_KEYS = ['fcfs', 'sjf', 'roundRobin', 'priority', 'priorityPreemptive', 'srtf'];
const METRIC_KEYS = ['avgWaitingTime', 'avgTurnaroundTime', 'cpuUtilization', 'throughput'];

function MiniGantt({ timeline, processes }) {
  const processColorMap = {};
  processes.forEach((p) => {
    processColorMap[p.id] = p.color;
  });

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '22px', margin: '0 -4px' }}>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          minWidth: '100%',
          width: 'max-content',
          height: '34px',
          padding: '0 4px',
          position: 'relative',
        }}
      >
        {timeline.map((seg, i) => {
          const isIdle = seg.pid === 'idle';
          const color = isIdle ? '#2a2a3d' : processColorMap[seg.pid] || '#555';
          const duration = seg.end - seg.start;

          // flex scale proportional to duration with absolute 32px minimum
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                flex: `${duration} 0 32px`,
                height: '100%',
                background: isIdle
                  ? 'repeating-linear-gradient(45deg, #1e1e2e, #1e1e2e 2px, #252538 2px, #252538 4px)'
                  : hexToRgba(color, 0.15),
                border: `1px solid ${isIdle ? '#3a3a4d' : hexToRgba(color, 0.5)}`,
                borderLeftWidth: '3px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              title={`${seg.pid === 'idle' ? 'IDLE' : seg.pid} (${duration}u)`}
            >
              {/* Process Label */}
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: isIdle ? 'var(--text-muted)' : color,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 4px',
                }}
              >
                {seg.pid === 'idle' ? '—' : seg.pid}
              </span>

              {/* Start Time (only for first block) */}
              {i === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: '-16px',
                    transform: 'translateX(-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {seg.start}
                </div>
              )}

              {/* End Time (for every block) */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: '-16px',
                  transform: 'translateX(50%)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {seg.end}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CompareMode() {
  const { compareResults, processes, exitCompare, quantum } = useSchedulerStore();

  const algoNames = useMemo(() => ({
    fcfs: 'FCFS',
    sjf: 'SJF',
    roundRobin: `Round Robin (q=${quantum})`,
    priority: 'Priority',
    priorityPreemptive: 'Priority (P)',
    srtf: 'SRTF',
  }), [quantum]);

  const [selectedAlgos, setSelectedAlgos] = useState(ALL_ALGO_KEYS);

  const toggleAlgo = (ak) => {
    setSelectedAlgos((prev) => {
      if (prev.includes(ak)) {
        return prev.length > 1 ? prev.filter((k) => k !== ak) : prev;
      }
      // Preserve original ordering
      return [...ALL_ALGO_KEYS].filter((k) => prev.includes(k) || k === ak);
    });
  };

  // Find best and worst for each metric based ONLY on selected algorithms
  const bestWorst = useMemo(() => {
    const bw = {};
    METRIC_KEYS.forEach((mk) => {
      // Lower is better for WT and TAT, higher is better for util and throughput
      const lowerIsBetter = mk === 'avgWaitingTime' || mk === 'avgTurnaroundTime';

      let best = null,
        worst = null,
        bestVal = lowerIsBetter ? Infinity : -Infinity,
        worstVal = lowerIsBetter ? -Infinity : Infinity;

      selectedAlgos.forEach((ak) => {
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
  }, [compareResults, selectedAlgos]);

  // Generate detailed insight analysis
  const analysis = useMemo(() => {
    if (selectedAlgos.length === 0) {
      return {
        summary: 'No algorithms selected for comparison.',
        highlights: [],
        tradeoffs: [],
        conclusion: 'Please select at least one algorithm above.',
      };
    }
    if (selectedAlgos.length === 1) {
      return {
        summary: `Viewing details for a single algorithm: ${algoNames[selectedAlgos[0]]}.`,
        highlights: [],
        tradeoffs: [],
        conclusion: 'Select at least two algorithms to view a comparative analysis.',
      };
    }

    const bestWT = bestWorst.avgWaitingTime;
    const bestTAT = bestWorst.avgTurnaroundTime;
    const bestThroughput = bestWorst.throughput; 
    const bestWTAlgo = algoNames[bestWT.best] || 'N/A';
    
    const wtImprovement = bestWT.worstVal > 0 && isFinite(bestWT.worstVal)
      ? ((1 - bestWT.bestVal / bestWT.worstVal) * 100).toFixed(0)
      : 0;

    const highlights = [
      { 
        id: 'wait',
        label: 'Lowest Wait Time', 
        value: bestWTAlgo, 
        detail: `${bestWT.bestVal.toFixed(2)}u (saves ${wtImprovement}%)`,
        color: 'var(--accent-cyan)'
      },
      { 
        id: 'tat',
        label: 'Lowest Turnaround', 
        value: algoNames[bestTAT.best] || 'N/A', 
        detail: `${bestTAT.bestVal.toFixed(2)}u`,
        color: 'var(--accent-purple)'
      },
      { 
        id: 'throughput',
        label: 'Highest Throughput', 
        value: algoNames[bestThroughput.best] || 'N/A', 
        detail: `${bestThroughput.bestVal.toFixed(2)} jobs/u`,
        color: 'var(--accent-gold)'
      },
    ];

    const tradeoffs = [];
    if (bestWT.best !== bestThroughput.best && bestWT.best && bestThroughput.best) {
      tradeoffs.push(`${bestWTAlgo} provides the best wait times, but ${algoNames[bestThroughput.best]} processes tasks faster overall.`);
    }

    const hasPreemptive = selectedAlgos.some((a) => ['srtf', 'roundRobin', 'priorityPreemptive'].includes(a));
    if (hasPreemptive && bestThroughput.best && ['fcfs', 'sjf', 'priority'].includes(bestThroughput.best)) {
      tradeoffs.push(`Preemptive algorithms generate more context switches, which gives non-preemptive ${algoNames[bestThroughput.best]} a pure throughput advantage.`);
    }

    let conclusion = '';
    if (bestWT.best === bestTAT.best) {
      conclusion = `${bestWTAlgo} dominates this workload, offering optimal time efficiency across the board.`;
    } else {
      conclusion = `The workload demonstrates a severe trade-off. Choose ${bestWTAlgo} for pure system reactivity, or ${algoNames[bestTAT.best]} for faster batch completion.`;
    }

    return {
      summary: `Analyzed ${selectedAlgos.length} scheduling algorithms across incoming processes. The metrics demonstrate how each algorithm balances system reactivity versus processing overhead.`,
      highlights,
      tradeoffs,
      conclusion,
    };
  }, [bestWorst, selectedAlgos, algoNames]);

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

      {/* Algorithm Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {ALL_ALGO_KEYS.map((ak) => {
          const isSelected = selectedAlgos.includes(ak);
          return (
            <button
              key={ak}
              onClick={() => toggleAlgo(ak)}
              style={{
                padding: '4px 12px',
                borderRadius: '99px',
                border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border)'}`,
                background: isSelected ? 'rgba(0, 229, 255, 0.1)' : 'var(--bg-card)',
                color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {algoNames[ak]}
            </button>
          );
        })}
      </div>

      {/* Mini Gantt Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {selectedAlgos.map((ak) => (
          <div
            key={ak}
            className="card animate-fade-up"
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
            {selectedAlgos.map((ak) => {
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

      {/* Detailed Analysis Box */}
      {analysis && (
        <div
          className="card animate-fade-up"
          style={{
            borderColor: 'rgba(0, 229, 255, 0.2)',
            padding: '24px',
            background: 'linear-gradient(180deg, rgba(30,30,46,1) 0%, rgba(20,20,32,1) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Analysis & Conclusion
            </h3>
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', marginTop: 0, lineHeight: 1.6 }}>
            {analysis.summary}
          </p>
          
          {analysis.highlights.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              {analysis.highlights.map((h, i) => (
                <div key={i} style={{ 
                  background: `color-mix(in srgb, ${h.color} 5%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${h.color} 20%, transparent)`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', right: '-10px', top: '-10px', 
                    width: '60px', height: '60px', 
                    background: `radial-gradient(circle, ${h.color} 0%, transparent 70%)`, 
                    opacity: 0.1 
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h.label}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: h.color }}>{h.value}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', opacity: 0.8 }}>{h.detail}</span>
                </div>
              ))}
            </div>
          )}

          {analysis.tradeoffs.length > 0 && (
            <div style={{ marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--accent-orange)' }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trade-offs Identified</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {analysis.tradeoffs.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          <div style={{ 
            background: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-cyan) 30%, transparent)',
            padding: '16px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{ background: 'var(--accent-cyan)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>VERDICT</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.4 }}>{analysis.conclusion}</span>
          </div>
        </div>
      )}
    </div>
  );
}
