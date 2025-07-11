
from rest_framework import serializers
from .models import Collection, Wishlist, CardNote

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

class CardNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardNote
        fields = ['id', 'user', 'card_id', 'note', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
