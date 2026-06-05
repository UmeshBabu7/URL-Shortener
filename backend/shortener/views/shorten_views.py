import hashlib
import json

from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from ..models import ShortenedURL
from ..rate_limiter import check_rate_limit, get_client_ip


def generate_alias(url: str) -> str:
    for salt in range(100):
        data = f"{url}{salt}".encode()
        digest = hashlib.sha256(data).hexdigest()
        alias = digest[:6]
        if not ShortenedURL.objects.filter(alias=alias).exists():
            return alias
    raise ValueError("Could not generate a unique alias after 100 attempts.")


@method_decorator(csrf_exempt, name="dispatch")
class ShortenURLView(View):
    def post(self, request):
        client_ip = get_client_ip(request)
        allowed, retry_after = check_rate_limit(client_ip)
        if not allowed:
            return JsonResponse(
                {
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. You may shorten 5 URLs per minute.",
                    "retry_after_seconds": retry_after,
                },
                status=429,
                headers={"Retry-After": str(retry_after)},
            )

        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        original_url = body.get("url", "").strip()
        if not original_url:
            return JsonResponse({"error": "The 'url' field is required."}, status=400)

        if not (
            original_url.startswith("http://") or original_url.startswith("https://")
        ):
            return JsonResponse(
                {"error": "URL must start with http:// or https://"}, status=400
            )

        existing = ShortenedURL.objects.filter(original_url=original_url).first()
        if existing:
            return JsonResponse(
                {
                    "alias": existing.alias,
                    "short_url": f"{settings.BASE_URL}/{existing.alias}",
                    "original_url": existing.original_url,
                    "created_at": existing.created_at.isoformat(),
                },
                status=200,
            )

        try:
            alias = generate_alias(original_url)
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=500)

        shortened = ShortenedURL.objects.create(alias=alias, original_url=original_url)
        return JsonResponse(
            {
                "alias": alias,
                "short_url": f"{settings.BASE_URL}/{alias}",
                "original_url": original_url,
                "created_at": shortened.created_at.isoformat(),
            },
            status=201,
        )
