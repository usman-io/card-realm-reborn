
from django.db import models
from django.conf import settings

class Collection(models.Model):
    CONDITION_CHOICES = [
        ('mint', 'Mint'),
        ('near_mint', 'Near Mint'),
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('light_played', 'Light Played'),
        ('played', 'Played'),
        ('poor', 'Poor'),
        ('unspecified', 'Unspecified'),
    ]

    VARIANT_CHOICES = [
        ('normal', 'Normal'),
        ('reverse_holo', 'Reverse Holo'),
        ('holo', 'Holo'),
        ('first_edition', 'First Edition'),
        ('shadowless', 'Shadowless'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English (EN)'),
        ('ja', 'Japanese (JA)'),
        ('de', 'German (DE)'),
        ('fr', 'French (FR)'),
        ('es', 'Spanish (ES)'),
        ('it', 'Italian (IT)'),
        ('pt', 'Portuguese (PT)'),
        ('ko', 'Korean (KO)'),
        ('zh', 'Chinese (ZH)'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    card_id = models.CharField(max_length=100)  # Pokemon TCG API card ID
    quantity = models.PositiveIntegerField(default=1)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='near_mint')
    variant = models.CharField(max_length=20, choices=VARIANT_CHOICES, default='normal')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    is_graded = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    added_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'card_id', 'condition', 'variant', 'language']

    def __str__(self):
        return f"{self.user.email} - {self.card_id} ({self.quantity})"

class Wishlist(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    card_id = models.CharField(max_length=100)  # Pokemon TCG API card ID
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    added_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['user', 'card_id']

    def __str__(self):
        return f"{self.user.email} - {self.card_id}"
