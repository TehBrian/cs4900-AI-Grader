# backend/test_simple_multi_step.py
import sys
import os
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.grading.services.cas_grader import CASGrader


def test_simple_equivalency():
    """Test CAS grading with simple expressions (no LaTeX)"""

    print("=" * 70)
    print("SIMPLE EQUIVALENCY TEST")
    print("=" * 70)

    grader = CASGrader()

    test_cases = [
        ("L/4", "L/4", True, "Exact match"),
        ("0.25*L", "L/4", True, "Decimal equivalent"),
        ("L*0.25", "L/4", True, "Rearranged"),
        ("L/2", "L/4", False, "Wrong coefficient"),
        ("16/4", "4", True, "Numeric evaluation"),
    ]

    for student, correct, expected, description in test_cases:
        print(f"\nTest: {description}")
        print(f"  Student: {student}")
        print(f"  Correct: {correct}")

        result = grader.grade_expression(student, correct, None)

        is_correct = result.get("is_correct", False)
        status = "✓ PASS" if is_correct == expected else "✗ FAIL"

        print(f"  Result: {'✓ CORRECT' if is_correct else '✗ WRONG'}")
        print(f"  {status}")
        print(f"  Reasoning: {result.get('reasoning', 'N/A')[:80]}")


if __name__ == "__main__":
    test_simple_equivalency()
