# Generated by Django 5.1.4 on 2025-03-17 13:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0032_project'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='project_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
