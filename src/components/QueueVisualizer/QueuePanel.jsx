import { memo, useMemo } from 'react';

const QueuePanel = memo(function QueuePanel({
  title,
  processes,
  colorScheme,
  emptyMessage = 'Empty',
  highlightActive = false,
  showOrder = false,
}) {
  const isEmpty = processes.length === 0;

  const headerIcon = useMemo(() => {
    if (title === 'Ready Queue') {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colorScheme.text} strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    } else if (title === 'CPU (Running)') {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colorScheme.text} strokeWidth="2.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="15" x2="23" y2="15" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="15" x2="4" y2="15" />
        </svg>
      );
    } else {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colorScheme.text} strokeWidth="2.5">
          <path d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    }
  }, [title, colorScheme.text]);

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden"
      style={{
        background: colorScheme.bg,
        border: `1px solid ${colorScheme.border}`,
        minHeight: '140px',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: colorScheme.header,
          borderBottom: `1px solid ${colorScheme.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          {headerIcon}
          <span
            className="font-mono text-xs font-bold uppercase tracking-wider"
            style={{ color: colorScheme.text }}
          >
            {title}
          </span>
        </div>
        <span
          className="font-mono text-xs px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            color: colorScheme.text,
          }}
        >
          {processes.length}
        </span>
      </div>

      <div
        className="flex-1 p-3 min-h-[80px] max-h-[120px] overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${colorScheme.border} transparent`,
        }}
      >
        {isEmpty ? (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: colorScheme.text, opacity: 0.4 }}
          >
            <span className="font-mono text-xs uppercase tracking-wider">{emptyMessage}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {showOrder && processes.map((process, i) => (
              <div
                key={`order-${process.id}`}
                className="font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {i + 1}.
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {processes.map((process, index) => (
                <ProcessChip
                  key={process.id}
                  process={process}
                  colorScheme={colorScheme}
                  index={index}
                  highlightActive={highlightActive}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

function ProcessChip({ process, colorScheme, index, highlightActive }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer"
      style={{
        background: colorScheme.chip,
        color: '#fff',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        fontWeight: 700,
        animation: `fadeSlideUp 0.3s ease-out forwards`,
        animationDelay: `${index * 60}ms`,
        opacity: 0,
        boxShadow: highlightActive
          ? `0 0 12px ${colorScheme.glow}, 0 0 4px ${colorScheme.glow}`
          : '0 2px 4px rgba(0, 0, 0, 0.2)',
        transform: highlightActive ? 'scale(1.05)' : 'scale(1)',
      }}
      title={`${process.id}\nArrival: ${process.arrivalTime}\nBurst: ${process.burstTime}`}
    >
      <span>{process.id}</span>
      {highlightActive && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )}
      {process.priority !== undefined && (
        <span className="opacity-70" style={{ fontSize: '0.6rem' }}>
          P{process.priority}
        </span>
      )}
    </div>
  );
}

export default QueuePanel;