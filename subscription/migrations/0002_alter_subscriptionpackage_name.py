# Generated by Django 5.1.1 on 2024-09-24 16:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subscriptionpackage',
            name='name',
            field=models.CharField(choices=[('basic', 'Basic'), ('standard', 'Standard'), ('premium', 'Premium')], max_length=50),
        ),
    ]
