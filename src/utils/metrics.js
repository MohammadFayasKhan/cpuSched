export function computeMetrics(results, timeline) {
  if (!results || results.length === 0) {
    return {
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0,
    };
  }

  const n = results.length;
  const totalWT = results.reduce((sum, r) => sum + r.waitingTime, 0);
  const totalTAT = results.reduce((sum, r) => sum + r.turnaroundTime, 0);
  const totalRT = results.reduce((sum, r) => sum + r.responseTime, 0);

  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;
  const idleTime = timeline
    .filter((seg) => seg.pid === 'idle')
    .reduce((sum, seg) => sum + (seg.end - seg.start), 0);
  const busyTime = totalTime - idleTime;

  return {
    avgWaitingTime: parseFloat((totalWT / n).toFixed(2)),
    avgTurnaroundTime: parseFloat((totalTAT / n).toFixed(2)),
    avgResponseTime: parseFloat((totalRT / n).toFixed(2)),
    cpuUtilization: totalTime > 0 ? parseFloat(((busyTime / totalTime) * 100).toFixed(1)) : 0,
    throughput: totalTime > 0 ? parseFloat((n / totalTime).toFixed(2)) : 0,
  };
}
