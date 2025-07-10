
from django.contrib import admin
from .models import CollectionItem, WishlistItem

@admin.register(CollectionItem)
class CollectionItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_id', 'quantity', 'condition', 'created_at']
    list_filter = ['condition', 'created_at']
    search_fields = ['user__email', 'card_id']

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_id', 'priority', 'created_at']
    list_filter = ['priority', 'created_at']
    search_fields = ['user__email', 'card_id']
