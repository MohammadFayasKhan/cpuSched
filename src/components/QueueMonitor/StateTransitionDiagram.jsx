import React, { useEffect, useState } from 'react';

const StateTransitionDiagram = ({ playbackTime, timeline }) => {
  const [activeState, setActiveState] = useState('NEW');

  useEffect(() => {
    if (!timeline || timeline.length === 0) {
      setActiveState('NEW');
      return;
    }

    const isRunning = timeline.some(t => t.pid !== 'idle' && t.start <= playbackTime && t.end > playbackTime);
    const allCompleted = timeline.length > 0 && timeline.filter(t => t.pid !== 'idle').every(t => t.end <= playbackTime);
    
    if (isRunning) setActiveState('RUNNING');
    else if (allCompleted) setActiveState('TERM');
    else if (playbackTime > 0) setActiveState('READY');
    else setActiveState('NEW');

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
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <span className="dot" style={{ background: 'var(--accent-purple)' }} />
        State Transition Diagram
      </div>
      
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
        
        {/* Nuclear Option: Fixed height SVG container */}
        <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <svg viewBox="0 0 600 160" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="arrow-inactive" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#6B7280" />
              </marker>
              <marker id="arrow-active" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#10B981" />
              </marker>
            </defs>

            {/* Connection Lines */}
            <g stroke="#4B5563" strokeWidth="2" fill="none">
              {/* New -> Ready */}
              <path d="M 110 50 L 170 50" markerEnd="url(#arrow-inactive)" />
              
              {/* Ready -> Running */}
              <path 
                d="M 260 50 L 330 50" 
                stroke={activeState === 'RUNNING' ? '#10B981' : '#4B5563'} 
                strokeWidth={activeState === 'RUNNING' ? 2 : 2}
                markerEnd={activeState === 'RUNNING' ? 'url(#arrow-active)' : 'url(#arrow-inactive)'} 
              />
              
              {/* Running -> Term */}
              <path 
                d="M 420 50 L 490 50" 
                stroke={activeState === 'TERM' ? '#10B981' : '#4B5563'}
                strokeWidth={activeState === 'TERM' ? 2 : 2}
                markerEnd={activeState === 'TERM' ? 'url(#arrow-active)' : 'url(#arrow-inactive)'} 
              />
              
              {/* Running -> Waiting */}
              <path 
                d="M 375 68 L 375 105" 
                stroke="#4B5563" 
                strokeWidth="2"
                markerEnd="url(#arrow-inactive)" 
              />
              
              {/* Waiting -> Ready */}
              <path 
                d="M 330 123 C 260 123, 215 123, 215 68" 
                stroke="#4B5563" 
                strokeWidth="2"
                markerEnd="url(#arrow-inactive)" 
              />
            </g>

            {/* Labels */}
            <text x="140" y="42" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontFamily="monospace">Arrival</text>
            <text x="295" y="42" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontFamily="monospace">Dispatch</text>
            <text x="455" y="42" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontFamily="monospace">Exit</text>
            <text x="385" y="90" fill="#9CA3AF" fontSize="10" textAnchor="start" fontFamily="monospace">I/O Request</text>
            <text x="260" y="145" fill="#9CA3AF" fontSize="10" textAnchor="middle" fontFamily="monospace">I/O Completion</text>

            {/* State Nodes (Scaled Down to 70x35 and 90x35) */}
            <g transform="translate(40, 32.5)">
              <rect width="70" height="35" rx="6" fill={getNodeFill('NEW')} stroke={getNodeColor('NEW')} strokeWidth={1.5} />
              <text x="35" y="21" fill={getNodeColor('NEW')} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NEW</text>
            </g>

            <g transform="translate(170, 32.5)">
              <rect width="90" height="35" rx="6" fill={getNodeFill('READY')} stroke={getNodeColor('READY')} strokeWidth={1.5} />
              <text x="45" y="21" fill={getNodeColor('READY')} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">READY</text>
            </g>

            <g transform="translate(330, 32.5)">
              <rect width="90" height="35" rx="6" fill={getNodeFill('RUNNING')} stroke={getNodeColor('RUNNING')} strokeWidth={1.5} />
              <text x="45" y="21" fill={getNodeColor('RUNNING')} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">RUNNING</text>
            </g>

            <g transform="translate(490, 32.5)">
              <rect width="70" height="35" rx="6" fill={getNodeFill('TERM')} stroke={getNodeColor('TERM')} strokeWidth={1.5} />
              <text x="35" y="21" fill={getNodeColor('TERM')} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">TERM</text>
            </g>

            <g transform="translate(330, 105)">
              <rect width="90" height="35" rx="6" fill={getNodeFill('WAITING')} stroke={getNodeColor('WAITING')} strokeWidth={1.5} />
              <text x="45" y="21" fill={getNodeColor('WAITING')} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">WAITING</text>
            </g>
          </svg>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(55, 65, 81, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3b82f6' }}></div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#22c55e' }}></div>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateTransitionDiagram;
