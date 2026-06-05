from django.db import models
from .base_models import TimeStampedModel


class ShortenedURL(TimeStampedModel):
    alias = models.CharField(max_length=6, unique=True, db_index=True)
    original_url = models.TextField()

    def __str__(self):
        return f"{self.alias} -> {self.original_url[:50]}"
