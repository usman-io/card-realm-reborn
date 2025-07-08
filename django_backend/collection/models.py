
from django.db import models
from django.contrib.auth.models import User

class Collection(models.Model):
    CONDITION_CHOICES = [
        ('mint', 'Mint'),
        ('near_mint', 'Near Mint'),
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('light_played', 'Light Played'),
        ('played', 'Played'),
        ('poor', 'Poor'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    card_id = models.CharField(max_length=100)  # Pokemon TCG API card ID
    quantity = models.PositiveIntegerField(default=1)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='near_mint')
    added_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'card_id', 'condition']

class Wishlist(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    card_id = models.CharField(max_length=100)  # Pokemon TCG API card ID
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    added_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['user', 'card_id']
