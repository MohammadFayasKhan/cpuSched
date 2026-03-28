import { Camera, FileSpreadsheet, Share2 } from 'lucide-react';
import { useState } from 'react';
import useSchedulerStore from '../../store/useSchedulerStore';
import { exportPNG, exportCSV, shareURL } from '../../utils/exportUtils';

export default function ExportControls({ onToast }) {
  const { results, metrics, algorithm, processes, quantum } = useSchedulerStore();

  const handleExportPNG = async () => {
    await exportPNG('gantt-export-area');
    onToast?.('PNG exported successfully!');
  };

  const handleExportCSV = () => {
    exportCSV(results, metrics, algorithm);
    onToast?.('CSV downloaded!');
  };

  const handleShare = () => {
    shareURL(processes, algorithm, quantum);
    onToast?.('Link copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button className="btn" onClick={handleExportPNG} title="Export as PNG" style={{ padding: '6px 10px' }}>
        <Camera size={14} />
      </button>
      <button className="btn" onClick={handleExportCSV} title="Export as CSV" style={{ padding: '6px 10px' }}>
        <FileSpreadsheet size={14} />
      </button>
      <button className="btn" onClick={handleShare} title="Share URL" style={{ padding: '6px 10px' }}>
        <Share2 size={14} />
      </button>
    </div>
  );
}
