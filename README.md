# AI Grader

A two-service web app for delivering and AI-grading symbolic math quizzes, built for Western Michigan University CS 4900.

- **frontend** — React + TypeScript + Tailwind (quiz delivery UI)
- **backend** — Django REST Framework (data, users, AI grading via Anthropic Claude)

---

## Running with Docker (recommended)

### 1. Create your `.env` file

```sh
cp .env.example .env
```

Fill in your keys:

```env
SECRET_KEY=your-django-secret-key
ANTHROPIC_API_KEY=...
```

### 2. Build and start

```sh
docker compose up -d --build
```

### 3. Run migrations (first time only)

```sh
docker compose exec backend python manage.py migrate
```

The app is now available at <http://localhost:3000>.

---

## Running locally (without Docker)

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
python manage.py migrate   # first time only
python manage.py runserver
```

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
  └─→ nginx :3000
        ├─ /api/* → backend:8000 (Django, includes AI grading)
        └─ /*     → React static files
```
