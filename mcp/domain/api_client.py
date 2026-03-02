import requests

BASE_URL = "http:localhost:8000/api" #placeholder url

#potential functions. These will talk to Django to get information

def get_submission(submission_id: int, student_id: int):
    pass

def get_rubric(rubric_id):
    pass

def post_grade(submission_id: int, student_id: int, grade):
    pass