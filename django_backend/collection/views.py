
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db import IntegrityError
from .models import Collection, Wishlist
from .serializers import CollectionSerializer, WishlistSerializer

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
        priority_order = ['urgent', 'high', 'medium', 'low']
        return queryset.order_by(
            *[f"priority='{p}'" for p in priority_order], 
            '-added_date'
        )

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

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def collection_stats(request):
    """Get collection statistics for the user"""
    total_cards = Collection.objects.filter(user=request.user).aggregate(
        total_quantity=models.Sum('quantity')
    )['total_quantity'] or 0
    
    unique_cards = Collection.objects.filter(user=request.user).count()
    wishlist_count = Wishlist.objects.filter(user=request.user).count()
    
    return Response({
        'total_cards': total_cards,
        'unique_cards': unique_cards,
        'wishlist_count': wishlist_count
    })
