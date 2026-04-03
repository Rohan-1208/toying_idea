# Deploy on Render

This repo is a monorepo:

- Frontend (Next.js): `apps/storefront`
- Backend (FastAPI): `apps/backend`
- Database: MongoDB (recommended: MongoDB Atlas)

## Why Atlas for MongoDB

Render does not provide a managed MongoDB database. The simplest reliable setup is:

- Render for backend + frontend
- MongoDB Atlas for the database

You *can* self-host MongoDB on Render using a private service + persistent disk, but that’s more fragile and more operational work.

## One-click Render deploy (Blueprint)

This repo includes a Render Blueprint: [render.yaml](file:///c:/Users/Rohan/Downloads/toying%20idea/render.yaml)

In Render:

1. Create a new **Blueprint** from your GitHub repo.
2. Render will create two web services:
   - `toying-backend`
   - `toying-storefront`

## Environment variables

### Backend (`toying-backend`)

Set these in the Render dashboard (do not commit secrets):

- `MONGODB_URI` = your Atlas connection string
- `MONGODB_DB` = `toying_idea` (or your DB name)
- `JWT_SECRET` = long random string
- `CORS_ORIGINS` = `https://<toying-storefront>.onrender.com`
- `ADMIN_EMAIL` = your admin email
- `ADMIN_PASSWORD` = your admin password

Notes:

- MongoDB Atlas: allow network access from `0.0.0.0/0` during early testing or configure Render outbound IPs.
- Admin user is ensured on backend startup from `ADMIN_EMAIL` + `ADMIN_PASSWORD`.

### Frontend (`toying-storefront`)

- `BACKEND_URL` = `https://<toying-backend>.onrender.com`

This is required because the Next.js app proxies `/api/*` to the backend via rewrite rules.

## Health check

Backend:

- `https://<toying-backend>.onrender.com/health` should return `{"ok": true}`

Frontend:

- `https://<toying-storefront>.onrender.com/`

## Admin access

- Admin panel is only accessible at `/admin` (no public links).

After deploy:

1. Visit `https://<toying-storefront>.onrender.com/admin`
2. Login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. Manage products, orders, and order statuses.

