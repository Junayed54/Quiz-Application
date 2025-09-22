from django.contrib import admin
from .models import GovernmentJob

@admin.register(GovernmentJob)
class GovernmentJobAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'organization',
        'department',
        'get_positions',   # custom method for many-to-many
        'location',
        'deadline',
        'posted_on',
    )
    list_filter = (
        'organization',
        'department',
        'positions',   # now plural
        'location',
        'posted_on',
        'deadline',
    )
    search_fields = (
        'title',
        'description',
        'organization__name',
        'department__name',
        'positions__title',   # updated for M2M
        'location',
    )
    date_hierarchy = 'posted_on'
    ordering = ('-posted_on',)

    fieldsets = (
        (None, {
            'fields': ('title', 'organization', 'department', 'positions', 'location')
        }),
        ('Job Details', {
            'fields': ('description', 'official_link', 'pdf')
        }),
        ('Important Dates', {
            'fields': ('deadline',)
        }),
    )

    filter_horizontal = ('positions',)  # adds a nice widget for selecting multiple

    def get_positions(self, obj):
        return ", ".join([pos.title for pos in obj.positions.all()])
    get_positions.short_description = "Positions"
