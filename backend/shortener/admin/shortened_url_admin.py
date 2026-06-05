from django.contrib import admin
from ..models import ShortenedURL


@admin.register(ShortenedURL)
class ShortenedURLAdmin(admin.ModelAdmin):
    list_display = ("alias", "short_original_url", "total_clicks", "created_at")
    search_fields = ("alias", "original_url")
    readonly_fields = ("alias", "created_at")
    ordering = ("-created_at",)

    def short_original_url(self, obj):
        return obj.original_url[:50]

    short_original_url.short_description = "Original URL"

    def total_clicks(self, obj):
        return obj.clicks.count()

    total_clicks.short_description = "Total Clicks"
