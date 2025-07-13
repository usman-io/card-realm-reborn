from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

def user_profile_picture_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/profile_pictures/user_<id>/<filename>
    return f'profile_pictures/user_{instance.id}/{filename}'

class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    profile_picture = models.ImageField(
        upload_to=user_profile_picture_path,
        null=True,
        blank=True,
        default=None
    )
    
    # Add custom related_name to avoid clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='accounts_user_set',
        related_query_name='user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='accounts_user_set',
        related_query_name='user',
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
