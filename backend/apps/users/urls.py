# backend/apps/users/urls.py
from django.urls import path
from .views import RegisterView, CurrentUserView, UserListView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView, # Optional
    TokenBlacklistView # Optional
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # DRF SimpleJWT login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'), # Optional
    # path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'), # For full logout with refresh token invalidation
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('users/', UserListView.as_view(), name='user_list_search'), # New endpoint for user search

]