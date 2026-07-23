# Database

The Prisma ORM schema is now the implementation source of truth:

- `../prisma/schema.prisma`

This folder keeps the original PostgreSQL SQL export as a reference:

- `001_initial_schema.sql` - normalized LMS schema covering organization setup, users, roles, course catalog, course builder, programs, cohorts, quizzes, assignments, surveys, certificates, XP, leaderboards, TNA, approvals, notifications, reporting, and audit logs.

## Prisma Workflow

After Prisma is installed, use:

```powershell
npx.cmd prisma generate
npx.cmd prisma migrate dev --name initial_lms_schema
```

Example connection string:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/enterprise_lms"
```

The frontend prototype is still static. The next implementation step is to add a backend API and connect the React screens to Prisma queries and mutations.
