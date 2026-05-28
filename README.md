# Neon Serpent

A full-stack MERN snake game set in a neon future city. The React client renders the game on canvas, the Express API stores leaderboard runs, and MongoDB is used when `MONGO_URI` is configured. Without MongoDB, the API falls back to an in-memory leaderboard so the game stays playable.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## MongoDB

Copy `.env.example` to `.env` and update `MONGO_URI` if your MongoDB server uses a different connection string.

```bash
cp .env.example .env
```

The API runs on `http://localhost:5050` by default and exposes:

- `GET /api/health`
- `GET /api/scores`
- `POST /api/scores`
