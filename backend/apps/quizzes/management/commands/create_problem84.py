from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.quizzes.models import Course, Quiz, QuizProblem, AnswerBox
from apps.problems.models import Problem
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Create Problem 8.4 - Beam Pattern Derivation (4 attempts)'

    def handle(self, *args, **options):
        instructor, _ = User.objects.get_or_create(
            username='instructor',
            defaults={'email': 'instructor@example.com', 'role': 'instructor', 
                     'first_name': 'Test', 'last_name': 'Instructor'}
        )
        if not instructor.check_password('password123'):
            instructor.set_password('password123')
            instructor.save()

        course = Course.objects.get(course_code='ECE5950', semester='spring', year=2026, instructor=instructor)

        # Delete old quiz if exists
        old_quiz = Quiz.objects.filter(title='Problem 8.4 - Beam Pattern Derivation', course=course).first()
        if old_quiz:
            old_quiz.delete()

        quiz = Quiz.objects.create(
            title='Problem 8.4 - Beam Pattern Derivation',
            course=course,
            description='Multi-step derivation proving Ωp = 4π/Dmax',
            quiz_type='homework',
            time_limit=60,
            available_from=timezone.now(),
            available_until=timezone.now() + timedelta(days=30),
            max_attempts=10,
            show_correct_answers=True,
            is_published=True,
            created_by=instructor,
            total_points=40.0,
        )

        # QUESTION 1 (Page 1) - Answer boxes at steps 1, 3, and 4
        p1 = Problem.objects.create(
            title='Problem 8.4 - Question 1',
            difficulty='advanced',
            author=instructor,
            question_text='''Complete the derivation steps indicated below to show that

Ωₚ = 4π/Dₘₐₓ

where Ωₚ is the antenna beam pattern and Dₘₐₓ is the directivity.

1. Write the definition for Ωₚ, in terms of Pₙ(θ,φ):

[ANSWER_BOX_1]

2. Express the integrand in step 1 in terms of P(R,θ,φ):

3. Express Ωₚ now in terms of U(Ω):

[ANSWER_BOX_2]

4. Express the integral in step 3 as two fractions as shown:

(−)∫[U(Ω)/U₀]dΩ

[ANSWER_BOX_3]

5. Apply the directivity relationships to give the following integral form:

This integral then evaluates to give the final form desired.''',
            solution_expression='', solution_explanation=''
        )
        qp1 = QuizProblem.objects.create(quiz=quiz, problem=p1, problem_order=1, points=10.0)
        
        AnswerBox.objects.create(
            quiz_problem=qp1, box_number=1, box_label='Ωₚ = ',
            expected_answer=r'\int P_n(\theta,\phi) \, d\Omega', points=3.0
        )
        AnswerBox.objects.create(
            quiz_problem=qp1, box_number=2, box_label='Ωₚ = ',
            expected_answer=r'\int \frac{U(\Omega)}{U_{\max}} \, d\Omega', points=4.0
        )
        AnswerBox.objects.create(
            quiz_problem=qp1, box_number=3, box_label='Ωₚ = ',
            expected_answer=r'\frac{U_{\max}}{U_0} \int \frac{U(\Omega)}{U_{\max}} \, d\Omega', points=3.0
        )

        # QUESTION 2 (Page 2) - Answer boxes at steps 1 and 5
        p2 = Problem.objects.create(
            title='Problem 8.4 - Question 2',
            difficulty='advanced',
            author=instructor,
            question_text='''Complete the derivation steps indicated below to show that

Ωₚ = 4π/Dₘₐₓ

where Ωₚ is the antenna beam pattern and Dₘₐₓ is the directivity.

1. Write the definition for Ωₚ, in terms of Pₙ(θ,φ):

[ANSWER_BOX_1]

2. Express the integrand in step 1 in terms of P(R,θ,φ):

3. Express Ωₚ now in terms of U(Ω):

4. Express the integral in step 3 as two fractions as shown:

(−)∫[U(Ω)/U₀]dΩ

5. Apply the directivity relationships to give the following integral form:

[ANSWER_BOX_2]

This integral then evaluates to give the final form desired.''',
            solution_expression='', solution_explanation=''
        )
        qp2 = QuizProblem.objects.create(quiz=quiz, problem=p2, problem_order=2, points=10.0)
        
        AnswerBox.objects.create(
            quiz_problem=qp2, box_number=1, box_label='Ωₚ = ',
            expected_answer=r'\int P_n(\theta,\phi) \, d\Omega', points=5.0
        )
        AnswerBox.objects.create(
            quiz_problem=qp2, box_number=2, box_label='Ωₚ = ',
            expected_answer=r'\frac{4\pi}{D_{\max}}', points=5.0
        )

        # QUESTION 3 (Page 3) - Answer boxes at steps 3 and 4
        p3 = Problem.objects.create(
            title='Problem 8.4 - Question 3',
            difficulty='advanced',
            author=instructor,
            question_text='''Complete the derivation steps indicated below to show that

Ωₚ = 4π/Dₘₐₓ

where Ωₚ is the antenna beam pattern and Dₘₐₓ is the directivity.

1. Write the definition for Ωₚ, in terms of Pₙ(θ,φ):

2. Express the integrand in step 1 in terms of P(R,θ,φ):

3. Express Ωₚ now in terms of U(Ω):

[ANSWER_BOX_1]

4. Express the integral in step 3 as two fractions as shown:

(−)∫[U(Ω)/U₀]dΩ

[ANSWER_BOX_2]

5. Apply the directivity relationships to give the following integral form:

This integral then evaluates to give the final form desired.''',
            solution_expression='', solution_explanation=''
        )
        qp3 = QuizProblem.objects.create(quiz=quiz, problem=p3, problem_order=3, points=10.0)
        
        AnswerBox.objects.create(
            quiz_problem=qp3, box_number=1, box_label='Ωₚ = ',
            expected_answer=r'\int \frac{U(\Omega)}{U_{\max}} \, d\Omega', points=5.0
        )
        AnswerBox.objects.create(
            quiz_problem=qp3, box_number=2, box_label='Ωₚ = ',
            expected_answer=r'\frac{U_{\max}}{U_0} \int \frac{U(\Omega)}{U_0} \, d\Omega', points=5.0
        )

        # QUESTION 4 (Page 4) - Answer boxes at steps 3 and 4
        p4 = Problem.objects.create(
            title='Problem 8.4 - Question 4',
            difficulty='advanced',
            author=instructor,
            question_text='''Complete the derivation steps indicated below to show that

Ωₚ = 4π/Dₘₐₓ

where Ωₚ is the antenna beam pattern and Dₘₐₓ is the directivity.

1. Write the definition for Ωₚ, in terms of Pₙ(θ,φ):

2. Express the integrand in step 1 in terms of P(R,θ,φ):

3. Express Ωₚ now in terms of U(Ω):

[ANSWER_BOX_1]

4. Express the integral in step 3 as two fractions as shown:

(−)∫[U(Ω)/U₀]dΩ

[ANSWER_BOX_2]

5. Apply the directivity relationships to give the following integral form:

<b>This integral then evaluates to give the final form desired.''',
            solution_expression='', solution_explanation=''
        )
        qp4 = QuizProblem.objects.create(quiz=quiz, problem=p4, problem_order=4, points=10.0)
        
        AnswerBox.objects.create(
            quiz_problem=qp4, box_number=1, box_label='Ωₚ = ',
            expected_answer=r'\int \frac{U(\Omega)}{U_{\max}} \, d\Omega', points=5.0
        )
        AnswerBox.objects.create(
            quiz_problem=qp4, box_number=2, box_label='Ωₚ = ',
            expected_answer=r'\frac{U_0}{U_{\max}} \int \frac{U(\Omega)}{U_0} \, d\Omega', points=5.0
        )

        self.stdout.write(self.style.SUCCESS('\n=== Problem 8.4 Complete ==='))
        self.stdout.write(f'Quiz ID: {quiz.id}')
        self.stdout.write(f'4 questions (attempts), total 40 points')