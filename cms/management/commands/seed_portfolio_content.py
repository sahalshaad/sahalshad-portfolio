from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand

from cms.models import (
    CVDocument,
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


class Command(BaseCommand):
    help = "Seed portfolio CMS with current default content."

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parents[4]
        profile_image_path = base_dir / "public" / "pixo.sahal.png"

        hero, _ = HeroSection.objects.get_or_create(
            name="sahalshad",
            defaults={
                "title": "Digital Marketing Specialist",
                "description": (
                    "I help ambitious brands grow through Performance Marketing, Meta Ads, and Lead Generation systems "
                    "designed to increase qualified pipeline and revenue."
                ),
                "cta_primary_text": "View My Work",
                "cta_primary_link": "#work",
                "cta_secondary_text": "Contact Me",
                "cta_secondary_link": "#contact",
                "is_active": True,
            },
        )
        if profile_image_path.exists() and not hero.profile_image:
            with open(profile_image_path, "rb") as image_file:
                hero.profile_image.save("pixo.sahal.png", File(image_file), save=True)

        services = [
            ("Performance Marketing", "Meta Ads + Google Ads with creative testing, tracking hygiene, and ROI-driven scaling.", "LineChart"),
            ("Social Media Marketing", "Content systems that build trust, increase reach, and support conversion-focused campaigns.", "Megaphone"),
            ("SEO & Analytics", "Search-led growth paired with GA4 insights, dashboards, and attribution you can act on.", "BarChart3"),
            ("Funnel & Lead Generation", "Landing pages, lead magnets, and nurture flows designed to lift CVR and reduce CPL.", "Funnel"),
        ]
        for idx, (title, desc, icon_class) in enumerate(services, start=1):
            Service.objects.get_or_create(
                service_title=title,
                defaults={"description": desc, "icon_class": icon_class, "order": idx, "is_active": True},
            )

        experiences = [
            (
                "Digital Marketing Lead",
                "Growth Studio",
                "2024 — Present",
                "Scaled paid acquisition to a consistent 4.2x blended ROAS using structured creative testing.",
            ),
            (
                "Performance Marketer",
                "D2C Brand",
                "2022 — 2024",
                "Managed multi-channel spend across Meta + Google, optimizing toward MER, not vanity metrics.",
            ),
            (
                "Marketing Associate",
                "Agency",
                "2021 — 2022",
                "Handled social calendars, community growth, and creative coordination across 6+ clients.",
            ),
        ]
        for idx, (role, company, duration, desc) in enumerate(experiences, start=1):
            Experience.objects.get_or_create(
                job_role=role,
                company_name=company,
                defaults={"duration": duration, "description": desc, "order": idx, "is_active": True},
            )

        projects = [
            ("Lead Engine for a Coaching Program", "Funnels", "Webinar + retargeting funnel for lead generation.", "Generated 500+ leads in 30 days with a webinar funnel + retargeting loop."),
            ("Paid Scaling for D2C Skincare", "Meta Ads", "Creative refresh + audience refinement strategy.", "Improved ROAS from 2.1x → 3.8x by refreshing creatives + tightening tracking."),
            ("Brand Refresh for a Local Service", "Branding", "Positioning and social content realignment.", "Increased inbound enquiries by 42% after positioning update + social content system."),
            ("SEO Growth for a B2B Website", "SEO", "Topic cluster strategy with technical fixes.", "Lifted organic signups by 64% via topic clusters, technical fixes, and CRO tweaks."),
        ]
        for idx, (title, category, desc, results) in enumerate(projects, start=1):
            PortfolioProject.objects.get_or_create(
                project_title=title,
                defaults={
                    "category": category,
                    "description": desc,
                    "results": results,
                    "order": idx,
                    "is_active": True,
                },
            )

        for idx, skill in enumerate(["Meta Ads", "Google Ads", "GA4", "SEO", "CRO", "Landing Pages", "Funnels"], start=1):
            SkillTag.objects.get_or_create(name=skill, defaults={"order": idx, "is_active": True})

        testimonials = [
            ("Ananya Kapoor", "Founder, Coaching Brand", "Clear strategy, fast execution, and reporting focused on business outcomes."),
            ("Rahul Mehta", "Marketing Manager, D2C", "Every change was backed by data and clear rationale."),
            ("Sarah Thomas", "Owner, Local Services", "The funnel work improved lead quality and reduced wasted calls."),
        ]
        for idx, (name, designation, feedback) in enumerate(testimonials, start=1):
            Testimonial.objects.get_or_create(
                client_name=name,
                defaults={"designation": designation, "feedback": feedback, "order": idx, "is_active": True},
            )

        ContactSection.objects.get_or_create(
            heading="Let’s Grow Your Business",
            defaults={
                "description": "Share your goals and I’ll reply with a simple plan: what to test first and what to measure.",
                "is_active": True,
            },
        )

        GeneralSettings.objects.get_or_create(
            site_name="sahalshad",
            defaults={
                "linkedin_url": "https://www.linkedin.com/",
                "instagram_url": "https://www.instagram.com/",
                "portfolio_url": "#work",
                "is_active": True,
            },
        )

        section_defaults = {
            "services": ("What I do", "Growth services designed for performance", "Clean strategy, crisp execution, and reporting that connects marketing to revenue."),
            "experience": ("Experience", "Hands-on, results-driven marketing", "From campaign architecture to creative iteration and funnel performance."),
            "work": ("Case studies", "Work that speaks in numbers", "A selection of projects across ads, branding, SEO, and funnels."),
            "results": ("Results", "Metrics that matter to business", "Clear wins across spend efficiency, lead volume, and campaign reliability."),
            "testimonials": ("Testimonials", "Trusted partnerships", "Short, honest feedback from clients and teams I’ve worked with."),
        }
        for key, (eyebrow, title, subtitle) in section_defaults.items():
            SectionContent.objects.get_or_create(
                section_key=key,
                defaults={"eyebrow": eyebrow, "title": title, "subtitle": subtitle, "is_active": True},
            )

        stats = [
            ("Total Ad Spend Managed", "$250k+"),
            ("Leads Generated", "3,500+"),
            ("Clients Worked With", "18+"),
            ("Campaign Success Rate", "92%"),
        ]
        for idx, (label, value) in enumerate(stats, start=1):
            ResultStat.objects.get_or_create(label=label, defaults={"value": value, "order": idx, "is_active": True})

        self.stdout.write(self.style.SUCCESS("Portfolio CMS seed completed."))
