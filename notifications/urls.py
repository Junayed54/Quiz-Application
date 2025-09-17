from django.urls import path
from .views import *
from django.views.generic import TemplateView


urlpatterns = [
    path("api/save-device-token/", save_device_token, name="save_device_token"),
    path("api/notifications/send/", SendNotificationView.as_view(), name="send_notification"),
    path('api/device-token/', RegisterDeviceTokenView.as_view()),
    path('api/segment-users/', SegmentUsersView.as_view(), name='segment-users'),
    path('api/log-activity/', LogActivityView.as_view(), name='log-activity'),
    path('api/send-notification/', SendNotificationView.as_view(), name='send-notification'),
    path("api/track-click/", TrackClickAPIView.as_view(), name="track_click_api"),
]



# Templates

urlpatterns += [
    path('segment-dashboard/', TemplateView.as_view(template_name="Html/custom/notifications/send_notification.html")),
]