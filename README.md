# Polsia MVP

**AI That Runs Your Company While You Sleep**

An autonomous AI agent platform that plans, codes, deploys, and markets micro-SaaS businesses — running 24/7 daily cycles.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│              Next.js 14 + Tailwind               │
│    Landing Page │ Auth │ Dashboard │ Detail       │
└──────────────────────┬──────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────┐
│                   Backend                        │
│                FastAPI + SQLAlchemy               │
│   Auth │ Companies │ Agent Routes │ Webhooks      │
└──────┬────────────────────────────┬─────────────┘
       │                            │
┌──────┴──────┐          ┌──────────┴────────────┐
│  PostgreSQL  │          │    Celery + Redis      │
│   Database   │          │   Task Queue + Beat    │
└─────────────┘          └──────────┬─────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │        AI Agent Pipeline     │
                     │  Planner → Coder → Deployer  │
                     │        → Marketer            │
                     │      (OpenAI GPT-4)          │
                     └─────────────────────────────┘
```

## Features

- **User Authentication** — JWT-based signup/login with secure password hashing
- **Company Management** — Create, view, update, and delete AI-run companies
- **AI Idea Generator** — GPT-4 powered business idea suggestions
- **Autonomous Agent Cycles** — 4-phase pipeline:
  - **Plan** — AI analyzes company state and creates actionable tasks
  - **Code** — AI generates full-stack code and writes files
  - **Deploy** — Containerized deployment with Docker (simulated in MVP)
  - **Market** — AI generates landing pages, social posts, SEO content
- **Task Queue** — Celery + Redis for async agent cycles
- **Scheduled Cycles** — Celery Beat runs daily cycles at 6 AM UTC
- **Dashboard** — Real-time stats, company list, agent logs, task tracking
- **Pricing Tiers** — Free (5 tasks) and Pro ($49/mo, 45 tasks, 20% revenue share)

## Quick Start

### Prerequisites

- Docker & Docker Compose
- An OpenAI API key

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/polsia-mvp.git
cd polsia-mvp
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Start with Docker Compose

```bash
docker compose up --build
```

This starts:
- **Frontend** at http://localhost:3000
- **Backend API** at http://localhost:8000
- **API Docs** at http://localhost:8000/docs
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Celery Worker** for async tasks
- **Celery Beat** for scheduled cycles

### 3. Use the App

1. Visit http://localhost:3000
2. Create an account
3. Create a new company (or let AI suggest an idea)
4. Run an agent cycle and watch the AI work

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your config

# Start the API
uvicorn app.main:app --reload --port 8000

# In another terminal — start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info

# In another terminal — start Celery beat
celery -A app.tasks.celery_app beat --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Sign in |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/companies/` | List companies |
| POST | `/api/v1/companies/` | Create company |
| GET | `/api/v1/companies/{id}` | Get company |
| PATCH | `/api/v1/companies/{id}` | Update company |
| DELETE | `/api/v1/companies/{id}` | Delete company |
| GET | `/api/v1/companies/{id}/logs` | Get agent logs |
| GET | `/api/v1/companies/{id}/tasks` | Get tasks |
| GET | `/api/v1/companies/dashboard/stats` | Dashboard stats |
| POST | `/api/v1/agent/suggest-idea` | AI idea generator |
| POST | `/api/v1/agent/run-cycle` | Run agent cycle |
| POST | `/api/v1/agent/run-all` | Run all cycles |

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Zustand, Lucide Icons
- **Backend:** FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **AI:** OpenAI GPT-4
- **Database:** PostgreSQL 16
- **Queue:** Celery + Redis
- **Deployment:** Docker + Docker Compose

## Project Structure

```
polsia-mvp/
├── backend/
│   ├── app/
│   │   ├── agent/          # AI agent pipeline
│   │   │   ├── planner.py  # Phase 1: Planning
│   │   │   ├── coder.py    # Phase 2: Code generation
│   │   │   ├── deployer.py # Phase 3: Deployment
│   │   │   ├── marketer.py # Phase 4: Marketing
│   │   │   └── orchestrator.py  # Cycle coordinator
│   │   ├── api/            # API routes & schemas
│   │   ├── core/           # Config, DB, security
│   │   ├── models/         # SQLAlchemy models
│   │   ├── services/       # Business logic
│   │   └── tasks/          # Celery tasks & scheduler
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── hooks/          # React hooks (auth)
│   │   └── lib/            # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Roadmap

- [ ] Real Docker-based deployment (build & run containers)
- [ ] Stripe payment integration
- [ ] WebSocket for real-time agent logs
- [ ] Custom domain support
- [ ] GitHub integration (auto-commit generated code)
- [ ] Analytics dashboard with revenue tracking
- [ ] Multi-model support (Claude, Gemini, local models)
- [ ] Email integration for customer support

## License

MIT
