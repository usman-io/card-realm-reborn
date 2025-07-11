
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db import IntegrityError
from django.db.models import Sum, Count, Q, Case, When, Value, IntegerField
from .models import Collection, Wishlist, CardNote
from .serializers import CollectionSerializer, WishlistSerializer, CardNoteSerializer
import requests
from decimal import Decimal

class CollectionListCreateView(generics.ListCreateAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Collection.objects.filter(user=self.request.user)
        
        # Filter by card_id if provided
        card_id = self.request.query_params.get('card_id')
        if card_id:
            queryset = queryset.filter(card_id=card_id)
        
        # Filter by condition if provided
        condition = self.request.query_params.get('condition')
        if condition:
            queryset = queryset.filter(condition=condition)
        
        # Order by most recent first
        return queryset.order_by('-added_date')

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            # If the same card with same condition/variant/language exists, update quantity
            existing = Collection.objects.get(
                user=self.request.user,
                card_id=serializer.validated_data['card_id'],
                condition=serializer.validated_data.get('condition', 'near_mint'),
                variant=serializer.validated_data.get('variant', 'normal'),
                language=serializer.validated_data.get('language', 'en')
            )
            existing.quantity += serializer.validated_data.get('quantity', 1)
            existing.save()
            serializer.instance = existing

class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)

class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Wishlist.objects.filter(user=self.request.user)
        
        # Filter by card_id if provided
        card_id = self.request.query_params.get('card_id')
        if card_id:
            queryset = queryset.filter(card_id=card_id)
        
        # Filter by priority if provided
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Order by priority (urgent first) then by most recent
        priority_order = Case(
            When(priority='urgent', then=Value(0)),
            When(priority='high', then=Value(1)),
            When(priority='medium', then=Value(2)),
            When(priority='low', then=Value(3)),
            default=Value(4),
            output_field=IntegerField(),
        )
        
        return queryset.order_by(priority_order, '-added_date')

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            return Response(
                {"error": "Card already in wishlist"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class WishlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

class CardNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = CardNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CardNote.objects.filter(user=self.request.user)
        
        # Filter by card_id if provided
        card_id = self.request.query_params.get('card_id')
        if card_id:
            queryset = queryset.filter(card_id=card_id)
        
        return queryset.order_by('-updated_at')

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            # If note already exists, update it
            existing = CardNote.objects.get(
                user=self.request.user,
                card_id=serializer.validated_data['card_id']
            )
            existing.note = serializer.validated_data['note']
            existing.save()
            serializer.instance = existing

class CardNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CardNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CardNote.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def collection_stats(request):
    """Get collection statistics for the user"""
    total_cards = Collection.objects.filter(user=request.user).aggregate(
        total_quantity=Sum('quantity')
    )['total_quantity'] or 0
    
    unique_cards = Collection.objects.filter(user=request.user).count()
    wishlist_count = Wishlist.objects.filter(user=request.user).count()
    
    return Response({
        'total_cards': total_cards,
        'unique_cards': unique_cards,
        'wishlist_count': wishlist_count
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_analytics(request):
    """Get detailed dashboard analytics for the user"""
    user_collection = Collection.objects.filter(user=request.user)
    user_wishlist = Wishlist.objects.filter(user=request.user)
    user_notes = CardNote.objects.filter(user=request.user)
    
    # Basic stats
    total_cards = user_collection.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
    unique_cards = user_collection.count()
    wishlist_count = user_wishlist.count()
    graded_cards = user_collection.filter(is_graded=True).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
    
    # Sets completed - simplified calculation
    sets_completed = {
        'any_variant': 0,
        'regular_variants': 0,
        'all_variants': 0,
        'standard_set': 0,
        'parallel_set': 0
    }
    
    # Card type distribution (simplified - we'll use card_id patterns)
    card_types = {
        'pokemon': user_collection.filter(card_id__icontains='pokemon').count() or 1,  # Default to 1 to avoid division by zero
        'trainer': user_collection.filter(card_id__icontains='trainer').count(),
        'energy': user_collection.filter(card_id__icontains='energy').count()
    }
    
    # Card rarity distribution (simplified)
    card_rarities = {
        'common': user_collection.filter(card_id__icontains='common').count(),
        'uncommon': user_collection.filter(card_id__icontains='uncommon').count() or 1,  # Default to 1
        'rare': user_collection.filter(card_id__icontains='rare').count(),
        'ultra_rare': user_collection.filter(card_id__icontains='ultra').count()
    }
    
    # Recent activity
    recent_collection = user_collection.order_by('-added_date')[:5]
    recent_wishlist = user_wishlist.order_by('-added_date')[:5]
    recent_notes = user_notes.order_by('-updated_at')[:5]
    
    recent_activity = []
    
    for item in recent_collection:
        recent_activity.append({
            'type': 'collection_add',
            'card_id': item.card_id,
            'quantity': item.quantity,
            'variant': item.variant,
            'language': item.language,
            'condition': item.condition,
            'date': item.added_date.isoformat(),
            'message': f"Added {item.quantity} {item.variant} variant(s) of card {item.card_id} to collection (language {item.language} and condition {item.condition})."
        })
    
    for item in recent_wishlist:
        recent_activity.append({
            'type': 'wishlist_add',
            'card_id': item.card_id,
            'priority': item.priority,
            'date': item.added_date.isoformat(),
            'message': f"Added card {item.card_id} to wishlist."
        })
    
    for item in recent_notes:
        recent_activity.append({
            'type': 'note_add',
            'card_id': item.card_id,
            'date': item.updated_at.isoformat(),
            'message': f"Added a note to card {item.card_id}."
        })
    
    # Sort recent activity by date
    recent_activity.sort(key=lambda x: x['date'], reverse=True)
    recent_activity = recent_activity[:10]  # Limit to 10 items
    
    # Quick access stats
    quick_access = {
        'sets_in_progress': max(1, unique_cards // 10),  # Rough estimate
        'cards_in_collection': unique_cards,
        'cards_in_wishlist': wishlist_count,
        'duplicate_variants': user_collection.filter(quantity__gt=1).count(),
        'graded_cards': graded_cards
    }
    
    # Estimated collection value (placeholder - would need market data)
    estimated_value = float(total_cards * 2.50)  # $2.50 average per card as placeholder
    
    # Completion rate (placeholder calculation)
    completion_rate = min(100, (unique_cards / max(1, unique_cards + wishlist_count)) * 100)
    
    return Response({
        'total_cards': total_cards,
        'unique_cards': unique_cards,
        'wishlist_count': wishlist_count,
        'graded_cards': graded_cards,
        'estimated_value': estimated_value,
        'completion_rate': round(completion_rate, 1),
        'sets_completed': sets_completed,
        'card_types': card_types,
        'card_rarities': card_rarities,
        'quick_access': quick_access,
        'recent_activity': recent_activity
    })
