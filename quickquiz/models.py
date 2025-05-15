from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
from django.utils import timezone
# Create your models here.
class PracticeQuestion(models.Model):
    text = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='practice_questions/', blank=True, null=True)
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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    duration = models.DurationField(null=True, blank=True)  # Duration between start and end time
    score = models.IntegerField(default=0)  # The score the user earned in the session

    

    def update_score(self, score):
        """Update the user's score at the end of the session."""
        self.score = score
        self.save()

    def __str__(self):
        return f"Session for {self.user.username}"




class UserPoints(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    points = models.PositiveIntegerField(default=0)  # Points accumulated by the user

    def __str__(self):
        return f"{self.user.username}'s Points"

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
