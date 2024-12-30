from django.urls import path
from .views import dashboard_view, CustomTokenObtainPairView, CustomRefreshTokenView, logout, is_authenticated, register

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('logout/', logout, name='logout'),
    path('authenticated/', is_authenticated, name='is_authenticated'),
    path('register/', register, name='register'),  # Combined register view
]