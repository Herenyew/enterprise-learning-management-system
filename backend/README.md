# Enterprise LMS Backend

Express, Node.js, PostgreSQL, and Prisma backend for the Enterprise LMS implementation.

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name initial_lms_schema
npm run db:seed
npm run dev
```

The API starts at:

```text
http://localhost:4000/api
```

Health endpoint:

```text
http://localhost:4000/api/health
```
