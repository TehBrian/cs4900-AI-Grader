from domain.api_client import post_grade
from domain.models import Grade
import traceback

def submit_grade(submission_id: int, student_id: int, score: float, feedback: str):
    # call validate_score(score)
    try:
        grade = Grade(submission_id = submission_id,
                      student_id = student_id,
                      score = score,
                      feedback = feedback,)
    except Exception as e:
        print("PROCESSING ERROR: ")
        traceback.print_exc()
    result = post_grade(submission_id, student_id, grade) 
    return result