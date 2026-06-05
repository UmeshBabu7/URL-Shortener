from django.urls import path
from .views import ShortenURLView, URLListView, URLAnalyticsView

urlpatterns = [
    path("shorten/", ShortenURLView.as_view(), name="shorten"),
    path("urls/", URLListView.as_view(), name="url-list"),
    path(
        "urls/<str:alias>/analytics/", URLAnalyticsView.as_view(), name="url-analytics"
    ),
]
