from django.test import TestCase

import sympy as sp
from apps.grading.services.cas_grader import CASGrader

# Create your tests here.
class TestGrader(TestCase):

    def test_numerical_equivalency_check(self):
        print()
        print("Running CASGrader test...")
        cas_grader = CASGrader(tolerance=0.000001)
        student_exprs = tuple(map(cas_grader._parse_expression,
                                [
                                    "1+1",      # standard
                                    "1+1+a",    # if not variables  cas_grader.py:line 131
                                    "1+1",      # test not equal and > tolerance
                                    "1+1+a",    # test variable not equal   cas_grader.py:line 146
                                ]
                            ))
        correct_exprs = tuple(map(cas_grader._parse_expression, ["1+1", "1+1+a", "1+2", "1+2+a"]))

        print(f"\nTolerance = 0.000001")
        i = 1
        for s_expr, c_expr, expected in zip(student_exprs, correct_exprs, [True, True, False, False]):
            result = cas_grader._numerical_equivalency_check(s_expr, c_expr, num_tests=10)
            if result == expected:
                print(f"Test {i}. ✅ Pass")
            else:
                print(f"Test {i}. ❌ Failed")
            i += 1

        print("\nTolerance = 1.1")
        cas_grader.tolerance = 1.1
        for s_expr, c_expr, expected in zip(student_exprs, correct_exprs, [True, True, True, True]):
            result = cas_grader._numerical_equivalency_check(s_expr, c_expr, num_tests=10)
            if result == expected:
                print(f"Test {i}. ✅ Pass")
            else:
                print(f"Test {i}. ❌ Failed")
            i += 1
        return result
