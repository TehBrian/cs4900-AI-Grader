from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.quizzes.models import Course, Quiz, QuizProblem, AnswerBox
from apps.problems.models import Problem
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Create Problem 8.3 - Exact match to sponsor requirements'

    def handle(self, *args, **options):
        instructor, _ = User.objects.get_or_create(
            username='instructor',
            defaults={'email': 'instructor@example.com', 'role': 'instructor', 'first_name': 'Test', 'last_name': 'Instructor'}
        )
        if not instructor.check_password('password123'):
            instructor.set_password('password123')
            instructor.save()

        course, _ = Course.objects.get_or_create(
            course_code='ECE5950', semester='spring', year=2026, instructor=instructor,
            defaults={'title': 'Telecommunications', 'description': 'Advanced Telecommunications Course'}
        )

        quiz, _ = Quiz.objects.get_or_create(
            title='Problem 8.3 - Antenna Definitions', course=course,
            defaults={
                'description': 'Antenna relationships', 'quiz_type': 'homework', 'time_limit': 30,
                'available_from': timezone.now(), 'available_until': timezone.now() + timedelta(days=30),
                'max_attempts': 10, 'show_correct_answers': True, 'is_published': True,
                'created_by': instructor, 'total_points': 60.0,
            }
        )

        QuizProblem.objects.filter(quiz=quiz).delete()
        Problem.objects.filter(title__startswith='Problem 8.3').delete()

        # PAGE 1
        p1 = Problem.objects.create(
            title='Problem 8.3 - Page 1', difficulty='intermediate', author=instructor,
            question_text='''Write expressions for the following antenna relationships in Chapter 8. Note: for power density terms, irradiance P is [W/m²] while intensity U is [W/rad²]. Also, write any multiple integrals just as a single integral.

1. Antenna beam pattern Ωₚ in terms of normalized irradiance Pₙ(θ,φ)

[ANSWER_BOX_1]

2. Average radiation intensity U₀ in terms of radiated power Wᵣ

[ANSWER_BOX_2]''', solution_expression='', solution_explanation=''
        )
        qp1 = QuizProblem.objects.create(quiz=quiz, problem=p1, problem_order=1, points=10.0)
        AnswerBox.objects.create(quiz_problem=qp1, box_number=1, box_label='Ωₚ = ', expected_answer=r'\int P_n(\theta,\phi) \, d\Omega', points=5.0)
        AnswerBox.objects.create(quiz_problem=qp1, box_number=2, box_label='U₀ = ', expected_answer=r'\frac{W_r}{4\pi}', points=5.0)

        # PAGE 2
        p2 = Problem.objects.create(
            title='Problem 8.3 - Page 2', difficulty='intermediate', author=instructor,
            question_text='''Write expressions for the following antenna relationships in Chapter 8. Note: for power density terms, irradiance P is [W/m²] while intensity U is [W/rad²]. Also, write any multiple integrals just as a single integral.

1. Ratio of irradiances P(R,θ,φ)/Pₘₐₓ in terms of a ratio of radiation intensities U

[ANSWER_BOX_1]

2. Antenna gain G(Ω) in terms of radiation intensity U

[ANSWER_BOX_2]''', solution_expression='', solution_explanation=''
        )
        qp2 = QuizProblem.objects.create(quiz=quiz, problem=p2, problem_order=2, points=10.0)
        AnswerBox.objects.create(quiz_problem=qp2, box_number=1, box_label='P(R,θ,φ)/Pₘₐₓ = ', expected_answer=r'\frac{U(\theta,\phi)}{U_{\max}}', points=5.0)
        AnswerBox.objects.create(quiz_problem=qp2, box_number=2, box_label='G(Ω) = ', expected_answer=r'\frac{4\pi U(\theta,\phi)}{W_r}', points=5.0)

        # PAGE 3
        p3 = Problem.objects.create(
            title='Problem 8.3 - Page 3', difficulty='intermediate', author=instructor,
            question_text='''Write expressions for the following antenna relationships in Chapter 8. Note: for power density terms, irradiance P is [W/m²] while intensity U is [W/rad²]. Also, write any multiple integrals just as a single integral.

1. Ratio of irradiances P(R,θ,φ)/Pₘₐₓ in terms of a ratio of radiation intensities U

[ANSWER_BOX_1]

2. Antenna gain G(Ω) in terms of radiation intensity U

[ANSWER_BOX_2]''', solution_expression='', solution_explanation=''
        )
        qp3 = QuizProblem.objects.create(quiz=quiz, problem=p3, problem_order=3, points=10.0)
        AnswerBox.objects.create(quiz_problem=qp3, box_number=1, box_label='P(R,θ,φ)/Pₘₐₓ = ', expected_answer=r'\frac{U(\theta,\phi)}{U_{\max}}', points=5.0)
        AnswerBox.objects.create(quiz_problem=qp3, box_number=2, box_label='G(Ω) = ', expected_answer=r'\frac{4\pi U(\theta,\phi)}{W_r}', points=5.0)

        # PAGE 4
        p4 = Problem.objects.create(
            title='Problem 8.3 - Page 4', difficulty='intermediate', author=instructor,
            question_text='''Write expressions for the following antenna relationships in Chapter 8. Note: for power density terms, irradiance P is [W/m²] while intensity U is [W/rad²]. Also, write any multiple integrals just as a single integral.

1. Antenna radiated power Wᵣ in terms of radiation intensity U

[ANSWER_BOX_1]

2. Antenna beam pattern Ωₚ in terms of normalized irradiance Pₙ(θ,φ)

[ANSWER_BOX_2]''', solution_expression='', solution_explanation=''
        )
        qp4 = QuizProblem.objects.create(quiz=quiz, problem=p4, problem_order=4, points=10.0)
        AnswerBox.objects.create(quiz_problem=qp4, box_number=1, box_label='Wᵣ = ', expected_answer=r'\int U(\theta,\phi) \, d\Omega', points=5.0)
        AnswerBox.objects.create(quiz_problem=qp4, box_number=2, box_label='Ωₚ = ', expected_answer=r'\int P_n(\theta,\phi) \, d\Omega', points=5.0)

        # PAGE 5
        p5 = Problem.objects.create(
            title='Problem 8.3 - Page 5', difficulty='intermediate', author=instructor,
            question_text='''Write expressions for the following antenna relationships in Chapter 8. Note: for power density terms, irradiance P is [W/m²] while intensity U is [W/rad²]. Also, write any multiple integrals just as a single integral.

1. Normalized power density Pₙ(θ,φ) in terms of irradiance P(R,θ,φ)

[ANSWER_BOX_1]

2. Antenna beam pattern Ωₚ in terms of normalized irradiance Pₙ(θ,φ)

[ANSWER_BOX_2]''', solution_expression='', solution_explanation=''
        )
        qp5 = QuizProblem.objects.create(quiz=quiz, problem=p5, problem_order=5, points=10.0)
        AnswerBox.objects.create(quiz_problem=qp5, box_number=1, box_label='Pₙ(θ,φ) = ', expected_answer=r'\frac{P(R,\theta,\phi)}{P_{\max}}', points=5.0)
        AnswerBox.objects.create(quiz_problem=qp5, box_number=2, box_label='Ωₚ = ', expected_answer=r'\int P_n(\theta,\phi) \, d\Omega', points=5.0)

        # PAGE 6
        p6 = Problem.objects.create(
            title='Problem 8.3 - Page 6', difficulty='intermediate', author=instructor,
            question_text='''Write expressions for the following antenna relationships in Chapter 8. Note: for power density terms, irradiance P is [W/m²] while intensity U is [W/rad²]. Also, write any multiple integrals just as a single integral.

1. Normalized power density Pₙ(θ,φ) in terms of irradiance P(R,θ,φ)

[ANSWER_BOX_1]

2. Antenna radiated power Wᵣ in terms of radiation intensity U

[ANSWER_BOX_2]''', solution_expression='', solution_explanation=''
        )
        qp6 = QuizProblem.objects.create(quiz=quiz, problem=p6, problem_order=6, points=10.0)
        AnswerBox.objects.create(quiz_problem=qp6, box_number=1, box_label='Pₙ(θ,φ) = ', expected_answer=r'\frac{P(R,\theta,\phi)}{P_{\max}}', points=5.0)
        AnswerBox.objects.create(quiz_problem=qp6, box_number=2, box_label='Wᵣ = ', expected_answer=r'\int U(\theta,\phi) \, d\Omega', points=5.0)

        self.stdout.write(self.style.SUCCESS(f'\n=== Problem 8.3 Complete ===\nQuiz ID: {quiz.id}\n6 pages, 12 answer boxes'))