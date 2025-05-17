from django.urls import path
from .views import *
from django.views.generic import TemplateView


urlpatterns = [
    path('', TemplateView.as_view(template_name="new_custom/new_templates/index2.html")),
    path('home/', home, name='home'),
    
    path('signup/', signup_view, name='sign_up'),
    path('login/', login_view, name='log_in'),
    
    
    
    path('past_exams/', TemplateView.as_view(template_name="new_custom/new_templates/university.html"), name ='universities'),
    path('all_past_exams/', TemplateView.as_view(template_name="new_custom/quiz/all_past_exams.html"), name="all_examss"),
    path('new_past_exam_details/<int:pk>/', TemplateView.as_view(template_name="new_custom/quiz/new_past_exam_details.html")),
    path('user/dashboard/', TemplateView.as_view(template_name="new_custom/new_templates/dashboard.html")),
    path('user/leaderboard/', TemplateView.as_view(template_name="new_custom/new_templates/dashboard3.html")),
    path('questions/', TemplateView.as_view(template_name="new_custom/new_templates/questions.html")),
    path('prev_result/<int:pk>/', TemplateView.as_view(template_name="new_custom/new_templates/prev_exam_result.html")),
]
