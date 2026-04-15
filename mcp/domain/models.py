from abc import ABC

class base_model(ABC):
    def __init__(self, id):
        self.id = id

    def validate(self): #Potential input validation 
        pass

class Submission(base_model):
    submission_id: int
    quiz_id: int
    student_id: int
    student_answers:int
    
    def __init__(self, submission_id, quiz_id, student_id, student_answer):
        self.submission_id = submission_id
        self.quiz_id = quiz_id
        self.student_id = student_id
        self.student_answers = student_answer


class Quiz(base_model):
    quiz_id: int
    problems: list
    title: str
    course: int

    
    def __init__(self, quiz_id, problems, title, course):
        self.quiz_id = quiz_id
        self.problems = problems
        self.title = title
        self.course = course
        
        
class Problem(base_model):
    problem_id: int
    points: float
    problem_number: int

    def __init__(self, problem_id, points, problem_number):
        self.problem_id = problem_id
        self.points = points
        self.problem_number = problem_number
        
    

class Rubric(base_model):
    def __init__(self, id, title, criteria):
        self.title = title
        self.criteria = criteria

class Grade(base_model):
    def __init__(self, submission_id, student_id, score, feedback):
        self.submission_id = submission_id
        self.student_id = student_id
        self.score = score
        self.feedback = feedback

class Answers(base_model):
    def __init__(self, answers):
        self.answers = answers
                