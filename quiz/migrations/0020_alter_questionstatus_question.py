# Generated by Django 5.1.1 on 2024-09-15 15:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0019_alter_questionstatus_question'),
    ]

    operations = [
        migrations.AlterField(
            model_name='questionstatus',
            name='question',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='quiz.question'),
        ),
    ]
