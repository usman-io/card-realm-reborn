
from django.urls import path
from . import views

urlpatterns = [
    path('collection/', views.CollectionListCreateView.as_view(), name='collection-list'),
    path('collection/<int:pk>/', views.CollectionDetailView.as_view(), name='collection-detail'),
    path('collection/stats/', views.collection_stats, name='collection-stats'),
    path('wishlist/', views.WishlistListCreateView.as_view(), name='wishlist-list'),
    path('wishlist/<int:pk>/', views.WishlistDetailView.as_view(), name='wishlist-detail'),
    path('notes/', views.CardNoteListCreateView.as_view(), name='card-notes-list'),
    path('notes/<int:pk>/', views.CardNoteDetailView.as_view(), name='card-notes-detail'),
    path('dashboard/analytics/', views.dashboard_analytics, name='dashboard-analytics'),
    path('activities/', views.user_activities, name='user-activities'),
    path('user/collection/', views.user_collection_cards, name='user-collection-cards'),
    path('user/wishlist/', views.user_wishlist_cards, name='user-wishlist-cards'),
    path('user/graded/', views.user_graded_cards, name='user-graded-cards'),
]
