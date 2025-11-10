# apps/problems/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'problems'

router = DefaultRouter()
router.register(r'categories', views.ProblemCategoryViewSet, basename='category')
router.register(r'', views.ProblemViewSet, basename='problem')

urlpatterns = [
    path('statistics/', views.problem_statistics, name='statistics'),
    path('', include(router.urls)),
]
