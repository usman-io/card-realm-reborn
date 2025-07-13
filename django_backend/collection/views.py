
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from .models import Collection, Wishlist, CardNote
from .serializers import CollectionSerializer, WishlistSerializer, CardNoteSerializer
from subscriptions.models import Subscription

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CollectionListCreateView(generics.ListCreateAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user).order_by('-added_date')

    def perform_create(self, serializer):
        # Check subscription limits for free users
        user_subscription = None
        try:
            user_subscription = Subscription.objects.get(user=self.request.user)
        except Subscription.DoesNotExist:
            pass

        # If user doesn't have active subscription (free plan), enforce 100 card limit
        if not user_subscription or not user_subscription.is_active:
            current_count = Collection.objects.filter(user=self.request.user).aggregate(
                total=Count('id')
            )['total'] or 0
            
            if current_count >= 100:
                return Response(
                    {'error': 'Free plan limited to 100 cards. Upgrade to Premium for unlimited cards.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer.save(user=self.request.user)

class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Collection.objects.filter(user=self.request.user)

class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).order_by('-added_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WishlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

class CardNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = CardNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CardNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CardNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CardNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CardNote.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def collection_stats(request):
    """Get collection statistics for the authenticated user"""
    collection_count = Collection.objects.filter(user=request.user).count()
    unique_cards = Collection.objects.filter(user=request.user).values('card_id').distinct().count()
    wishlist_count = Wishlist.objects.filter(user=request.user).count()
    
    return Response({
        'total_cards': collection_count,
        'unique_cards': unique_cards,
        'wishlist_count': wishlist_count,
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_analytics(request):
    """Get comprehensive dashboard analytics with subscription-aware features"""
    user = request.user
    
    # Get user subscription status
    user_subscription = None
    is_premium = False
    try:
        user_subscription = Subscription.objects.get(user=user)
        is_premium = user_subscription.is_active
    except Subscription.DoesNotExist:
        pass

    # Basic analytics available to all users
    collection_items = Collection.objects.filter(user=user)
    total_cards = collection_items.count()
    unique_cards = collection_items.values('card_id').distinct().count()
    wishlist_count = Wishlist.objects.filter(user=user).count()
    graded_cards = collection_items.filter(is_graded=True).count()

    # Calculate usage percentage for free users
    usage_percentage = 0
    cards_remaining = 0
    if not is_premium:
        usage_percentage = min((total_cards / 100) * 100, 100)
        cards_remaining = max(100 - total_cards, 0)

    # Advanced analytics only for premium users
    estimated_value = 0
    completion_rate = 0
    sets_completed = {
        'any_variant': 0,
        'regular_variants': 0,
        'all_variants': 0,
        'standard_set': 0,
        'parallel_set': 0,
    }
    
    if is_premium:
        # Premium users get advanced analytics
        # For now, using placeholder values - can be enhanced with real calculations
        estimated_value = total_cards * 2.5  # Placeholder calculation
        completion_rate = min((unique_cards / max(total_cards, 1)) * 100, 100)

    # Card type breakdown
    card_types = {
        'pokemon': unique_cards * 0.7,  # Approximate breakdown
        'trainer': unique_cards * 0.2,
        'energy': unique_cards * 0.1,
    }

    # Card rarity breakdown (placeholder data)
    card_rarities = {
        'common': unique_cards * 0.4,
        'uncommon': unique_cards * 0.3,
        'rare': unique_cards * 0.2,
        'ultra_rare': unique_cards * 0.1,
    }

    # Recent activity
    recent_collection = collection_items.order_by('-added_date')[:5]
    recent_wishlist = Wishlist.objects.filter(user=user).order_by('-added_date')[:3]
    
    recent_activity = []
    for item in recent_collection:
        recent_activity.append({
            'type': 'collection_add',
            'card_id': item.card_id,
            'date': item.added_date.isoformat(),
            'message': f'Added {item.quantity}x card {item.card_id} to collection',
            'quantity': item.quantity,
            'variant': item.variant,
            'condition': item.condition,
        })
    
    for item in recent_wishlist:
        recent_activity.append({
            'type': 'wishlist_add',
            'card_id': item.card_id,
            'date': item.added_date.isoformat(),
            'message': f'Added card {item.card_id} to wishlist',
            'priority': item.priority,
        })
    
    # Sort by date
    recent_activity.sort(key=lambda x: x['date'], reverse=True)

    return Response({
        'total_cards': total_cards,
        'unique_cards': unique_cards,
        'wishlist_count': wishlist_count,
        'graded_cards': graded_cards,
        'estimated_value': estimated_value if is_premium else 0,
        'completion_rate': completion_rate,
        'is_premium': is_premium,
        'usage_percentage': usage_percentage,
        'cards_remaining': cards_remaining,
        'plan_name': user_subscription.plan if user_subscription and is_premium else 'Free',
        'sets_completed': sets_completed,
        'card_types': card_types,
        'card_rarities': card_rarities,
        'recent_activity': recent_activity[:10],
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_activities(request):
    """Get paginated user activities with search functionality"""
    user = request.user
    search_query = request.GET.get('search', '').strip()
    
    # Get all activities
    collection_items = Collection.objects.filter(user=user).order_by('-added_date')
    wishlist_items = Wishlist.objects.filter(user=user).order_by('-added_date')
    
    activities = []
    
    # Add collection activities
    for item in collection_items:
        activity = {
            'id': f'collection_{item.id}',
            'type': 'collection_add',
            'card_id': item.card_id,
            'date': item.added_date.isoformat(),
            'message': f'Added {item.quantity}x card {item.card_id} to collection',
            'quantity': item.quantity,
            'variant': item.variant,
            'condition': item.condition,
        }
        if not search_query or search_query.lower() in activity['message'].lower() or search_query.lower() in item.card_id.lower():
            activities.append(activity)
    
    # Add wishlist activities
    for item in wishlist_items:
        activity = {
            'id': f'wishlist_{item.id}',
            'type': 'wishlist_add',
            'card_id': item.card_id,
            'date': item.added_date.isoformat(),
            'message': f'Added card {item.card_id} to wishlist',
            'priority': item.priority,
        }
        if not search_query or search_query.lower() in activity['message'].lower() or search_query.lower() in item.card_id.lower():
            activities.append(activity)
    
    # Sort by date
    activities.sort(key=lambda x: x['date'], reverse=True)
    
    # Pagination
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(activities, request)
    
    return paginator.get_paginated_response(page)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_collection_cards(request):
    """Get paginated collection cards"""
    collection_items = Collection.objects.filter(user=request.user).order_by('-added_date')
    
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(collection_items, request)
    
    if page is not None:
        serializer = CollectionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = CollectionSerializer(collection_items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_wishlist_cards(request):
    """Get paginated wishlist cards"""
    wishlist_items = Wishlist.objects.filter(user=request.user).order_by('-added_date')
    
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(wishlist_items, request)
    
    if page is not None:
        serializer = WishlistSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_graded_cards(request):
    """Get paginated graded collection cards"""
    graded_items = Collection.objects.filter(user=request.user, is_graded=True).order_by('-added_date')
    
    paginator = CustomPageNumberPagination()
    page = paginator.paginate_queryset(graded_items, request)
    
    if page is not None:
        serializer = CollectionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = CollectionSerializer(graded_items, many=True)
    return Response(serializer.data)
