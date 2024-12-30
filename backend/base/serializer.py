from rest_framework import serializers
from .models import Dashboard, UserProfile
from django.contrib.auth.models import User


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


class DashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboard
        fields = ['id', 'description']