# backend/test_multi_step_grading.py
import sys
import os
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.grading.services.multi_step_grader import MultiStepGrader, format_grading_result
from apps.problems.models import Problem

def test_multi_step_grading():
    """Test grading with work shown"""
    
    print("=" * 70)
    print("MULTI-STEP GRADING TEST")
    print("=" * 70)
    
    grader = MultiStepGrader()
    
    # Get antenna problem
    problem = Problem.objects.get(title__icontains='Antenna')
    parameters = {'L': 16, 'delta': 0.25}
    
    # CORRECT expected answer for this problem
    correct_answer = 'L/4'
    
    # Test Case 1: Student shows complete work with CORRECT answer
    submission1 = """
Step 1: E(x) = rect(4x/L) for the uniform aperture distribution
Step 2: Taking Fourier Transform: F{E(x)} = (L/4)sinc(ωL/8)
Step 3: Applying change of variable: ω = k·sin(φ)
Step 4: Substituting into the expression
Final Answer: L/4
"""
    
    print("\n" + "="*70)
    print("TEST CASE 1: Complete work shown with CORRECT answer")
    print("="*70)
    print(f"Parameters: L={parameters['L']}")
    print(f"Expected Answer: {correct_answer}")
    print(f"\nStudent Submission:\n{submission1}")
    
    problem_data = {
        'question_text': problem.question_text,
        'solution_expression': correct_answer,
        'solution_explanation': problem.solution_explanation
    }
    
    result1 = grader.grade_submission(submission1, problem_data, parameters)
    print(format_grading_result(result1))
    
    # Test Case 2: Student shows work but WRONG answer
    submission2 = """
Step 1: E(x) = rect(4x/L)
Step 2: F{E(x)} = (L/2)sinc(ωL/8)  <- Wrong coefficient
Final Answer: L/2
"""
    
    print("\n" + "="*70)
    print("TEST CASE 2: Work shown but INCORRECT coefficient")
    print("="*70)
    print(f"Expected Answer: {correct_answer}")
    print(f"\nStudent Submission:\n{submission2}")
    
    result2 = grader.grade_submission(submission2, problem_data, parameters)
    print(format_grading_result(result2))
    
    # Test Case 3: Only final answer (CORRECT), no work
    submission3 = "L/4"
    
    print("\n" + "="*70)
    print("TEST CASE 3: Only CORRECT final answer, no work shown")
    print("="*70)
    print(f"Expected Answer: {correct_answer}")
    print(f"\nStudent Submission: {submission3}")
    
    result3 = grader.grade_submission(submission3, problem_data, parameters)
    print(format_grading_result(result3))
    
    # Test Case 4: Equivalent form
    submission4 = "0.25*L"
    
    print("\n" + "="*70)
    print("TEST CASE 4: Equivalent form (0.25*L)")
    print("="*70)
    print(f"Expected Answer: {correct_answer}")
    print(f"\nStudent Submission: {submission4}")
    
    result4 = grader.grade_submission(submission4, problem_data, parameters)
    print(format_grading_result(result4))
    
    print("\n" + "="*70)
    print("✅ MULTI-STEP GRADING TEST COMPLETE")
    print("="*70)
    
    print("\nSUMMARY:")
    print(f"  Test 1 (correct with work): {result1['total_score']:.1f}/100")
    print(f"  Test 2 (wrong answer): {result2['total_score']:.1f}/100")
    print(f"  Test 3 (correct, no work): {result3['total_score']:.1f}/100")
    print(f"  Test 4 (equivalent form): {result4['total_score']:.1f}/100")
    
    print("\nNOTE: Full GPT-4 evaluation requires OpenAI API key")
    print("Set OPENAI_API_KEY in your .env file to enable AI grading of work shown")
    print("Without API key, system grades only final answer using CAS (SymPy)")

if __name__ == '__main__':
    test_multi_step_grading()
