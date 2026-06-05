from django.contrib import admin
from ..models import Click


@admin.register(Click)
class ClickAdmin(admin.ModelAdmin):
    list_display = ("url", "ip_address", "created_at")
    search_fields = ("url__alias", "ip_address")
    readonly_fields = ("url", "ip_address", "created_at")
    ordering = ("-created_at",)
