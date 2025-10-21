# apps/problems/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import json
import uuid

User = get_user_model()

class ProblemCategory(models.Model):
    """
    Categories for organizing mathematical problems
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    
    # Display settings
    icon = models.CharField(max_length=50, blank=True)  # Font Awesome icon class
    color = models.CharField(max_length=7, default='#007bff')  # Hex color code
    sort_order = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'problem_categories'
        verbose_name = 'Problem Category'
        verbose_name_plural = 'Problem Categories'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} → {self.name}"
        return self.name


class Problem(models.Model):
    """
    Mathematical problems with variable parameters and LaTeX support
    """
    DIFFICULTY_LEVELS = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    )
    
    # Basic information
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="Brief description of the problem")
    category = models.ForeignKey(ProblemCategory, on_delete=models.SET_NULL, null=True, blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='intermediate')
    
    # Problem content
    question_text = models.TextField(help_text="Problem statement with LaTeX formatting")
    question_latex = models.TextField(blank=True, help_text="Pre-rendered LaTeX for question")
    
    # Solution information
    solution_expression = models.TextField(help_text="Correct answer in LaTeX format")
    solution_explanation = models.TextField(blank=True, help_text="Step-by-step solution explanation")
    
    # Variable parameters (stored as JSON)
    variables = models.JSONField(
        default=dict,
        help_text="Variable definitions: {var_name: {min: val, max: val, type: 'int'|'float', step: val}}"
    )
    
    # Answer configuration
    answer_tolerance = models.FloatField(
        default=1e-6,
        validators=[MinValueValidator(1e-12), MaxValueValidator(1e-1)],
        help_text="Numerical tolerance for answer checking"
    )
    allow_equivalent_forms = models.BooleanField(
        default=True,
        help_text="Allow mathematically equivalent expressions"
    )
    
    # Multi-part problem support
    has_multiple_parts = models.BooleanField(default=False)
    total_parts = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    # Media attachments
    problem_image = models.ImageField(upload_to='problem_images/', blank=True, null=True)
    supplementary_files = models.JSONField(default=list, blank=True)  # List of file URLs
    
    # Authoring information
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_problems')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Status and usage
    is_published = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False, help_text="Can be used as template for new problems")
    usage_count = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    average_difficulty_rating = models.FloatField(default=0.0)
    success_rate = models.FloatField(default=0.0)
    average_solve_time = models.FloatField(default=0.0)  # in seconds
    
    class Meta:
        db_table = 'problems'
        verbose_name = 'Problem'
        verbose_name_plural = 'Problems'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'difficulty']),
            models.Index(fields=['author', 'is_published']),
            models.Index(fields=['is_published', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_difficulty_display()})"
    
    def generate_parameters(self):
        """Generate random parameter values based on variable definitions."""
        import random
        parameters = {}
        
        for var_name, config in self.variables.items():
            min_val = config.get('min', 0)
            max_val = config.get('max', 10)
            var_type = config.get('type', 'float')
            step = config.get('step', 1)
            
            if var_type == 'int':
                parameters[var_name] = random.randint(min_val, max_val)
            elif var_type == 'float':
                if step:
                    # Generate stepped values
                    steps = int((max_val - min_val) / step)
                    parameters[var_name] = min_val + random.randint(0, steps) * step
                else:
                    parameters[var_name] = random.uniform(min_val, max_val)
        
        return parameters
    
    def render_with_parameters(self, parameters):
        """Render question text with specific parameter values."""
        question = self.question_text
        for var_name, value in parameters.items():
            question = question.replace(f"{{{var_name}}}", str(value))
        return question
    
    def calculate_expected_answer(self, parameters):
        """Calculate the expected answer given parameter values."""
        # This will be implemented with SymPy integration
        # For now, return the solution expression with substituted values
        solution = self.solution_expression
        for var_name, value in parameters.items():
            solution = solution.replace(f"{{{var_name}}}", str(value))
        return solution


class ProblemPart(models.Model):
    """
    Individual parts of multi-part problems
    """
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='parts')
    part_number = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    
    # Part content
    part_text = models.TextField(help_text="Text for this specific part")
    expected_answer = models.TextField(help_text="Expected answer for this part in LaTeX")
    
    # Grading configuration
    points = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(100)])
    allow_partial_credit = models.BooleanField(default=True)
    
    # Answer format requirements
    answer_format = models.CharField(
        max_length=50,
        choices=(
            ('expression', 'Mathematical Expression'),
            ('numeric', 'Numeric Value'),
            ('multiple_choice', 'Multiple Choice'),
            ('true_false', 'True/False'),
        ),
        default='expression'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'problem_parts'
        verbose_name = 'Problem Part'
        verbose_name_plural = 'Problem Parts'
        unique_together = ['problem', 'part_number']
        ordering = ['problem', 'part_number']
    
    def __str__(self):
        return f"{self.problem.title} - Part {self.part_number}"


class ProblemTag(models.Model):
    """
    Tags for problem organization and search
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6c757d')  # Hex color code
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'problem_tags'
        verbose_name = 'Problem Tag'
        verbose_name_plural = 'Problem Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ProblemTagging(models.Model):
    """
    Many-to-many relationship between problems and tags
    """
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    tag = models.ForeignKey(ProblemTag, on_delete=models.CASCADE)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'problem_tagging'
        unique_together = ['problem', 'tag']
        verbose_name = 'Problem Tagging'
        verbose_name_plural = 'Problem Taggings'
    
    def __str__(self):
        return f"{self.problem.title} → {self.tag.name}"


class ProblemTemplate(models.Model):
    """
    Reusable problem templates for quick problem creation
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(ProblemCategory, on_delete=models.SET_NULL, null=True)
    
    # Template structure
    template_data = models.JSONField(
        help_text="Complete problem template including question, variables, solution"
    )
    
    # Usage tracking
    usage_count = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=False)
    
    # Authoring
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'problem_templates'
        verbose_name = 'Problem Template'
        verbose_name_plural = 'Problem Templates'
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return f"Template: {self.name}"
