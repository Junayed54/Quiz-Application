from django.urls import path
from .views import *
from django.views.generic import TemplateView


urlpatterns = [
    path('', TemplateView.as_view(template_name="new_custom/new_templates/index2.html")),
    path('home/', home, name='home'),
    path('about-us/', TemplateView.as_view(template_name="new_custom/new_templates/about.html"), name='about'),
    path('contact-us/', TemplateView.as_view(template_name="new_custom/new_templates/contact_us.html"), name='contact_us'),
    path('signup/', signup_view, name='sign_up'),
    path('login/', login_view, name='log_in'),
    
    
    
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