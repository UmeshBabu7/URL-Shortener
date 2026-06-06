from django.http import HttpResponseRedirect, JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import ShortenedURL, Click
from .rate_limiter import get_client_ip


@method_decorator(csrf_exempt, name="dispatch")
class RedirectView(View):
    def get(self, request, alias):
        try:
            url = ShortenedURL.objects.get(alias=alias)
        except ShortenedURL.DoesNotExist:
            return JsonResponse({"error": f"Alias '{alias}' not found."}, status=404)

        Click.objects.create(url=url, ip_address=get_client_ip(request))
        return HttpResponseRedirect(url.original_url)
