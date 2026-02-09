with open("apps/grading/services/ai_symbolic_grader.py", "r") as f:
    content = f.read()

# Lower the passing threshold from 70% to 60%
content = content.replace(
    "is_correct = final_score >= 0.7  # 70% threshold",
    "is_correct = final_score >= 0.6  # 60% threshold",
)

with open("apps/grading/services/ai_symbolic_grader.py", "w") as f:
    f.write(content)

print("✅ Lowered threshold to 60%!")
