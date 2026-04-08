# apps/grading/serializers.py
from rest_framework import serializers
from .models import Submission, GradingResult


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


class SubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source="problem.title", read_only=True)
    student_username = serializers.CharField(source="student.username", read_only=True)
    result = GradingResultSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = [
            "submission_id",
            "student_id",
            "quiz_id",
            "content",
            "attempt_number",
        ]
