import { useState, useMemo, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';
import algoInfo from '../../data/algoInfo';
import GanttBlock from './GanttBlock';
import GanttPlayback from './GanttPlayback';

export default function GanttChart() {
  const { timeline, algorithm, processes, hasRun, playbackTime } = useSchedulerStore();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [zoomLevel, setZoomLevel] = useState(0); // -2 to +3

  const info = algoInfo[algorithm];
  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;

  // Measure container width for auto-fit
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate pxPerUnit: auto-fit to width, then allow zoom adjustment
  const pxPerUnit = useMemo(() => {
    if (totalTime <= 0) return 50;
    // Account for gaps between segments: (segmentCount - 1) * 3px gap
    const gapSpace = (timeline.length - 1) * 3;
    const basePixelsPerUnit = Math.max(20, (containerWidth - gapSpace) / totalTime);
    const zoomFactor = 1 + zoomLevel * 0.25;
    return Math.max(16, Math.min(100, basePixelsPerUnit * zoomFactor));
  }, [containerWidth, totalTime, zoomLevel, timeline.length]);

  const processColorMap = useMemo(() => {
    const map = {};
    processes.forEach((p) => {
      map[p.id] = p.color;
    });
    return map;
  }, [processes]);

  // Generate time axis ticks
  const ticks = useMemo(() => {
    if (!timeline.length) return [];
    const tickSet = new Set();
    timeline.forEach((seg) => {
      tickSet.add(seg.start);
      tickSet.add(seg.end);
    });
    return Array.from(tickSet).sort((a, b) => a - b);
  }, [timeline]);

  const totalGapSpace = (timeline.length - 1) * 3;
  const totalWidth = totalTime * pxPerUnit + totalGapSpace;
  const needsScroll = totalWidth > containerWidth;

  if (!hasRun) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80px',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Configure processes and click{' '}
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>RUN ▶</span>{' '}
          to see the Gantt chart
        </div>
      </div>
    );
  }

  // In auto-fit mode, compute tick positions as percentages of totalTime
  // Each unit of time gets equal share of available space (excluding gaps)
  const computeTickPosition = (tickValue) => {
    if (needsScroll) {
      // In scroll mode, use absolute positioning with pxPerUnit
      // Sum up segment widths and gaps up to tick value
      let pos = 0;
      for (const seg of timeline) {
        if (seg.start >= tickValue) break;
        const segEnd = Math.min(seg.end, tickValue);
        pos += (segEnd - seg.start) * pxPerUnit;
        if (seg.end <= tickValue) {
          // Add gap after this segment (if not the last one before tick)
          const segIndex = timeline.indexOf(seg);
          if (segIndex < timeline.length - 1) pos += 3;
        }
      }
      return `${pos}px`;
    } else {
      // In auto-fit mode, use percentage based on totalTime
      // The flexbox distributes space proportionally to duration
      // So each unit of time gets (100% - totalGapPx) / totalTime of width
      // Plus accumulated gaps from segments before the tick
      let gapsBefore = 0;
      for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].end <= tickValue && i < timeline.length - 1) {
          gapsBefore++;
        }
      }
      const gapPx = gapsBefore * 3;
      const timePercent = tickValue / totalTime;
      return `calc(${timePercent * 100}% * (1 - ${totalGapSpace}px / 100%) + ${gapPx}px)`;
    }
  };

  // Better calc for auto-fit: use calc() to account for gap space
  const getTickLeft = (tickValue) => {
    if (needsScroll) {
      return computeTickPosition(tickValue);
    }
    // In auto-fit mode: the total rendered width = container width
    // Segments share space proportionally by duration with 3px gaps between
    // So position of tick = (tickValue/totalTime) * (containerWidth - totalGapSpace) + gapsBefore * 3
    let gapsBefore = 0;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].end <= tickValue && i < timeline.length - 1) {
        gapsBefore++;
      }
    }
    const gapPx = gapsBefore * 3;
    const fraction = totalTime > 0 ? tickValue / totalTime : 0;
    // Use calc to avoid needing measured widths
    return `calc(${fraction} * (100% - ${totalGapSpace}px) + ${gapPx}px)`;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div className="section-header" style={{ margin: 0 }}>
          <span className="dot" />
          {info?.name || algorithm} — Gantt Chart
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn"
            onClick={() => setZoomLevel(Math.max(-2, zoomLevel - 1))}
            style={{ padding: '4px 8px' }}
            disabled={zoomLevel <= -2}
          >
            <ZoomOut size={12} />
          </button>
          <button
            className="btn"
            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1))}
            style={{ padding: '4px 8px' }}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      <GanttPlayback />

      <div id="gantt-export-area" ref={containerRef}>
        <div
          style={{
            overflowX: needsScroll ? 'auto' : 'hidden',
            overflowY: 'hidden',
            paddingBottom: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '3px',
              position: 'relative',
              minWidth: needsScroll ? `${totalWidth}px` : undefined,
              width: needsScroll ? undefined : '100%',
              paddingBottom: '28px',
            }}
          >
            {/* Playback cursor */}
            {(useSchedulerStore.getState().isPlaying || playbackTime > 0) && (
              <div
                style={{
                  position: 'absolute',
                  left: `${playbackTime * pxPerUnit}px`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'var(--accent-cyan)',
                  zIndex: 10,
                  boxShadow: '0 0 8px var(--accent-cyan)',
                  transition: 'left 0.05s linear',
                  pointerEvents: 'none',
                }}
              />
            )}

            {timeline.map((seg, i) => (
              <GanttBlock
                key={`${seg.pid}-${seg.start}-${i}`}
                segment={seg}
                index={i}
                pxPerUnit={pxPerUnit}
                processColor={processColorMap[seg.pid] || '#2a2a3d'}
                autoFit={!needsScroll}
                totalTime={totalTime}
              />
            ))}

            {/* Time axis — uses same positioning logic as flex layout */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '20px',
              }}
            >
              {ticks.map((tick) => (
                <div
                  key={tick}
                  style={{
                    position: 'absolute',
                    left: getTickLeft(tick),
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '1px',
                      height: '6px',
                      background: 'var(--text-muted)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {tick}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
