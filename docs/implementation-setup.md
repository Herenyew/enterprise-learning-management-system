# Implementation Setup

This workspace now follows the requested frontend and backend folder structure.

## Repository Setup

When the empty repository URL is available:

```powershell
git clone <repository-url> enterprise-lms
```

Then copy this project into that cloned repository or push this workspace to the new remote.

## Frontend Structure

The existing Vite React prototype remains in `src/app`. Supporting folders were added from the company template:

- `src/app/API` - API clients and network functions
- `src/app/components` - reusable UI components
- `src/app/constants` - shared route/config constants
- `src/app/models` - TypeScript models
- `src/app/pages` - future route-level page containers
- `src/app/schemas` - validation schemas
- `src/assets` - images, SVGs, and static assets imported by the app
- `src/store` - global state setup
- `src/utils` - pure helper functions

Frontend environment variables are documented in `.env.example`.

## Backend Structure

The backend lives in `backend/` and follows the Postgres, Express, Node.js, and Prisma structure:

- `backend/prisma/schema.prisma` - Prisma schema copied from the normalized LMS model
- `backend/prisma/migrations` - generated Prisma migrations
- `backend/prisma/seed.ts` - initial seed data
- `backend/src/config` - environment and database setup
- `backend/src/controllers` - request/response handlers
- `backend/src/routes` - Express route registration
- `backend/src/services` - business logic and Prisma operations
- `backend/src/middlewares` - reusable middleware
- `backend/src/utils` - logging and helper utilities
- `backend/src/types` - shared TypeScript types
- `backend/src/app.ts` - Express app configuration
- `backend/src/server.ts` - server bootstrap

The folder also includes `backend/src/modules/health` as the starting point for the feature-based architecture recommended in the backend PDF.

## Environment Variables

Copy the examples before running locally:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

Update the values in `backend/.env`, especially:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- email provider values, when email is implemented
- Google Drive credentials, when uploads are implemented

## Local Database

Start Postgres and Redis:

```powershell
docker compose up -d
```

Then from `backend/`:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate -- --name initial_lms_schema
npm run db:seed
npm run dev
```

Run the frontend from the repository root:

```powershell
npm install
npm run dev
```

Health check:

```text
http://localhost:4000/api/health
```
