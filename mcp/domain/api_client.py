import requests

BASE_URL = "http://127.0.0.1:8000/api" #placeholder url

#potential functions. These will talk to Django to get information

def get_submission(submission_id: int, student_id: int):
    response = requests.get((BASE_URL + "/grading/my_submissions/?student_id={student_id}"))
    return response.json()

def get_problem():
    pass

def get_rubric(rubric_id):
    pass

def post_grade(submission_id: int, student_id: int, grade):
    response = requests.post((BASE_URL + "")) #API for backend post would go here
    return response