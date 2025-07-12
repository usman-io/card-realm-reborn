
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('subscription/', views.SubscriptionListCreateView.as_view(), name='subscription-list-create'),
    path('subscription/<int:pk>/', views.SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('create-portal-session/', views.create_portal_session, name='create-portal-session'),
    path('cancel-subscription/', views.cancel_subscription, name='cancel-subscription'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]
