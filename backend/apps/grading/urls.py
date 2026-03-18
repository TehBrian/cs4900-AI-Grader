# apps/grading/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "grading"

router = DefaultRouter()
router.register(r"", views.GradingViewSet, basename="grading")


urlpatterns = [
    path("statistics/", views.grading_statistics, name="statistics"),
    path("submissions/", views.GradingViewSet.my_submissions, name="submissions"),
    path("", include(router.urls)),
]
