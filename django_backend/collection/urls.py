
from django.urls import path
from . import views

urlpatterns = [
    path('collection/', views.CollectionListCreateView.as_view(), name='collection-list'),
    path('collection/<int:pk>/', views.CollectionItemDetailView.as_view(), name='collection-detail'),
    path('wishlist/', views.WishlistListCreateView.as_view(), name='wishlist-list'),
    path('wishlist/<int:pk>/', views.WishlistItemDetailView.as_view(), name='wishlist-detail'),
]
