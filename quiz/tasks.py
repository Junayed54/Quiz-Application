from celery import shared_task
from django.utils import timezone
from .models import ExamAttempt, Exam

@shared_task
def auto_submit_exam(attempt_id):
    try:
        attempt = ExamAttempt.objects.get(id=attempt_id)

        # Check if the attempt has already been completed
        if attempt.passed or attempt.answered > 0:
            print(f"Attempt {attempt_id} is already submitted or passed.")
            return

        # Process unanswered questions by setting a default answer
        unanswered_questions = attempt.exam.questions.exclude(id__in=[a.question_id for a in attempt.answers.all()])
        for question in unanswered_questions:
            attempt.answers.create(question_id=question.id, option='none')  # Adjust 'none' as per your needs

        # Recalculate pass/fail status
        attempt.passed = attempt.is_passed()
        attempt.attempt_time = timezone.now()
        attempt.save()

    except ExamAttempt.DoesNotExist:
        print(f"ExamAttempt with id {attempt_id} does not exist.")