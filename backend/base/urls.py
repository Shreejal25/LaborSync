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
    user_profile_detail_view ,# Corrected import,
    register_manager,
    login_manager,
    assign_task,
    view_user_tasks,
    forgot_password,
    reset_password_confirm,
    manager_profile_view
   
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
    path('manager-profile/', manager_profile_view, name='manager-profile'),
    path('register/manager/', register_manager, name='register_manager'),
    path('login/manager/', login_manager, name='login_manager'),
    path('assign/task/', assign_task, name='assign_task'),
    path('view/tasks/', view_user_tasks, name='view_user_tasks'),
    path('forgot_password/', forgot_password, name='forgot_password'),
    path('reset_password_confirm/<uidb64>/<token>/', reset_password_confirm, name='reset_password_confirm'),
    
]