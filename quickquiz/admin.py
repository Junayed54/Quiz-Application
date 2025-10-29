from django.contrib import admin
from .models import *



@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']
    
    

# PracticeOption Admin
class PracticeOptionInline(admin.TabularInline):
    model = PracticeOption
    extra = 0
    can_delete = False
    readonly_fields = ('text', 'image', 'is_correct')
    show_change_link = False
    max_num = 0  # Prevent adding new rows

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

class PracticeQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'short_text', 'marks', 'created_at')
    search_fields = ('text', )
    list_filter = ('subject', 'created_at')
    inlines = [PracticeOptionInline]

    def short_text(self, obj):
        return obj.text[:50] + "..." if obj.text and len(obj.text) > 50 else obj.text
    short_text.short_description = "Question Text"

admin.site.register(PracticeQuestion, PracticeQuestionAdmin)

# PracticeSession Admin
@admin.register(PracticeSession)
class PracticeSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'duration', 'score']
    search_fields = ['user__username']  # Allow searching by username of the user

@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_user_name', 'get_user_phone', 'username', 'points']
    search_fields = ['user__username', 'username', 'user__phone_number', 'phone_number']

    def get_user_name(self, obj):
        """Show username from related User or fallback username field"""
        return obj.user.username if obj.user else obj.username
    get_user_name.short_description = 'User'

    def get_user_phone(self, obj):
        """Show phone number from related User or fallback phone_number field"""
        return obj.user.phone_number if obj.user else obj.phone_number
    get_user_phone.short_description = 'Phone Number'

