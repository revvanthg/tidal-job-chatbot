const API = import.meta.env.VITE_API_BASE || __API__ || '';

export async function searchJobs(query) {
  const r = await fetch(`${API}/jobs?query=${encodeURIComponent(query)}`);
  return r.json();
}
export async function getJob(id) {
  const r = await fetch(`${API}/jobs/${encodeURIComponent(id)}`);
  return r.json();
}
export async function actionJob(id, type) {
  const r = await fetch(`${API}/jobs/${encodeURIComponent(id)}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  return r.json();
}
