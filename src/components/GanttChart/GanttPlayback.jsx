import { useEffect, useRef, useCallback } from 'react';
import { SkipBack, Play, Pause } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';

export default function GanttPlayback() {
  const {
    timeline,
    isPlaying,
    playbackTime,
    playbackSpeed,
    setPlaybackTime,
    setIsPlaying,
    setPlaybackSpeed,
  } = useSchedulerStore();

  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;

  const animate = useCallback(
    (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      const { playbackTime, playbackSpeed, isPlaying } = useSchedulerStore.getState();

      if (!isPlaying) return;

      const newTime = playbackTime + delta * playbackSpeed;

      if (newTime >= totalTime) {
        setPlaybackTime(totalTime);
        setIsPlaying(false);
        lastTimeRef.current = null;
        return;
      }

      setPlaybackTime(newTime);
      animFrameRef.current = requestAnimationFrame(animate);
    },
    [totalTime, setPlaybackTime, setIsPlaying]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
    lastTimeRef.current = null;
  };

  const handleTogglePlay = () => {
    if (playbackTime >= totalTime) {
      setPlaybackTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'var(--bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        marginBottom: '12px',
        flexWrap: 'wrap',
      }}
    >
      <button className="btn" onClick={handleReset} style={{ padding: '5px 10px' }}>
        <SkipBack size={12} />
        Reset
      </button>

      <button
        className="btn btn-primary"
        onClick={handleTogglePlay}
        style={{ padding: '5px 12px' }}
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Speed:
        </span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.25"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          style={{
            width: '80px',
            accentColor: 'var(--accent-cyan)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            minWidth: '32px',
          }}
        >
          {playbackSpeed}x
        </span>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          marginLeft: '8px',
        }}
      >
        t={playbackTime.toFixed(1)} / {totalTime}
      </div>
    </div>
  );
}
