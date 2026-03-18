# apps/quizzes/serializers.py
"""
Serializers for Quiz Management API
"""
from rest_framework import serializers
from .models import (
    Course,
    CourseEnrollment,
    Quiz,
    QuizProblem,
    QuizAttempt,
    QuizStatistics,
)


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course"""

    instructor_name= serializers.SerializerMethodField()
    code= serializers.CharField(source="course_code")
    term= serializers.SerializerMethodField()

    class Meta:
        model= Course
        fields= [
            "id",
            "code",
            "title",
            "term",
            "instructor_name",
        ]

    def get_instructor_name(self, obj):
        full_name= obj.instructor.get_full_name()
        return full_name if full_name else obj.instructor.username

    def get_term(self, obj):
        return f"{obj.semester.title()} {obj.year}"


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for CourseEnrollment"""

    class Meta:
        model = CourseEnrollment
        fields = "__all__"


class QuizProblemSerializer(serializers.ModelSerializer):
    """Serializer for QuizProblem"""

    class Meta:
        model = QuizProblem
        fields = "__all__"


class QuizListSerializer(serializers.ModelSerializer):
    """Serializer for listing quizzes"""

    course_name = serializers.CharField(source="course.title", read_only=True)
    problem_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "course",
            "course_name",
            "time_limit",
            "max_attempts",
            "is_published",
            "available_until",
            "problem_count",
        ]

    def get_problem_count(self, obj):
        return obj.quiz_problems.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed quiz view"""

    problems = QuizProblemSerializer(many=True, read_only=True, source="quiz_problems")
    course_name = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Quiz
        fields = "__all__"


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for QuizAttempt"""

    class Meta:
        model = QuizAttempt
        fields = "__all__"


class QuizStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for QuizStatistics"""

    class Meta:
        model = QuizStatistics
        fields = "__all__"
