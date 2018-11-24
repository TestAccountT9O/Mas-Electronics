# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-11-14 12:12
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0005_remove_expense_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='category',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='expenses', to='expenses.ExpenseCategory'),
        ),
    ]