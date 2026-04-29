from ckeditor.fields import RichTextField
from django.core.validators import FileExtensionValidator
from django.db import models


class BaseOrderedModel(models.Model):
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["order", "id"]


class HeroSection(models.Model):
    name = models.CharField(max_length=120)
    title = models.CharField(max_length=180, default="Digital Marketing Specialist")
    description = RichTextField()
    profile_image = models.ImageField(upload_to="hero/")
    cta_primary_text = models.CharField(max_length=80, default="View My Work")
    cta_primary_link = models.CharField(max_length=255, default="#work")
    cta_secondary_text = models.CharField(max_length=80, default="Contact Me")
    cta_secondary_link = models.CharField(max_length=255, default="#contact")
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hero Section"
        verbose_name_plural = "Hero Sections"

    def __str__(self) -> str:
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"


class Experience(BaseOrderedModel):
    job_role = models.CharField(max_length=160)
    company_name = models.CharField(max_length=160)
    duration = models.CharField(max_length=120)
    description = RichTextField()

    def __str__(self) -> str:
        return f"{self.job_role} - {self.company_name}"


class Service(BaseOrderedModel):
    service_title = models.CharField(max_length=160)
    description = RichTextField()
    icon_class = models.CharField(max_length=80, blank=True, help_text="Example: LineChart")
    icon_image = models.ImageField(upload_to="services/icons/", blank=True, null=True)

    def __str__(self) -> str:
        return self.service_title


class PortfolioProject(BaseOrderedModel):
    class Category(models.TextChoices):
        META_ADS = "Meta Ads", "Meta Ads"
        SEO = "SEO", "SEO"
        BRANDING = "Branding", "Branding"
        GOOGLE_ADS = "Google Ads", "Google Ads"
        FUNNELS = "Funnels", "Funnels"

    project_title = models.CharField(max_length=180)
    category = models.CharField(max_length=40, choices=Category.choices)
    description = RichTextField()
    results = models.CharField(max_length=255)
    image = models.ImageField(upload_to="portfolio/", blank=True, null=True)
    external_link = models.URLField(blank=True)

    def __str__(self) -> str:
        return self.project_title


class SkillTag(BaseOrderedModel):
    name = models.CharField(max_length=80, unique=True)

    def __str__(self) -> str:
        return self.name


class Testimonial(BaseOrderedModel):
    client_name = models.CharField(max_length=140)
    designation = models.CharField(max_length=180, blank=True)
    feedback = RichTextField()
    image = models.ImageField(upload_to="testimonials/", blank=True, null=True)

    def __str__(self) -> str:
        return self.client_name


class ContactSection(models.Model):
    heading = models.CharField(max_length=180, default="Let’s Grow Your Business")
    description = RichTextField()
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Contact Section"
        verbose_name_plural = "Contact Sections"

    def __str__(self) -> str:
        return self.heading


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    project_type = models.CharField(max_length=120)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} - {self.project_type}"


class ResultStat(BaseOrderedModel):
    label = models.CharField(max_length=120)
    value = models.CharField(max_length=80)

    def __str__(self) -> str:
        return f"{self.label}: {self.value}"


class SectionContent(models.Model):
    class SectionKey(models.TextChoices):
        SERVICES = "services", "Services"
        EXPERIENCE = "experience", "Experience"
        WORK = "work", "Case Studies"
        RESULTS = "results", "Results"
        TESTIMONIALS = "testimonials", "Testimonials"

    section_key = models.CharField(max_length=40, choices=SectionKey.choices, unique=True)
    eyebrow = models.CharField(max_length=120)
    title = models.CharField(max_length=180)
    subtitle = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Section Content"
        verbose_name_plural = "Section Content"

    def __str__(self) -> str:
        return self.get_section_key_display()


class CVDocument(models.Model):
    title = models.CharField(max_length=120, default="Latest CV")
    file = models.FileField(
        upload_to="cv/",
        validators=[FileExtensionValidator(["pdf"])],
        help_text="Upload PDF only.",
    )
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "CV Upload"
        verbose_name_plural = "CV Uploads"

    def __str__(self) -> str:
        return self.title


class GeneralSettings(models.Model):
    site_name = models.CharField(max_length=120, default="sahalshad")
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=40, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "General Settings"
        verbose_name_plural = "General Settings"

    def __str__(self) -> str:
        return self.site_name
