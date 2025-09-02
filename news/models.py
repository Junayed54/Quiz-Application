from django.db import models
from django.conf import settings

class News(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class NewsImage(models.Model):
    news = models.ForeignKey(
        News, 
        related_name="images", 
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to="news_images/")

    def __str__(self):
        return f"Image for {self.news.title}"
