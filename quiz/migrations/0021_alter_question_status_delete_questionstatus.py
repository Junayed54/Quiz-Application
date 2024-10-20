# Generated by Django 5.1.1 on 2024-09-15 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0020_alter_questionstatus_question'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='status',
            field=models.IntegerField(choices=[('submitted', 'Submitted'), ('reviewed', 'Reviewed'), ('approved', 'Approved'), ('published', 'Published'), ('rejected', 'Rejected')], default=1, null=True),
        ),
        migrations.DeleteModel(
            name='QuestionStatus',
        ),
    ]
