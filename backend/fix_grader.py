with open('apps/grading/services/ai_symbolic_grader.py', 'r') as f:
    content = f.read()

# Fix the regex that's adding extra asterisks
old_line = "        expr = re.sub(r'\\)(\\[a-zA-Z0-9])', r')*\\1', expr)"
new_line = "        expr = re.sub(r'\\)([a-zA-Z])', r')*\\1', expr)"

content = content.replace(old_line, new_line)

# Also improve the implicit multiplication handling
old_implicit = "        # Handle implicit multiplication (e.g., \"2x\" -> \"2*x\")\n        expr = re.sub(r'(\\d)([a-zA-Z])', r'\\1*\\2', expr)\n        expr = re.sub(r'\\)([a-zA-Z0-9])', r')*\\1', expr)\n        expr = re.sub(r'([a-zA-Z0-9])\\(', r'\\1*(', expr)"

new_implicit = """        # Handle implicit multiplication (e.g., "2x" -> "2*x")
        expr = re.sub(r'(\\d)([a-zA-Z])', r'\\1*\\2', expr)
        expr = re.sub(r'\\)([a-zA-Z])', r')*\\1', expr)
        expr = re.sub(r'([0-9])\\(', r'\\1*(', expr)"""

content = content.replace(old_implicit, new_implicit)

with open('apps/grading/services/ai_symbolic_grader.py', 'w') as f:
    f.write(content)

print("✅ Fixed!")
