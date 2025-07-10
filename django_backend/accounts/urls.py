
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    LoginView, 
    RegisterView, 
    ProfileView,
    LogoutView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
