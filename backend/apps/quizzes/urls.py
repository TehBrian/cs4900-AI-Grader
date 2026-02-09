# apps/quizzes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'quizzes'

router = DefaultRouter()
router.register('courses', views.CourseViewSet, basename='course')
router.register('quizzes', views.QuizViewSet, basename='quizzes')

urlpatterns = [
    path('quiz/statistics/', views.quiz_statistics, name='statistics'),
    path('', include(router.urls)),
]
