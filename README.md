# AI Grader

A three-service web app for delivering and AI-grading symbolic math quizzes, built for Western Michigan University CS 4900.

- **frontend** — React + TypeScript + Tailwind (quiz delivery UI)
- **backend** — Django REST Framework (data, users, grading logic)
- **mcp_logic** — FastMCP server (AI grading via Anthropic Claude)

---

## Running with Docker (recommended)

### 1. Create your `.env` file

```sh
cp .env.example .env
```

Fill in your keys:

```env
SECRET_KEY=your-django-secret-key
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 2. Build and start

```sh
docker compose up --build
```

### 3. Run migrations (first time only)

```sh
docker compose exec backend python manage.py migrate
```

The app is now available at <http://localhost:3000>.

The MCP server is available at <http://localhost:4000> for manual testing.

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

### mcp_logic

```sh
cd mcp_logic
source .venv/bin/activate
python server.py
```

To inspect the MCP server interactively:

```sh
npx -y @modelcontextprotocol/inspector <server address printed by server.py>
```

---

## Architecture

```text
Browser
  └─→ nginx :3000
        ├─ /api/* → backend:8000 (Django)
        └─ /*     → React static files

mcp_logic :4000
  └─→ backend:8000 (Django, internal)
```
