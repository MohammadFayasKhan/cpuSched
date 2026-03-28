import { hexToRgba } from '../../utils/colorUtils';
import { createPortal } from 'react-dom';

export default function GanttTooltip({ segment, color, fixedPos }) {
  if (!segment) return null;

  const isIdle = segment.pid === 'idle';
  const duration = segment.end - segment.start;

  // Clamp horizontal position to keep tooltip within viewport
  const tooltipWidth = 180;
  const viewportWidth = window.innerWidth;
  let clampedX = fixedPos.x;

  // If tooltip would go past right edge, shift left
  if (clampedX + tooltipWidth / 2 > viewportWidth - 16) {
    clampedX = viewportWidth - tooltipWidth / 2 - 16;
  }
  // If tooltip would go past left edge, shift right
  if (clampedX - tooltipWidth / 2 < 16) {
    clampedX = tooltipWidth / 2 + 16;
  }

  const tooltip = (
    <div
      style={{
        position: 'fixed',
        left: `${clampedX}px`,
        top: `${fixedPos.y - 8}px`,
        transform: 'translate(-50%, -100%)',
        background: 'var(--bg-card)',
        border: `1px solid ${isIdle ? 'var(--border)' : color}`,
        borderRadius: '10px',
        padding: '12px 16px',
        zIndex: 9999,
        minWidth: '160px',
        maxWidth: `${tooltipWidth}px`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${isIdle ? 'var(--border)' : hexToRgba(color, 0.2)}`,
        pointerEvents: 'none',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: isIdle ? 'var(--text-muted)' : color,
          marginBottom: '8px',
          borderBottom: `1px solid ${isIdle ? 'var(--border)' : hexToRgba(color, 0.3)}`,
          paddingBottom: '6px',
        }}
      >
        {isIdle ? 'IDLE' : segment.pid}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Start:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{segment.start}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>End:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{segment.end}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{duration} unit{duration !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {/* Arrow pointing down */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          width: '10px',
          height: '10px',
          background: 'var(--bg-card)',
          borderRight: `1px solid ${isIdle ? 'var(--border)' : color}`,
          borderBottom: `1px solid ${isIdle ? 'var(--border)' : color}`,
        }}
      />
    </div>
  );

  return createPortal(tooltip, document.body);
}
