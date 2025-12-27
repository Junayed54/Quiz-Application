from django.urls import path
from .views import *
from django.views.generic import TemplateView


urlpatterns = [
    path('', TemplateView.as_view(template_name="new_custom/new_templates/index2.html")),
    # just for test template
    path('test/', TemplateView.as_view(template_name="new_custom/new_templates/test.html")),
    path('home/', home, name='home'),
    path('about-us/', TemplateView.as_view(template_name="new_custom/new_templates/about.html"), name='about'),
    path('contact-us/', TemplateView.as_view(template_name="new_custom/new_templates/contact_us.html"), name='contact_us'),
    path('signup/', signup_view, name='sign_up'),
    path('login/', login_view, name='log_in'),
    path('privacy-policy/', TemplateView.as_view(template_name="new_custom/new_templates/privacy-policy.html")),
    path('delete-account/', TemplateView.as_view(template_name="new_custom/new_templates/delete-account.html")),
    
    path('past_exams/', TemplateView.as_view(template_name="new_custom/quiz/exam_types.html"), name ='universities'),
    path('past_exams/<int:exam_type_id>/', TemplateView.as_view(template_name="new_custom/quiz/all_past_exams.html"), name="all_examss"),
    path('model-tests/', TemplateView.as_view(template_name="new_custom/quiz/model_test_types.html"), name="model-tests_types"),
    path('model-tests/<int:id>/', TemplateView.as_view(template_name="new_custom/quiz/model_test.html"), name="model-tests_types"),
    path('past_exam_details/<int:pk>/', TemplateView.as_view(template_name="new_custom/quiz/new_past_exam_details.html")),
    path('past_exam/read/<int:pk>/', TemplateView.as_view(template_name="new_custom/quiz/past_exam_read.html")),
    path('user/dashboard/', TemplateView.as_view(template_name="new_custom/new_templates/dashboard.html")),
    path('user/leaderboard/', TemplateView.as_view(template_name="new_custom/new_templates/quick_leaderboard3.html")),
    path('model-test/leaderboard/<uuid:exam_id>/', TemplateView.as_view(template_name="new_custom/quiz/model_test_leaderboard.html")),
    path('past-exam/leaderboard/<int:id>/', TemplateView.as_view(template_name="new_custom/quiz/past_exam_leaderboard.html")),
    path('quizzes/', TemplateView.as_view(template_name="new_custom/new_templates/questions.html")),
    path('quiz-games/', TemplateView.as_view(template_name="new_custom/new_templates/quiz_&_games.html")),
    path('word-games/', TemplateView.as_view(template_name="new_custom/games/all-word-games.html")),
    
    path('word-games/lettrix/', TemplateView.as_view(template_name="new_custom/games/word-mixer-game.html")),
    path('word-games/lettrix/start/', TemplateView.as_view(template_name="new_custom/games/word-mixer-game-start.html")),
    path('word-games/spella/', TemplateView.as_view(template_name="new_custom/games/spelling-game.html")),
    path('word-games/word-gather/', TemplateView.as_view(template_name="new_custom/games/word-gather.html")),
    
    path('word-games/leaderboard/', TemplateView.as_view(template_name="new_custom/games/word-game-leaderboard.html")),
    
    path('prev_result/<int:pk>/', TemplateView.as_view(template_name="new_custom/new_templates/prev_exam_result.html")),
    
    path('model-tests/<uuid:id>/', TemplateView.as_view(template_name="new_custom/quiz/model_test_details.html")),
    path('model-test/start/<uuid:id>/', TemplateView.as_view(template_name="new_custom/quiz/model_test_start.html")),
    path('model-test/read/<uuid:id>/', TemplateView.as_view(template_name="new_custom/quiz/model_test_read.html")),
    path('model-test/result/<uuid:id>/', TemplateView.as_view(template_name="new_custom/quiz/model-test-result.html")),
    path('user-summary/<int:pk>/', TemplateView.as_view(template_name="new_custom/user/user-summary.html")),
]




urlpatterns += [
    path('exams/wr_exams/', TemplateView.as_view(template_name="new_custom/wr_exams/wr_exams.html")),
    path('exams/wr_exams/<int:id>/', TemplateView.as_view(template_name="new_custom/wr_exams/wr_exam_details.html")),
]

# jobs news urls

urlpatterns +=[
    path('job-circular/', TemplateView.as_view(template_name="new_custom/jobs/all_jobs.html")),
    path('job-circular/<int:id>/', TemplateView.as_view(template_name="new_custom/jobs/job_details.html")),
    
    path('notices/', TemplateView.as_view(template_name="new_custom/jobs/notice_list.html")),
    path('notices/<int:id>/details/', TemplateView.as_view(template_name="new_custom/jobs/notice_details.html")),
]

# News
urlpatterns +=[
    path('news/', TemplateView.as_view(template_name='new_custom/news/news_category.html')),
    path('news/<int:pk>/', TemplateView.as_view(template_name='new_custom/news/all_news.html')),
    path('news/details/<int:pk>/', TemplateView.as_view(template_name='new_custom/news/news_details.html')),
]

# Notifications Templates
urlpatterns +=[
    path('notification/send/', TemplateView.as_view(template_name="new_custom/notifications/send_notification.html")),
]

urlpatterns +=[
    path('admin-dashboard/', TemplateView.as_view(template_name="Html/custom/admin/admin_dashboard.html")),
]


from django.views.static import serve
from django.conf import settings
from django.urls import re_path
import os
# ads.txt urls
urlpatterns += [
    re_path(r'^ads\.txt$', serve, {
        'path': 'ads.txt',
        'document_root': os.path.join(settings.BASE_DIR, 'frontend/static'),
        'show_indexes': False
    }),
]