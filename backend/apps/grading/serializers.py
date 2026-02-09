# apps/grading/serializers.py
from rest_framework import serializers
from .models import StudentSubmission, GradingResult


class GradingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingResult
        fields = [
            "feedback_message",
            "hint_message",
            "processing_time",
            "cas_confidence",
            "ai_confidence",
        ]


class StudentSubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source="problem.title", read_only=True)
    student_username = serializers.CharField(source="student.username", read_only=True)
    result = GradingResultSerializer(read_only=True)

    class Meta:
        model = StudentSubmission
        fields = [
            "submission_id",
            "problem",
            "problem_title",
            "student",
            "student_username",
            "student_answer",
            "is_correct",
            "score",
            "grading_method",
            "submitted_at",
            "status",
            "attempt_number",
            "result",
        ]
