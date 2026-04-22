import React, { useMemo } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { Cpu, Clock, Hourglass, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StateTransitionDiagram from './StateTransitionDiagram';

const QueueMonitor = () => {
  const { processes, playbackTime, timeline } = useSchedulerStore();

  const queueData = useMemo(() => {
    if (!timeline || timeline.length === 0) return { ready: [], running: null, waiting: [], completed: [] };

    const ready = [];
    let running = null;
    const waiting = [];
    const completed = [];

    const currentExecution = timeline.find(t => t.pid !== 'idle' && t.start <= playbackTime && t.end > playbackTime);
    if (currentExecution) {
      const proc = processes.find(p => p.id === currentExecution.pid);
      if (proc) {
        running = { ...proc, remaining: currentExecution.end - playbackTime };
      }
    }

    processes.forEach(p => {
      if (running && p.id === running.id) return;
      if (p.arrivalTime <= playbackTime) {
        const completionTime = timeline.find(t => t.pid === p.id)?.end;
        if (completionTime && completionTime <= playbackTime) {
          completed.push(p);
        } else {
          ready.push(p);
        }
      }
    });

    ready.sort((a, b) => a.arrivalTime - b.arrivalTime);
    completed.sort((a, b) => {
      const timeA = timeline.find(t => t.pid === a.id)?.end || 0;
      const timeB = timeline.find(t => t.pid === b.id)?.end || 0;
      return timeA - timeB;
    });

    return { ready, running, waiting, completed };
  }, [playbackTime, processes, timeline]);

  return (
    <div className="queue-monitor-wrapper" style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {/* QUEUE MONITOR SECTION */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="dot" style={{ background: 'var(--accent-cyan)' }} />
            Queue Monitor
          </div>
          
          {/* Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} className="text-gray-500 hidden sm:block" />
              <span className="text-xs font-mono text-gray-400 hidden sm:block">TIME</span>
              <span className="font-mono text-lg font-bold text-cyan-400 tabular-nums">
                {playbackTime.toFixed(1)}<span className="text-sm text-cyan-600 ml-0.5">u</span>
              </span>
            </div>
            <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-700 min-h-[200px] w-full">
            
            {/* Column 1: Ready Queue */}
            <div style={{ padding: '1rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock size={14} className="shrink-0 text-blue-400" /> 
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider truncate">Ready Queue</span>
                </div>
                <span className="shrink-0 bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-blue-500/20">
                  {queueData.ready.length}
                </span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>
                <AnimatePresence>
                  {queueData.ready.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', border: '2px dashed rgba(55,65,81,0.5)', borderRadius: '0.5rem', color: '#4B5563', fontStyle: 'italic', fontSize: '0.875rem' }}
                    >
                      No processes waiting
                    </motion.div>
                  ) : (
                    queueData.ready.map((p, i) => (
                      <ProcessRow key={p.id} process={p} variant="ready" index={i} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Column 2: CPU Running */}
            <div style={{ padding: '1rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0, width: '100%', backgroundColor: 'rgba(20, 83, 45, 0.05)' }}>
              {queueData.running && (
                <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none rounded-lg"></div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', position: 'relative', zIndex: 10, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Cpu size={14} className="shrink-0 text-green-400" /> 
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider truncate">CPU (Running)</span>
                </div>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${queueData.running ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                  {queueData.running ? '1' : '0'}
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, minWidth: 0, width: '100%' }}>
                <AnimatePresence mode="wait">
                  {queueData.running ? (
                    <motion.div
                      key={queueData.running.id}
                      initial={{ scale: 0.9, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: -10 }}
                      style={{ width: '100%', minWidth: 0 }}
                    >
                      {/* Nuclear Option CPU Layout */}
                      <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid rgba(34, 197, 94, 0.5)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                          {/* Green Circle fixed size */}
                          <div style={{ width: '50px', height: '50px', flexShrink: 0, borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(34, 197, 94, 0.2)' }}>
                            {queueData.running.id.replace('P', '')}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#dcfce7', fontWeight: 'bold', fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{queueData.running.id}</div>
                            <div style={{ color: 'rgba(74, 222, 128, 0.6)', fontSize: '0.625rem', fontFamily: 'monospace', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Burst: {queueData.running.burstTime}u</div>
                          </div>
                        </div>

                        <div style={{ width: '100%', flexShrink: 0, backgroundColor: 'rgba(17, 24, 39, 0.5)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(55, 65, 81, 0.5)', marginTop: '1rem', boxSizing: 'border-box' }}>
                          <div style={{ color: '#4ade80', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Remaining</div>
                          <div style={{ color: 'white', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.125rem', flexShrink: 0 }}>
                            {queueData.running.remaining.toFixed(1)}<span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>u</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ width: '100%', backgroundColor: '#374151', borderRadius: '9999px', height: '6px', overflow: 'hidden', flexShrink: 0, marginTop: '1rem' }}>
                          <motion.div 
                            style={{ backgroundImage: 'linear-gradient(to right, #22c55e, #4ade80)', height: '100%', borderRadius: '9999px' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${((queueData.running.burstTime - queueData.running.remaining) / queueData.running.burstTime) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      style={{ color: '#4B5563', fontSize: '0.875rem', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100px', gap: '0.75rem' }}
                    >
                      <Cpu size={32} style={{ opacity: 0.2 }} />
                      CPU Idle
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Column 3: Waiting + Completed */}
            <div style={{ padding: '1rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
              {/* Waiting Section */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '1.25rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Hourglass size={14} className="shrink-0 text-orange-400" /> 
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider truncate">Waiting (I/O)</span>
                  </div>
                  <span className="shrink-0 bg-orange-500/10 text-orange-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-orange-500/20">
                    {queueData.waiting.length}
                  </span>
                </div>
                <div style={{ flex: 1, minHeight: '100px', border: '2px dashed rgba(55,65,81,0.5)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(31,41,55,0.2)', padding: '0.5rem', overflow: 'hidden' }}>
                  {queueData.waiting.length === 0 ? (
                    <span style={{ color: '#4B5563', fontSize: '0.875rem', fontStyle: 'italic' }}>Empty</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', height: '100%', overflowY: 'auto' }}>
                      {queueData.waiting.map(p => (
                        <div key={p.id} style={{ padding: '0.25rem 0.5rem', backgroundColor: 'rgba(124, 45, 18, 0.5)', color: '#fdba74', fontSize: '0.75rem', borderRadius: '0.375rem', border: '1px solid rgba(249, 115, 22, 0.3)', fontFamily: 'monospace', height: 'fit-content' }}>
                          {p.id}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Section */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #374151', minWidth: 0, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', width: '100%' }}>
                  <CheckCircle2 size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Completed ({queueData.completed.length})
                  </span>
                </div>
                {/* Completed Badges container with padding: 1rem and gap: 0.5rem */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem', backgroundColor: 'rgba(31, 41, 55, 0.4)', borderRadius: '0.5rem', border: '1px solid rgba(55, 65, 81, 0.3)', maxHeight: '100px', overflowY: 'auto', boxSizing: 'border-box' }}>
                  {queueData.completed.length === 0 && (
                    <span style={{ fontSize: '0.875rem', color: '#4B5563', fontStyle: 'italic' }}>None yet</span>
                  )}
                  {queueData.completed.map((p, i) => (
                    <motion.div 
                      key={p.id}
                      initial={{ scale: 0, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.5rem', backgroundColor: '#1f2937', borderRadius: '0.25rem', border: '1px solid #4b5563', color: '#d1d5db', fontSize: '0.625rem', fontFamily: 'monospace', height: 'fit-content', flexShrink: 0 }}
                    >
                      <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{p.id}</span>
                      <ArrowRight size={10} style={{ color: '#6b7280' }} />
                      <span style={{ color: '#6b7280' }}>Done</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATE TRANSITION DIAGRAM SECTION */}
      <StateTransitionDiagram playbackTime={playbackTime} timeline={timeline} />
      
    </div>
  );
};

const ProcessRow = ({ process, variant, index }) => {
  const isReady = variant === 'ready';
  const bgColor = isReady ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)';
  const borderColor = isReady ? 'rgba(59, 130, 246, 0.3)' : 'rgba(249, 115, 22, 0.3)';
  const textColor = isReady ? '#bfdbfe' : '#fed7aa';
  const accentColor = isReady ? '#3b82f6' : '#f97316';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
        <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>
          {process.id.replace('P', '')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.875rem', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{process.id}</div>
          <div style={{ color: '#6b7280', fontSize: '0.625rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Arrival: {process.arrivalTime}u</div>
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right', marginRight: '0.5rem' }}>
        <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>Burst</div>
        <div style={{ color: '#e5e7eb', fontFamily: 'monospace', fontSize: '0.875rem' }}>{process.burstTime}u</div>
      </div>
    </motion.div>
  );
};

export default QueueMonitor;
