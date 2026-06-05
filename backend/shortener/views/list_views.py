from django.conf import settings
from django.http import JsonResponse
from django.views import View

from ..models import ShortenedURL


class URLListView(View):
    def get(self, request):
        urls = ShortenedURL.objects.all()
        data = [
            {
                "alias": url.alias,
                "short_url": f"{settings.BASE_URL}/{url.alias}",
                "original_url": url.original_url,
                "total_clicks": url.clicks.count(),
                "created_at": url.created_at.isoformat(),
            }
            for url in urls
        ]
        return JsonResponse({"urls": data}, status=200)
