# TrackPath — Job & Internship Tracker

TrackPath is a React/Vite job application tracker with an Express REST API and MongoDB persistence. The existing UI is preserved; application documents embed contacts, interviews, notes, and timeline events for atomic updates and simple retrieval.

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Purpose | Required | Where to obtain it |
|---|---|---:|---|
| `PORT` | HTTP port; defaults to `3000` | No | Choose any available port |
| `NODE_ENV` | `development` enables Vite middleware; `production` serves `dist` | No | Set by the deployment environment |
| `MONGODB_URI` | MongoDB connection string | **Yes** | MongoDB Atlas or your MongoDB administrator |
| `MONGODB_DB` | Optional database-name override | No | The URI database name is used when blank |
| `SEED_ON_START` | Seeds the sample fixture only when the collection is empty | No | Set to `true` for a demo database |
| `APP_URL` | Optional allowed frontend origin for CORS | No | Your deployed frontend URL; blank is suitable for same-origin |

No AI API key or other external service is required.

## Run locally

```bash
npm install
cp .env.example .env
# Set MONGODB_URI in .env
npm run dev
```

To seed the 12 sample records into an empty database:

```bash
npm run seed
```

The seed command is idempotent when the collection is non-empty. The JSON fixture is retained only as sample data and is never used as runtime storage.

## Production build

```bash
npm run build
npm start
```

Set `NODE_ENV=production`, `MONGODB_URI`, and `PORT` in the deployment environment. Build and server should run in the same release so Express can serve `dist`.

## API

The direct-object response contract used by the existing frontend is preserved:

- `GET /api/applications` — search/filter/sort with `search`, `status`, `jobType`, `workModel`, `sort`
- `GET /api/applications/:id`
- `POST /api/applications`
- `PUT /api/applications/:id`
- `PATCH /api/applications/:id/status`
- `DELETE /api/applications/:id`
- `POST /api/applications/:id/interviews`
- `POST /api/applications/:id/notes`
- `PATCH /api/applications/:id/deadline-toggle`
- `GET /api/analytics`
- `GET /api/reminders`
- `GET /api/export?format=json|csv`
- `POST /api/import` — validated upsert-by-`id` import; records absent from the import are removed to preserve the prior replace-all behavior
- `POST /api/reset-sample` — replaces the collection with the sample fixture
- `GET /api/health`

Validation rejects invalid enum values, dates, ratings, URLs, nested arrays, malformed imports, duplicate IDs, and oversized imports. MongoDB indexes cover `id`, `company`, `status`, `jobType`, `workModel`, `appliedDate`, and `deadline`.

## Deployment requirements

Use a MongoDB deployment reachable from the server (MongoDB Atlas is the simplest option), allow the server's outbound IP in the MongoDB network access list, and store `MONGODB_URI` as a deployment secret. Do not commit `.env` or credentials.
