import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export async function exportPNG(elementId = 'gantt-export-area') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const canvas = await html2canvas(el, {
    backgroundColor: '#0d0d14',
    scale: 2,
    useCORS: true,
  });

  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, 'cpusched-results.png');
    }
  });
}

export function exportCSV(results, metrics, algorithm) {
  if (!results || results.length === 0) return;

  let csv = `CPUSCHED Results - ${algorithm}\n\n`;
  csv += 'PID,Arrival Time,Burst Time,Completion Time,Turnaround Time,Waiting Time,Response Time\n';

  results.forEach((r) => {
    csv += `${r.pid},${r.arrivalTime},${r.burstTime},${r.completionTime},${r.turnaroundTime},${r.waitingTime},${r.responseTime}\n`;
  });

  csv += '\nSummary Metrics\n';
  csv += `Average Waiting Time,${metrics.avgWaitingTime}\n`;
  csv += `Average Turnaround Time,${metrics.avgTurnaroundTime}\n`;
  csv += `Average Response Time,${metrics.avgResponseTime}\n`;
  csv += `CPU Utilization,${metrics.cpuUtilization}%\n`;
  csv += `Throughput,${metrics.throughput}/unit\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `cpusched-${algorithm}.csv`);
}

export function shareURL(processes, algorithm, quantum) {
  const data = { processes, algorithm, quantum };
  const encoded = btoa(JSON.stringify(data));
  const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
  navigator.clipboard.writeText(url);
  return url;
}

export function loadFromURL() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  try {
    return JSON.parse(atob(hash));
  } catch {
    return null;
  }
}
