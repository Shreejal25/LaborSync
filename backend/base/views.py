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
from django.db.models import Count, Q
from django.db import transaction
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from .permission import IsManager


from .models import Dashboard, UserProfile,TimeLog,ManagerProfile, Task, Project, UserPoints, PointsTransaction, Badge, UserBadge, Reward,RewardRedemption
from rest_framework import generics, permissions, status
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from .serializer import DashboardSerializer, CombinedUserSerializer, ClockInClockOutSerializer, UserProfileSerializer,UserSerializer,ManagerSerializer,ManagerProfileSerializer,TaskSerializer, TaskViewSerializer, ProjectSerializer, ProjectWorkerSerializer, UserPointsSerializer, RewardSerializer, RewardCreateSerializer
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
    serializer = CombinedUserSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.save()

        # Automatically add the user to the "Workers" group
        workers_group, created = Group.objects.get_or_create(name="Workers")
        user.groups.add(workers_group)

        return Response({'message': 'User registered successfully and added to Workers group!'}, status=201)
    
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
    task = None
    
    if task_id:
        try:
            # Check if task exists and is assigned to user
            task = Task.objects.get(id=task_id, assigned_to=user)
            
            # Only allow clock-in if task is pending or in_progress
            if task.status not in ['pending', 'in_progress']:
                return Response({'message': 'This task is already completed.'}, status=400)
                
        except Task.DoesNotExist:
            return Response({'message': f'Task with ID {task_id} not found or not assigned to you.'}, status=400)
        except ValueError:
            return Response({'message': 'Invalid task ID format.'}, status=400)
        
    # Check for existing active TimeLog for this user
    latest_log = TimeLog.objects.filter(user=user).order_by('-clock_in').first()

    if latest_log and latest_log.clock_out is None:
        return Response({"message": "You are already clocked in."}, status=400)

    # Create a new TimeLog
    new_log = TimeLog.objects.create(user=user, clock_in=timezone.now(), task=task)
    
    if task:
        # Set task to in_progress if it was pending
        if task.status == 'pending':
            task.status = 'in_progress'
            task.save()
        
    serializer = ClockInClockOutSerializer(new_log)
    return Response({"message": "Clocked in successfully.", "data": serializer.data}, status=200)


# Update your clock_out view to award points
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    user = request.user
    task_id = request.data.get('task_id')
    
    try:
        task = Task.objects.get(id=task_id, assigned_to=user)
        latest_log = TimeLog.objects.filter(
            user=user,
            task=task,
            clock_out__isnull=True
        ).latest('clock_in')

        latest_log.clock_out = timezone.now()
        latest_log.save()

        # Award points for task completion
        if check_task_completion(task):
            task.status = 'completed'
            task.save()
            
            # Award 5 points to each assigned user
            for assigned_user in task.assigned_to.all():
                award_points(
                    user=assigned_user,
                    points=5,
                    description=f"Task completion: {task.task_title}",
                    task=task
                )
            
            return Response({
                "message": "Clocked out successfully. Task marked as completed!",
                "completed": True
            }, status=200)

        return Response({
            "message": "Clocked out successfully",
            "completed": False
        }, status=200)

    except TimeLog.DoesNotExist:
        return Response({"message": "No active clock-in found"}, status=400)
    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=404)
    
def check_task_completion(task):
    """Check if all workers have completed required clock cycles"""
    for user in task.assigned_to.all():
        completed_cycles = TimeLog.objects.filter(
            user=user,
            task=task,
            clock_out__isnull=False
        ).count()
        
        if completed_cycles < task.min_clock_cycles:
            return False
    return True




@api_view(['POST'])
@permission_classes([IsAuthenticated, IsManager])
def complete_task(request, task_id):
    try:
        # Get task first
        task = Task.objects.get(id=task_id)

        # Permission check
        if (task.assigned_to != request.user and 
            getattr(task, 'assigned_by', None) != request.user and 
            not request.user.is_manager):
            return Response(
                {"message": "You don't have permission to complete this task"},
                status=403
            )

        if task.status == 'completed':
            return Response({"message": "Task is already completed"}, status=400)

        # ❗ Skip requirement check and force complete
        task.status = 'completed'
        task.completed_by = request.user
        task.completed_at = timezone.now()
        task.save()

        return Response({
            "message": "Task successfully completed",
            "task": TaskSerializer(task).data
        }, status=200)

    except Task.DoesNotExist:
        return Response({"message": "Task not found"}, status=404)

    

def get_completion_progress(task):
    """Get completion progress for all workers"""
    progress = []
    for user in task.assigned_to.all():
        completed = TimeLog.objects.filter(
            user=user,
            task=task,
            clock_out__isnull=False
        ).count()
        progress.append({
            "user": user.username,
            "completed_cycles": completed,
            "required_cycles": task.min_clock_cycles,
            "complete": completed >= task.min_clock_cycles
        })
    return progress

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_project(request):
    data = request.data.copy()
    serializer = ProjectSerializer(data=data, context={'request': request})
    
    if serializer.is_valid():
        # Automatically set created_by from request.user
        project = serializer.save(created_by=request.user)
        return Response(ProjectSerializer(project).data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_project(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    
    # Verify the requesting user is the project creator
    if project.created_by != request.user:
        return Response({'error': 'Not authorized to update this project'}, status=403)
    
    serializer = ProjectSerializer(project, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_projects(request):
    try:
        # Get projects where user is creator OR assigned worker
        projects = Project.objects.filter(
            Q(created_by=request.user) | 
            Q(workers__username=request.user.username)
        ).distinct()
        
        if not projects.exists():
            return Response(
                {"detail": "No projects found."},
                status=status.HTTP_200_OK
            )
            
        serializer = ProjectSerializer(projects, many=True)
        return Response({
            "count": projects.count(),
            "projects": serializer.data
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_project(request, project_id):
    """
    Delete a project (only if user is the creator)
    """
    project = get_object_or_404(Project, pk=project_id)
    
    # Verify the requesting user is the project creator
    if project.created_by != request.user:
        return Response({'error': 'Not authorized to delete this project'}, status=403)
    
    project.delete()
    return Response({'message': 'Project deleted successfully'}, status=204)

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

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_task(request, task_id):
    user = request.user
    
    if not user.groups.filter(name='Managers').exists():
        return Response({'error': 'Permission denied'}, status=403)
    
    task = get_object_or_404(Task, pk=task_id)
    
    # Log for debugging
    print("Incoming data:", request.data)
    
    serializer = TaskSerializer(
        task, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Task updated successfully!',
            'task': serializer.data
        }, status=200)
    
    print("Validation errors:", serializer.errors)
    return Response({
        'error': 'Validation failed',
        'details': serializer.errors
    }, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_task(request, task_id):
    """
    Delete a task (only if user is a manager)
    """
    user = request.user
    
    # Check if user is a manager
    if not user.groups.filter(name='Managers').exists():
        return Response({'error': 'You do not have permission to delete tasks.'}, status=403)
    
    task = get_object_or_404(Task, pk=task_id)
    task.delete()
    return Response({'message': 'Task deleted successfully'}, status=204)


#Views for charts and graphs

# views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsManager])
def worker_productivity_stats(request):
    # Get all workers (users in Workers group)
    workers = User.objects.filter(
        groups__name__in=['Worker', 'Workers']
    ).annotate(
        total_tasks=Count('assigned_tasks'),  # Using the related_name
        completed_tasks=Count(
            'assigned_tasks',
            filter=Q(assigned_tasks__status='completed')
        )
    )
    
    data = []
    for worker in workers:
        total = worker.total_tasks
        completed = worker.completed_tasks
        
        data.append({
            'id': worker.id,
            'username': worker.username,
            'completed_tasks': completed,
            'total_tasks': total,
            'productivity': round((completed / total * 100), 2) if total > 0 else 0
        })
    
    return Response(data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_workers(request, project_id):
    try:
        project = Project.objects.get(pk=project_id)
        serializer = ProjectWorkerSerializer(project) #serialize the project object
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found.'}, status=404)
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import Group
from .models import Task


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_user_tasks(request):
    """View for regular users to see their assigned tasks"""
    tasks = Task.objects.filter(assigned_to=request.user)
    serializer = TaskViewSerializer(tasks, many=True)
    return Response(serializer.data)

# views.py
from .permission import IsManager

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsManager])
def view_manager_tasks(request):
    tasks = Task.objects.all().prefetch_related('assigned_to')
    serializer = TaskViewSerializer(tasks, many=True)
    return Response(serializer.data)  



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_user_info(request):
    user = request.user
    return Response({
        'username': user.username,
        'groups': [g.name for g in user.groups.all()],
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'all_permissions': list(user.get_all_permissions())
    })



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





from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsManager])
def award_points(request):
    """
    Award points to a user for completing tasks or other achievements
    """
    required_fields = ['points', 'description', 'username']
    if not all(field in request.data for field in required_fields):
        return Response(
            {'error': 'Points, description, and username are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        points = int(request.data['points'])
        if points <= 0:
            return Response(
                {'error': 'Points must be a positive integer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(User, username=request.data['username'])
        task_id = request.data.get('task_id')
        feedback_id = request.data.get('feedback_id')

        with transaction.atomic():
            # Update user points
            user_points, created = UserPoints.objects.get_or_create(user=user)
            user_points.total_points += points
            user_points.available_points += points
            user_points.save()

            # Create transaction record
            transaction_data = {
                'user': user,
                'transaction_type': 'earn',
                'points': points,
                'description': request.data['description'],
            }
            
            if task_id:
                task = get_object_or_404(Task, id=task_id)
                transaction_data['related_task'] = task
            
            if feedback_id:
                transaction_data['related_feedback'] = feedback_id

            PointsTransaction.objects.create(**transaction_data)

            # Check for new badges
            check_badges(user)

            return Response(
                {
                    'message': 'Points awarded successfully.',
                    'total_points': user_points.total_points,
                    'available_points': user_points.available_points
                },
                status=status.HTTP_201_CREATED
            )

    except ValueError:
        return Response(
            {'error': 'Points must be a valid integer.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def check_badges(user):
    """
    Check and award badges based on total points
    """
    user_points = user.points.total_points
    eligible_badges = Badge.objects.filter(
        points_required__lte=user_points
    ).exclude(
        id__in=user.badges.values_list('badge_id', flat=True)
    )

    for badge in eligible_badges:
        UserBadge.objects.create(user=user, badge=badge)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_points(request):
    """
    Get current user's points information
    """
    points, _ = UserPoints.objects.get_or_create(user=request.user)
    serializer = UserPointsSerializer(points)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_rewards(request):
    """
    Get list of available rewards for the current user
    - Shows rewards with no eligible_users (public rewards)
    - Shows rewards where current user is in eligible_users
    - Filters out inactive rewards
    """
    # Get all active rewards that are either:
    # 1. Public (no eligible_users specified), OR
    # 2. Include the current user in eligible_users
    rewards = Reward.objects.filter(
        is_active=True
    ).filter(
          # Public rewards
        Q(eligible_users=request.user)    # User-specific rewards
    ).distinct()  # Remove duplicates if any

    serializer = RewardSerializer(rewards, many=True, context={'request': request})
    return Response({
        'count': len(serializer.data),
        'rewards': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_reward(request):
    """
    Redeem a reward using available points (by reward name)
    Only eligible users can redeem (if eligible_users is specified)
    """
    required_fields = ['reward_name']
    if not all(field in request.data for field in required_fields):
        return Response(
            {'error': 'Reward name is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get the reward by name (case-insensitive)
        reward = Reward.objects.filter(
            name__iexact=request.data['reward_name'],
            is_active=True
        ).first()

        if not reward:
            return Response(
                {'error': 'No active reward found with this name.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check eligibility
        if reward.eligible_users.exists():  # If specific users are designated
            if not reward.eligible_users.filter(id=request.user.id).exists():
                return Response(
                    {'error': 'You are not eligible to redeem this reward.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        user_points = UserPoints.objects.get(user=request.user)

        if user_points.available_points < reward.point_cost:
            return Response(
                {
                    'error': f'Not enough points. You need {reward.point_cost} points but only have {user_points.available_points}.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Deduct points
            user_points.available_points -= reward.point_cost
            user_points.redeemed_points += reward.point_cost
            user_points.save()

            # Create transaction record
            PointsTransaction.objects.create(
                user=request.user,
                transaction_type='redeem',
                points=-reward.point_cost,
                description=f"Redeemed: {reward.name}",
                related_reward=reward
            )

            # Process reward based on type
            reward_message = process_reward(request.user, reward)

            return Response(
                {
                    'message': f'Successfully redeemed {reward.name}',
                    'remaining_points': user_points.available_points,
                    'reward_details': reward_message
                },
                status=status.HTTP_200_OK
            )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def process_reward(user, reward):
    """
    Handle different reward types and return appropriate message
    """
    if reward.reward_type == 'bonus':
        # In a real implementation, you would integrate with payroll here
        return {
            'type': 'cash_bonus',
            'amount': float(reward.cash_value),
            'status': 'pending_processing',
            'message': f'Cash bonus of ${reward.cash_value} will be processed in the next payroll cycle.'
        }
    
    elif reward.reward_type == 'timeoff':
        # Add to user's time off balance
        return {
            'type': 'time_off',
            'days': reward.days_off,
            'status': 'credited',
            'message': f'{reward.days_off} day(s) of paid time off has been added to your account.'
        }
    
    elif reward.reward_type == 'other':
        return {
            'type': 'other',
            'status': 'pending_fulfillment',
            'message': 'Your reward will be processed and delivered soon.'
        }
    
    return {
        'type': 'unknown',
        'status': 'pending',
        'message': 'Reward is being processed.'
    }
    
    
    



@api_view(['POST'])
@permission_classes([IsAuthenticated, IsManager])
def create_reward(request):
    """
    Create a new reward
    POST /api/rewards/create/
    {
        "name": "Team Bonus",
        "description": "Annual team performance bonus",
        "point_cost": 500,
        "reward_type": "bonus",
        "cash_value": 100.00,
        "is_active": true,
        "eligible_users": [1, 2, 3]  # Optional user IDs
    }
    """
    serializer = RewardCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        # Get eligible_users data before saving
        eligible_users = serializer.validated_data.pop('eligible_users', [])
        
        # Create the reward and automatically set the creator
        reward = serializer.save(created_by=request.user)
        
        # Add eligible users if any were provided
        if eligible_users:
            reward.eligible_users.set(eligible_users)
        
        return Response(
            {
                'message': 'Reward created successfully',
                'reward': RewardCreateSerializer(reward).data
            },
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        {
            'error': 'Invalid data',
            'details': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Removed IsManager to allow all users to view their history
def get_reward_history(request):
    """
    Get user's reward redemption history with enhanced filtering
    """
    try:
        # Include both successful redemptions and failed attempts if you track them
        transactions = PointsTransaction.objects.filter(
            user=request.user,
            transaction_type__in=['redeem', 'redeem_failed']  # Include failed attempts if tracked
        ).select_related(
            'related_reward'
        ).prefetch_related(
            'related_reward__eligible_users'  # If you want to show eligibility info
        ).order_by('-timestamp')

        if not transactions.exists():
            return Response(
                {'message': 'No redemption history found'},
                status=status.HTTP_200_OK
            )

        history = []
        for transaction in transactions:
            reward = transaction.related_reward
            history.append({
                'id': transaction.id,
                'reward': {
                    'id': reward.id if reward else None,
                    'name': reward.name if reward else 'Unknown Reward',
                    'type': reward.reward_type if reward else None,
                },
                'points': abs(transaction.points),  # Absolute value
                'date': transaction.timestamp,
                'status': 'success' if transaction.points < 0 else 'failed',
                'description': transaction.description
            })

        return Response({
            'count': len(history),
            'history': history
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsManager])
def get_manager_rewards(request):
    """
    Get all rewards created by the current manager
    GET /api/rewards/manager/
    """
    try:
        # Get rewards created by the current manager
        rewards = Reward.objects.filter(
            created_by=request.user
        ).prefetch_related(
            'eligible_users'
        ).order_by('-created_at')

        if not rewards.exists():
            return Response(
                {'message': 'No rewards created yet'},
                status=status.HTTP_200_OK
            )

        # Serialize the data with eligible users details
        reward_data = []
        for reward in rewards:
            eligible_users = reward.eligible_users.all()
            reward_data.append({
                'id': reward.id,
                'name': reward.name,
                'description': reward.description,
                'point_cost': reward.point_cost,
                'reward_type': reward.reward_type,
                'cash_value': str(reward.cash_value) if reward.cash_value else None,
                'days_off': reward.days_off,
                'is_active': reward.is_active,
                'created_at': reward.created_at,
                'created_by': reward.created_by.username,
                'eligible_users': [
                    {
                        'id': user.id,
                        'username': user.username,
                        'full_name': f"{user.first_name} {user.last_name}"
                    } for user in eligible_users
                ],
                'total_redemptions': PointsTransaction.objects.filter(
                    related_reward=reward,
                    transaction_type='redeem'
                ).count()
            })

        return Response({
            'count': len(reward_data),
            'rewards': reward_data
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )