import os, sys, django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.grading.services.ai_symbolic_grader import AISymbolicGrader
from sympy import sympify, simplify, N

grader = AISymbolicGrader()

# Test one failing case
student = "0.5*e**(-1.0*x)*cos(2*x)"
correct = "0.5*e**(-x)*cos(2.0*x)"

print("Original student:", student)
print("Original correct:", correct)
print()

# Clean using grader's method
student_clean = grader._clean_expression(student)
correct_clean = grader._clean_expression(correct)

print("Cleaned student:", student_clean)
print("Cleaned correct:", correct_clean)
print()

# Parse
s_sym = sympify(student_clean)
c_sym = sympify(correct_clean)

print("Parsed student:", s_sym)
print("Parsed correct:", c_sym)
print()

# Test numerically
from sympy import symbols
x = symbols('x')
x_val = {x: 1.0}

s_num = float(N(s_sym.subs(x_val)))
c_num = float(N(c_sym.subs(x_val)))

print(f"Student numerical at x=1.0: {s_num}")
print(f"Correct numerical at x=1.0: {c_num}")
print(f"Difference: {abs(s_num - c_num)}")
print(f"Match? {abs(s_num - c_num) < 1e-6}")
