# Deploy: Vercel (frontend) + Railway (backend) + Atlas (DB)

Repo: `Rohan-1208/toying_idea`

## Backend (Railway)

### 1) Create the service

1. Railway → New Project → **Deploy from GitHub Repo**
2. Select `toying_idea`
3. Set **Root Directory** to `apps/backend`

### 2) Start command

Railway should detect Python, install `requirements.txt`, and run the Procfile:

- [Procfile](file:///c:/Users/Rohan/Downloads/toying%20idea/apps/backend/Procfile)

### 3) Environment variables

Set these in Railway:

- `MONGODB_URI` = Atlas connection string (mongodb+srv://...)
- `MONGODB_DB` = `toying_idea`
- `JWT_SECRET` = long random string
- `CORS_ORIGINS` = `https://<your-vercel-domain>`
- `ADMIN_EMAIL` = your admin email
- `ADMIN_PASSWORD` = your admin password

### 4) Verify

After deploy, Railway gives a public URL:

- `https://<your-railway-app>.up.railway.app/health` → `{"ok":true}`
- `https://<your-railway-app>.up.railway.app/api/products` → JSON

## Frontend (Vercel)

### 1) Import project

1. Vercel → Add New → **Project**
2. Import `Rohan-1208/toying_idea`
3. Set **Root Directory** to `apps/storefront`

### 2) Environment variables

Set in Vercel (Production + Preview):

- `BACKEND_URL` = `https://<your-railway-app>.up.railway.app`

This powers the Next.js rewrite in [next.config.ts](file:///c:/Users/Rohan/Downloads/toying%20idea/apps/storefront/next.config.ts) that proxies `/api/*` to the backend.

### 3) Verify

After deploy:

- `https://<your-vercel-domain>/api/products` should return JSON
- Admin: `https://<your-vercel-domain>/admin`

## Atlas (DB)

- Ensure Network Access allows Railway outbound traffic (for early testing, `0.0.0.0/0`).
- Ensure the DB user has read/write permissions.

