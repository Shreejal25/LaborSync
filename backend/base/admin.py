from django.contrib import admin
from .models import Dashboard, UserProfile, TimeLog
from django.utils.timezone import localtime


# Register Dashboard and UserProfile
admin.site.register(Dashboard)
admin.site.register(UserProfile)





from .models import Task

class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_title', 'project_name', 'assigned_to', 'estimated_completion_datetime', 'assigned_shift']
    search_fields = ['task_title', 'project_name', 'assigned_to__username']  # Allow searching by username
    list_filter = ['assigned_shift']  # Filter tasks by assigned shift

    # Optional: Customize detail view if needed
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        # You can add any additional filtering or annotations here if necessary
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
            return localtime(obj.clock_in).strftime('%Y-%m-%d %H:%M:%S')  # Adjust format as needed
        return "N/A"
    formatted_clock_in.short_description = "Clock In"

    def formatted_clock_out(self, obj):
        """Display the clock-out time in a readable format."""
        if obj.clock_out:
            return localtime(obj.clock_out).strftime('%Y-%m-%d %H:%M:%S')  # Adjust format as needed
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
