import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.grading.services.ai_symbolic_grader import AISymbolicGrader

print("Testing AI Symbolic Grader...")
print("-" * 50)

grader = AISymbolicGrader()

# Test case from requirements
result = grader.grade_expression(
    student_answer="e**(-x)/2*cos(2*x)",
    correct_answer="0.5*e**(-x)*cos(2*x)",
    variables={"x": 1.0},
)

print(f"Student: e**(-x)/2*cos(2*x)")
print(f"Correct: 0.5*e**(-x)*cos(2*x)")
print(f"Result: {'✅ CORRECT' if result['is_correct'] else '❌ INCORRECT'}")
print(f"Score: {result['score']:.2f}")
print(f"Method: {result['method_used']}")
print(f"Feedback: {result['feedback']}")
print("-" * 50)

if grader.use_ai:
    print("✅ AI grading ENABLED")
else:
    print("⚠️  AI grading DISABLED (add OPENAI_API_KEY to .env)")
