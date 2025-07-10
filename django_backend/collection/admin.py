
from django.contrib import admin
from collection.models import Collection, Wishlist

@admin.register(Collection)
class CollectionItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_id', 'quantity', 'condition', 'added_date', 'updated_date']
    list_filter = ['condition', 'added_date']
    search_fields = ['user__email', 'card_id']
    readonly_fields = ['added_date', 'updated_date']

@admin.register(Wishlist)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_id', 'priority', 'added_date']
    list_filter = ['priority', 'added_date']
    search_fields = ['user__email', 'card_id']
    readonly_fields = ['added_date']
