import { useEffect, useRef, useMemo } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';
import './ExplanationFeed.css';

export default function ExplanationFeed() {
  const { log, hasRun, processes, playbackTime, isPlaying } = useSchedulerStore();
  const containerRef = useRef(null);

  const processColorMap = useMemo(() => {
    const map = {};
    processes.forEach((p) => {
      map[p.id] = p.color;
    });
    return map;
  }, [processes]);

  // Auto-scroll removed - no longer auto-scrolls during playback

  if (!hasRun || !log.length) return null;

  return (
    <div>
      <div className="section-header">
        <span className="dot" />
        Scheduling Log
      </div>

      <div className="log-container" ref={containerRef}>
        {log.map((entry, i) => {
          const color = entry.pid ? processColorMap[entry.pid] : 'var(--text-muted)';
          const isCurrentPlayback =
            (isPlaying || playbackTime > 0) &&
            entry.time <= playbackTime &&
            (i === log.length - 1 || log[i + 1].time > playbackTime);

          return (
            <div
              key={i}
              className={`log-entry ${isCurrentPlayback ? 'active' : ''} ${entry.event === 'idle' ? 'idle' : ''}`}
              style={{
                animationDelay: `${i * 120}ms`,
                borderLeftColor: isCurrentPlayback ? 'var(--accent-cyan)' : 'transparent',
              }}
            >
              <span className="log-timestamp" style={{ color }}>
                [t={entry.time}]
              </span>
              <span className="log-text">{entry.text.replace(`[t=${entry.time}] `, '')}</span>

              {entry.readyQueue && entry.readyQueue.length > 0 && (
                <div className="log-queue">
                  Queue: [{entry.readyQueue.join(', ')}]
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
