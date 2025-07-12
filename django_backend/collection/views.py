from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Avg
from .models import Collection, CardNote
from .serializers import CollectionSerializer, CardNoteSerializer
from subscriptions.models import Subscription
import requests
from django.conf import settings

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_analytics(request):
    user = request.user
    
    # Total cards collected
    total_cards = Collection.objects.filter(user=user).count()
    
    # Total sets completed (example - you might need a different logic)
    total_sets = Collection.objects.filter(user=user).values('card__set').distinct().count()
    
    # Average card condition (assuming you have a condition field)
    average_condition = Collection.objects.filter(user=user).aggregate(Avg('condition'))['condition__avg'] or 0
    
    # Most common card type
    most_common_type = Collection.objects.filter(user=user).values('card__types').annotate(count=Count('card__types')).order_by('-count').first()
    most_common_type_name = most_common_type['card__types'] if most_common_type else "N/A"
    
    # Latest cards added (last 5)
    latest_cards = Collection.objects.filter(user=user).order_by('-created_at')[:5]
    latest_cards_data = CollectionSerializer(latest_cards, many=True).data
    
    return Response({
        'total_cards': total_cards,
        'total_sets': total_sets,
        'average_condition': average_condition,
        'most_common_type': most_common_type_name,
        'latest_cards': latest_cards_data,
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_collection(request):
    page = request.GET.get('page', 1)
    page_size = min(int(request.GET.get('page_size', 30)), 100)
    
    collections = Collection.objects.filter(user=request.user).order_by('-created_at')
    
    # Apply pagination
    paginator = CustomPageNumberPagination()
    paginator.page_size = page_size
    result_page = paginator.paginate_queryset(collections, request)
    
    serializer = CollectionSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_collection(request):
    serializer = CollectionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def collection_detail(request, pk):
    try:
        collection = Collection.objects.get(pk=pk, user=request.user)
    except Collection.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CollectionSerializer(collection)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CollectionSerializer(collection, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        collection.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def card_notes(request, card_id):
    notes = CardNote.objects.filter(user=request.user, card_id=card_id)
    serializer = CardNoteSerializer(notes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_card_note(request):
    serializer = CardNoteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def card_note_detail(request, pk):
    try:
        note = CardNote.objects.get(pk=pk, user=request.user)
    except CardNote.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CardNoteSerializer(note)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CardNoteSerializer(note, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
