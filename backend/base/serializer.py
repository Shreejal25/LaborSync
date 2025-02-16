from rest_framework import generics,serializers,permissions
from .models import Dashboard, UserProfile,TimeLog,Manager
from django.contrib.auth.models import User
from django.db import models


class CombinedUserSerializer(serializers.ModelSerializer):
    user_profile = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), required=False
    )
    
    phone_number = serializers.CharField(source='userprofile.phone_number', required=False)
    gender = serializers.CharField(source='userprofile.gender', required=False)
    current_address = serializers.CharField(source='userprofile.current_address', required=False)
    permanent_address = serializers.CharField(source='userprofile.permanent_address', required=False)
    city_town = serializers.CharField(source='userprofile.city_town', required=False)
    state_province = serializers.CharField(source='userprofile.state_province', required=False)
    education_level = serializers.CharField(source='userprofile.education_level', required=False)
    certifications = serializers.CharField(source='userprofile.certifications', required=False)
    skills = serializers.CharField(source='userprofile.skills', required=False)
    languages_spoken = serializers.CharField(source='userprofile.languages_spoken', required=False)
    work_availability = serializers.CharField(source='userprofile.work_availability', required=False)
    work_schedule_preference = serializers.CharField(source='userprofile.work_schedule_preference', required=False)

    class Meta:
        model = User
        fields = [
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'user_profile',
            'phone_number',
            'gender',
            'current_address',
            'permanent_address',
            'city_town',
            'state_province',
            'education_level',
            'certifications',
            'skills',
            'languages_spoken',
            'work_availability',
            'work_schedule_preference'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user_profile_data = validated_data.pop('userprofile', {})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        UserProfile.objects.create(
            user=user,
            role = models.CharField(max_length=10, choices=[('manager', 'Manager'), ('worker', 'Worker')], default='worker'),
            phone_number=user_profile_data.get('phone_number', ''),
            gender=user_profile_data.get('gender', ''),
            current_address=user_profile_data.get('current_address', ''),
            permanent_address=user_profile_data.get('permanent_address', ''),
            city_town=user_profile_data.get('city_town', ''),
            state_province=user_profile_data.get('state_province', ''),
            education_level=user_profile_data.get('education_level', ''),
            certifications=user_profile_data.get('certifications', ''),
            skills=user_profile_data.get('skills', ''),
            languages_spoken=user_profile_data.get('languages_spoken', ''),
            work_availability=user_profile_data.get('work_availability', ''),
            work_schedule_preference=user_profile_data.get('work_schedule_preference', '')
        )
        return user
    
    
class ManagerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'user',  # This will link to the User model
            'role',  # This can be set to 'manager' when creating/updating
            'company_name',  # New field for company name
            'work_location'   # New field for work location
        ]
        extra_kwargs = {
            'user': {'read_only': True},  # Prevent setting user directly
            'role': {'default': 'manager'}  # Set default role to manager
        }

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)  # Create user instance
        profile = UserProfile.objects.create(user=user, **validated_data)  # Create profile instance
        return profile

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        
        # Update User if provided
        if user_data:
            instance.user.username = user_data.get('username', instance.user.username)
            instance.user.email = user_data.get('email', instance.user.email)
            instance.user.first_name = user_data.get('first_name', instance.user.first_name)
            instance.user.last_name = user_data.get('last_name', instance.user.last_name)
            instance.user.save()

        # Update UserProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']
        
        

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer('user')
    class Meta:
        model = UserProfile
        fields = [
            'user',
            'phone_number', 'gender', 'current_address', 'permanent_address',
            'city_town', 'state_province', 'education_level', 'certifications',
            'skills', 'languages_spoken', 'work_availability', 'work_schedule_preference'
        ]



class ManagerSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(required=True)
    work_location = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'company_name', 'work_location']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only
        }

    def create(self, validated_data):
        # Extract company name and work location from validated data
        company_name = validated_data.pop('company_name')
        work_location = validated_data.pop('work_location')

        # Create the user instance
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])  # Hash the password
        user.save()

        # Create the manager profile with additional fields
        Manager.objects.create(user=user, company_name=company_name, work_location=work_location)

        return user  # Return the created user instance (or you can return the manager instance if needed)


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = ['id', 'description']
        


class ClockInClockOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeLog
        fields = ['clock_in', 'clock_out']

    def update(self, instance, validated_data):
        # Update clock_in and clock_out instead of clock_in_time and clock_out_time
        if 'clock_in' in validated_data:
            instance.clock_in = validated_data['clock_in']
        if 'clock_out' in validated_data:
            instance.clock_out = validated_data['clock_out']
        instance.save()
        return instance
    


from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.CharField()  # Accept username as a string

    class Meta:
        model = Task
        fields = [
            'project_name',
            'task_title',
            'description',
            'estimated_completion_datetime',
            'assigned_shift',
            'assigned_to'  # This will be handled in the view
        ]

    def create(self, validated_data):
        assigned_to_username = validated_data.pop('assigned_to')
        try:
            assigned_user = User.objects.get(username=assigned_to_username)
        except User.DoesNotExist:
            raise serializers.ValidationError({"assigned_to": "User with this username does not exist."})

        task = Task.objects.create(assigned_to=assigned_user, **validated_data)
        return task


class TaskViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'project_name',
            'task_title',
            'description',
            'estimated_completion_datetime',
            'assigned_shift',
            'assigned_to'  # This will show the username of the assigned user
        ]

