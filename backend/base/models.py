from django.db import models
from django.contrib.auth.models import User
class Dashboard(models.Model):
    description = models.CharField(max_length=300)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard')


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('others', 'Others')])
    current_address = models.TextField()
    permanent_address = models.TextField()
    city_town = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100)
    education_level = models.CharField(max_length=100)
    certifications = models.TextField(blank=True, null=True)
    skills = models.TextField()
    languages_spoken = models.TextField()
    work_availability = models.CharField(max_length=10, choices=[('fulltime', 'Fulltime'), ('parttime', 'Part-time'), ('freelance', 'Freelance')])
    work_schedule_preference = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username