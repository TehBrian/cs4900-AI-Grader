# AI Grader Backend API Documentation

Base URL: `http://localhost:8000/api`

## Authentication
Currently using `AllowAny` permissions for development. Production should implement proper authentication.

---

## Problem Management API

### List All Problems
```http
GET /api/problems/
```

**Query Parameters:**
- `category` - Filter by category ID
- `difficulty` - Filter by difficulty (beginner, intermediate, advanced, expert)
- `search` - Search in title and description

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "title": "Simple Integration",
      "category": 1,
      "category_name": "Calculus",
      "difficulty": "intermediate",
      "created_at": "2025-11-06T08:54:33.483827-05:00"
    }
  ]
}
```

### Create Problem
```http
POST /api/problems/
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Integration Problem",
  "description": "Find the integral",
  "difficulty": "beginner",
  "question_text": "∫2x dx",
  "solution_expression": "x² + C",
  "author": 1
}
```

### Get Problem Details
```http
GET /api/problems/{id}/
```

### Update Problem
```http
PATCH /api/problems/{id}/
Content-Type: application/json
```

### Get Problem Statistics
```http
GET /api/problems/statistics/
```

**Response:**
```json
{
  "total_problems": 1,
  "total_categories": 1,
  "total_tags": 0
}
```

---

## Quiz Management API

### List All Quizzes
```http
GET /api/quizzes/
```

**Query Parameters:**
- `course` - Filter by course ID
- `published` - Filter by published status (true/false)

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "title": "Week 1 Quiz",
      "course": 1,
      "course_name": "Calculus I",
      "time_limit": null,
      "max_attempts": 3,
      "is_published": true,
      "available_until": "2025-12-09T15:18:52Z",
      "problem_count": 0
    }
  ]
}
```

### Create Quiz
```http
POST /api/quizzes/
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Week 1 Quiz",
  "description": "Integration basics",
  "course": 1,
  "quiz_type": "quiz",
  "available_from": "2025-11-06T00:00:00Z",
  "available_until": "2025-12-06T23:59:59Z",
  "max_attempts": 3,
  "is_published": true,
  "created_by": 1
}
```

**Quiz Types:**
- `practice`
- `homework`
- `exam`
- `quiz`

### Get Quiz Details
```http
GET /api/quizzes/{id}/
```

### Get Quiz Statistics
```http
GET /api/quizzes/statistics/
```

**Response:**
```json
{
  "total_quizzes": 1,
  "published_quizzes": 1,
  "draft_quizzes": 0,
  "total_attempts": 0,
  "total_courses": 1
}
```

---

## Course Management API

### List All Courses
```http
GET /api/quizzes/courses/
```

### Create Course
```http
POST /api/quizzes/courses/
Content-Type: application/json
```

**Request Body:**
```json
{
  "course_code": "MATH101",
  "title": "Calculus I",
  "description": "Introduction to Calculus",
  "semester": "fall",
  "year": 2025,
  "instructor": 1
}
```

**Semester Options:**
- `fall`
- `winter`
- `spring`
- `summer`

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

---

## Development Setup

1. Start the server:
```bash
python manage.py runserver
```

2. Server runs at: `http://127.0.0.1:8000`

3. API endpoints: `http://127.0.0.1:8000/api/`

---

## Testing with cURL

### Create a Problem:
```bash
curl -X POST http://127.0.0.1:8000/api/problems/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Problem",
    "description": "A test problem",
    "difficulty": "beginner",
    "question_text": "Solve: 2x + 3 = 7",
    "solution_expression": "x = 2",
    "author": 1
  }'
```

### Create a Quiz:
```bash
curl -X POST http://127.0.0.1:8000/api/quizzes/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "course": 1,
    "quiz_type": "quiz",
    "available_from": "2025-11-06T00:00:00Z",
    "available_until": "2025-12-06T23:59:59Z",
    "max_attempts": 3,
    "is_published": true,
    "created_by": 1
  }'
```
