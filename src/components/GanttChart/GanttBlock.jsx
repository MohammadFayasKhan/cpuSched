import { useState, useRef, useCallback } from 'react';
import { hexToRgba, brighten } from '../../utils/colorUtils';
import GanttTooltip from './GanttTooltip';

export default function GanttBlock({ segment, index, pxPerUnit, processColor, autoFit, totalTime }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const blockRef = useRef(null);

  const isIdle = segment.pid === 'idle';
  const duration = segment.end - segment.start;
  const width = duration * pxPerUnit;
  const color = isIdle ? '#2a2a3d' : processColor;
  const borderColor = isIdle ? '#3a3a4d' : brighten(color, 40);

  // In auto-fit mode, use flex-based sizing
  const widthStyle = autoFit
    ? { flex: `${duration} 0 0%`, minWidth: '20px' }
    : { width: `${width}px` };

  const handleMouseEnter = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <div
      ref={blockRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...widthStyle,
        height: '52px',
        background: isIdle
          ? `repeating-linear-gradient(
              45deg,
              #1e1e2e,
              #1e1e2e 4px,
              #252538 4px,
              #252538 8px
            )`
          : hexToRgba(color, 0.15),
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        cursor: 'pointer',
        flexShrink: 0,
        animation: 'slideInRight 0.3s ease-out forwards',
        animationDelay: `${index * 120}ms`,
        opacity: 0,
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = isIdle
          ? 'none'
          : `0 0 12px ${hexToRgba(color, 0.3)}, inset 0 0 20px ${hexToRgba(color, 0.05)}`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: (autoFit ? true : width < 40) ? '0.65rem' : '0.8rem',
          color: isIdle ? 'var(--text-muted)' : color,
          lineHeight: 1,
        }}
      >
        {isIdle ? '—' : segment.pid}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5rem',
          color: isIdle ? 'var(--text-muted)' : hexToRgba(color, 0.7),
          marginTop: '2px',
          fontWeight: 600,
        }}
      >
        {duration}u
      </span>

      {showTooltip && (
        <GanttTooltip
          segment={segment}
          color={color}
          fixedPos={tooltipPos}
        />
      )}
    </div>
  );
}
