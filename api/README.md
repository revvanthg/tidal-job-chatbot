# API (Cloud Run + Firestore)

## Local run
```bash
npm i
export SEED_TOKEN="myseed_123"
node index.js
```

## Deploy
```bash
gcloud run deploy tidal-bot-api   --source .   --region asia-south1   --allow-unauthenticated   --set-env-vars SEED_TOKEN=$SEED_TOKEN   --min-instances=0
```

## Seed 10 jobs
```bash
export API_URL="https://<your-cloud-run-url>"
curl -X POST "$API_URL/admin/seed" -H "x-seed-token: $SEED_TOKEN"
```
