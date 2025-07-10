
from rest_framework import serializers
from .models import Subscription

class SubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'status', 'current_period_start', 
                 'current_period_end', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']
