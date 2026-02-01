# apps/grading/management/commands/test_grading.py
import os
from django.core.management.base import BaseCommand
from apps.problems.models import Problem
from apps.users.models import CustomUser
import sympy as sp


class Command(BaseCommand):
    help = "Test the grading system with SymPy"

    def handle(self, *args, **options):
        # Test SymPy equivalency checking
        self.stdout.write(self.style.SUCCESS("Testing SymPy grading engine...\n"))

        # Test case 1: Simple equivalency
        expr1 = "0.5*x"
        expr2 = "x/2"
        self.test_equivalency(expr1, expr2, should_match=True)

        # Test case 2: Complex expression
        expr1 = "sin(x)**2 + cos(x)**2"
        expr2 = "1"
        self.test_equivalency(expr1, expr2, should_match=True)

        # Test case 3: Non-equivalent
        expr1 = "x**2"
        expr2 = "x"
        self.test_equivalency(expr1, expr2, should_match=False)

        # Test case 4: Different forms of same expression
        expr1 = "2*x + 3*x"
        expr2 = "5*x"
        self.test_equivalency(expr1, expr2, should_match=True)

        # Test with antenna problem parameters
        self.test_antenna_problem()

    def test_equivalency(self, expr1, expr2, should_match=True):
        try:
            sym_expr1 = sp.sympify(expr1)
            sym_expr2 = sp.sympify(expr2)

            # Check if simplified forms are equal
            diff = sp.simplify(sym_expr1 - sym_expr2)
            is_equivalent = diff == 0

            if is_equivalent == should_match:
                result = self.style.SUCCESS("✓ PASS")
            else:
                result = self.style.ERROR("✗ FAIL")

            self.stdout.write(f"{result}: {expr1} ≡ {expr2} ? {is_equivalent}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    def test_antenna_problem(self):
        self.stdout.write("\n" + self.style.WARNING("--- Testing Antenna Problem ---"))

        # Get the problem
        try:
            problem = Problem.objects.get(title__icontains="Antenna")
            self.stdout.write(f"Problem: {problem.title}")

            # Generate parameters for a student
            parameters = problem.generate_parameters()
            self.stdout.write(f"Generated parameters: {parameters}")

            # Render question with parameters
            question = problem.render_with_parameters(parameters)
            self.stdout.write(f"\nRendered question:\n{question[:300]}...")

            self.stdout.write(self.style.SUCCESS("\n✓ Antenna problem test complete!"))

        except Problem.DoesNotExist:
            self.stdout.write(self.style.WARNING("No antenna problem found"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
