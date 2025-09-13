from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required


def home(request):
    return render(request, 'Html/index.html')

def signup_view(request):
    return render(request, 'new_custom/new_templates/signup.html')


def login_view(request):
    
    return render(request, 'new_custom/new_templates/signIn.html')




# def home(request):
#     return render(request, 'Html/index.html')

# def home(request):
#     return render(request, 'home.html')

# def signup_view(request):
#     return render(request, 'Html/sign-up-cover.html')


# def login_view(request):
    
#     return render(request, 'Html/sign-in-cover.html')
@login_required
def exam_list_view(request):
    return render(request, 'exams.html')

# views.py
from django.views.generic import TemplateView
from notifications.middleware import ActivityLoggerMixin

class LoggedTemplateView(ActivityLoggerMixin, TemplateView):
    def dispatch(self, request, *args, **kwargs):
        self.log_activity(request)
        return super().dispatch(request, *args, **kwargs)
