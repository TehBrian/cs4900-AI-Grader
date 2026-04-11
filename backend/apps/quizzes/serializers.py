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
from ..users.models import CustomUser



class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course"""
    instructor_id= serializers.IntegerField()

    class Meta:
        model= Course
        fields= [
            "id",
            "title",
            "course_code",
            "semester",
            "instructor_id",
        ]

    def create(self, validated_data):
        instructor = CustomUser.objects.get(id=validated_data["instructor_id"])
        course = Course.objects.create(
            title=validated_data["title"],
            course_code=validated_data["course_code"],
            semester=validated_data["semester"],
            description="",
            year=2026,  #TODO: get year
            instructor=instructor

        )
        return course

    def update(self, instance, validated_data):
        """ Allow course editing
        serializer = CourseSerializer(instance, data=data)
        """
        #TODO: Update course info
        ...

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for CourseEnrollment"""

    class Meta:
        model = CourseEnrollment
        fields = "__all__"

class QuizSerializer(serializers.ModelSerializer):

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "course",
            "quiz_type",
            "problems",
            "time_limit",
            "available_from",
            "available_until",
            "max_attempts",
            "allow_review",
            "total_points",
        ]

    def create(self, validated_data):
        return Quiz.objects.create(**validated_data)

class QuizProblemSerializer(serializers.ModelSerializer):
    """Serializer for QuizProblem"""
    problem_text = serializers.CharField(source="problem.question_text", read_only=True)
    problem_title = serializers.CharField(source="problem.title", read_only=True)
    
    class Meta:
        model = QuizProblem
        fields = [
            "id",
            "problem_order",
            "points",
            "custom_instructions",
            "time_limit_override",
            "parameter_overrides",
            "quiz",
            "problem",
            "problem_text",
            "problem_title",
        ]


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
