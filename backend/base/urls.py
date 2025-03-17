from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # dashboard_view,
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
    manager_profile_view,
    manager_dashboard_view,
    user_dashboard_view,
    user_role_view,
    get_clock_history,
    get_workers, 
    get_project_workers,
    create_project
    
   
)


urlpatterns = [
    
    # path('dashboard/', dashboard_view, name='dashboard'),
    path('manager-dashboard/', manager_dashboard_view, name='manager-dashboard'),
    path('user-dashboard/', user_dashboard_view, name='user-dashboard'),
    
    path('workers/', get_workers, name='get-workers'),  # URL for fetching workers
    path('clock-history/', get_clock_history, name='get-clock-history'), 
    
    path('user-role/', user_role_view, name='user-role'),
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
    path('projects/', create_project, name='create_project'),
    path('projects/<int:project_id>/workers/', get_project_workers, name='get_project_workers'),  # Corrected line 
    
]