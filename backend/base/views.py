from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from .models import Dashboard, UserProfile,TimeLog
from rest_framework import generics, permissions, status
from .serializer import DashboardSerializer, CombinedUserSerializer, ClockInClockOutSerializer, UserProfileSerializer
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
            
            return res
        except:
            return Response({'success': False})

class CustomRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token
            response = super().post(request, *args, **kwargs)
            
            tokens = response.data
            access_token = tokens['access']

            res = Response()
            res.data = {'refreshed': True}
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='None',
                path='/'
            )
            return res
        except:
            return Response({'refreshed': False})

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
def register(request):
    serializer = CombinedUserSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully!'}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    dashboards = Dashboard.objects.filter(user=user)
    serializer = DashboardSerializer(dashboards, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_detail_view(request):
    user_profile = get_object_or_404(UserProfile, user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(user_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    user = request.user
    # Check for the latest TimeLog
    latest_log = TimeLog.objects.filter(user=user).order_by('-clock_in').first()

    if latest_log and latest_log.clock_out is None:
        return Response({"message": "You are already clocked in."}, status=400)

    # Create a new TimeLog if no active clock-in
    new_log = TimeLog.objects.create(user=user, clock_in=timezone.now())
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
    serializer = ClockInClockOutSerializer(latest_log)
    return Response({"message": "Clocked out successfully.", "data": serializer.data}, status=200)

