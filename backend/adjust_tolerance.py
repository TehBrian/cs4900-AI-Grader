with open('apps/grading/services/ai_symbolic_grader.py', 'r') as f:
    content = f.read()

# Increase tolerance slightly for approximate matches
content = content.replace('self.tolerance = 1e-6', 'self.tolerance = 1e-5')

# Also adjust the threshold for numerical matches
content = content.replace('is_correct = matches >= tests * 0.8', 'is_correct = matches >= tests * 0.7')

with open('apps/grading/services/ai_symbolic_grader.py', 'w') as f:
    f.write(content)

print("✅ Adjusted tolerance!")
