# apps/grading/serializers.py
"""
Serializers for the Grading API
"""
from rest_framework import serializers
from .models import GradingEngine, StudentSubmission, SubmissionPart, GradingResult


class GradeExpressionSerializer(serializers.Serializer):
    """Serializer for grading a single expression"""
    student_answer = serializers.CharField(required=True, help_text="Student's answer")
    correct_answer = serializers.CharField(required=True, help_text="Correct answer")
    variables = serializers.DictField(
        child=serializers.FloatField(),
        required=False,
        allow_null=True,
        help_text="Variables and their values (e.g., {'x': 1.0})"
    )
    tolerance = serializers.FloatField(required=False, default=1e-5)


class GradeResponseSerializer(serializers.Serializer):
    """Serializer for grading response"""
    is_correct = serializers.BooleanField()
    score = serializers.FloatField()
    feedback = serializers.CharField()
    method_used = serializers.CharField()
    confidence = serializers.FloatField()
    details = serializers.DictField()


class GradingEngineSerializer(serializers.ModelSerializer):
    """Serializer for GradingEngine model"""
    
    class Meta:
        model = GradingEngine
        fields = '__all__'


class StudentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for StudentSubmission model"""
    
    class Meta:
        model = StudentSubmission
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at']


class SubmissionPartSerializer(serializers.ModelSerializer):
    """Serializer for SubmissionPart model"""
    
    class Meta:
        model = SubmissionPart
        fields = '__all__'


class GradingResultSerializer(serializers.ModelSerializer):
    """Serializer for GradingResult model"""
    
    class Meta:
        model = GradingResult
        fields = '__all__'
        read_only_fields = ['id', 'graded_at']
