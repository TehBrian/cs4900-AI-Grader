import json
import os

from anthropic import Anthropic


def grade_submission(submission):
    """
    Grade a quiz submission using Claude. Fetches quiz/user data directly from
    the Django ORM and returns (results_json, summary) matching the old
    QuizGraderClient.run_grading_workflow() return shape.
    """
    submission_struct = _build_submission_struct(submission)
    quiz_struct = _build_quiz_struct(submission.quiz)
    user_struct = _build_user_struct(submission.student_id)

    prompt = _build_prompt(submission_struct, quiz_struct, user_struct)

    try:
        client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}],
        )
        return _parse_response(response.content[0].text)
    except Exception as e:
        print(f"Anthropic grading error: {e}")
        return {}, ""


def _build_submission_struct(submission):
    return {
        "submission_id": str(submission.submission_id),
        "quiz_id": submission.quiz.id,
        "student_id": submission.student_id.id,
        "student_answers": submission.content,
    }


def _build_quiz_struct(quiz):
    nested_problems = []
    for problem in quiz.problems.all():
        parts = [
            {
                "part_number": p.part_number,
                "part_text": p.part_text,
                "expected_answer": p.expected_answer,
                "points": p.points,
            }
            for p in problem.parts.order_by("part_number")
        ]
        nested_problems.append({"problem": {
            "id": problem.id,
            "title": problem.title,
            "question_text": problem.question_text,
            "solution_expression": problem.solution_expression,
        }, "parts": parts})

    return {
        "quiz_id": quiz.id,
        "title": quiz.title,
        "course": quiz.course_id,
        "problems": nested_problems,
    }


def _build_user_struct(user):
    return {
        "student_id": user.id,
        "student_email": user.email,
        "student_WIN": user.win_number,
    }


def _build_prompt(submission_struct, quiz_struct, user_struct):
    return f"""Please grade the following quiz submission. \
Solve the problems based on question_text and grade students answers.
For each problem follow the following format and create a json:

quiz_number: number,
student_answer: students answer,
expected_answer: your answer,

Student Submission:
{json.dumps(submission_struct, indent=2)}

Quiz Problems:
{json.dumps(quiz_struct, indent=2)}

User Info:
{json.dumps(user_struct, indent=2)}

include this at the end of your response on a new line:
"quiz_title,win_number,earned_points,overall_feedback,"
"""


def _parse_response(text):
    try:
        json_end = text.rfind("]") + 1
        json_str = text[7:json_end].strip()
        results = json.loads(json_str)
        summary = text[json_end:]
        return results, summary
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        return {}, ""
