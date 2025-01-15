from django.urls import path, include
from .views import (
    dashboard_view,
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    logout,
    is_authenticated,
    register,
    clock_in,
    clock_out,
    user_profile_detail_view  # Corrected import
)

urlpatterns = [
    path('dashboard/', dashboard_view, name='dashboard'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('authenticated/', is_authenticated, name='is_authenticated'),
    path('register/', register, name='register'),
    path('clock_in/', clock_in, name='clock_in'),
    path('clock_out/', clock_out, name='clock_out'),
    path('user/profile/', user_profile_detail_view, name='user_profile_detail'),  # Corrected path
]