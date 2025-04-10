# Generated by Django 5.1.4 on 2025-04-10 04:37

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0010_remove_taskreward_awarded_to_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='reward',
            name='is_redeemable',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='reward',
            name='redemption_instructions',
            field=models.TextField(blank=True),
        ),
        migrations.CreateModel(
            name='RewardRedemption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points_used', models.PositiveIntegerField()),
                ('status', models.CharField(choices=[('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('fulfilled', 'Fulfilled')], default='pending', max_length=20)),
                ('requested_at', models.DateTimeField(auto_now_add=True)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('admin_notes', models.TextField(blank=True)),
                ('reward', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='redemptions', to='base.reward')),
                ('task', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='base.task')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reward_redemptions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-requested_at'],
            },
        ),
    ]
