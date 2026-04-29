from django.contrib import admin
from django.utils.html import format_html

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


@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "is_active", "updated_at", "profile_preview")
    list_editable = ("is_active",)
    search_fields = ("name", "title")

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.pop("delete_selected", None)
        return actions

    @admin.display(description="Profile")
    def profile_preview(self, obj):
        if not obj.profile_image:
            return "-"
        return format_html('<img src="{}" style="height:48px;width:48px;border-radius:8px;object-fit:cover;" />', obj.profile_image.url)


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("job_role", "company_name", "duration", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("job_role", "company_name")
    ordering = ("order", "id")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("service_title", "order", "is_active", "icon_preview")
    list_editable = ("order", "is_active")
    search_fields = ("service_title", "icon_class")
    ordering = ("order", "id")

    @admin.display(description="Icon")
    def icon_preview(self, obj):
        if obj.icon_image:
            return format_html('<img src="{}" style="height:36px;width:36px;border-radius:6px;object-fit:cover;" />', obj.icon_image.url)
        return obj.icon_class or "-"


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ("project_title", "category", "results", "order", "is_active", "image_preview")
    list_filter = ("category", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("project_title", "results", "description")
    ordering = ("order", "id")

    @admin.display(description="Image")
    def image_preview(self, obj):
        if not obj.image:
            return "-"
        return format_html('<img src="{}" style="height:42px;width:64px;border-radius:8px;object-fit:cover;" />', obj.image.url)


@admin.register(SkillTag)
class SkillTagAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("name",)
    ordering = ("order", "id")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("client_name", "designation", "order", "is_active", "image_preview")
    list_editable = ("order", "is_active")
    search_fields = ("client_name", "designation", "feedback")
    ordering = ("order", "id")

    @admin.display(description="Photo")
    def image_preview(self, obj):
        if not obj.image:
            return "-"
        return format_html('<img src="{}" style="height:40px;width:40px;border-radius:9999px;object-fit:cover;" />', obj.image.url)


@admin.register(ContactSection)
class ContactSectionAdmin(admin.ModelAdmin):
    list_display = ("heading", "is_active", "updated_at")
    list_editable = ("is_active",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "project_type", "created_at")
    list_filter = ("project_type", "created_at")
    search_fields = ("name", "email")
    readonly_fields = ("name", "email", "project_type", "message", "created_at")
    ordering = ("-created_at",)


@admin.register(ResultStat)
class ResultStatAdmin(admin.ModelAdmin):
    list_display = ("label", "value", "order", "is_active")
    list_editable = ("value", "order", "is_active")
    search_fields = ("label", "value")
    ordering = ("order", "id")


@admin.register(SectionContent)
class SectionContentAdmin(admin.ModelAdmin):
    list_display = ("section_key", "eyebrow", "title", "is_active", "updated_at")
    list_editable = ("is_active",)
    search_fields = ("section_key", "title", "subtitle")


@admin.register(CVDocument)
class CVDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "updated_at", "file_link")
    list_editable = ("is_active",)

    @admin.display(description="File")
    def file_link(self, obj):
        if not obj.file:
            return "-"
        return format_html('<a href="{}" target="_blank">Open PDF</a>', obj.file.url)


@admin.register(GeneralSettings)
class GeneralSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "email", "phone_number", "social_links", "is_active", "updated_at")
    list_editable = ("is_active",)
    fieldsets = (
        ("Website", {"fields": ("site_name", "is_active")}),
        (
            "Social Media Links",
            {
                "fields": ("linkedin_url", "instagram_url", "portfolio_url"),
                "description": "Paste the full profile URL, including https://",
            },
        ),
        ("Contact Details", {"fields": ("email", "phone_number")}),
    )

    def has_add_permission(self, request):
        if GeneralSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.pop("delete_selected", None)
        return actions

    @admin.display(description="Social links")
    def social_links(self, obj):
        links = []
        if obj.linkedin_url:
            links.append(format_html('<a href="{}" target="_blank">LinkedIn</a>', obj.linkedin_url))
        if obj.instagram_url:
            links.append(format_html('<a href="{}" target="_blank">Instagram</a>', obj.instagram_url))
        if obj.portfolio_url:
            links.append(format_html('<a href="{}" target="_blank">Portfolio</a>', obj.portfolio_url))
        return format_html(" | ".join("{}" for _ in links), *links) if links else "-"
