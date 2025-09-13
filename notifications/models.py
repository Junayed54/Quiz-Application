from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. DeviceToken: Stores FCM tokens for both logged-in and guest users
class DeviceToken(models.Model):
    DEVICE_TYPES = (
        ('web', 'Web'),
        ('android', 'Android'),
        ('ios', 'iOS'),
    )

    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    device_id = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # Optional for guest tracking
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['device_id']),
            models.Index(fields=['user']),
            models.Index(fields=['ip_address']),
        ]

    def __str__(self):
        return f"{self.device_type} - {self.token[:10]}..."


# 2. UserActivity: Logs page visits for both guests and logged-in users
class UserActivity(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    device_id = models.CharField(max_length=255)
    token = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    path = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['device_id']),
            models.Index(fields=['path']),
            models.Index(fields=['user']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.device_id} visited {self.path}"


# 3. NotificationLog: Records each notification attempt and delivery stats
class NotificationLog(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    tokens = models.JSONField()  # List of FCM tokens
    success_count = models.IntegerField(default=0)
    failure_count = models.IntegerField(default=0)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification: {self.title} ({self.sent_at})"
