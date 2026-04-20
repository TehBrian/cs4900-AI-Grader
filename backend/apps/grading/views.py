# apps/grading/views.py
"""
API Views for Grading System
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import StudentSubmission, GradingResult
from apps.problems.models import Problem
from apps.users.models import CustomUser
from .engines import GradingCoordinator
from .serializers import StudentSubmissionSerializer, GradingResultSerializer

#from mcp.client import mcp_client
from pathlib import Path


class GradingViewSet(viewsets.ViewSet):
    """
    ViewSet for grading operations
    """

    permission_classes = [AllowAny]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.grading_coordinator = GradingCoordinator()

    @action(detail=False, methods=["post"])
    def submit(self, request):
        """
        Submit an answer for grading

        POST /api/grading/submit/
        {
            "problem_id": 3,
            "answer": "sinc^2(phi)",
            "student_id": 1
        }
        """
        problem_id = request.data.get("problem_id")
        answer = request.data.get("answer")
        student_id = request.data.get("student_id", 1)

        if not problem_id or not answer:
            return Response(
                {"error": "problem_id and answer are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            student = CustomUser.objects.get(id=student_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Count attempts
        attempt_number = (
            StudentSubmission.objects.filter(student=student, problem=problem).count()
            + 1
        )

        # Create submission
        submission = StudentSubmission.objects.create(
            student=student,
            problem=problem,
            student_answer=answer,
            raw_input=answer,
            expected_answer=problem.solution_expression,
            attempt_number=attempt_number,
            status="grading",
        )

        submission.start_grading()

        # Grade the submission
        grading_result = self.grading_coordinator.grade(problem, answer)

        # Update submission with results
        submission.complete_grading(
            is_correct=grading_result["correct"], score=grading_result["score"]
        )
        submission.grading_method = grading_result.get("method", "unknown")
        submission.save(update_fields=["grading_method"])

        # Create grading result
        GradingResult.objects.create(
            submission=submission,
            feedback_message=grading_result.get("feedback", ""),
            processing_time=0.1,  # Placeholder
            cas_result=grading_result.get("details", {}),
        )

        # Return result
        return Response(
            {
                "submission_id": str(submission.submission_id),
                "score": grading_result["score"],
                "is_correct": grading_result["correct"],
                "feedback": grading_result.get("feedback", ""),
                "grading_method": grading_result.get("method"),
                "details": grading_result.get("details", {}),
                "attempt_number": attempt_number,
            }
        )

    @action(detail=False, methods=["post"])
    def submit_steps(self, request):
        """
        Submit multi-step answer for grading

        POST /api/grading/submit-steps/
        {
            "problem_id": 6,
            "answers": {
                "step_1": "answer for step 1",
                "step_2": "answer for step 2"
            },
            "student_id": 1
        }
        """
        problem_id = request.data.get("problem_id")
        step_answers = request.data.get("answers", {})
        student_id = request.data.get("student_id", 1)

        try:
            problem = Problem.objects.get(id=problem_id)
            student = CustomUser.objects.get(id=student_id)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Count attempts
        attempt_number = (
            StudentSubmission.objects.filter(student=student, problem=problem).count()
            + 1
        )

        # Create submission
        submission = StudentSubmission.objects.create(
            student=student,
            problem=problem,
            student_answer=str(step_answers),
            raw_input=str(step_answers),
            expected_answer=problem.solution_expression,
            attempt_number=attempt_number,
            status="grading",
        )

        submission.start_grading()

        # Grade multi-step submission
        grading_result = self.grading_coordinator.grade_multi_step(
            problem, step_answers
        )

        # Update submission
        submission.complete_grading(
            is_correct=grading_result["correct"], score=grading_result["total_score"]
        )
        submission.grading_method = "multi_step"
        submission.save(update_fields=["grading_method"])

        # Create detailed result
        GradingResult.objects.create(
            submission=submission,
            feedback_message=f"Multi-step grading: {len(grading_result['steps'])} steps",
            processing_time=0.2,
            cas_result={"steps": grading_result["steps"]},
        )

        return Response(
            {
                "submission_id": str(submission.submission_id),
                "total_score": grading_result["total_score"],
                "steps": grading_result["steps"],
                "correct": grading_result["correct"],
                "attempt_number": attempt_number,
            }
        )

    @action(detail=False, methods=["post"])
    def hint(self, request):
        """
        Get a hint for a problem

        POST /api/grading/hint/
        {
            "problem_id": 3,
            "current_answer": "sinc(phi)"
        }
        """
        problem_id = request.data.get("problem_id")
        current_answer = request.data.get("current_answer", "")

        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return Response(
                {"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND
            )

        hint = self.grading_coordinator.ai_grader.provide_hint(problem, current_answer)

        return Response({"hint": hint})

    @action(detail=False, methods=["get"])
    def my_submissions(self, request):
        """Get submissions for a student"""
        student_id = request.query_params.get("student_id", 1)

        submissions = StudentSubmission.objects.filter(student_id=student_id).order_by(
            "-submitted_at"
        )[:10]

        serializer = StudentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["POST"])
    def ai_result_submit(self, request):
        "Submit AI results to backend"

        submission_id = request.data.get("submission_id")
        result = request.data.get("result")

        submission_obj = get_object_or_404(StudentSubmission, submission_id=submission_id)
       
        created = GradingResult.objects.create(
            submission = submission_obj,
            ai_result = result
        )
        return Response({"status": "success"}, status=201 if created else 200)
    
    @action(detail=False, methods=["GET"])
    def get_results(self, request):
        win_number = request.query_params.get("win_number")
        results = GradingResult.objects.filter(submission__student__win_number = win_number)

        serializer = GradingResultSerializer(results, many=True)
        return Response(serializer.data)        


@api_view(["GET"])
@permission_classes([AllowAny])
def grading_statistics(request):
    """Get grading statistics"""
    total_submissions = StudentSubmission.objects.count()
    correct_submissions = StudentSubmission.objects.filter(is_correct=True).count()

    accuracy = (
        (correct_submissions / total_submissions * 100) if total_submissions > 0 else 0
    )

    # Grading method breakdown
    method_stats = {}
    for method, _ in StudentSubmission._meta.get_field("grading_method").choices:
        count = StudentSubmission.objects.filter(grading_method=method).count()
        method_stats[method] = count

    return Response(
        {
            "total_submissions": total_submissions,
            "correct_submissions": correct_submissions,
            "incorrect_submissions": total_submissions - correct_submissions,
            "accuracy": round(accuracy, 2),
            "by_method": method_stats,
            "pending": StudentSubmission.objects.filter(status="pending").count(),
            "completed": StudentSubmission.objects.filter(status="completed").count(),
        }
    )
