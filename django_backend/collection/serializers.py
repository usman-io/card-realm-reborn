
from rest_framework import serializers
from .models import Collection, Wishlist

class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = [
            'id', 'user', 'card_id', 'quantity', 'condition', 'variant', 
            'language', 'is_graded', 'notes', 'added_date', 'updated_date'
        ]
        read_only_fields = ['user', 'added_date', 'updated_date']

class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'card_id', 'priority', 'added_date', 'notes']
        read_only_fields = ['user', 'added_date']
