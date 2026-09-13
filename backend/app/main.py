from datetime import date
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import Appointment, AppointmentStatus
from app.schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentStatusUpdate,
)
from app.crud import (
    check_time_overlap,
    get_appointments,
    get_appointment_by_id,
    create_appointment,
    update_appointment,
    delete_appointment,
)
from app.seed import seed_sample_data

from contextlib import asynccontextmanager

# Create DB tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-seed sample appointments on startup if empty."""
    db = next(get_db())
    try:
        seed_sample_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Appointment Board API",
    description="API for managing team appointments with time slot collision prevention.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Appointment Board API",
        "docs": "/docs",
        "health": "/api/health",
        "appointments": "/api/appointments"
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Appointment Board API"}



@app.get("/api/appointments", response_model=List[AppointmentResponse])
def list_appointments(
    filter_date: Optional[date] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    status_filter: Optional[AppointmentStatus] = Query(None, alias="status", description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    db: Session = Depends(get_db),
):
    appointments = get_appointments(
        db, filter_date=filter_date, status=status_filter, search=search
    )
    return [apt.to_dict() for apt in appointments]


@app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    apt = get_appointment_by_id(db, appointment_id)
    if not apt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found.",
        )
    return apt.to_dict()


@app.post("/api/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def add_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
):
    # Check for time slot overlap
    overlapping = check_time_overlap(
        db,
        appointment_date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )

    if overlapping:
        conflict_start = overlapping.start_time.strftime("%H:%M")
        conflict_end = overlapping.end_time.strftime("%H:%M")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Time slot conflict: An appointment ('{overlapping.title}') "
                f"already exists from {conflict_start} to {conflict_end} on {payload.date}."
            ),
        )

    new_apt = create_appointment(db, payload)
    return new_apt.to_dict()


@app.put("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def edit_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
):
    existing = get_appointment_by_id(db, appointment_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found.",
        )

    # Determine effective target date, start time, end time, and status
    target_date = payload.date if payload.date is not None else existing.date
    target_start = payload.start_time if payload.start_time is not None else existing.start_time
    target_end = payload.end_time if payload.end_time is not None else existing.end_time
    target_status = payload.status if payload.status is not None else existing.status

    if target_end <= target_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be strictly after start time.",
        )

    # If the appointment is not cancelled, verify no time slot collision with OTHER appointments
    if target_status != AppointmentStatus.CANCELLED:
        overlapping = check_time_overlap(
            db,
            appointment_date=target_date,
            start_time=target_start,
            end_time=target_end,
            exclude_id=appointment_id,
        )
        if overlapping:
            conflict_start = overlapping.start_time.strftime("%H:%M")
            conflict_end = overlapping.end_time.strftime("%H:%M")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Time slot conflict: An appointment ('{overlapping.title}') "
                    f"already exists from {conflict_start} to {conflict_end} on {target_date}."
                ),
            )

    updated_apt = update_appointment(db, existing, payload)
    return updated_apt.to_dict()


@app.patch("/api/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def change_status(
    appointment_id: int,
    payload: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
):
    existing = get_appointment_by_id(db, appointment_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found.",
        )

    # If reactivating a cancelled appointment, perform overlap check
    if existing.status == AppointmentStatus.CANCELLED and payload.status != AppointmentStatus.CANCELLED:
        overlapping = check_time_overlap(
            db,
            appointment_date=existing.date,
            start_time=existing.start_time,
            end_time=existing.end_time,
            exclude_id=appointment_id,
        )
        if overlapping:
            conflict_start = overlapping.start_time.strftime("%H:%M")
            conflict_end = overlapping.end_time.strftime("%H:%M")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot reactivate appointment: Time slot conflicts with "
                    f"'{overlapping.title}' ({conflict_start} - {conflict_end})."
                ),
            )

    existing.status = payload.status
    db.add(existing)
    db.commit()
    db.refresh(existing)
    return existing.to_dict()


@app.delete("/api/appointments/{appointment_id}")
def remove_appointment(appointment_id: int, db: Session = Depends(get_db)):
    success = delete_appointment(db, appointment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appointment with ID {appointment_id} not found.",
        )
    return {"message": f"Appointment {appointment_id} deleted successfully."}


@app.post("/api/appointments/seed")
def reset_seed_data(db: Session = Depends(get_db)):
    """Reset and re-seed sample appointments."""
    seed_sample_data(db, force=True)
    return {"message": "Database reset and re-seeded with sample appointments successfully."}
