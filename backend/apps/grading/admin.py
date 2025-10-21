from django.contrib import admin
from .models import (
    GradingEngine,
    StudentSubmission,
    SubmissionPart,
    GradingResult
)

admin.site.register(GradingEngine)
admin.site.register(StudentSubmission)
admin.site.register(SubmissionPart)
admin.site.register(GradingResult)
