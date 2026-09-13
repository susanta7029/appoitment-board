from datetime import date, time
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, not_, or_
from app.models import Appointment, AppointmentStatus
from app.schemas import AppointmentCreate, AppointmentUpdate


def check_time_overlap(
    db: Session,
    appointment_date: date,
    start_time: time,
    end_time: time,
    exclude_id: Optional[int] = None
) -> Optional[Appointment]:
    """
    Checks if an appointment time slot overlaps with an existing non-cancelled appointment.
    Two intervals (S1, E1) and (S2, E2) overlap if:
      S1 < E2 AND E1 > S2
    """
    query = db.query(Appointment).filter(
        Appointment.date == appointment_date,
        Appointment.status != AppointmentStatus.CANCELLED,
        Appointment.start_time < end_time,
        Appointment.end_time > start_time,
    )

    if exclude_id is not None:
        query = query.filter(Appointment.id != exclude_id)

    return query.first()


def get_appointments(
    db: Session,
    filter_date: Optional[date] = None,
    status: Optional[AppointmentStatus] = None,
    search: Optional[str] = None
) -> List[Appointment]:
    query = db.query(Appointment)

    if filter_date:
        query = query.filter(Appointment.date == filter_date)

    if status:
        query = query.filter(Appointment.status == status)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Appointment.title.ilike(search_pattern),
                Appointment.description.ilike(search_pattern)
            )
        )

    # Order by date ascending, then start_time ascending
    return query.order_by(Appointment.date.asc(), Appointment.start_time.asc()).all()


def get_appointment_by_id(db: Session, appointment_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()


def create_appointment(db: Session, obj_in: AppointmentCreate) -> Appointment:
    db_obj = Appointment(
        title=obj_in.title,
        description=obj_in.description,
        date=obj_in.date,
        start_time=obj_in.start_time,
        end_time=obj_in.end_time,
        status=obj_in.status or AppointmentStatus.SCHEDULED,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_appointment(
    db: Session,
    db_obj: Appointment,
    obj_in: AppointmentUpdate
) -> Appointment:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_appointment(db: Session, appointment_id: int) -> bool:
    db_obj = get_appointment_by_id(db, appointment_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
