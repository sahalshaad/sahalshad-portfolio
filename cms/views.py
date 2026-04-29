import json

from django.conf import settings
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
from django.utils.html import strip_tags

from .models import (
    CVDocument,
    ContactMessage,
    ContactSection,
    Experience,
    GeneralSettings,
    HeroSection,
    PortfolioProject,
    ResultStat,
    SectionContent,
    Service,
    SkillTag,
    Testimonial,
)


def _file_url(request, field_file):
    if not field_file:
        return ""
    return request.build_absolute_uri(field_file.url)


@ensure_csrf_cookie
def portfolio_content(request):
    hero = HeroSection.objects.filter(is_active=True).order_by("-updated_at").first() or HeroSection.objects.first()
    contact = (
        ContactSection.objects.filter(is_active=True).order_by("-updated_at").first()
        or ContactSection.objects.first()
    )
    cv = CVDocument.objects.filter(is_active=True).order_by("-updated_at").first() or CVDocument.objects.first()
    settings = (
        GeneralSettings.objects.filter(is_active=True).order_by("-updated_at").first()
        or GeneralSettings.objects.first()
    )

    experiences = Experience.objects.filter(is_active=True).order_by("order", "id")
    services = Service.objects.filter(is_active=True).order_by("order", "id")
    projects = PortfolioProject.objects.filter(is_active=True).order_by("order", "id")
    skills = SkillTag.objects.filter(is_active=True).order_by("order", "id")
    testimonials = Testimonial.objects.filter(is_active=True).order_by("order", "id")
    stats = ResultStat.objects.filter(is_active=True).order_by("order", "id")
    section_content = {
        item.section_key: {
            "eyebrow": item.eyebrow,
            "title": item.title,
            "subtitle": item.subtitle,
        }
        for item in SectionContent.objects.filter(is_active=True)
    }

    data = {
        "hero": {
            "name": hero.name if hero else "",
            "title": hero.title if hero else "",
            "description": strip_tags(hero.description) if hero else "",
            "profile_image_url": _file_url(request, hero.profile_image) if hero else "",
            "cta_primary_text": hero.cta_primary_text if hero else "View My Work",
            "cta_primary_link": hero.cta_primary_link if hero else "#work",
            "cta_secondary_text": hero.cta_secondary_text if hero else "Contact Me",
            "cta_secondary_link": hero.cta_secondary_link if hero else "#contact",
        },
        "experiences": [
            {
                "job_role": item.job_role,
                "company_name": item.company_name,
                "duration": item.duration,
                "description": strip_tags(item.description),
            }
            for item in experiences
        ],
        "services": [
            {
                "service_title": item.service_title,
                "description": strip_tags(item.description),
                "icon_class": item.icon_class,
                "icon_image_url": _file_url(request, item.icon_image),
            }
            for item in services
        ],
        "projects": [
            {
                "project_title": item.project_title,
                "category": item.category,
                "description": strip_tags(item.description),
                "results": item.results,
                "image_url": _file_url(request, item.image),
                "external_link": item.external_link,
            }
            for item in projects
        ],
        "skills": [item.name for item in skills],
        "stats": [{"label": item.label, "value": item.value} for item in stats],
        "section_content": section_content,
        "testimonials": [
            {
                "client_name": item.client_name,
                "designation": item.designation,
                "feedback": strip_tags(item.feedback),
                "image_url": _file_url(request, item.image),
            }
            for item in testimonials
        ],
        "contact": {
            "heading": contact.heading if contact else "Let's Grow Your Business",
            "description": strip_tags(contact.description) if contact else "",
        },
        "cv": {
            "title": cv.title if cv else "Download CV",
            "file_url": _file_url(request, cv.file) if cv else "",
        },
        "settings": {
            "site_name": settings.site_name if settings else "sahalshad",
            "linkedin_url": settings.linkedin_url if settings else "",
            "instagram_url": settings.instagram_url if settings else "",
            "portfolio_url": settings.portfolio_url if settings else "",
            "email": settings.email if settings else "",
            "phone_number": settings.phone_number if settings else "",
        },
    }
    return JsonResponse(data)


@csrf_exempt
@require_POST
def contact_submit(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"success": False, "message": "Invalid request payload."}, status=400)

    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    project_type = str(payload.get("projectType", "")).strip()
    message = str(payload.get("message", "")).strip()

    if not all([name, email, project_type, message]):
        return JsonResponse({"success": False, "message": "All fields are required."}, status=400)

    try:
        validate_email(email)
    except Exception:
        return JsonResponse({"success": False, "message": "Please enter a valid email address."}, status=400)

    contact_message = ContactMessage.objects.create(
        name=name,
        email=email,
        project_type=project_type,
        message=message,
    )

    if getattr(settings, "ADMIN_EMAIL", ""):
        send_mail(
            subject=f"New portfolio enquiry: {project_type}",
            message=(
                f"Name: {contact_message.name}\n"
                f"Email: {contact_message.email}\n"
                f"Project Type: {contact_message.project_type}\n\n"
                f"Message:\n{contact_message.message}"
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", settings.ADMIN_EMAIL),
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )

    return JsonResponse({"success": True, "message": "Message sent successfully"})
