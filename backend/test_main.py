import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import date

from app.database import Base, get_db
from app.main import app

# Use in-memory SQLite with StaticPool so all connections share the same memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"



def test_create_valid_appointment():
    test_date = str(date.today())
    payload = {
        "title": "Team Standup",
        "description": "Daily sync call",
        "date": test_date,
        "start_time": "09:00",
        "end_time": "09:30",
        "status": "scheduled"
    }
    response = client.post("/api/appointments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Team Standup"
    assert data["id"] is not None


def test_create_appointment_invalid_time_range():
    test_date = str(date.today())
    payload = {
        "title": "Invalid Time",
        "description": "End time before start time",
        "date": test_date,
        "start_time": "10:00",
        "end_time": "09:00",
        "status": "scheduled"
    }
    response = client.post("/api/appointments", json=payload)
    assert response.status_code == 422  # Pydantic validation error for time ordering


def test_time_overlap_prevention():
    test_date = str(date.today())
    # Create initial appointment 10:00 - 11:30
    payload1 = {
        "title": "Client Meeting",
        "description": "First appointment",
        "date": test_date,
        "start_time": "10:00",
        "end_time": "11:30",
        "status": "scheduled"
    }
    res1 = client.post("/api/appointments", json=payload1)
    assert res1.status_code == 201

    # Attempt to create overlapping appointment 11:00 - 12:00
    payload2 = {
        "title": "Design Sync",
        "description": "Overlapping appointment",
        "date": test_date,
        "start_time": "11:00",
        "end_time": "12:00",
        "status": "scheduled"
    }
    res2 = client.post("/api/appointments", json=payload2)
    assert res2.status_code == 400
    assert "Time slot conflict" in res2.json()["detail"]


def test_adjacent_time_slots_allowed():
    test_date = str(date.today())
    # 10:00 - 11:00
    res1 = client.post("/api/appointments", json={
        "title": "Slot A",
        "date": test_date,
        "start_time": "10:00",
        "end_time": "11:00",
        "status": "scheduled"
    })
    assert res1.status_code == 201

    # 11:00 - 12:00 (Starts right when previous ends)
    res2 = client.post("/api/appointments", json={
        "title": "Slot B",
        "date": test_date,
        "start_time": "11:00",
        "end_time": "12:00",
        "status": "scheduled"
    })
    assert res2.status_code == 201


def test_cancelled_appointment_frees_time_slot():
    test_date = str(date.today())
    # 14:00 - 15:00
    res1 = client.post("/api/appointments", json={
        "title": "To Be Cancelled",
        "date": test_date,
        "start_time": "14:00",
        "end_time": "15:00",
        "status": "scheduled"
    })
    apt_id = res1.json()["id"]

    # Cancel appointment
    client.patch(f"/api/appointments/{apt_id}/status", json={"status": "cancelled"})

    # Now schedule new appointment at the exact same slot
    res2 = client.post("/api/appointments", json={
        "title": "Replacement Meeting",
        "date": test_date,
        "start_time": "14:00",
        "end_time": "15:00",
        "status": "scheduled"
    })
    assert res2.status_code == 201


def test_status_update():
    test_date = str(date.today())
    res1 = client.post("/api/appointments", json={
        "title": "Complete Me",
        "date": test_date,
        "start_time": "16:00",
        "end_time": "17:00",
        "status": "scheduled"
    })
    apt_id = res1.json()["id"]

    # Mark complete
    res_complete = client.patch(f"/api/appointments/{apt_id}/status", json={"status": "completed"})
    assert res_complete.status_code == 200
    assert res_complete.json()["status"] == "completed"
