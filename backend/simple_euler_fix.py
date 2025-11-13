with open('apps/grading/services/ai_symbolic_grader.py', 'r') as f:
    content = f.read()

# Find where we remove backslashes and add our conversion there
old_line = "        # Remove remaining backslashes\n        expr = expr.replace('\\\\', '')"
new_lines = """        # Remove remaining backslashes
        expr = expr.replace('\\\\', '')
        
        # Convert e** to exp for proper SymPy handling
        expr = re.sub(r'\\be\\*\\*', 'exp', expr)"""

content = content.replace(old_line, new_lines)

with open('apps/grading/services/ai_symbolic_grader.py', 'w') as f:
    f.write(content)

print("✅ Added e** to exp conversion!")
