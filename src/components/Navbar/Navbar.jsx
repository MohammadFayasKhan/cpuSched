import { Camera, FileSpreadsheet, Share2 } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { exportPNG, exportCSV, shareURL } from '../../utils/exportUtils';
import { useState } from 'react';

export default function Navbar() {
  const { results, metrics, algorithm, processes, quantum } = useSchedulerStore();
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleExportPNG = async () => {
    await exportPNG('gantt-export-area');
    showToast('PNG exported successfully!');
  };

  const handleExportCSV = () => {
    exportCSV(results, metrics, algorithm);
    showToast('CSV downloaded!');
  };

  const handleShare = () => {
    shareURL(processes, algorithm, quantum);
    showToast('Link copied to clipboard!');
  };

  return (
    <>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'rgba(13, 13, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 900,
              fontSize: '1.5rem',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            <span style={{ color: 'var(--accent-cyan)' }}>CPU</span>
            <span style={{ color: 'var(--accent-orange)' }}>SCHED</span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: 'var(--text-muted)',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            Intelligent Scheduling Simulator
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn"
            onClick={handleExportPNG}
            title="Export as PNG"
            style={{ padding: '6px 10px' }}
          >
            <Camera size={14} />
          </button>
          <button
            className="btn"
            onClick={handleExportCSV}
            title="Export as CSV"
            style={{ padding: '6px 10px' }}
          >
            <FileSpreadsheet size={14} />
          </button>
          <button
            className="btn"
            onClick={handleShare}
            title="Share URL"
            style={{ padding: '6px 10px' }}
          >
            <Share2 size={14} />
          </button>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast success">
            <span style={{ color: 'var(--success)' }}>✓</span>
            {toast}
          </div>
        </div>
      )}
    </>
  );
}
