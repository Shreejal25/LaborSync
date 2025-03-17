from django.contrib import admin
from .models import Dashboard, UserProfile, TimeLog, ManagerProfile
from django.utils.timezone import localtime


# Register Dashboard and UserProfile
admin.site.register(Dashboard)
admin.site.register(UserProfile)
admin.site.register(ManagerProfile)





from .models import Task

class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'task_title', 
        'get_project_name', 
        'get_assigned_to_username',  # Display the assigned_to user's username
        'assigned_by_username', 
        'estimated_completion_datetime', 
        'assigned_shift'
    ]
    search_fields = [
        'task_title', 
        'project_name__name',  # Search by project name if it's a ForeignKey
        'assigned_to__username', 
        'assigned_by__username'
    ]  # Allow searching by assigned user's username
    list_filter = ['assigned_shift']  # Filter tasks by assigned shift

    # Customize the display of 'assigned_by' field in list_display
    def assigned_by_username(self, obj):
        return obj.assigned_by.username if obj.assigned_by else "N/A"  # Display "N/A" if assigned_by is null

    assigned_by_username.admin_order_field = 'assigned_by'  # Allow sorting by assigned_by field
    assigned_by_username.short_description = 'Assigned By'  # Custom column name in the admin

    # Display the project name if the task has a project assigned
    def get_project_name(self, obj):
        return obj.project_name.name if obj.project_name else "No Project"  # Assuming 'project_name' is a ForeignKey to a Project model

    get_project_name.admin_order_field = 'project_name'  # Allow sorting by project name
    get_project_name.short_description = 'Project Name'  # Custom column name for the project

    # Display the username of the assigned worker
    def get_assigned_to_username(self, obj):
        return obj.assigned_to.username if obj.assigned_to else "N/A"  # Display "N/A" if assigned_to is null

    get_assigned_to_username.admin_order_field = 'assigned_to'  # Allow sorting by assigned_to field
    get_assigned_to_username.short_description = 'Assigned To'  # Custom column name for assigned worker

    # Optional: Customize the detail view if needed
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset

admin.site.register(Task, TaskAdmin)


@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    # Fields to display in the list view
    list_display = ('user', 'formatted_clock_in', 'formatted_clock_out', 'duration', 'is_active')

    # Fields to filter by in the admin sidebar
    list_filter = ('user', 'clock_in', 'clock_out')

    # Fields to search for
    search_fields = ('user__username',)

    # Make certain fields readonly (e.g., clock_in and clock_out)
    readonly_fields = ('clock_in', 'clock_out', 'duration', 'is_active')

    # Display the clock-in and clock-out fields for editing
    fields = ('user', 'clock_in', 'clock_out', 'is_active', 'duration')

    def formatted_clock_in(self, obj):
        """Display the clock-in time in a readable format."""
        if obj.clock_in:
            return localtime(obj.clock_in).strftime ('%b %d, %Y, %I:%M %p')  # Adjust format as needed
        return "N/A"
    formatted_clock_in.short_description = "Clock In"

    def formatted_clock_out(self, obj):
        """Display the clock-out time in a readable format."""
        if obj.clock_out:
            return localtime(obj.clock_out).strftime('%b %d, %Y, %I:%M %p')  # Adjust format as needed
        return "N/A"
    formatted_clock_out.short_description = "Clock Out"

    def duration(self, obj):
        """Calculate and display the duration between clock_in and clock_out."""
        if obj.clock_out and obj.clock_in:
            return obj.clock_out - obj.clock_in
        return "N/A"
    duration.short_description = "Duration"

    def is_active(self, obj):
        """Check if the user is still clocked in."""
        return obj.clock_out is None
    is_active.boolean = True  # Display as a boolean icon
    is_active.short_description = "Active"
