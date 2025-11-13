with open('apps/grading/services/ai_symbolic_grader.py', 'r') as f:
    content = f.read()

# Remove the duplicate import line
content = content.replace('                    from sympy import expand, simplify', '                    from sympy import expand')

with open('apps/grading/services/ai_symbolic_grader.py', 'w') as f:
    f.write(content)

print("✅ Fixed import error!")
