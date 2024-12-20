# Generated by Django 5.1.1 on 2024-10-29 05:21

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ExamCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
            ],
            options={
                'verbose_name_plural': 'Exam Categories',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Exam',
            fields=[
                ('exam_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255, unique=True)),
                ('total_questions', models.PositiveIntegerField()),
                ('total_mark', models.PositiveIntegerField()),
                ('pass_mark', models.PositiveIntegerField()),
                ('negative_mark', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('starting_time', models.DateTimeField(blank=True, null=True)),
                ('last_date', models.DateField(blank=True, null=True)),
                ('duration', models.DurationField(blank=True, help_text='Exam duration (e.g., 1 hour 30 minutes)', null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='exams_created', to=settings.AUTH_USER_MODEL)),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='exams', to='quiz.examcategory')),
            ],
            options={
                'verbose_name': 'Exam',
                'verbose_name_plural': 'Exams',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ExamAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answered', models.PositiveIntegerField(default=0)),
                ('wrong_answers', models.PositiveIntegerField(default=0)),
                ('passed', models.BooleanField(default=False)),
                ('total_correct_answers', models.PositiveIntegerField(default=0)),
                ('attempt_time', models.DateTimeField(auto_now_add=True)),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='quiz.exam')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exam_attempts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Exam Attempt',
                'verbose_name_plural': 'Exam Attempts',
                'ordering': ['-attempt_time'],
            },
        ),
        migrations.CreateModel(
            name='ExamDifficulty',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('difficulty1_percentage', models.IntegerField(default=0)),
                ('difficulty2_percentage', models.IntegerField(default=0)),
                ('difficulty3_percentage', models.IntegerField(default=0)),
                ('difficulty4_percentage', models.IntegerField(default=0)),
                ('difficulty5_percentage', models.IntegerField(default=0)),
                ('difficulty6_percentage', models.IntegerField(default=0)),
                ('exam', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='difficulty', to='quiz.exam')),
            ],
            options={
                'verbose_name': 'Exam Difficulty',
                'verbose_name_plural': 'Exam Difficulties',
            },
        ),
        migrations.CreateModel(
            name='Leaderboard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField(default=0)),
                ('total_questions', models.IntegerField(default=0, null=True)),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leaderboards', to='quiz.exam')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leaderboard', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-score'],
            },
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=255, unique=True)),
                ('marks', models.IntegerField()),
                ('difficulty_level', models.IntegerField(choices=[(1, 'Very Easy'), (2, 'Easy'), (3, 'Medium'), (4, 'Hard'), (5, 'Very Hard'), (6, 'Expert')], default=1)),
                ('status', models.CharField(choices=[('submitted', 'Submitted'), ('reviewed', 'Reviewed'), ('approved', 'Approved'), ('published', 'Published'), ('rejected', 'Rejected')], default='submitted', max_length=30, null=True)),
                ('remarks', models.TextField(blank=True, null=True)),
                ('time_limit', models.IntegerField(default=60, help_text='Time limit for this question in seconds')),
                ('created_at', models.DateField(auto_now_add=True, null=True)),
                ('updated_at', models.DateField(auto_now=True, null=True)),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='quiz.category')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='question_created_by', to=settings.AUTH_USER_MODEL)),
                ('exam', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='quiz.exam')),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='question_reviewed_by', to=settings.AUTH_USER_MODEL)),
                ('subject', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='quiz.subject')),
            ],
        ),
        migrations.CreateModel(
            name='QuestionOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=255)),
                ('is_correct', models.BooleanField(default=False)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='options', to='quiz.question')),
            ],
        ),
        migrations.CreateModel(
            name='QuestionUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('exam', models.CharField(help_text='Name of the external exam where the question was used', max_length=255)),
                ('year', models.IntegerField(default=2024)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usages', to='quiz.question')),
            ],
        ),
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('student', 'student'), ('draft', 'Draft'), ('submitted_to_admin', 'Submitted to Admin'), ('under_review', 'Under Review'), ('reviewed', 'Reviewed'), ('returned_to_creator', 'Returned to Creator'), ('published', 'Published')], default='draft', max_length=50)),
                ('exam', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='exam', to='quiz.exam')),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_by', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
