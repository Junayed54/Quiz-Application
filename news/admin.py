from django.contrib import admin
from .models import *

@admin.register(NewsCategory)
class NewsCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
   

class NewsImageInline(admin.TabularInline):
    """
    Allows adding and editing news images directly from the News admin page.
    """
    model = NewsImage
    extra = 1  # Provides one extra empty form for new images

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    """
    Admin configuration for the News model.
    """
    list_display = ('title', 'author', 'published_date', 'created_at')
    list_filter = ('published_date', 'author')
    search_fields = ('title', 'content', "category__name")
    date_hierarchy = 'published_date'
    inlines = [NewsImageInline]
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('category', 'title', 'content', 'published_date', 'author')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """
        Filters the queryset to show news created by the current user,
        unless they are a superuser.
        """
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(author=request.user)

    def save_model(self, request, obj, form, change):
        """
        Automatically sets the author of the news item to the currently logged-in user.
        """
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)

@admin.register(NewsImage)
class NewsImageAdmin(admin.ModelAdmin):
    """
    Admin configuration for the NewsImage model (optional, but good practice).
    """
    list_display = ('__str__', 'news')
    list_filter = ('news',)
    search_fields = ('news__title',)