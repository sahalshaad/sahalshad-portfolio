from django.urls import path

from .views import contact_submit, portfolio_content

urlpatterns = [
    path("portfolio-content/", portfolio_content, name="portfolio-content"),
    path("contact-submit/", contact_submit, name="contact-submit"),
]
