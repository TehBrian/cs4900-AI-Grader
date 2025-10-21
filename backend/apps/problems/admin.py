from django.contrib import admin
from .models import (
    ProblemCategory,
    ProblemTag,
    ProblemTemplate,
    Problem,
    ProblemTagging,
    ProblemPart
)

admin.site.register(ProblemCategory)
admin.site.register(ProblemTag)
admin.site.register(ProblemTemplate)
admin.site.register(Problem)
admin.site.register(ProblemTagging)
admin.site.register(ProblemPart)
