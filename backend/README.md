# Katove Backend

Express.js API server for the Katove e-commerce platform.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (provides PostgreSQL database and file storage)

## Quick Start

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your values

# Start the server
npm start
```

The server runs on `http://localhost:3001` by default.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Port the server listens on |
| `BASE_URL` | No | `http://localhost:PORT` | Public URL of the API (used in responses) |
| `CORS_ORIGIN` | **Yes** | `http://localhost:3000` | Allowed origin for CORS (your frontend URL) |
| `ADMIN_PASSWORD` | **Yes** | — | Password for admin login |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWT tokens |
| `SUPABASE_URL` | **Yes** | — | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service-role key (server-side only) |

## Deploy

### Docker

```bash
docker build -t katove-backend .
docker run -p 3001:3001 --env-file .env katove-backend
```

### Railway / Render / Fly.io

1. Push the `backend/` directory to a new Git repository (or use a mono-repo deploy path).
2. Set the **root directory** to `backend` (or the repo root if it only contains backend code).
3. Add all environment variables from `.env.example` in the platform dashboard.
4. Set the **start command** to `npm start`.
5. Set `CORS_ORIGIN` to your deployed frontend URL (e.g. `https://katove.vercel.app`).

### Heroku

```bash
# From the backend/ directory
heroku create katove-backend
heroku config:set PORT=3001 CORS_ORIGIN=https://your-frontend.vercel.app ...
git push heroku main
```

## API Overview

| Category | Endpoints |
|---|---|
| Auth | `POST /api/admin/login` |
| Products | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id` |
| Categories | `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/:id` |
| Orders | `GET/POST /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status` |
| Installments | `POST /api/installments/request`, `GET /api/installments` |
| Affiliates | `POST /api/affiliates/register`, `GET /api/affiliates/dashboard` |
| Settings | `GET/POST /api/settings` |
| Profile | `GET/PUT /api/profile` |
| Admin | `GET /api/admin/stats` |

## Connecting to the Frontend

Set `CORS_ORIGIN` to the URL where your frontend is deployed. The frontend must set its `NEXT_PUBLIC_API_URL` environment variable to the URL where this backend is deployed.
