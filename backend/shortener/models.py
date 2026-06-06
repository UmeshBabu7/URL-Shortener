from django.db import models


class ShortenedURL(models.Model):
    alias = models.CharField(max_length=6, unique=True, db_index=True)
    original_url = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        abstract = False

    def __str__(self):
        return f"{self.alias} → {self.original_url[:60]}"


class Click(models.Model):
    url = models.ForeignKey(
        ShortenedURL, on_delete=models.CASCADE, related_name="clicks"
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    clicked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-clicked_at"]

    def __str__(self):
        return f"Click on {self.url.alias} at {self.clicked_at}"
