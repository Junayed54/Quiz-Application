from django.urls import path
from .views import *

urlpatterns = [
    path('api/start-practice/', StartPracticeSessionView.as_view(), name='start-practice'),
    path('api/submit-practice/', SubmitPracticeSessionView.as_view(), name='submit-practice'),
    path('api/practice/leaderboard/', PracticeLeaderboardAPIView.as_view(), name='leaderboard'),
]
