# backend/test_simple_grading.py
import sys
import os
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.grading.services.cas_grader import CASGrader


def test_simple_cases():
    """Test grading with simple, non-LaTeX expressions"""
    print("=" * 70)
    print("SIMPLE GRADING TEST (Without LaTeX)")
    print("=" * 70)

    grader = CASGrader()

    # Test cases for antenna problem - simplified versions
    test_cases = [
        {
            "name": "Basic fraction equivalence",
            "student": "L/4",
            "correct": "0.25*L",
            "expected": True,
        },
        {
            "name": "Sine function equivalence",
            "student": "sin(x)",
            "correct": "sin(x)",
            "expected": True,
        },
        {
            "name": "Complex expression - matching",
            "student": "L*k*sin(phi)/32",
            "correct": "k*L*sin(phi)/32",
            "expected": True,
        },
        {
            "name": "Complex expression - wrong coefficient",
            "student": "L*k*sin(phi)/16",
            "correct": "k*L*sin(phi)/32",
            "expected": False,
        },
        {
            "name": "With parameters substituted",
            "student": "22/4",
            "correct": "5.5",
            "expected": True,
        },
    ]

    passed = 0
    failed = 0

    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*70}")
        print(f"Test {i}: {test['name']}")
        print(f"{'='*70}")
        print(f"Student Answer: {test['student']}")
        print(f"Correct Answer: {test['correct']}")

        result = grader.grade_expression(test["student"], test["correct"], None)

        is_correct = result.get("is_correct", False)

        print(f"\n📊 Result:")
        print(f"   Correct: {'✓ YES' if is_correct else '✗ NO'}")
        print(f"   Confidence: {result.get('confidence', 0):.2%}")
        print(f"   Method: {result.get('method', 'unknown').upper()}")
        print(f"   Reasoning: {result.get('reasoning', 'N/A')}")

        if is_correct == test["expected"]:
            print(f"   Test Status: ✓ PASS")
            passed += 1
        else:
            print(f"   Test Status: ✗ FAIL")
            failed += 1

    print(f"\n{'='*70}")
    print(f"Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print(f"{'='*70}")


if __name__ == "__main__":
    test_simple_cases()
