from rest_framework import generics,serializers,permissions
from .models import Dashboard, UserProfile,TimeLog,Manager, ManagerProfile
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
    
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']  # Include user fields

class ManagerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested serializer for user details

    class Meta:
        model = ManagerProfile
        fields = ['user', 'company_name', 'work_location']  # Role is removed as it's not in the model

    def create(self, validated_data):
        user_data = validated_data.pop('user')  # Extract user data
        user = User.objects.create(**user_data)  # Create user instance
        manager_profile = ManagerProfile.objects.create(user=user, **validated_data)  # Create profile
        return manager_profile

    def get_user(self, obj):
        return {
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
        }

    def update(self, instance, validated_data):
        # Extract user data from the request
        user_data = validated_data.pop('user', None)
        
        # Debugging: print the validated data
        print("Validated data:", validated_data)

        # Update user fields if user data is provided
        if user_data:
            user = instance.user
            print("Updating user:", user)
            user.username = user_data.get("username", user.username)
            user.email = user_data.get("email", user.email)
            user.first_name = user_data.get("first_name", user.first_name)
            user.last_name = user_data.get("last_name", user.last_name)
            user.save()

        # Update ManagerProfile fields
        instance.company_name = validated_data.get("company_name", instance.company_name)
        instance.work_location = validated_data.get("work_location", instance.work_location)
        instance.save()

        return instance
            

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
    assigned_by = serializers.ReadOnlyField(source="assigned_by.username") 
    assigned_to = serializers.SlugRelatedField(
        queryset=User.objects.all(), 
        slug_field='username'  # Accepts username instead of ID
    )

    class Meta:
        model = Task
        fields = [
            'project_name',
            'task_title',
            'description',
            'estimated_completion_datetime',
            'assigned_shift',
            'assigned_to',
            'assigned_by'
        ]

    def create(self, validated_data):
        request = self.context.get('request')  # Get the request context
        validated_data["assigned_by"] = request.user  # Set assigned_by automatically
        return super().create(validated_data)


class TaskViewSerializer(serializers.ModelSerializer):
    assigned_by = serializers.CharField(source="assigned_by.username", read_only=True)  # Get assigned_by username

    class Meta:
        model = Task
        fields = [
            'id',
            'project_name',
            'task_title',
            'description',
            'estimated_completion_datetime',
            'assigned_shift',
            'assigned_to',
            'assigned_by' # This will show the username of the assigned user
        ]
