# Generated by Django 5.1.4 on 2025-04-10 06:41

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0013_remove_pointstransaction_related_feedback_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='reward',
            name='eligible_users',
            field=models.ManyToManyField(blank=True, related_name='eligible_rewards', to=settings.AUTH_USER_MODEL),
        ),
    ]
