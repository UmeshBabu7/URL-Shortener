from datetime import timedelta

from django.conf import settings
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.utils import timezone
from django.views import View

from ..models import ShortenedURL


class URLAnalyticsView(View):
    def get(self, request, alias):
        try:
            url = ShortenedURL.objects.annotate(total_click_count=Count("clicks")).get(
                alias=alias
            )
        except ShortenedURL.DoesNotExist:
            return JsonResponse({"error": "Alias not found."}, status=404)
        today = timezone.now().date()
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        day_labels = [d.strftime("%b %d") for d in days]
        counts_qs = (
            url.clicks.filter(
                clicked_at__date__gte=days[0],
                clicked_at__date__lte=today,
            )
            .annotate(day=TruncDate("clicked_at"))
            .values("day")
            .annotate(count=Count("id"))
        )
        counts = {row["day"]: row["count"] for row in counts_qs}
        return JsonResponse(
            {
                "alias": alias,
                "original_url": url.original_url,
                "short_url": f"{settings.BASE_URL}/{alias}",
                "total_clicks": url.total_click_count,
                "analytics": {
                    "labels": day_labels,
                    "data": [counts.get(d, 0) for d in days],
                },
            },
            status=200,
        )
