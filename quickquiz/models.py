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







# -------------------------------
#  REWARD SYSTEM MODELS
# -------------------------------
# class RewardDistribution(models.Model):
#     DISTRIBUTION_CHOICES = [
#         ('daily', 'Daily'),
#         ('weekly', 'Weekly'),
#         ('half_monthly', 'Half-Monthly'),
#         ('monthly', 'Monthly'),
#     ]

#     distribution_type = models.CharField(max_length=20, choices=DISTRIBUTION_CHOICES)
#     start_date = models.DateField()
#     end_date = models.DateField()
#     distributed_at = models.DateTimeField(auto_now_add=True)
#     total_users = models.IntegerField(default=0)
#     total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
#     note = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"{self.get_distribution_type_display()} Reward ({self.start_date} → {self.end_date})"

#     def calculate_period(self):
#         """Automatically determine start and end date based on the chosen type."""
#         today = date.today()
#         if self.distribution_type == 'daily':
#             self.start_date = today
#             self.end_date = today

#         elif self.distribution_type == 'weekly':
#             self.start_date = today - timedelta(days=7)
#             self.end_date = today

#         elif self.distribution_type == 'half_monthly':
#             if today.day <= 15:
#                 self.start_date = today.replace(day=1)
#                 self.end_date = today.replace(day=15)
#             else:
#                 self.start_date = today.replace(day=16)
#                 next_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1)
#                 self.end_date = next_month - timedelta(days=1)

#         elif self.distribution_type == 'monthly':
#             self.start_date = today.replace(day=1)
#             next_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1)
#             self.end_date = next_month - timedelta(days=1)

#         self.save()


# class UserReward(models.Model):
#     distribution = models.ForeignKey(
#         RewardDistribution,
#         on_delete=models.CASCADE,
#         related_name='user_rewards'
#     )
#     username = models.CharField(max_length=150, blank=True, null=True)
#     phone_number = models.CharField(max_length=15)
#     total_score = models.IntegerField(default=0)
#     reward_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

#     class Meta:
#         unique_together = ('distribution', 'phone_number')
#         ordering = ['-total_score']

#     def __str__(self):
#         return f"{self.username or 'Guest'} ({self.phone_number}) - {self.reward_amount}৳"

#     def calculate_reward(self):
#         """Default rule: 100 score = 1.00 Taka"""
#         self.reward_amount = round(self.total_score / 100, 2)
#         self.save()