# School Platform Backend

This backend will be built with NestJS + Prisma + PostgreSQL. While Node scaffolding is pending, this README documents structure, database models, and local setup.

## Stack
- Runtime: Node.js (NestJS)
- ORM: Prisma
- DB: PostgreSQL (Docker)
- Auth: JWT + RBAC (Admin/Teacher/Student)

## Local Setup (DB)
1) Start Postgres and Adminer:
   - `docker compose up -d`
2) Adminer UI: http://localhost:8080
   - System: PostgreSQL
   - Server: db
   - Username: school
   - Password: schoolpass
   - Database: school_app

## Environment
Create `backend/.env` (already added) with:
```
DATABASE_URL="postgresql://school:schoolpass@localhost:5432/school_app?schema=public"
```

## Prisma
- Schema path: `backend/prisma/schema.prisma`
- After Node is ready:
  - `pnpm dlx prisma generate`
  - `pnpm dlx prisma migrate dev --name init`

## Modules (planned)
- Auth (JWT, refresh) + RBAC guards
- Users, Grades, Classes, Subjects, Units, Lessons, Content Assets
- Assignments/Quizzes, Questions, Submissions, Grading
- Reports (PDF/Excel)
- Messaging (class channel) — optional in MVP 1

## Notes
- Content assets support multiple languages (en, tr) via language field.
- ClassSubject binds a subject to a class with a specific teacher.
- Assignments can act as quizzes when questions are attached.
