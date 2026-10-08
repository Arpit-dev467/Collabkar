# Backend

Simple Express backend for the frontend.

## Endpoints

- `GET /health` -> `{ ok: true }`
- `POST /api/waitlist` -> saves waitlist submissions (webhook or local CSV)
- `POST /api/pricing-suggestion` -> returns pricing suggestion JSON
- `POST /api/influencer` -> submit Instagram username + manual stats (no scraping)
- `GET /api/influencer/verify-code?username=...` -> generate a verification code
- `POST /api/influencer/verify` -> mark influencer as verified
- `GET /api/campaigns/mine` -> list campaigns owned by the authenticated brand
- `GET /api/campaigns/active` -> list active campaigns
- `POST /api/campaigns` -> create a campaign
- `PATCH /api/campaigns/:id` -> update a campaign
- `POST /api/ai/price` -> local AI pricing prediction without a separate Python service
- `POST /api/ai/analyze` -> local creator analysis with pricing, niche, and fake-risk estimates
- `POST /api/ai/match` -> local creator matching for a provided list of creators
- `GET /api/ai/health` -> confirms the backend-local AI mode is active

## Environment

Create `backend/.env` (or set env vars in your shell):

```bash
PORT=4001
CORS_ORIGIN=http://localhost:3000
AUTH_JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
AUTH_JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@localhost:5432/collabkar
APP_BASE_URL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_EMAIL="CollabKar <onboarding@yourdomain.com>"
WAITLIST_FILE_PATH=C:\path\to\waitlist-emails.csv
WAITLIST_WEBHOOK_URL=https://your-pc-bridge-url.example.com/waitlist
```

Production requires PostgreSQL, a JWT secret of at least 32 characters, an HTTPS
`APP_BASE_URL`, and both Resend settings. Verification links are only logged in
non-production development when Resend is not configured.

Apply the SQL files in `src/db/migrations` to create the PostgreSQL tables.

## Run

```bash
cd backend
npm install
npm run dev
```

## AI Folder Compatibility

The checked-in `AI/influencer_analytics` training code still depends on packages like
`pandas` and `scikit-learn`, which may not install yet on Python 3.14.

For local development, the backend now uses a built-in heuristic AI layer instead of
requiring a separate FastAPI service.

If you want a Python-side runtime that still works on Python 3.14, you can use:

```bash
python AI/influencer_analytics/runtime.py health
```

## Run with Docker

From the repo root:

```bash
docker compose up --build
```
