from django.contrib import admin
from .models import ShortenedURL, Click


class ClickInline(admin.TabularInline):
    model = Click
    extra = 0
    readonly_fields = ("ip_address", "clicked_at")
    can_delete = False


@admin.register(ShortenedURL)
class ShortenedURLAdmin(admin.ModelAdmin):
    list_display = ("alias", "short_original_url", "click_count", "created_at")
    search_fields = ("alias", "original_url")
    readonly_fields = ("created_at",)
    inlines = [ClickInline]

    def short_original_url(self, obj):
        return obj.original_url[:60]

    short_original_url.short_description = "Original URL"

    def click_count(self, obj):
        return obj.clicks.count()

    click_count.short_description = "Clicks"


@admin.register(Click)
class ClickAdmin(admin.ModelAdmin):
    list_display = ("url", "ip_address", "clicked_at")
    list_filter = ("clicked_at",)
    search_fields = ("url__alias", "ip_address")
    readonly_fields = ("url", "ip_address", "clicked_at")
