# notifications/admin.py
from django.contrib import admin, messages
from django import forms
from django.shortcuts import render, redirect
from .services import send_custom_notification

class NotificationForm(forms.Form):
    title = forms.CharField(max_length=100)
    body = forms.CharField(widget=forms.Textarea)

def send_custom_notification_view(request):
    if request.method == "POST":
        form = NotificationForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            body = form.cleaned_data["body"]
            result = send_custom_notification(title, body)
            messages.success(request, result)
            return redirect("..")
    else:
        form = NotificationForm()
    return render(request, "admin/send_notification.html", {"form": form})




from django.contrib import admin
from .models import DeviceToken, UserActivity, NotificationLog

@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'device_type', 'device_id', 'user', 'ip_address', 'updated_at')
    list_filter = ('device_type', 'user')
    search_fields = ('token', 'device_id', 'ip_address')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('path', 'method','token', 'device_id', 'user', 'ip_address', 'timestamp')
    list_filter = ('path', 'method')
    search_fields = ('device_id', 'ip_address', 'path')
    readonly_fields = ('timestamp',)


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('title', 'sent_at', 'success_count', 'failure_count')
    search_fields = ('title',)
    readonly_fields = ('sent_at', 'tokens', 'success_count', 'failure_count')
