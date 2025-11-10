# Tidal Job Chat Bot — Cloud Run + Firestore + Firebase Hosting (Zero Cost Demo)

This zip contains:
- `api/` — Cloud Run (Node/Express) API using Firestore
- `web/` — React (Vite) messenger UI

## Prereqs
- Node 18+, Git
- gcloud CLI (`gcloud auth login`), Firebase CLI (`npm i -g firebase-tools && firebase login`)
- GCP project selected: `gcloud config set project YOUR_GCP_PROJECT`
- In console: Create **Firestore (Native mode)** once (region e.g., `asia-south1`).

## Enable services
```bash
gcloud services enable run.googleapis.com firestore.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 1) Deploy API to Cloud Run
```bash
cd api
npm i
export SEED_TOKEN="myseed_123"      # choose any random string
gcloud run deploy tidal-bot-api   --source .   --region asia-south1   --allow-unauthenticated   --set-env-vars SEED_TOKEN=$SEED_TOKEN   --min-instances=0

# Copy the service URL printed by the command
export API_URL="https://<your-cloud-run-url>"
```

### Seed 10 jobs (dummy)
```bash
curl -X POST "$API_URL/admin/seed" -H "x-seed-token: $SEED_TOKEN"
curl "$API_URL/health"
curl "$API_URL/jobs?query=rms"
```

## 2) Run Web locally
```bash
cd ../web
npm i
export VITE_API_BASE="$API_URL"
npm run dev   # open the local URL it prints
```

## 3) Deploy Web to Firebase Hosting (Spark free plan)
```bash
npm run build
firebase init hosting
# existing project -> select your GCP project
# public dir: dist
# single page app: Yes
firebase deploy --only hosting
```

## Demo notes
- Type `RMS_01` to fetch a job, see status, last start/end, duration, next run, dependencies & owner.
- Click **Start/Stop/Rerun** to simulate actions (history updates). 
- Download JSON/CSV using buttons.
```

