import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.grading.services.ai_symbolic_grader import AISymbolicGrader

print("=" * 60)
print("AI SYMBOLIC GRADER - FULL TEST SUITE")
print("Testing all 9 equivalency forms from requirements")
print("=" * 60)
print()

grader = AISymbolicGrader()
correct_answer = "0.5*e**(-x)*cos(2.0*x)"

test_cases = [
    ("0.5*e**(-x)*cos(2.0*x)", "Exact match"),
    ("(0.5)*e**(-x)*cos(2.0*x)", "With parentheses around 0.5"),
    ("0.5*e**(-1.0*x)*cos(2*x)", "Explicit -1.0*x"),
    ("0.5*(e**(-x))*cos(2*x)", "Parentheses around e"),
    ("(1/2)*e**(-x)*cos(2*x)", "Fraction notation"),
    ("e**(-x)/2*cos(2*x)", "Division form"),
    ("e**(-x)*cos(2*x)/2", "Division at end"),
    ("(1/2)*cos(2*x)*e**(-x)", "Reordered"),
    ("0.499999*cos(2*x)*e**(-x)", "Numerical approximation"),
]

variables = {'x': 1.0}
passed = 0
failed = 0

for i, (student_answer, description) in enumerate(test_cases, 1):
    print(f"Test {i}: {description}")
    print(f"  Input: {student_answer}")
    
    result = grader.grade_expression(
        student_answer=student_answer,
        correct_answer=correct_answer,
        variables=variables
    )
    
    if result['is_correct']:
        print(f"  ✅ PASS - Score: {result['score']:.2f}")
        passed += 1
    else:
        print(f"  ❌ FAIL - Score: {result['score']:.2f}")
        failed += 1
    print()

print("=" * 60)
print(f"RESULTS: {passed}/{len(test_cases)} tests passed")
print("=" * 60)

if passed == len(test_cases):
    print("🎉 ALL TESTS PASSED! AI grading is working perfectly!")
else:
    print(f"⚠️  {failed} tests failed. Review the output above.")

print()
if grader.use_ai:
    print("✅ AI grading ENABLED (OpenAI)")
else:
    print("⚠️  AI grading using SymPy only (add OPENAI_API_KEY for full AI)")
