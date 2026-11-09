# Veloria

Veloria is a full-stack notes app for creating, viewing, editing, searching, and deleting notes. It is deployed and uses PostgreSQL to persist notes.

## Live app

- **Frontend:** [https://veloria-note.vercel.app](https://veloria-note.vercel.app)
- **API health:** [https://veloria-api-6v1j.onrender.com/api/health](https://veloria-api-6v1j.onrender.com/api/health)

The frontend is hosted on Vercel, the Express API on Render, and PostgreSQL on Neon.

> **Security note:** Veloria currently has no authentication or per-user access control. Anyone who can reach the public app/API may be able to read, create, update, or delete notes. Do not store private or sensitive information.

## Features

- Create, view, edit, and delete notes
- PostgreSQL persistence through Prisma
- Search notes by title and content
- Dedicated page for each note
- Input validation and readable error messages
- Loading, success, and error states
- Confirmation before deleting
- Responsive layout

## Technology

| Part | Stack |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL, Prisma ORM 5 |
| Hosting | Vercel (frontend), Render (API), Neon (database) |

## Run locally

### Requirements

- Node.js 18.18 or newer and npm
- Docker with Docker Compose, or another PostgreSQL server

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d db
docker compose ps
```

Wait until the database reports `healthy`.

The local Compose database uses:

- Database: `notes_db`
- Username: `notes_user`
- Password: `notes_password`
- Port: `5432`

These are development-only credentials.

### 2. Configure and run the backend

In a second terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

The API listens at `http://localhost:5000`. Check its database connection at <http://localhost:5000/api/health>.

If port `5432` is already in use, change the host-side port in `docker-compose.yml` and update the port in `backend/.env` to match.

### 3. Configure and run the frontend

In a third terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL |
| `PORT` | No | API port; defaults to `5000`. Render supplies its own port. |
| `NODE_ENV` | No | Runtime mode |
| `CORS_ORIGIN` | No | Comma-separated allowed browser origins; defaults to `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL, including `/api` |

The frontend embeds `NEXT_PUBLIC_API_URL` during its build. Restart the dev server or make a new production deployment after changing it.

Real `.env` and `.env.local` files are ignored by Git. Never commit database credentials.

## API

Local base URL: `http://localhost:5000/api`

Production base URL: `https://veloria-api-6v1j.onrender.com/api`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | API and database health |
| `GET` | `/notes` | List notes, most recently edited first |
| `GET` | `/notes/:id` | Get a note |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes/:id` | Replace a note's title and content |
| `DELETE` | `/notes/:id` | Delete a note |

Create and update requests use JSON with a non-empty `title` (up to 120 characters) and `content` (up to 10,000 characters):

```json
{
  "title": "A note",
  "content": "Note contents"
}
```

The API responds with JSON success/error envelopes. It returns validation errors for invalid input, `404` for missing notes/routes, and `503` when PostgreSQL is unavailable. The health endpoint returns `200` when the database is connected and `503` when it is not.

## Checks and database commands

Run backend commands from `backend/`:

```bash
npm run typecheck
npm run build
npm run test:smoke
```

The smoke test requires the API and database to be running. It creates and removes its own test note. To test a different API:

```bash
API_URL=https://veloria-api-6v1j.onrender.com/api npm run test:smoke
```

Run frontend checks from `frontend/`:

```bash
npm run typecheck
npm run lint
npm run build
```

Prisma commands (from `backend/`):

| Command | Use |
| --- | --- |
| `npm run prisma:migrate` | Local development: create/apply migrations |
| `npm run prisma:deploy` | Apply committed migrations to a deployment database |
| `npm run prisma:studio` | Open Prisma Studio to inspect database rows |

## Deployment

The production services are configured as follows:

### Neon database

Create a PostgreSQL database in Neon. Keep its connection URL private. The backend uses the direct/unpooled connection URL as `DATABASE_URL`.

Apply committed migrations to the production database from the `backend/` directory:

```bash
npm run prisma:deploy
```

Set `DATABASE_URL` in the deployment environment for the command, and do not put credentials in source control or chat.

### Render API

Connect the GitHub repository and configure:

- **Root directory:** `backend`
- **Build command:** `npm install --include=dev && npm run build`
- **Start command:** `npm start`
- **Environment variables:**
  - `DATABASE_URL`: Neon direct/unpooled connection URL
  - `NODE_ENV`: `production`
  - `CORS_ORIGIN`: `https://veloria-note.vercel.app`

The free Render plan does not provide a pre-deploy command, so run `npm run prisma:deploy` separately as described above when a migration needs to be applied.

### Vercel frontend

Connect the repository and configure:

- **Root directory:** `frontend`
- **Environment variable:** `NEXT_PUBLIC_API_URL=https://veloria-api-6v1j.onrender.com/api`

Redeploy the frontend after changing its environment variables.

## Project layout

```text
backend/
  prisma/       Prisma schema and migrations
  scripts/      API smoke test
  src/          Express app, routes, controllers, services, and utilities
frontend/
  src/app/      Next.js pages
  src/components/ Reusable UI
  src/hooks/    Notes and toast state
  src/services/ API client and notes endpoints
```

## Limitations

- There is no authentication or per-user authorization.
- Search is performed in the browser over the notes currently loaded.
- The API returns all notes in one response; pagination is not implemented.
- Concurrent edits use last-write-wins behavior.
- Notes are plain text.
