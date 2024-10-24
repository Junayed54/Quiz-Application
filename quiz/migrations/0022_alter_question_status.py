# Generated by Django 5.1.1 on 2024-09-15 17:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0021_alter_question_status_delete_questionstatus'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='status',
            field=models.CharField(choices=[('submitted', 'Submitted'), ('reviewed', 'Reviewed'), ('approved', 'Approved'), ('published', 'Published'), ('rejected', 'Rejected')], default=1, max_length=30, null=True),
        ),
    ]
