# AI Grader

A two-service web app for delivering and AI-grading symbolic math quizzes, built for Western Michigan University CS 4900.

- **frontend** — React + TypeScript + Tailwind (quiz delivery UI)
- **backend** — Django REST Framework (data, users, AI grading via Anthropic Claude)

---

## Deploying to Railway

This repo is deployed as an isolated Railway monorepo:

- `frontend`: public service. Vite builds the React app, nginx serves static files, and nginx proxies `/api/` to the backend.
- `backend`: private Django/Gunicorn API service.
- `Postgres`: managed Railway database.

Browser requests should all use the frontend domain. Do not expose the backend publicly unless you have a separate reason to.

### 1. Create Railway services

Create three services in one Railway project:

- `backend`
- `frontend`
- `Postgres`

For the two app services, connect this GitHub repo and set:

| Service | Root Directory | Config File |
| --- | --- | --- |
| `backend` | `/backend` | `/backend/railway.toml` |
| `frontend` | `/frontend` | `/frontend/railway.toml` |

### 2. Set variables

Backend variables:

```env
PORT=8000
DEBUG=False
SECRET_KEY=<generated secret>
ANTHROPIC_API_KEY=<key>
DATABASE_URL=${{Postgres.DATABASE_URL}}
FRONTEND_URL=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
ALLOWED_HOSTS=${{frontend.RAILWAY_PUBLIC_DOMAIN}},${{backend.RAILWAY_PRIVATE_DOMAIN}},healthcheck.railway.app
```

Frontend variables:

```env
BACKEND_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:${{backend.PORT}}
```

Do not set `VITE_API_BASE_URL` in Railway. The frontend intentionally calls `/api/...` on the same origin, and nginx forwards those requests to the private backend.

### 3. Deploy and verify

1. Generate a Railway public domain for `frontend` only.
2. Deploy `backend`, then deploy `frontend`.
3. Open `https://<frontend-domain>/health` and confirm it returns `ok`.
4. Open `https://<frontend-domain>/api/schema/` and confirm the API schema loads through the frontend proxy.
5. Test register/login and refresh-backed navigation.

`docker-compose.yml` is not used for Railway deployment.

---

## Running locally

Create your local env file:

```sh
cp .env.example .env
```

Fill in at least:

```env
SECRET_KEY=your-django-secret-key
ANTHROPIC_API_KEY=...
```

Open a terminal in each directory and run the listed commands.

### frontend

```sh
cd frontend
npm install
npm start
```

### backend

```sh
cd backend
source .venv/bin/activate
mkdir -p data
python manage.py migrate   # first time only
python manage.py runserver
```

The Vite dev server proxies `/api` to <http://localhost:8000>.

---

## Developer Notes

### API Type Safety

Frontend TypeScript types are auto-generated from the Django REST Framework OpenAPI schema. The pipeline is:

1. `drf-spectacular` introspects the Django serializers and `@extend_schema` decorators to produce `backend/schema.yaml`
2. `openapi-typescript` converts `schema.yaml` into `frontend/src/api/schema.d.ts`
3. `openapi-fetch` provides a typed `fetch` client — every path, query param, request body, and response is checked at compile time

**When you change a serializer or add/remove an API endpoint, regenerate the types:**

```sh
cd frontend
npm run sync-types   # runs generate-schema then generate-types
```

If a field is renamed or removed, TypeScript will immediately flag every place in the UI that references it.

**Adding a new endpoint:**

- For standard ModelViewSet CRUD actions, no extra annotation is needed — `drf-spectacular` detects the serializer automatically.
- For custom `@action` endpoints, add an `@extend_schema` decorator in the view specifying `request=` and `responses=` so the schema is accurate. See the existing examples in `apps/users/views.py` and `apps/grading/views.py`.

**Interactive API docs** are available at <http://localhost:8000/api/docs/> when the backend is running.

---

## Architecture

```text
Browser
  └─→ Railway frontend domain
        └─→ nginx
              ├─ /api/* → backend private Railway service
              └─ /*     → React static files
```
