from django.db import models
from .base_models import TimeStampedModel
from .shortened_url_models import ShortenedURL


class Click(TimeStampedModel):
    url = models.ForeignKey(
        ShortenedURL, on_delete=models.CASCADE, related_name="clicks"
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    clicked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Click on {self.url.alias} at {self.created_at}"
