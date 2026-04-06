from abc import ABC

class base_model(ABC):
    def __init__(self, id):
        self.id = id

    def validate(self): #Potential input validation 
        pass

class Submission(base_model):
    def __init__(self, id, student_id, contents):
        super.__init__(id)
        self.student_id = student_id
        self.contents = contents

    #Validation potentially needed here

class Rubric(base_model):
    def __init__(self, id, title, criteria):
        super().__init__(id)
        self.title = title
        self.criteria = criteria

class Grade(base_model):
    def __init__(self, submission_id, student_id, score, feedback):
        super().__init__(id)
        self.score = score
        self.feedback = feedback

class Answers(base_model):
    def __init__(self, answers):
        self.answers = answers
                