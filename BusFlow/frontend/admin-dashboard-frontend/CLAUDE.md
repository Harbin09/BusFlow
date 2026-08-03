# CLAUDE.md — Bus Flow Transit  SaaS


## # Project
Bus Flow SaaS is an AI-powered B2B platform enabling universities to optimize campus transit via live bus tracking, academic timetable sync, weather-aware predictive ETAs, and real-time fleet management.
- **Frontend Stack:** Next.js, React, TypeScript, Tailwind CSS (Deployed on Vercel).
- **Backend Stack:** FastAPI, Uvicorn, Pydantic (Deployed on Railway).
- **Database & Auth:** Supabase PostgreSQL, SQLAlchemy ORM, Alembic Migrations, Clerk Authentication.
- **APIs & AI Layer:** Google Maps API, Weather API, Traffic API, OpenAI API.

## # Conventions
- **TypeScript & Python Typing:** Strict TypeScript on frontend (`noImplicitAny`). Explicit Pydantic schemas and Python type hints on backend.
- **Styling:** Tailwind CSS for all UI components.
- **Architecture:** 
  - Frontend components in `src/components/`, pages in `src/app/` (Next.js App Router).
  - Backend modules in `backend/app/` (`routers/`, `services/`, `models/`, `schemas/`).
  - Database models in `models.py` with migrations via `alembic/`.
- **Code Style:** Clean, modular, self-documenting code. Explicit error handling for live GPS streams, map renders, and weather API failures.

## # Testing
- **Run Tests:** `npm test` (Frontend) | `pytest` (Backend).
- **Test Structure:** Unit and integration tests placed in `__tests__/` (Frontend) and `tests/` (Backend).
- **Coverage Rule:** Every core feature (Clerk Auth, Live Tracking, Timetable Sync, AI ETA Calculation, Weather Cron/Alerts) must have at least one passing test before PR merge.

## # Git Workflow
- **Branching:** Feature branch workflow (`feat/timetable-sync`, `feat/ai-eta-calc`, `fix/tracking-latency`).
- **Commit Messages:** Standardized prefixes: `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `test: ...`.
- **Main Protection:** Never push directly to `main`. Require PR review and passing tests prior to deployment.

## # Boundaries
- **Destructive Actions:** Do NOT drop database tables or run destructive Alembic downgrades without asking.
- **Environment & Secrets:** Do NOT touch, expose, or commit `.env` or API secret keys (Clerk, OpenAI, Maps, Supabase).
- **Dependencies:** Do NOT install new npm or pip packages without explicit user confirmation.
- **Scope Safeguards:** Strictly NO bus ownership/hardware management modules, ride-hail price aggregators, or QR boarding features for MVP.

---
