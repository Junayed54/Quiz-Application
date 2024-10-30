import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import date
# from django.contrib.auth import get_user_model

User = get_user_model()



class ExamCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    @property
    def exam_count(self):
        """Return the number of exams under this category."""
        return self.exams.count()

    class Meta:
        verbose_name_plural = "Exam Categories"
        ordering = ['name']


class Exam(models.Model):
    exam_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    total_questions = models.PositiveIntegerField()
    created_by = models.ForeignKey(User, related_name='exams_created', on_delete=models.SET_NULL, null=True, blank=True)
    total_mark = models.PositiveIntegerField()
    pass_mark = models.PositiveIntegerField()
    negative_mark = models.FloatField(null=True, blank=True, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    starting_time = models.DateTimeField(null=True, blank=True)
    last_date = models.DateField(null=True, blank=True)
    category = models.ForeignKey(ExamCategory, related_name='exams', on_delete=models.SET_NULL, null=True, blank=True)
    duration = models.DurationField(null=True, blank=True, help_text="Duration in format: HH:MM:SS (e.g., 1:30:00 for 1 hour 30 minutes)")

    def __str__(self):
        return f"{self.title} (Category: {self.category.name if self.category else 'Uncategorized'})"

    @property
    def status(self):
        """Return exam status as 'Upcoming', 'Ongoing', or 'Closed'."""
        now = timezone.now()
        if self.starting_time and self.last_date:
            end_time = self.starting_time + self.duration if self.duration else timezone.make_aware(
                timezone.datetime.combine(self.last_date, timezone.datetime.max.time()))
            if now < self.starting_time:
                return "Upcoming"
            elif self.starting_time <= now <= end_time:
                return "Ongoing"
        return "Closed"

    def calculate_pass_fail(self, correct_answers):
        """Determine if the user has passed or failed based on correct answers."""
        return correct_answers >= self.pass_mark

    def get_user_attempt_count(self, user):
        """Get the number of attempts by a specific user."""
        return ExamAttempt.objects.filter(user=user, exam=self).count()

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Exam"
        verbose_name_plural = "Exams"


class Status(models.Model):
    STATUS_CHOICES = [
        ('student', 'student'),
        ('draft', 'Draft'),
        ('submitted_to_admin', 'Submitted to Admin'),
        ('under_review', 'Under Review'),
        ('reviewed', 'Reviewed'),
        ('returned_to_creator', 'Returned to Creator'),
        ('published', 'Published'),
    ]
    
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name = 'exam')
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="user")
    # description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name = "reviewed_by")  # Admin who reviewed the exam

    def __str__(self):
        return f"{self.exam.title} - {self.status}"

    def get_exam_details(self):
        """
        This method returns a dictionary containing the exam details needed for the frontend.
        """
        return {
            'title': self.exam.title,
            # 'category': self.exam.category.name,
            'created_by': self.exam.created_by.username,  # Assuming 'created_by' is a ForeignKey to User in Exam model
            'total_questions': self.exam.total_questions,
            'total_marks': self.exam.total_mark,
            'negative_mark': self.exam.negative_mark,
            'pass_mark': self.exam.pass_mark,
            'starting_time': self.exam.starting_time,
            'duration': self.exam.duration,
            'last_date': self.exam.last_date,
            'status': self.status,
            'reviewed_by': self.reviewed_by.username if self.reviewed_by else None,
            'user': self.user.username if self.user else None,
        }

class ExamDifficulty(models.Model):
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name='difficulty')
    difficulty1_percentage = models.IntegerField(default=0)  # Difficulty 1 (0-100%)
    difficulty2_percentage = models.IntegerField(default=0)  # Difficulty 2 (0-100%)
    difficulty3_percentage = models.IntegerField(default=0)  # Difficulty 3 (0-100%)
    difficulty4_percentage = models.IntegerField(default=0)  # Difficulty 4 (0-100%)
    difficulty5_percentage = models.IntegerField(default=0)  # Difficulty 5 (0-100%)
    difficulty6_percentage = models.IntegerField(default=0)  # Difficulty 6 (0-100%)

    def clean(self):
        """
        Ensure the sum of the difficulty percentages is 100%.
        """
        total_percentage = (self.difficulty1_percentage + self.difficulty2_percentage +
                            self.difficulty3_percentage + self.difficulty4_percentage +
                            self.difficulty5_percentage + self.difficulty6_percentage)
        if total_percentage != 100:
            raise ValidationError("The total percentage of difficulty questions must equal 100.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Difficulty for {self.exam.title}"

    class Meta:
        verbose_name = 'Exam Difficulty'
        verbose_name_plural = 'Exam Difficulties'




class ExamAttempt(models.Model):
    exam = models.ForeignKey('Exam', related_name='attempts', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_attempts')
    answered = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    total_correct_answers = models.PositiveIntegerField(default=0)
    attempt_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempt_time']
        verbose_name = "Exam Attempt"
        verbose_name_plural = "Exam Attempts"

    def __str__(self):
        return f"{self.user.username} - {self.exam.title} - {self.total_correct_answers} correct answers"

    @property
    def score(self):
        """Calculate and return the user's score."""
        return max(self.total_correct_answers - self.wrong_answers, 0)

    @property
    def is_passed(self):
        """Check if the attempt passed based on exam pass mark."""
        return self.total_correct_answers >= self.exam.pass_mark

    @classmethod
    def total_correct_for_user_exam(cls, user, exam):
        """Get total correct answers for a user across all attempts for a specific exam."""
        return cls.objects.filter(user=user, exam=exam).aggregate(total_correct=Sum('total_correct_answers'))['total_correct'] or 0

    def save(self, *args, **kwargs):
        """Override save to auto-set `passed` based on `is_passed`."""
        self.passed = self.is_passed
        super().save(*args, **kwargs)
        
        
        
class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Question(models.Model):
    DIFFICULTY_LEVEL_CHOICES = [
        (1, 'Very Easy'),
        (2, 'Easy'),
        (3, 'Medium'),
        (4, 'Hard'),
        (5, 'Very Hard'),
        (6, 'Expert'),
    ]
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]
    
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    text = models.CharField(max_length=255, unique=True)
    marks = models.IntegerField()
    category = models.ForeignKey(Category, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    difficulty_level = models.IntegerField(choices=DIFFICULTY_LEVEL_CHOICES, default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted', null=True)
    remarks = models.TextField(blank=True, null=True)
    time_limit = models.IntegerField(help_text="Time limit for this question in seconds", default=60)
    created_by = models.ForeignKey(User, related_name="question_created_by", null=True, blank=True, on_delete=models.CASCADE)
    reviewed_by = models.ForeignKey(User, related_name="question_reviewed_by", null=True, blank=True, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, related_name='questions', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateField(auto_now_add=True, null=True)
    updated_at = models.DateField(auto_now=True, null=True)
    def get_options(self):
        return self.options.all()

    def get_correct_answer(self):
        """Returns the correct answer text for the question, if available."""
        correct_option = self.options.filter(is_correct=True).first()
        return correct_option.text if correct_option else None
    
    def __str__(self):
        return self.text

    def category_name(self):
        return self.category.name
    
    
class QuestionUsage(models.Model):
    question = models.ForeignKey(Question, related_name='usages', on_delete=models.CASCADE)
    exam = models.CharField(max_length=255, help_text="Name of the external exam where the question was used")
    year = models.IntegerField(default=date.today().year)

    def __str__(self):
        return f"{self.question.text} used in {self.exam} ({self.year})"

    

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class Leaderboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard')
    score = models.IntegerField(default=0)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='leaderboards')
    total_questions = models.IntegerField(default=0, null=True)
    class Meta:
        ordering = ['-score']  # Order by score descending

    def __str__(self):
        return f'{self.user.username} - {self.score}'

    @staticmethod
    def update_best_score(user, exam):
        # Find the highest score for this user and exam
        best_score = ExamAttempt.objects.filter(user=user, exam=exam).order_by('-total_correct_answers').first()
        
        if best_score:
            leaderboard_entry, created = Leaderboard.objects.get_or_create(user=user, exam=exam)
            if leaderboard_entry.score < best_score.total_correct_answers:
                leaderboard_entry.score = best_score.total_correct_answers
                leaderboard_entry.save()
