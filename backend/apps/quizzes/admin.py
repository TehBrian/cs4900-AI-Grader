from django.contrib import admin
from .models import Course, CourseEnrollment, Quiz, QuizProblem, QuizAttempt, QuizStatistics

admin.site.register(Course)
admin.site.register(CourseEnrollment)
admin.site.register(Quiz)
admin.site.register(QuizProblem)
admin.site.register(QuizAttempt)
admin.site.register(QuizStatistics)
