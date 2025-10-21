# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser
    Supports different user roles: Student, Instructor, Administrator
    """
    USER_ROLES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Administrator'),
    )
    
    # Basic user information
    role = models.CharField(max_length=20, choices=USER_ROLES, default='student')
    win_number = models.CharField(
        max_length=10,
        unique=True,
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{8,10}$',
                message='WIN number must be 8-10 digits',
                code='invalid_win'
            ),
        ],
        help_text="Western Michigan University ID Number"
    )
    
    # Contact information
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in format: '+999999999'. 9-15 digits allowed.",
                code='invalid_phone'
            ),
        ]
    )
    
    # Academic information
    department = models.CharField(max_length=100, blank=True)
    academic_level = models.CharField(
        max_length=20,
        choices=(
            ('freshman', 'Freshman'),
            ('sophomore', 'Sophomore'),
            ('junior', 'Junior'),
            ('senior', 'Senior'),
            ('graduate', 'Graduate'),
            ('faculty', 'Faculty'),
        ),
        blank=True
    )
    
    # Profile settings
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    timezone = models.CharField(max_length=50, default='America/Detroit')
    
    # Account status
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f'{self.first_name} {self.last_name}'
        return full_name.strip()
    
    def is_instructor(self):
        """Check if user is an instructor."""
        return self.role == 'instructor'
    
    def is_student(self):
        """Check if user is a student."""
        return self.role == 'student'
    
    def is_admin_user(self):
        """Check if user is an administrator."""
        return self.role == 'admin'


class UserProfile(models.Model):
    """
    Extended profile information for users
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    
    # Academic preferences
    preferred_math_notation = models.CharField(
        max_length=20,
        choices=(
            ('latex', 'LaTeX'),
            ('mathml', 'MathML'),
            ('plain', 'Plain Text'),
        ),
        default='latex'
    )
    
    # Learning preferences (for students)
    show_hints = models.BooleanField(default=True)
    show_step_by_step = models.BooleanField(default=True)
    preferred_feedback_level = models.CharField(
        max_length=20,
        choices=(
            ('minimal', 'Minimal'),
            ('detailed', 'Detailed'),
            ('comprehensive', 'Comprehensive'),
        ),
        default='detailed'
    )
    
    # Privacy settings
    allow_analytics = models.BooleanField(default=True)
    public_profile = models.BooleanField(default=False)
    
    # Performance tracking
    total_problems_attempted = models.PositiveIntegerField(default=0)
    total_problems_correct = models.PositiveIntegerField(default=0)
    average_response_time = models.FloatField(default=0.0)  # in seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile for {self.user.username}"
    
    @property
    def success_rate(self):
        """Calculate the success rate for problems attempted."""
        if self.total_problems_attempted == 0:
            return 0.0
        return (self.total_problems_correct / self.total_problems_attempted) * 100
    
    def update_performance(self, is_correct, response_time):
        """Update performance metrics."""
        self.total_problems_attempted += 1
        if is_correct:
            self.total_problems_correct += 1
        
        # Update average response time
        total_time = self.average_response_time * (self.total_problems_attempted - 1)
        self.average_response_time = (total_time + response_time) / self.total_problems_attempted
        self.save()


class UserSession(models.Model):
    """
    Track user sessions for analytics and security
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Session timing
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    
    # Session data
    is_active = models.BooleanField(default=True)
    location = models.CharField(max_length=100, blank=True)  # City, State derived from IP
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def duration(self):
        """Calculate session duration."""
        end_time = self.logout_time or self.last_activity
        return end_time - self.login_time
