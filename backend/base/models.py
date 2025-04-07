from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=[('manager', 'Manager'), ('worker', 'Worker'), ('', '---------')], default='worker', null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=20, choices=[('male', 'Male'), ('female', 'Female'), ('others', 'Others'), ('', '---------')], null=True, blank=True)
    current_address = models.TextField(null=True, blank=True)
    permanent_address = models.TextField(null=True, blank=True)
    city_town = models.CharField(max_length=200, null=True, blank=True)
    state_province = models.CharField(max_length=200, null=True, blank=True)
    education_level = models.CharField(max_length=200, null=True, blank=True)
    certifications = models.TextField(blank=True, null=True)
    skills = models.TextField(null=True, blank=True)
    languages_spoken = models.TextField(null=True, blank=True)
    work_availability = models.CharField(max_length=20, choices=[('fulltime', 'Fulltime'), ('parttime', 'Part-time'), ('freelance', 'Freelance'), ('', '---------')], null=True, blank=True)
    work_schedule_preference = models.CharField(max_length=200, null=True, blank=True)

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

# In models.py
from django.db import models
from django.utils import timezone
from datetime import date, timedelta

from django.db import models
from django.utils import timezone
from datetime import date, timedelta

class Project(models.Model):
    # Add these choices at the top of your model class
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]
    
  
    
    # Existing fields
    name = models.CharField(max_length=255)
    workers = models.ManyToManyField(User, related_name='projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    # New fields
    description = models.TextField(blank=True, null=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    documents = models.FileField(upload_to='projects/documents/', blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,related_name='created_projects')  # Fixed field
   
    start_date = models.DateField(default=date.today)
    
    def __str__(self):
        return self.name




class TimeLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey('Task', on_delete=models.SET_NULL, null=True, blank=True) #added task field.
    clock_in = models.DateTimeField(default=now)
    clock_out = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    
    min_clock_cycles = models.PositiveIntegerField(
        default=1,
        help_text="Number of clock-in/out cycles required per worker before task can be completed"
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='tasks')
    task_title = models.CharField(max_length=255)
    description = models.TextField()
    estimated_completion_datetime = models.DateTimeField()
    assigned_shift = models.CharField(max_length=100)
    assigned_to = models.ManyToManyField(
        User,
        related_name='assigned_tasks',
        blank=True  # Makes the field optional
    )
    
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.task_title




class TaskStatusHistory(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20, choices=Task.STATUS_CHOICES)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-changed_at']
        verbose_name_plural = 'Task Status History'

    def __str__(self):
        return f"{self.task.task_title} - {self.get_status_display()} at {self.changed_at}"
    