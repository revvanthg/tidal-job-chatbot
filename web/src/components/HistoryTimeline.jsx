export default function HistoryTimeline({ job }) {
  const history = job?.history || [];
  if (!history.length) return null;
  return (
    <div className="card history">
      <div style={{fontWeight:600}}>Run History</div>
      {history.slice(0,8).map((h,i)=> (
        <div key={i} className="history-item">
          <span>{h.status}</span>
          <span>{h.start} → {h.end}</span>
          <span>{h.durationSec ? Math.round(h.durationSec/60)+"m" : ''}</span>
        </div>
      ))}
    </div>
  );
}
