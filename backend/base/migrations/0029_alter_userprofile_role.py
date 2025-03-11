# Generated by Django 5.1.4 on 2025-03-11 04:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0028_task_assigned_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='role',
            field=models.CharField(choices=[('manager', 'Manager'), ('worker', 'Worker')], default='worker', max_length=30),
        ),
    ]
