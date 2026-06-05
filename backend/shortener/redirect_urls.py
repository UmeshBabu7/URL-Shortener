from django.urls import path
from .redirect_view import RedirectView

urlpatterns = [
    path("<str:alias>", RedirectView.as_view(), name="redirect"),
]
