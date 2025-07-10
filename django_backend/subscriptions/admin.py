
from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'current_period_end', 'created_at']
    list_filter = ['plan', 'status', 'created_at']
    search_fields = ['user__email', 'stripe_customer_id', 'stripe_subscription_id']
    readonly_fields = ['stripe_customer_id', 'stripe_subscription_id', 'created_at', 'updated_at']
