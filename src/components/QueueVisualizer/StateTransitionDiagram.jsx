import { useEffect, useState } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';

const StateTransitionDiagram = () => {
  const { playbackTime, timeline } = useSchedulerStore();
  const [activeState, setActiveState] = useState('NEW');

  useEffect(() => {
    if (!timeline || timeline.length === 0) {
      setActiveState('NEW');
      return;
    }

    const isRunning = timeline.some(t => t.pid !== 'idle' && t.start <= playbackTime && t.end > playbackTime);
    const allCompleted = timeline.every(t => t.pid === 'idle' || t.end <= playbackTime);

    if (isRunning) {
      setActiveState('RUNNING');
    } else if (playbackTime > 0 && allCompleted) {
      setActiveState('TERM');
    } else if (playbackTime > 0) {
      setActiveState('READY');
    } else {
      setActiveState('NEW');
    }
  }, [playbackTime, timeline]);

  const getNodeColor = (stateName) => {
    if (activeState === stateName) return '#10B981';
    if (['READY', 'RUNNING', 'WAITING', 'TERM'].includes(stateName)) return '#3B82F6';
    return '#4B5563';
  };

  const getNodeFill = (stateName) => {
    if (activeState === stateName) return 'rgba(16, 185, 129, 0.15)';
    return 'rgba(59, 130, 246, 0.1)';
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <h4
        className="font-mono text-xs font-bold uppercase tracking-widest mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        State Transition Diagram
      </h4>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        <svg viewBox="0 0 700 200" style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker
              id="arrow-std-v2"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
            </marker>
            <marker
              id="arrow-active-v2"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
            </marker>
          </defs>

          <g stroke="#4B5563" strokeWidth="2" fill="none">
            <path d="M 120 100 L 170 100" markerEnd="url(#arrow-std-v2)" />
            
            <path 
              d="M 270 100 L 320 100" 
              stroke={activeState === 'RUNNING' ? '#10B981' : '#4B5563'} 
              strokeWidth={activeState === 'RUNNING' ? 3 : 2}
              markerEnd={activeState === 'RUNNING' ? 'url(#arrow-active-v2)' : 'url(#arrow-std-v2)'} 
            />
            
            <path 
              d="M 420 100 L 470 100" 
              stroke={activeState === 'TERM' ? '#10B981' : '#4B5563'}
              strokeWidth={activeState === 'TERM' ? 3 : 2}
              markerEnd={activeState === 'TERM' ? 'url(#arrow-active-v2)' : 'url(#arrow-std-v2)'} 
            />
            
            <path 
              d="M 370 120 Q 370 160 420 160" 
              stroke="#4B5563" 
              strokeWidth="2"
              markerEnd="url(#arrow-std-v2)" 
            />
            
            <path 
              d="M 270 160 Q 270 130 320 120" 
              stroke="#4B5563" 
              strokeWidth="2"
              markerEnd="url(#arrow-std-v2)" 
            />
          </g>

          <text x="145" y="88" fill="#9CA3AF" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
            Arrival
          </text>
          <text x="295" y="88" fill="#9CA3AF" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
            Dispatch
          </text>
          <text x="445" y="88" fill="#9CA3AF" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
            Exit
          </text>
          <text x="405" y="175" fill="#9CA3AF" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
            I/O
          </text>
          <text x="295" y="175" fill="#9CA3AF" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
            Ready
          </text>

          <g transform="translate(50, 80)">
            <rect
              width="70"
              height="40"
              rx="8"
              fill={getNodeFill('NEW')}
              stroke={getNodeColor('NEW')}
              strokeWidth={activeState === 'NEW' ? 3 : 1.5}
            />
            <text
              x="35"
              y="25"
              fill={getNodeColor('NEW')}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              NEW
            </text>
          </g>

          <g transform="translate(180, 80)">
            <rect
              width="90"
              height="40"
              rx="8"
              fill={getNodeFill('READY')}
              stroke={getNodeColor('READY')}
              strokeWidth={activeState === 'READY' ? 3 : 1.5}
            />
            <text
              x="45"
              y="25"
              fill={getNodeColor('READY')}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              READY
            </text>
          </g>

          <g transform="translate(330, 80)">
            <rect
              width="90"
              height="40"
              rx="8"
              fill={getNodeFill('RUNNING')}
              stroke={getNodeColor('RUNNING')}
              strokeWidth={activeState === 'RUNNING' ? 3 : 1.5}
            />
            <text
              x="45"
              y="25"
              fill={getNodeColor('RUNNING')}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              RUNNING
            </text>
          </g>

          <g transform="translate(480, 80)">
            <rect
              width="70"
              height="40"
              rx="8"
              fill={getNodeFill('TERM')}
              stroke={getNodeColor('TERM')}
              strokeWidth={activeState === 'TERM' ? 3 : 1.5}
            />
            <text
              x="35"
              y="25"
              fill={getNodeColor('TERM')}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              TERM
            </text>
          </g>

          <g transform="translate(330, 140)">
            <rect
              width="90"
              height="40"
              rx="8"
              fill={getNodeFill('WAITING')}
              stroke={getNodeColor('WAITING')}
              strokeWidth={activeState === 'WAITING' ? 3 : 1.5}
            />
            <text
              x="45"
              y="25"
              fill={getNodeColor('WAITING')}
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              WAITING
            </text>
          </g>
        </svg>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3B82F6' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981' }} />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};

export default StateTransitionDiagram;