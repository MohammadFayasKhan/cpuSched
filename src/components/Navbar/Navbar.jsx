import { Users, FileSpreadsheet, Share2, X, Star } from 'lucide-react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { exportCSV, shareURL } from '../../utils/exportUtils';
import { useState } from 'react';

export default function Navbar() {
  const { results, metrics, algorithm, processes, quantum } = useSchedulerStore();
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const [showCredits, setShowCredits] = useState(false);

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
            onClick={() => setShowCredits(true)}
            title="Developer Acknowledgements"
            style={{ padding: '6px 10px', color: 'var(--accent-cyan)' }}
          >
            <Users size={14} />
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

      {/* Developer Acknowledgements Modal */}
      {showCredits && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 10, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
          onClick={() => setShowCredits(false)}
        >
          <div
            className="card"
            style={{
              width: '90%',
              maxWidth: '550px',
              padding: '24px',
              background: 'linear-gradient(180deg, #1e1e2e 0%, #171725 100%)',
              border: '1px solid var(--accent-cyan)',
              animation: 'fadeSlideUp 0.3s ease-out forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
                <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Developer Acknowledgements
                </h2>
              </div>
              <button 
                className="btn" 
                onClick={() => setShowCredits(false)}
                style={{ background: 'transparent', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Leader */}
              <div style={{
                background: 'color-mix(in srgb, var(--accent-cyan) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-cyan) 30%, transparent)',
                borderRadius: '8px',
                padding: '16px',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--accent-gold)' }}>
                  <Star size={16} fill="currentColor" />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Group Leader
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Mohammad Fayas Khan
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                  Reg No: 12413692
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Done most of all technical work and built all the core simulation algorithms, logic, and dynamic UI components.
                </p>
              </div>

              {/* Members */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Team Member
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Aditya Rana</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Reg No: 12413424</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Helped in collecting data, design ideas, and stuff related to the project planning and structure.
                  </p>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Team Member
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Adithyan P</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Reg No: 12411988</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Helped in documenting the project, managing collective additions, and technical structuring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
