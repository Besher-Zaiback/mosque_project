# Quran Circles Platform

A web platform for managing Quran memorization circles in mosques.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: NestJS, TypeScript, TypeORM
- Database: PostgreSQL
- Runtime: Docker Compose

## Features

- Circle supervisor dashboard for student review and page evaluations
- Mosque manager dashboard for student and exam request management
- General manager dashboard for exam result approval
- Parent dashboard for tracking a linked student's progress

## Run With Docker

From the project root:

```bash
docker compose up --build
```

App URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

Run in the background:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove database data:

```bash
docker compose down -v
```

Optional root `.env` values:

```bash
JWT_SECRET=change_this_secret
VITE_API_BASE_URL=http://localhost:3000
```

## Run Locally

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Start the backend:

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Demo Accounts

All demo accounts use the password `123456`.

- `supervisor@example.com`
- `manager@example.com`
- `general@example.com`
- `parent@example.com`
