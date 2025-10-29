from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import News
from .serializers import NewsSerializer

from firebase_admin import messaging
import logging
from notifications.models import DeviceToken, NotificationLog

class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", None) == "Admin"


class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by("-created_at")
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            # Require authentication for creating, updating, and deleting.
            return [permissions.IsAuthenticated()]
        # Allow any user (authenticated or not) to view news details or list.
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        """Create a News object and send notification if requested."""
        news_instance = serializer.save(author=self.request.user, published_date=timezone.now())

        # ✅ Check if admin wants to send notification
        send_notification = self.request.data.get("send_notification", False)

        if str(send_notification).lower() in ["true", "1", "yes"]:
            logger = logging.getLogger(__name__)

            # ✅ Get all device tokens
            tokens = list(DeviceToken.objects.values_list("token", flat=True))
            if not tokens:
                logger.warning("No device tokens found — skipping notification.")
                return

            # ✅ Build notification message
            title = "📰 Latest News Update!"
            body = f"{news_instance.title}\nStay informed — check it out now!"
            image_url = getattr(news_instance, "image_url", None)
            click_action_url = f"https://jobs.academy/news/details/{news_instance.id}/"

            sent_count = 0
            failed_count = 0

            try:
                if len(tokens) > 10:
                    # Batch send
                    message = messaging.MulticastMessage(
                        notification=messaging.Notification(
                            title=title,
                            body=body,
                            image=image_url,
                        ),
                        data={"url": click_action_url} if click_action_url else {},
                        tokens=tokens,
                    )
                    response = messaging.send_multicast(message)
                    sent_count = response.success_count
                    failed_count = response.failure_count
                else:
                    # Send individually
                    for token in tokens:
                        try:
                            messaging.send(
                                messaging.Message(
                                    notification=messaging.Notification(title, body, image_url),
                                    data={"url": click_action_url} if click_action_url else {},
                                    token=token,
                                )
                            )
                            sent_count += 1
                        except Exception as e:
                            logger.error(f"Notification failed for token={token}, error={e}")
                            failed_count += 1
            except Exception as e:
                logger.error(f"Batch notification error: {e}")
                failed_count = len(tokens)

            # ✅ Log the notification
            NotificationLog.objects.create(
                title=title,
                body=body,
                tokens=tokens,
                success_count=sent_count,
                failure_count=failed_count,
            )



