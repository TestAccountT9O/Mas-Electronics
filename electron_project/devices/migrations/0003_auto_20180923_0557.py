# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-09-23 03:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('devices', '0002_auto_20180915_0234'),
    ]

    operations = [
        migrations.AlterField(
            model_name='devicesparepartrelation',
            name='count',
            field=models.IntegerField(default=0),
        ),
    ]
