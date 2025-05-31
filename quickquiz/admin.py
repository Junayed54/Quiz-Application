from django.contrib import admin
from .models import *



@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']
    
    

# PracticeOption Admin
class PracticeOptionInline(admin.TabularInline):
    model = PracticeOption
    extra = 1  # Number of empty forms to show by default

# PracticeQuestion Admin
@admin.register(PracticeQuestion)
class PracticeQuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'text', 'subject', 'image']  # Fields to display in the list view
    search_fields = ['text']  # Make it searchable by the question text
    inlines = [PracticeOptionInline]  # Display PracticeOption inline within PracticeQuestion

# PracticeSession Admin
@admin.register(PracticeSession)
class PracticeSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'duration', 'score']
    search_fields = ['user__username']  # Allow searching by username of the user

# UserPoints Admin
@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'points']
    search_fields = ['user__username']  # Make it searchable by username of the user
