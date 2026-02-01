from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    # JWT Token endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Include app routes
    path("api/users/", include("apps.users.urls", namespace="users")),
    path("api/problems/", include("apps.problems.urls", namespace="problems")),
    path("api/grading/", include("apps.grading.urls", namespace="grading")),
    path("api/quizzes/", include("apps.quizzes.urls", namespace="quizzes")),
]


# Template and Assignment APIs
from apps.problems.urls_template import router as template_router
from apps.assignments.urls import router as assignment_router

urlpatterns += [
    path("api/templates/", include("apps.problems.urls_template")),
    path("api/assignments/", include("apps.assignments.urls")),
]
