from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
from django.utils import timezone
# Create your models here.
class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class PracticeQuestion(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)  # New field
    text = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='practice_questions/', blank=True, null=True)
    marks = models.PositiveIntegerField(default=1)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text or f"Image Question ({self.id})"


class PracticeOption(models.Model):
    question = models.ForeignKey(PracticeQuestion, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='practice_options/', blank=True, null=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text or f"Image Option ({self.id})"

class PracticeSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150, blank=True, null=True)  # For unauthenticated users
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # For unauthenticated users
    duration = models.DurationField(null=True, blank=True)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def update_score(self, score):
        """Update the user's score at the end of the session."""
        self.score = score
        self.save()

    def __str__(self):
        return f"Session for {self.user.username if self.user else self.username}"


class UserPoints(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150, blank=True, null=True)  # For unauthenticated users
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # For unauthenticated users
    points = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username if self.user else self.username}'s Points"

    def add_points(self, points):
        """Add points to the user's account."""
        self.points += points
        self.save()

    def subtract_points(self, points):
        """Subtract points from the user's account."""
        if self.points >= points:
            self.points -= points
            self.save()
        else:
            raise ValueError("Not enough points to subtract.")

