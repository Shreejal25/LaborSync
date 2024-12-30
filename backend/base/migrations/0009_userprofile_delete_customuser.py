# Generated by Django 5.1.4 on 2024-12-26 12:01

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0008_customuser'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone_number', models.CharField(max_length=15)),
                ('gender', models.CharField(choices=[('male', 'Male'), ('female', 'Female'), ('others', 'Others')], max_length=10)),
                ('current_address', models.TextField()),
                ('permanent_address', models.TextField()),
                ('city_town', models.CharField(max_length=100)),
                ('state_province', models.CharField(max_length=100)),
                ('education_level', models.CharField(max_length=100)),
                ('certifications', models.TextField(blank=True, null=True)),
                ('skills', models.TextField()),
                ('languages_spoken', models.TextField()),
                ('work_availability', models.CharField(choices=[('fulltime', 'Fulltime'), ('parttime', 'Part-time'), ('freelance', 'Freelance')], max_length=10)),
                ('work_schedule_preference', models.CharField(max_length=100)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='CustomUser',
        ),
    ]
