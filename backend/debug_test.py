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

print("Student:", student)
print("Correct:", correct)
print()

# Parse
s_sym = sympify(student)
c_sym = sympify(correct)

print("Parsed student:", s_sym)
print("Parsed correct:", c_sym)
print()

# Simplify
s_simp = simplify(s_sym)
c_simp = simplify(c_sym)

print("Simplified student:", s_simp)
print("Simplified correct:", c_simp)
print()

# Test numerically
x_val = {'x': 1.0}
s_num = float(N(s_simp.subs(x_val)))
c_num = float(N(c_simp.subs(x_val)))

print(f"Student numerical value at x=1.0: {s_num}")
print(f"Correct numerical value at x=1.0: {c_num}")
print(f"Difference: {abs(s_num - c_num)}")
print(f"Within tolerance (1e-6)? {abs(s_num - c_num) < 1e-6}")
