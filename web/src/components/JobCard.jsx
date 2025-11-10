export default function JobCard({ job }) {
  if (!job) return null;
  return (
    <div className="card">
      <div className="small">Job</div>
      <div style={{fontWeight:600}}>{job.id}</div>
      <div className="small" style={{marginTop:6}}>Status</div>
      <div className="status-chip">{job.status}</div>
      <div className="grid" style={{marginTop:8}}>
        <div><div className="small">Owner</div>{job.owner || '-'}</div>
        <div><div className="small">Next Run</div>{job.nextRun || '-'}</div>
        <div><div className="small">Last Start</div>{job.lastRunStart || '-'}</div>
        <div><div className="small">Last End</div>{job.lastRunEnd || '-'}</div>
        <div><div className="small">Duration</div>{job.durationSec ? (Math.round(job.durationSec/60)+" min") : '-'}</div>
        <div><div className="small">Dependencies</div>{(job.dependencies||[]).join(', ')||'-'}</div>
      </div>
    </div>
  );
}
