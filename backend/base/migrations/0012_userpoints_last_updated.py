# Generated by Django 5.1.4 on 2025-04-10 05:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0011_reward_is_redeemable_reward_redemption_instructions_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpoints',
            name='last_updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
