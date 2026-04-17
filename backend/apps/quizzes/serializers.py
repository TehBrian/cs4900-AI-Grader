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

class QuizProblemCreateSerializer(serializers.Serializer):
    problem_id = serializers.IntegerField()
    problem_order = serializers.IntegerField()
    points = serializers.FloatField(required=False, default=1.0)
    custom_instructions = serializers.CharField(required=False, allow_blank=True, default="")
    time_limit_override = serializers.IntegerField(required=False, allow_null=True)
    parameter_overrides = serializers.JSONField(required=False, default=dict)

class QuizSerializer(serializers.ModelSerializer):
    problems = QuizProblemCreateSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "course",
            "created_by",
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
        problems_data = validated_data.pop("problems", [])
        quiz = Quiz.objects.create(**validated_data)

        for item in problems_data:
            QuizProblem.objects.create(
                quiz=quiz,
                problem_id=item["problem_id"],
                problem_order=item["problem_order"],
                points=item.get("points", 1.0),
                custom_instructions=item.get("custom_instructions", ""),
                time_limit_override=item.get("time_limit_override"),
                parameter_overrides=item.get("parameter_overrides", {}),
            )

        quiz.calculate_total_points()
        return quiz

class QuizProblemSerializer(serializers.ModelSerializer):
    """Serializer for QuizProblem"""
    problem_text = serializers.CharField(source="problem.question_text", read_only=True)
    problem_title = serializers.CharField(source="problem.title", read_only=True)
    problem_latex = serializers.CharField(source="problem.question_latex", read_only=True)
    linked_problem_id = serializers.IntegerField(source="problem.id", read_only=True)

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
            "linked_problem_id",
            "problem_text",
            "problem_title",
            "problem_latex",
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
