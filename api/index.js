import express from 'express';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const db = new Firestore();
const JOBS = db.collection('jobs');

// Helpers
const fmt = (d) => d ? new Date(d).toISOString() : null;
const durationSec = (startIso, endIso) => {
  if (!startIso || !endIso) return null;
  const ms = new Date(endIso) - new Date(startIso);
  return Math.max(0, Math.round(ms / 1000));
};

app.get('/health', (req, res) => res.json({ ok: true }));

// GET /jobs?query=abc
app.get('/jobs', async (req, res) => {
  try {
    const q = (req.query.query || '').toString().trim().toLowerCase();
    const snap = await JOBS.get();
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const filtered = q
      ? all.filter(j =>
          j.id.toLowerCase().includes(q) ||
          (j.name || '').toLowerCase().includes(q)
        )
      : all;
    const ranked = filtered.sort((a,b) => {
      if (!q) return a.id.localeCompare(b.id);
      const as = a.id.toLowerCase().startsWith(q) || (a.name||'').toLowerCase().startsWith(q);
      const bs = b.id.toLowerCase().startsWith(q) || (b.name||'').toLowerCase().startsWith(q);
      if (as && !bs) return -1;
      if (!as && bs) return 1;
      return a.id.localeCompare(b.id);
    }).slice(0, 20);
    res.json({ total: filtered.length, items: ranked });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// GET /jobs/:id
app.get('/jobs/:id', async (req, res) => {
  try {
    const ref = JOBS.doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// POST /jobs/:id/actions { type: 'start'|'stop'|'rerun' }
app.post('/jobs/:id/actions', async (req, res) => {
  try {
    const { type } = req.body || {};
    const ref = JOBS.doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    const j = { id: snap.id, ...snap.data() };

    const now = new Date();
    let updates = {};
    let history = Array.isArray(j.history) ? [...j.history] : [];

    if (type === 'start') {
      updates.status = 'Running';
      updates.lastRunStart = fmt(now);
      updates.lastRunEnd = null;
      updates.durationSec = null;
    } else if (type === 'stop') {
      const end = fmt(now);
      const st = j.lastRunStart || end;
      const dur = durationSec(st, end);
      updates.status = 'Failed';
      updates.lastRunEnd = end;
      updates.durationSec = dur;
      history.unshift({ start: st, end, status: 'Failed', durationSec: dur });
    } else if (type === 'rerun') {
      const start = fmt(now);
      const end = fmt(new Date(now.getTime() + 2 * 60 * 1000));
      const dur = durationSec(start, end);
      updates.status = 'Success';
      updates.lastRunStart = start;
      updates.lastRunEnd = end;
      updates.durationSec = dur;
      history.unshift({ start, end, status: 'Success', durationSec: dur });
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const next = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    updates.nextRun = fmt(next);
    updates.history = history.slice(0, 20);

    await ref.set({ ...updates }, { merge: true });
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// POST /admin/seed with header x-seed-token = SEED_TOKEN
const SEED_TOKEN = process.env.SEED_TOKEN || '';
app.post('/admin/seed', async (req, res) => {
  try {
    if (!SEED_TOKEN || req.headers['x-seed-token'] !== SEED_TOKEN)
      return res.status(401).json({ error: 'Unauthorized' });

    const raw = fs.readFileSync(new URL('./seed.json', import.meta.url), 'utf-8');
    const items = JSON.parse(raw);

    const existing = await JOBS.limit(1).get();
    if (!existing.empty) {
      return res.json({ ok: true, note: 'Already seeded' });
    }

    const batch = db.batch();
    for (const j of items) {
      const ref = JOBS.doc(j.id);
      batch.set(ref, j);
    }
    await batch.commit();
    res.json({ ok: true, count: items.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
