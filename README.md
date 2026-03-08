# Katove — E-Commerce Platform

Full-stack e-commerce application built with **Next.js** (frontend) and **Express.js** (backend), backed by **Supabase**.

## Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │  REST   │   Backend    │         │   Supabase   │
│  (Next.js)   │───────▶│  (Express)   │───────▶│  (Postgres + │
│  Port 3000   │  API    │  Port 3001   │         │   Storage)   │
└──────────────┘         └──────────────┘         └──────────────┘
```

The frontend and backend are **independent services** that can be deployed separately. They communicate via REST API calls.

## Repository Structure

```
katove/
├── frontend/          # Next.js 16 + React 19 + TypeScript + Tailwind CSS
│   ├── README.md      # Frontend-specific setup & deployment guide
│   ├── .env.example   # Required environment variables
│   └── Dockerfile
├── backend/           # Express.js 5 + Node.js API server
│   ├── README.md      # Backend-specific setup & deployment guide
│   ├── .env.example   # Required environment variables
│   └── Dockerfile
└── docker-compose.yml # Run both services locally with one command
```

## Quick Start (Local Development)

### Option A: Run each service separately

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env        # fill in your Supabase credentials
npm install
npm start                   # http://localhost:3001

# Terminal 2 — Frontend
cd frontend
cp .env.example .env.local  # fill in your API URL + Supabase keys
npm install
npm run dev                 # http://localhost:3000
```

### Option B: Docker Compose

```bash
# Fill in env files first (see .env.example in each directory)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

docker compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:3001
```

## Deploying as Separate Services

The frontend and backend are designed to be deployed independently. Each directory is a self-contained application with its own `package.json`, `Dockerfile`, and deployment instructions.

### Splitting into Separate Repositories

To deploy as two completely separate repos:

```bash
# Create katove-backend repo
mkdir katove-backend
cp -r backend/* backend/.* katove-backend/ 2>/dev/null
cd katove-backend && git init && git add . && git commit -m "Initial commit"

# Create katove-frontend repo
mkdir katove-frontend
cp -r frontend/* frontend/.* katove-frontend/ 2>/dev/null
cd katove-frontend && git init && git add . && git commit -m "Initial commit"
```

### Recommended Deployment Platforms

| Service | Platform | Why |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Zero-config Next.js hosting, automatic deployments |
| **Backend** | [Railway](https://railway.app) or [Render](https://render.com) | Easy Node.js hosting with environment variable management |
| **Database** | [Supabase](https://supabase.com) | Already integrated — PostgreSQL + Auth + Storage |

### Connecting the Services

After deploying both services, update the environment variables so they point to each other:

| Where | Variable | Value |
|---|---|---|
| **Frontend** | `NEXT_PUBLIC_API_URL` | URL of your deployed backend (e.g. `https://katove-api.railway.app`) |
| **Backend** | `CORS_ORIGIN` | URL of your deployed frontend (e.g. `https://katove.vercel.app`) |

See each service's `README.md` for detailed deployment instructions:
- [Frontend Deployment Guide](frontend/README.md)
- [Backend Deployment Guide](backend/README.md)
