from django.urls import path
from .views import *
from django.views.generic import TemplateView


urlpatterns = [
    path("api/word-of-the-day/", WordOfTheDayAPIView.as_view(), name="word-of-the-day"),
    # path("api/words/", WordListAPIView.as_view(), name="word-list"),
    path("api/words/<int:id>/", WordDetailAPIView.as_view(), name="word-detail"),
    path("api/words/az/", WordAZAPIView.as_view(), name="word-az"),
    path("api/words/search/", WordSearchAPIView.as_view(), name="word-search"),
    path("api/language/<int:language_id>/words/upload/", DictionaryExcelUploadAPIView.as_view()),
    
    
]



# Template 

urlpatterns +=[
    path("language/", TemplateView.as_view(template_name="new_custom/language/language-home.html")),
    
    
    # admin Templates
    path("language/<int:language_id>/upload-words/", TemplateView.as_view(template_name="Html/custom/language/upload-words.html")),
    
    
]