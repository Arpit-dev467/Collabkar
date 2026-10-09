# COLLABKAR (Hackathon Build)

CollabKar connects **creators** and **brands** to run campaigns, manage deliverables, and track payouts — with role-based dashboards.

Live demo: https://collabkar-inqz.vercel.app/

## What’s Included

- Creator signup/login + dashboard
- Brand signup/login + dashboard
- Admin login (username: `admin`, password: `1234`) with access to both dashboards
- Waitlist capture endpoint
- AI pricing suggestion endpoint

## Tech Stack

- Frontend: Next.js (App Router) + Tailwind + Framer Motion
- Backend: Node.js + Express

## Quick Start (Local)

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4001`.

### 2) Frontend

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Routes

- `/login`
- `/signup`
- `/dashboard` (redirects based on role)
  - `/dashboard/creator`
  - `/dashboard/brand`
  - `/dashboard/admin`

## Backend API

- `POST /api/auth/signup` → `{ email, password, role: creator|brand }`
- `POST /api/auth/login` → `{ identifier: email|admin, password }`
- `GET /api/auth/me` (Bearer token)
- `POST /api/waitlist`
- `POST /api/pricing-suggestion`

## Notes (Hackathon)

- User accounts are stored in `backend/data/users.json` for speed of development.
- For production: move users to a DB, store JWT secret securely, add rate limiting + validation.

## Deploy (Fast)

### Option A: Render (recommended for hackathons)

This repo includes a Render Blueprint: `render.yaml`.

1. Create a new Render Blueprint from this GitHub repo
2. When prompted, set:
   - Backend `CORS_ORIGIN` = your frontend URL (e.g. `https://collabkar-frontend.onrender.com`)
   - Frontend `NEXT_PUBLIC_BACKEND_URL` = your backend URL (e.g. `https://collabkar-backend.onrender.com`)
3. Deploy

### Option B: Vercel (frontend) + Render/Fly (backend)

- Deploy `frontend/` to Vercel (set Root Directory to `frontend`)
- Deploy `backend/` to your backend host
- Set `NEXT_PUBLIC_BACKEND_URL` in Vercel to the backend URL
