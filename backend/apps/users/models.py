# backend/apps/users/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
import re # For email validation

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        
        # University email validation (example: ends with .edu or .ac.xx)
        # Adjust this regex to your university's email domain(s)
        # This is a basic check, more robust validation might be needed
        if not re.match(r"^[a-zA-Z0-9._%+-]+@rdu\.edu\.tr$", email, re.IGNORECASE): # Added re.IGNORECASE
            raise ValueError(_('Please use a valid university email address.'))
            
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True) # Superusers should be active by default
        extra_fields.setdefault('role', User.Role.ADMIN) # Default role for superuser

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', _('Student')
        LECTURER = 'LECTURER', _('Lecturer')
        ADVISOR = 'ADVISOR', _('Advisor')
        ADMIN = 'ADMIN', _('Admin') # Optional, for platform administrators

    username = None # We'll use email as the unique identifier
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)
    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.STUDENT, # Default role for new registrations
    )
    # Add other fields if needed, e.g., department
    # university_id_number = models.CharField(max_length=50, blank=True, null=True, unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name'] # 'role' could be here if not defaulted

    objects = UserManager()

    def __str__(self):
        return self.email

# Optional: Profile model (can be created later)
# class Profile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
#     avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
#     bio = models.TextField(blank=True)
#     # ... other profile fields