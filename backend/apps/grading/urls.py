# apps/grading/urls.py
from django.urls import path
from . import views

app_name = 'grading'

urlpatterns = [
    path('grade/', views.grade_expression, name='grade'),
]
