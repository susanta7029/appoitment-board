from datetime import date, time, timedelta
from sqlalchemy.orm import Session
from app.models import Appointment, AppointmentStatus


def seed_sample_data(db: Session, force: bool = False):
    """Populates the database with sample appointments if empty or if forced."""
    if not force and db.query(Appointment).count() > 0:
        return

    if force:
        db.query(Appointment).delete()
        db.commit()

    today = date.today()
    tomorrow = today + timedelta(days=1)
    day_after = today + timedelta(days=2)

    sample_appointments = [
        Appointment(
            title="Product Strategy Sync",
            description="Discuss Q4 roadmap items, sprint priorities, and feature rollout schedule.",
            date=today,
            start_time=time(9, 0),
            end_time=time(10, 0),
            status=AppointmentStatus.SCHEDULED,
        ),
        Appointment(
            title="Client Onboarding Demo",
            description="Walkthrough key platform features with Acme Corp technical team.",
            date=today,
            start_time=time(10, 30),
            end_time=time(11, 30),
            status=AppointmentStatus.COMPLETED,
        ),
        Appointment(
            title="Backend Architecture Review",
            description="Review PostgreSQL schema migrations, FastAPI performance bottlenecks, and caching layer.",
            date=today,
            start_time=time(14, 0),
            end_time=time(15, 30),
            status=AppointmentStatus.SCHEDULED,
        ),
        Appointment(
            title="Design System Alignment (Cancelled)",
            description="Sync with UI/UX team regarding design tokens and icon library updates.",
            date=today,
            start_time=time(16, 0),
            end_time=time(17, 0),
            status=AppointmentStatus.CANCELLED,
        ),
        Appointment(
            title="Sprint 14 Planning & Estimation",
            description="Refine user stories for the upcoming 2-week iteration and assign task owners.",
            date=tomorrow,
            start_time=time(10, 0),
            end_time=time(11, 30),
            status=AppointmentStatus.SCHEDULED,
        ),
        Appointment(
            title="1-on-1 Engineering Mentorship",
            description="Bi-weekly career development check-in and technical feedback session.",
            date=tomorrow,
            start_time=time(13, 0),
            end_time=time(14, 0),
            status=AppointmentStatus.SCHEDULED,
        ),
        Appointment(
            title="Engineering Retrospective",
            description="Team-wide retrospective on process improvements and deployment velocity.",
            date=day_after,
            start_time=time(15, 0),
            end_time=time(16, 0),
            status=AppointmentStatus.SCHEDULED,
        ),
    ]

    for item in sample_appointments:
        db.add(item)
    db.commit()
    print(f"Successfully seeded {len(sample_appointments)} sample appointments.")
