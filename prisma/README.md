# Prisma Schema

`schema.prisma` is the source of truth for the LMS backend data model.

## Setup

Install Prisma when the backend package is ready:

```powershell
npm.cmd install @prisma/client
npm.cmd install --save-dev prisma
```

Then set the database URL:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/enterprise_lms"
```

## Common Commands

```powershell
npx.cmd prisma generate
npx.cmd prisma migrate dev --name initial_lms_schema
npx.cmd prisma studio
```

The schema mirrors the normalized SQL model while making Prisma the app-facing ORM layer for future API implementation.
