# Katove Frontend

Next.js storefront for the Katove e-commerce platform.

## Prerequisites

- Node.js 20+
- A running [Katove Backend](../backend/README.md) instance
- A [Supabase](https://supabase.com) project

## Quick Start

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start the dev server
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | URL of the Katove backend API (e.g. `http://localhost:3001`) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous (public) key |

> All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Build for Production

```bash
npm run build   # creates .next/ output
npm start       # serves the production build on port 3000
```

## Deploy

### Vercel (Recommended)

1. Push the `frontend/` directory to a new Git repository (or set the **root directory** to `frontend`).
2. Import the repo in [Vercel](https://vercel.com).
3. Add the environment variables from `.env.example` in **Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL (e.g. `https://katove-backend.railway.app`).
5. Deploy.

### Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-backend-url.com \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -t katove-frontend .

docker run -p 3000:3000 katove-frontend
```

> **Note:** `NEXT_PUBLIC_*` variables are baked into the build at build time, so they must be passed as `--build-arg` during `docker build`.

### Netlify / Cloudflare Pages

1. Set the **build command** to `npm run build`.
2. Set the **output directory** to `.next` (the platform adapter handles the standalone output).
3. Add environment variables in the platform dashboard.
4. You may need a platform-specific adapter (e.g. `@netlify/plugin-nextjs`) for full Next.js support.

## Connecting to the Backend

Set `NEXT_PUBLIC_API_URL` to the URL where your backend is deployed. The backend must set its `CORS_ORIGIN` environment variable to the URL where this frontend is hosted.

### Example

| Service | URL | Env Var |
|---|---|---|
| Frontend (Vercel) | `https://katove.vercel.app` | Backend sets `CORS_ORIGIN=https://katove.vercel.app` |
| Backend (Railway) | `https://katove-api.railway.app` | Frontend sets `NEXT_PUBLIC_API_URL=https://katove-api.railway.app` |
