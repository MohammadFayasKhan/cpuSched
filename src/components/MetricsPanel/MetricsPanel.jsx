import { useEffect, useState, useRef } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';
import './MetricsPanel.css';

function AnimatedNumber({ value, duration = 800, suffix = '', decimals = 2 }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (value === null || value === undefined) return;

    startRef.current = performance.now();
    const target = parseFloat(value);

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(eased * target);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span>
      {display.toFixed(decimals)}{suffix}
    </span>
  );
}

export default function MetricsPanel() {
  const { metrics, hasRun } = useSchedulerStore();

  if (!hasRun || !metrics) return null;

  const cards = [
    {
      label: 'Avg Waiting Time',
      value: metrics.avgWaitingTime,
      suffix: ' units',
      accent: 'var(--accent-cyan)',
      decimals: 2,
    },
    {
      label: 'Avg Turnaround',
      value: metrics.avgTurnaroundTime,
      suffix: ' units',
      accent: 'var(--accent-orange)',
      decimals: 2,
    },
    {
      label: 'CPU Utilization',
      value: metrics.cpuUtilization,
      suffix: '%',
      accent: 'var(--accent-purple)',
      decimals: 1,
    },
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="metric-card"
          style={{
            borderLeftColor: card.accent,
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="metric-label">{card.label}</div>
          <div className="metric-value" style={{ color: card.accent }}>
            <AnimatedNumber
              value={card.value}
              suffix={card.suffix}
              decimals={card.decimals}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
