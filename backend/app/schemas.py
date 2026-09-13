from datetime import date as DateType, time as TimeType
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models import AppointmentStatus


class AppointmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Title of the appointment")
    description: Optional[str] = Field(None, description="Detailed description or notes")
    date: DateType = Field(..., description="Date of the appointment (YYYY-MM-DD)")
    start_time: TimeType = Field(..., description="Start time (HH:MM)")
    end_time: TimeType = Field(..., description="End time (HH:MM)")
    status: Optional[AppointmentStatus] = Field(default=AppointmentStatus.SCHEDULED)

    @field_validator("end_time")
    @classmethod
    def validate_time_range(cls, end_time: TimeType, info):
        start_time = info.data.get("start_time")
        if start_time and end_time <= start_time:
            raise ValueError("End time must be strictly after start time.")
        return end_time


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    date: Optional[DateType] = None
    start_time: Optional[TimeType] = None
    end_time: Optional[TimeType] = None
    status: Optional[AppointmentStatus] = None

    @field_validator("end_time")
    @classmethod
    def validate_time_range(cls, end_time: Optional[TimeType], info):
        start_time = info.data.get("start_time")
        if start_time and end_time and end_time <= start_time:
            raise ValueError("End time must be strictly after start time.")
        return end_time



class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentResponse(AppointmentBase):
    id: int
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)
