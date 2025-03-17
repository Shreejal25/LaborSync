from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=[('manager', 'Manager'), ('worker', 'Worker')], default='worker')
    phone_number = models.CharField(max_length=20)  # Increased length
    gender = models.CharField(max_length=20, choices=[('male', 'Male'), ('female', 'Female'), ('others', 'Others')]) # increased length
    current_address = models.TextField()
    permanent_address = models.TextField()
    city_town = models.CharField(max_length=200) # increased length
    state_province = models.CharField(max_length=200) # increased length
    education_level = models.CharField(max_length=200) # increased length
    certifications = models.TextField(blank=True, null=True)
    skills = models.TextField()
    languages_spoken = models.TextField()
    work_availability = models.CharField(max_length=20, choices=[('fulltime', 'Fulltime'), ('parttime', 'Part-time'), ('freelance', 'Freelance')]) # increased length
    work_schedule_preference = models.CharField(max_length=200) # increased length

    def __str__(self):
        return self.user.username
from django.db import models


class ManagerProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='manager_profile', null=True, blank=True
    )
    company_name = models.CharField(max_length=255)
    work_location = models.CharField(max_length=255)

    def __str__(self):
        if self.user:  # Check if self.user is not None
            return f"{self.user.username} - Manager"
        return "Manager Profile (No User Assigned)"  # Or some other appropriate message 
    
class Manager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)  # Make it nullable
    company_name = models.CharField(max_length=255)
    work_location = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.username} - {self.company_name}"


class Dashboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboards')  # Renaming the related name to 'dashboards'
    description = models.TextField()
    clock_in_time = models.DateTimeField(null=True, blank=True)
    clock_out_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Dashboard"
    
    
# Project Model

from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    name = models.CharField(max_length=255)
    workers = models.ManyToManyField(User, related_name='projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name



class TimeLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.SET_NULL, null=True, blank=True) #added task field.
    clock_in = models.DateTimeField(default=now)
    clock_out = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"TimeLog for {self.user.username}"
    

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone  

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='tasks')
    task_title = models.CharField(max_length=255)
    description = models.TextField()
    estimated_completion_datetime = models.DateTimeField()
    assigned_shift = models.CharField(max_length=100)
    assigned_to = models.ManyToManyField(User, related_name='assigned_tasks')  # Editable per task
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task_title

    
