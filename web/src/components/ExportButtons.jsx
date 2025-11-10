function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type:'text/plain'}));
  a.download = filename; a.click();
}
export function ExportJSON({ job }) {
  if (!job) return null;
  return <button onClick={()=> download(`${job.id}.json`, JSON.stringify(job, null, 2))}>Download JSON</button>
}
export function ExportCSV({ job }) {
  if (!job) return null;
  const toCSV = (j) => {
    const base = `id,name,status,owner,lastStart,lastEnd,durationSec,nextRun,dependencies\n`+
      `${j.id},${j.name||''},${j.status||''},${j.owner||''},${j.lastRunStart||''},${j.lastRunEnd||''},${j.durationSec||''},${j.nextRun||''},"${(j.dependencies||[]).join(';')}"`;
    return base;
  };
  return <button onClick={()=> download(`${job.id}.csv`, toCSV(job))}>Download CSV</button>
}
