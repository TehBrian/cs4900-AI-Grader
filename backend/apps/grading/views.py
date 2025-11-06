# apps/grading/views.py
"""
API Views for Grading
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .services.ai_symbolic_grader import AISymbolicGrader
from .serializers import GradeExpressionSerializer, GradeResponseSerializer


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated access
def grade_expression(request):
    """
    Grade a symbolic expression
    
    POST /api/grading/grade/
    
    Request body:
    {
        "student_answer": "e**(-x)/2*cos(2*x)",
        "correct_answer": "0.5*e**(-x)*cos(2*x)",
        "variables": {"x": 1.0}
    }
    """
    serializer = GradeExpressionSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Get validated data
    student_answer = serializer.validated_data['student_answer']
    correct_answer = serializer.validated_data['correct_answer']
    variables = serializer.validated_data.get('variables', None)
    tolerance = serializer.validated_data.get('tolerance', 1e-5)
    
    # Grade the expression
    grader = AISymbolicGrader()
    result = grader.grade_expression(
        student_answer=student_answer,
        correct_answer=correct_answer,
        variables=variables,
        tolerance=tolerance
    )
    
    return Response(result, status=status.HTTP_200_OK)
