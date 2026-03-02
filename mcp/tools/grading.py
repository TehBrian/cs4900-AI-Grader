from domain.api_client import post_grade
from domain.models import Grade
#from domain.utils import validate_score Not implemented yet

def submit_grade(submission_id: int, student_id: int, score: float, feedback: str):
    # call validate_score(score)

    grade = Grade(submission_id = submission_id,
                  student_id = student_id,
                  score = score,
                  feedback = feedback,)
        
    result = post_grade(submission_id, student_id, grade) 
    return result