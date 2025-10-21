from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'problems'

router = DefaultRouter()
# ViewSets will be added later

urlpatterns = [
    path('', include(router.urls)),
    # Additional URL patterns will be added as we build views
]
