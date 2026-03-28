import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';
import algoInfo from '../../data/algoInfo';
import './AlgoInfoBox.css';

function Badge({ text, variant }) {
  const classMap = {
    orange: 'badge-orange',
    red: 'badge-red',
    green: 'badge-green',
    yellow: 'badge-yellow',
    cyan: 'badge-cyan',
    purple: 'badge-purple',
  };

  return <span className={`badge ${classMap[variant] || 'badge-cyan'}`}>{text}</span>;
}

export default function AlgoInfoBox() {
  const { algorithm } = useSchedulerStore();
  const [showQuestions, setShowQuestions] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const info = algoInfo[algorithm];
  if (!info) return null;

  const typeBadge =
    info.type === 'Preemptive'
      ? { text: 'Preemptive', variant: 'red' }
      : { text: 'Non-Preemptive', variant: 'orange' };

  const overheadBadge =
    info.overhead === 'Low'
      ? { text: 'Low Overhead', variant: 'green' }
      : info.overhead === 'Medium'
        ? { text: 'Medium Overhead', variant: 'yellow' }
        : { text: 'High Overhead', variant: 'red' };

  const starvationBadge = info.starvationRisk
    ? { text: 'Starvation: Yes', variant: 'red' }
    : { text: 'Starvation: No', variant: 'cyan' };

  return (
    <div className="algo-info-box animate-cross-fade" key={algorithm}>
      <div
        className="algo-info-header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="section-header" style={{ margin: 0 }}>
          <span className="dot" />
          Algorithm Info
        </div>

        {/* Mobile toggle */}
        <button className="algo-info-toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className={`algo-info-content ${expanded ? 'expanded' : ''}`}>
        <h3 className="algo-info-name">{info.name}</h3>
        <p className="algo-info-tagline">{info.tagline}</p>

        <div className="algo-info-badges">
          <Badge {...typeBadge} />
          <Badge {...overheadBadge} />
          <Badge {...starvationBadge} />
        </div>

        <div className="algo-info-section">
          <h4 className="algo-info-section-title">Definition</h4>
          <p className="algo-info-text">{info.definition}</p>
        </div>

        <div className="algo-info-section">
          <h4 className="algo-info-section-title">How It Works</h4>
          <ol className="algo-info-steps">
            {info.howItWorks.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="algo-info-meta-row">
          <div className="algo-info-meta">
            <span className="algo-info-meta-label">Time Complexity</span>
            <span className="algo-info-meta-value">{info.timeComplexity}</span>
          </div>
          <div className="algo-info-meta">
            <span className="algo-info-meta-label">Starvation Risk</span>
            <span
              className="algo-info-meta-value"
              style={{ color: info.starvationRisk ? 'var(--error)' : 'var(--success)' }}
            >
              {info.starvationRisk ? 'YES ✗' : 'NO ✓'}
            </span>
          </div>
        </div>

        <div className="algo-info-section">
          <h4 className="algo-info-section-title">Use Cases</h4>
          <ul className="algo-info-list">
            {info.useCases.map((uc, i) => (
              <li key={i}>{uc}</li>
            ))}
          </ul>
        </div>

        <div className="algo-info-section">
          <h4 className="algo-info-section-title">Advantages</h4>
          <ul className="algo-info-list advantages">
            {info.advantages.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>

        <div className="algo-info-section">
          <h4 className="algo-info-section-title">Disadvantages</h4>
          <ul className="algo-info-list disadvantages">
            {info.disadvantages.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>

        <div className="algo-info-section">
          <button
            className="interview-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuestions(!showQuestions);
            }}
          >
            {showQuestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Interview Questions
          </button>

          <div className={`interview-questions ${showQuestions ? 'open' : ''}`}>
            <ul className="algo-info-list questions">
              {info.interviewQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
