# apps/quizzes/views.py
"""
API Views for Quiz Management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Course, Quiz, QuizProblem, QuizAttempt, QuizStatistics
from .serializers import (
    CourseSerializer,
    QuizListSerializer,
    QuizDetailSerializer,
    QuizProblemSerializer,
    QuizAttemptSerializer,
    QuizSerializer,
)


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Courses

    Endpoints:
    - POST /api/course/ - Create course
    - GET /api/courses/ - List all courses
    - GET /api/courses/{id}/ - Get course details
    """

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def create_course(self, request):
        request.data["semester"] = request.data.pop("term")
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response([], status=status.HTTP_200_OK)
            except:
                print("serial failed")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def list_courses(self, request):
        ...

    @action(detail=False, methods=["get"])
    def details(self, request):
        ...


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Quizzes

    Endpoints:
    - GET /api/quizzes/ - List all quizzes
    - POST /api/quizzes/ - Create quiz
    - GET /api/quizzes/{id}/ - Get quiz details
    - PUT /api/quizzes/{id}/ - Update quiz
    - DELETE /api/quizzes/{id}/ - Delete quiz
    """

    queryset = Quiz.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == "list":
            return QuizListSerializer
        if self.action == "create":
            return QuizSerializer
        return QuizDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by course
        course_id = self.request.query_params.get("course", None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)

        # Filter by published status
        is_published = self.request.query_params.get("published", None)
        if is_published is not None:
            queryset = queryset.filter(is_published=is_published.lower() == "true")

        return queryset

    @action(detail=False, methods=["post"])
    def create_quiz(self, request):
        serializer = QuizSerializer(data=request.data)
        if serializer.is_valid():
            try:
                course = serializer.save()
                print(f"course: {course}")
                return Response([], status=status.HTTP_200_OK)
            except:
                print("serial failed")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def get_course_quizzes(self, request):
        course_id = request.data.get("course_id", None)
        if course_id:
            course_quizzes = Quiz.objects.filter(course=course_id)
            if not len(course_quizzes) > 0:
                return Response([], status=status.HTTP_200_OK)
            return Response(course_quizzes)

    @action(detail=True, methods=["get"])
    def problems(self, request, pk=None):
        """Get all problems for a quiz"""
        quiz = self.get_object()
        problems = quiz.quiz_problems.all()
        serializer = QuizProblemSerializer(problems, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def start_attempt(self, request, pk=None):
        """Start a new quiz attempt"""
        quiz = self.get_object()

        # Create new attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz, student=request.user if request.user.is_authenticated else None
        )

        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def quiz_statistics(request):
    """
    Get statistics about quizzes

    GET /api/quizzes/statistics/
    """
    total_quizzes = Quiz.objects.count()
    published_quizzes = Quiz.objects.filter(is_published=True).count()
    total_attempts = QuizAttempt.objects.count()

    return Response(
        {
            "total_quizzes": total_quizzes,
            "published_quizzes": published_quizzes,
            "draft_quizzes": total_quizzes - published_quizzes,
            "total_attempts": total_attempts,
            "total_courses": Course.objects.count(),
        }
    )
