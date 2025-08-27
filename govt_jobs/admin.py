from django.contrib import admin
from .models import GovernmentJob

@admin.register(GovernmentJob)
class GovernmentJobAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'organization',
        'department',
        'position',
        'location',
        'deadline',
        'posted_on',
    )
    list_filter = (
        'organization',
        'department',
        'position',
        'location',
        'posted_on',
        'deadline',
    )
    search_fields = (
        'title',
        'description',
        'organization__name',
        'department__name',
        'position__name',
        'location',
    )
    date_hierarchy = 'posted_on'
    ordering = ('-posted_on',)

    fieldsets = (
        (None, {
            'fields': ('title', 'organization', 'department', 'position', 'location')
        }),
        ('Job Details', {
            'fields': ('description', 'official_link', 'pdf')
        }),
        ('Important Dates', {
            'fields': ('deadline',)
        }),
    )

