# Generated by Django 5.1.1 on 2024-09-10 09:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0007_alter_question_text'),
    ]

    operations = [
        migrations.AddField(
            model_name='exam',
            name='status',
            field=models.CharField(choices=[('draft', 'Draft'), ('submitted_to_admin', 'Submitted to Admin'), ('under_review', 'Under Review'), ('reviewed', 'Reviewed'), ('published', 'Published'), ('returned_to_creator', 'Returned to Creator')], default='draft', max_length=20),
        ),
    ]
