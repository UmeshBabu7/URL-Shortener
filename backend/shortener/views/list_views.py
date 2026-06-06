from django.conf import settings
from django.db.models import Count
from django.http import JsonResponse
from django.views import View

from ..models import ShortenedURL


class URLListView(View):
    def get(self, request):
        urls = ShortenedURL.objects.annotate(click_count=Count("clicks")).order_by(
            "-created_at"
        )
        data = [
            {
                "alias": url.alias,
                "short_url": f"{settings.BASE_URL}/{url.alias}",
                "original_url": url.original_url,
                "total_clicks": url.click_count,
                "created_at": url.created_at.isoformat(),
            }
            for url in urls
        ]
        return JsonResponse({"urls": data}, status=200)
