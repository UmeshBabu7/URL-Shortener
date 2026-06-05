from datetime import timedelta

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views import View

from ..models import ShortenedURL


class URLAnalyticsView(View):
    def get(self, request, alias):
        try:
            url = ShortenedURL.objects.get(alias=alias)
        except ShortenedURL.DoesNotExist:
            return JsonResponse({"error": "Alias not found."}, status=404)

        today = timezone.now().date()
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        day_labels = [d.strftime("%b %d") for d in days]
        counts = {d: 0 for d in days}

        for click in url.clicks.filter(
            clicked_at__date__gte=days[0], clicked_at__date__lte=today
        ):
            day = click.clicked_at.date()
            if day in counts:
                counts[day] += 1

        return JsonResponse(
            {
                "alias": alias,
                "original_url": url.original_url,
                "short_url": f"{settings.BASE_URL}/{alias}",
                "total_clicks": url.clicks.count(),
                "analytics": {
                    "labels": day_labels,
                    "data": [counts[d] for d in days],
                },
            },
            status=200,
        )
