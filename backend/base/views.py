from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail

from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework.authtoken.models import Token  # Correct import
from rest_framework import viewsets, status
from django.utils.http import urlsafe_base64_encode

from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
    


from .models import Dashboard, UserProfile,TimeLog,ManagerProfile, Task, Project
from rest_framework import generics, permissions, status
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from .serializer import DashboardSerializer, CombinedUserSerializer, ClockInClockOutSerializer, UserProfileSerializer,UserSerializer,ManagerSerializer,ManagerProfileSerializer,TaskSerializer, TaskViewSerializer, ProjectSerializer, ProjectWorkerSerializer
from rest_framework.decorators import api_view, permission_classes 
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.utils import timezone

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']
            refresh_token = tokens['refresh']

            res = Response()

            res.data = {'success': True}

            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            is_manager = False
            user = authenticate(username=request.data.get('username'), password=request.data.get('password'))

            if user is not None:
                is_manager = user.groups.filter(name='Managers').exists()

            res.data['is_manager'] = is_manager
            res.data['dashboard_type'] = 'manager' if is_manager else 'user' #adding dashboard type

            return res
        except:
            return Response({'success': False, 'dashboard_type' : 'user'}) #add dashboard type even if failed.


class CustomRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')  # Read from cookie
            if not refresh_token:
                return Response({'error': 'No refresh token found'}, status=status.HTTP_401_UNAUTHORIZED)

            request.data['refresh'] = refresh_token
            response = super().post(request, *args, **kwargs)

            if 'access' not in response.data:
                return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

            access_token = response.data['access']

            res = Response({'refreshed': True})
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,  # Set True in production
                samesite='None',
                path='/'
            )
            return res
        except:
            return Response({'error': 'Refresh failed'}, status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data = {'success': True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res
    except:
        return Response({'success': False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])  
def is_authenticated(request):
    return Response({'authenticated': True})
    


@api_view(['POST'])
@permission_classes([AllowAny])
def register_manager(request):
    serializer = ManagerSerializer(data=request.data)

    if serializer.is_valid():
        manager_user = serializer.save()  # Save the user instance

        # Extract company_name and work_location from request data
        company_name = request.data.get('company_name', '')
        work_location = request.data.get('work_location', '')

        # Create an associated ManagerProfile with additional details
        ManagerProfile.objects.create(
            user=manager_user,
            company_name=company_name,
            work_location=work_location
        )

        # Assign user to the Managers group
        manager_group, created = Group.objects.get_or_create(name='Managers')
        manager_group.user_set.add(manager_user)  # Add user to the Managers group

        return Response({'message': 'Manager registered successfully!'}, status=201)

    return Response(serializer.errors, status=400)




@api_view(['POST'])
@permission_classes([AllowAny])
def login_manager(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
   
    
    if user is not None:
        # Check if the user is a manager
        is_manager = user.groups.filter(name='Managers').exists()
        return Response({
            'message': 'Login successful',
            'is_manager': is_manager
        }, status=200)
    
    return Response({'error': 'Invalid credentials'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer =CombinedUserSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully!'}, status=201)
    return Response(serializer.errors, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_dashboard_view(request):
    user = request.user

    # Check if the user is a manager
    if not user.groups.filter(name='Managers').exists():
        return Response({'error': 'Access denied. User is not a manager.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        manager_profile = ManagerProfile.objects.get(user=user)
    except ManagerProfile.DoesNotExist:
        return Response({'error': 'Manager profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Fetch manager-specific data
    tasks = Task.objects.filter(assigned_by=user)
    total_tasks_assigned = tasks.count()
    active_tasks = tasks.filter(status='in_progress').count()
    completed_tasks = tasks.filter(status='completed').count()
    recent_tasks = tasks.order_by('-created_at')[:7]

    # Serialize data
    manager_serializer = ManagerProfileSerializer(manager_profile)
    task_serializer = TaskViewSerializer(recent_tasks, many=True)

    return Response({
        'dashboard_type': 'manager',
        'manager_profile': manager_serializer.data,
        'stats': {
            'total_tasks_assigned': total_tasks_assigned,
            'active_tasks': active_tasks,
            'completed_tasks': completed_tasks,
        },
        'recent_tasks': task_serializer.data
    })
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_view(request):
    user = request.user

    if user.groups.filter(name='Managers').exists():
        return Response({'error': 'Access denied. User is a manager.'}, status=status.HTTP_403_FORBIDDEN)

    dashboards = Dashboard.objects.filter(user=user)
    serializer = DashboardSerializer(dashboards, many=True)

    return Response({
        'dashboard_type': 'user',
        'dashboards': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_role_view(request):
    user = request.user
    is_manager = user.groups.filter(name='Managers').exists()
    return Response({
        'role': 'manager' if is_manager else 'user'
    })









@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_workers(request):
    user = request.user

    # Ensure only managers can access this endpoint
    if not user.groups.filter(name='Managers').exists():
        return Response({'error': 'Access denied. Only managers can view workers.'}, status=status.HTTP_403_FORBIDDEN)

    workers = UserProfile.objects.exclude(user__groups__name='Managers')  # Exclude managers
    serializer = UserProfileSerializer(workers, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_clock_history(request):
    user = request.user

    # If the user is a manager, fetch clock history for all workers
    if user.groups.filter(name='Managers').exists():
        clock_history = TimeLog.objects.all().order_by('clock_in')
    else:
        # If the user is not a manager, return only their clock history
        clock_history = TimeLog.objects.filter(user=user).order_by('clock_in')

    serializer = ClockInClockOutSerializer(clock_history, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def create_user_profile(request):
    """
    Creates a UserProfile instance for the authenticated user.
    """
    user = request.user
    # Check if a profile already exists.
    if UserProfile.objects.filter(user=user).exists():
        return Response({"detail": "User profile already exists."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserProfileSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=user)  # Associate the profile with the user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_detail_view(request):
    user_profile = get_object_or_404(UserProfile, user=request.user)

    if request.method == 'GET':
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Extract user data and user profile data from the request
        user_data = request.data.get('user', {})
        user_profile_data = request.data.get('user_profile', request.data) #Get user profile data from request.data if user_profile is not provided

        # Update User if any user data is provided
        if user_data:
            user = user_profile.user
            user_serializer = UserSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update UserProfile with the provided data
        serializer = UserProfileSerializer(user_profile, data=user_profile_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def manager_profile_view(request):
    try:
        manager_profile = ManagerProfile.objects.get(user=request.user)
    except ManagerProfile.DoesNotExist:
        return Response({'error': 'Manager profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ManagerProfileSerializer(manager_profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Debugging: Print the incoming request data
        print("Request Data:", request.data)

        # Pass the entire request.data to the ManagerProfileSerializer
        serializer = ManagerProfileSerializer(manager_profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Save the ManagerProfile instance
            serializer.save()
            return Response(serializer.data)
        else:
            # Return validation errors if the data is invalid
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    user = request.user
    task_id = request.data.get('task_id')
    task =None
    
    if task_id:
        try:
            task = Task.objects.get(id=task_id, assigned_to=user, status = 'pending')
        except Task.DoesNotExist:
            return Response({'message': f'Task with ID {task_id} not found or not assigned to you.'}, status=400)
        except ValueError:
            return Response({'message': 'Invalid task ID format.'}, status=400)
        
        
    # Check for the latest TimeLog
    latest_log = TimeLog.objects.filter(user=user).order_by('-clock_in').first()

    if latest_log and latest_log.clock_out is None:
        return Response({"message": "You are already clocked in."}, status=400)

    # Create a new TimeLog if no active clock-in
    new_log = TimeLog.objects.create(user=user, clock_in=timezone.now(), task=task)
    
    if task:
        task.status = 'in_progress'
        task.save()
        
    serializer = ClockInClockOutSerializer(new_log)
    return Response({"message": "Clocked in successfully.", "data": serializer.data}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    user = request.user
    # Check for the latest TimeLog
    latest_log = TimeLog.objects.filter(user=user).order_by('-clock_in').first()

    if not latest_log or latest_log.clock_out:
        return Response({"message": "You are not clocked in."}, status=400)

    # Update the existing TimeLog
    latest_log.clock_out = timezone.now()
    latest_log.save()
    
    if latest_log.task:
        latest_log.task.status = 'completed'
        latest_log.task.save()
    serializer = ClockInClockOutSerializer(latest_log)
    return Response({"message": "Clocked out successfully.", "data": serializer.data}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_project(request):
    serializer = ProjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_project(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user is a manager
    if not request.user.groups.filter(name='Managers').exists():
        return Response({'error': 'Only managers can update projects.'}, 
                       status=status.HTTP_403_FORBIDDEN)

    serializer = ProjectSerializer(project, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projects(request):
    projects = Project.objects.all()

    if not projects.exists():
        return Response({"message": "No projects found"}, status=200)

    # Use the ProjectSerializer to include related workers
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_task(request):
    user = request.user

    if not user.groups.filter(name='Managers').exists():
        return Response({'error': 'You do not have permission to assign tasks.'}, status=403)

    serializer = TaskSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Task assigned successfully!'}, status=201)

    return Response(serializer.errors, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_workers(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
        serializer = ProjectWorkerSerializer(project) #serialize the project object
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_user_tasks(request):
    user = request.user  # Get the authenticated user
    tasks = Task.objects.filter(assigned_to=user)  # Filter tasks assigned to this user
    
    serializer = TaskViewSerializer(tasks, many=True)  # Serialize the tasks
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    if user:
        subject = 'Password Reset Requested'
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Use localhost:3000 for testing
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"
        
        message = f"Hi {user.username},\n\nYou requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email."
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
            )
            return Response({'success': True, 'message': 'If the email exists, a reset link has been sent.'})
        except Exception as e:
            return Response({'success': False, 'message': f'Error sending email: {str(e)}'}, status=500)
    
    return Response({'success': True, 'message': 'If the email exists, a reset link has been sent.'})



@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request, uidb64, token):
    try:
        # Decode the user ID from the URL
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'success': False, 'message': 'Invalid or expired token.'}, status=400)
    
    # Check if the token is valid
    if not default_token_generator.check_token(user, token):
        return Response({'success': False, 'message': 'Invalid or expired token.'}, status=400)
    
    # Get the new password from the request data
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not new_password or not confirm_password:
        return Response({'success': False, 'message': 'Both password fields are required.'}, status=400)

    if new_password != confirm_password:
        return Response({'success': False, 'message': 'Passwords do not match.'}, status=400)

    # Set the new password for the user
    user.set_password(new_password)
    user.save()

    return Response({'success': True, 'message': 'Password has been reset successfully.'})