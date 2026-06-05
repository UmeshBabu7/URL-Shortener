from django.http import HttpResponsePermanentRedirect, JsonResponse
from django.views import View

from .models import ShortenedURL, Click
from .rate_limiter import get_client_ip


class RedirectView(View):
    def get(self, request, alias):
        try:
            url = ShortenedURL.objects.get(alias=alias)
        except ShortenedURL.DoesNotExist:
            return JsonResponse({"error": f"Alias '{alias}' not found."}, status=404)

        Click.objects.create(url=url, ip_address=get_client_ip(request))
        return HttpResponsePermanentRedirect(url.original_url)
