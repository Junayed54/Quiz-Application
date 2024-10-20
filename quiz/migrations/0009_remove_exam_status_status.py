# Generated by Django 5.1.1 on 2024-09-10 09:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0008_exam_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exam',
            name='status',
        ),
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('submitted_to_admin', 'Submitted to Admin'), ('under_review', 'Under Review'), ('reviewed', 'Reviewed'), ('returned_to_creator', 'Returned to Creator'), ('published', 'Published')], default='draft', max_length=50)),
                ('exam', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='quiz.exam')),
            ],
        ),
    ]
