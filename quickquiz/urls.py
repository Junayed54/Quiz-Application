from django.urls import path, include
from .views import *
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('api/', include(router.urls)),
    
    
    
    path('api/start-practice/', StartPracticeSessionView.as_view(), name='start-practice'),
    path('api/submit-practice/', SubmitPracticeSessionView.as_view(), name='submit-practice'),
    path('api/practice/leaderboard/', PracticeLeaderboardAPIView.as_view(), name='leaderboard'),
    
    path('api/questions/upload/', PracticeQuestionUploadView.as_view()),
]


# templates
urlpatterns +=[
    path("upload-questions/", TemplateView.as_view(template_name="Html/custom/quick_quiz/upload_questions.html")),
]