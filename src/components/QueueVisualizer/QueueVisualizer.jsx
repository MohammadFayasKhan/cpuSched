import { useMemo } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Clock, Hourglass, CheckCircle2, ArrowRight } from 'lucide-react';

const QueueMonitor = () => {
  const { processes, playbackTime, timeline, isPlaying } = useSchedulerStore();

  const queueData = useMemo(() => {
    if (!timeline || timeline.length === 0 || !processes) {
      return { ready: [], running: null, waiting: [], completed: [] };
    }

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
        const completionEntry = timeline.find(t => t.pid === p.id);
        if (completionEntry && completionEntry.end <= playbackTime) {
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
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: 'var(--accent-cyan)',
              animation: isPlaying ? 'pulse-glow 1s infinite' : 'none',
            }}
          />
          <span
            className="font-mono text-xs font-bold tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            QUEUE MONITOR
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>TIME</span>
          <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent-cyan)' }}>
            {playbackTime.toFixed(1)}
            <span className="text-sm" style={{ color: 'var(--accent-cyan)', opacity: 0.6 }}>u</span>
          </span>
          {isPlaying && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
            >
              LIVE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 divide-x divide-gray-700/50" style={{ minHeight: '180px' }}>
        <div className="col-span-4 p-5 flex flex-col" style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-xs font-bold uppercase" style={{ color: '#60A5FA', letterSpacing: '0.1em' }}>
              <Clock size={14} /> Ready Queue
            </span>
            <span
              className="font-mono text-xs px-2 py-0.5 rounded font-bold"
              style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            >
              {queueData.ready.length}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
            <AnimatePresence>
              {queueData.ready.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-center font-mono text-xs italic border border-dashed rounded-lg"
                  style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', opacity: 0.5 }}
                >
                  No processes waiting
                </motion.div>
              ) : (
                queueData.ready.map((p, i) => (
                  <ProcessCard key={p.id} process={p} variant="ready" index={i} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="col-span-4 p-5 flex flex-col relative" style={{ background: 'rgba(34, 197, 94, 0.03)' }}>
          {queueData.running && <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none" style={{ animation: 'pulse 2s infinite' }} />}

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="flex items-center gap-2 text-xs font-bold uppercase" style={{ color: '#22C55E', letterSpacing: '0.1em' }}>
              <Cpu size={14} /> CPU (Running)
            </span>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded font-bold border ${queueData.running ? '' : ''}`}
              style={queueData.running
                ? { background: 'rgba(34, 197, 94, 0.2)', color: '#86EFAC', border: '1px solid rgba(34, 197, 94, 0.3)' }
                : { background: 'var(--bg-surface)', color: 'var(--text-muted)', border: 'var(--border)' }
              }
            >
              {queueData.running ? '1' : '0'}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              {queueData.running ? (
                <motion.div
                  key={queueData.running.id}
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                          style={{ background: '#22C55E', color: '#fff', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}
                        >
                          {queueData.running.id.replace('P', '')}
                        </div>
                        <div>
                          <div className="font-bold text-lg leading-none" style={{ color: '#fff' }}>
                            {queueData.running.id}
                          </div>
                          <div className="font-mono text-xs mt-1" style={{ color: 'rgba(34, 197, 94, 0.8)' }}>
                            Burst: {queueData.running.burstTime}u
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Remaining</div>
                        <div className="font-mono font-bold text-xl" style={{ color: '#fff' }}>
                          {queueData.running.remaining.toFixed(1)}
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>u</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-surface)', marginTop: '8px' }}>
                      <motion.div
                        className="h-full"
                        style={{ background: '#22C55E' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((queueData.running.burstTime - queueData.running.remaining) / queueData.running.burstTime) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-sm italic flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                  <Cpu size={32} style={{ opacity: 0.3 }} />
                  CPU Idle
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="col-span-4 p-5 flex flex-col" style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
          <div className="flex-1 flex flex-col mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase" style={{ color: '#F97316', letterSpacing: '0.1em' }}>
                <Hourglass size={14} /> Waiting (I/O)
              </span>
              <span
                className="font-mono text-xs px-2 py-0.5 rounded font-bold"
                style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#FDBA74', border: '1px solid rgba(249, 115, 22, 0.2)' }}
              >
                {queueData.waiting.length}
              </span>
            </div>
            <div
              className="flex-1 min-h-[60px] rounded-lg flex items-center justify-center"
              style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border)' }}
            >
              {queueData.waiting.length === 0 ? (
                <span className="text-xs italic" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>Empty</span>
              ) : (
                <div className="flex gap-2">
                  {queueData.waiting.map(p => (
                    <div
                      key={p.id}
                      className="px-2 py-1 rounded text-xs"
                      style={{ background: 'rgba(249, 115, 22, 0.3)', color: '#FED7AA', border: '1px solid rgba(249, 115, 22, 0.3)' }}
                    >
                      {p.id}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-auto" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                Completed ({queueData.completed.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {queueData.completed.length === 0 && (
                <span className="text-xs italic" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>None yet</span>
              )}
              {queueData.completed.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <span className="font-bold" style={{ color: '#4ADE80' }}>{p.id}</span>
                  <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Done</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProcessCard = ({ process, variant, index }) => {
  const isReady = variant === 'ready';
  const bgColor = isReady ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)';
  const borderColor = isReady ? 'rgba(59, 130, 246, 0.3)' : 'rgba(249, 115, 22, 0.3)';
  const textColor = isReady ? '#93C5FD' : '#FED7AA';
  const accentColor = isReady ? '#3B82F6' : '#F97316';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      className="rounded p-3 flex items-center justify-between cursor-default transition-colors"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm"
          style={{ background: accentColor, color: '#fff' }}
        >
          {process.id.replace('P', '')}
        </div>
        <div>
          <div className="font-bold font-mono text-sm" style={{ color: textColor }}>
            {process.id}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Arrival: {process.arrivalTime}u</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Burst</div>
        <div className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{process.burstTime}u</div>
      </div>
    </motion.div>
  );
};

export default QueueMonitor;