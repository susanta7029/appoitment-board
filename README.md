# Appointment Board Application

A full-stack web application designed for small teams to view, schedule, update, complete, and cancel appointments with automatic time-slot collision detection.

Built for the **Full Stack Developer Intern Practical Assessment**.

![Appointment Board Screenshot](assets/screenshot.png?v=2)

---



## 🌟 Core Features

- **Interactive Appointment Board**: Visual card grid grouped by date with clear status badges (`Scheduled`, `Completed`, `Cancelled`).
- **Time Slot Collision Prevention**: Prevents double-booking by checking that no two active appointments overlap on the same date.
- **Dynamic Filtering & Search**: Filter appointments by specific **Date**, by **Status** (`All`, `Scheduled`, `Completed`, `Cancelled`), or by real-time title/description **Search**.
- **Complete & Cancel Workflows**:
  - Mark appointments as **Completed**.
  - **Cancel** appointments (cancelled items remain visible on the board with strike-through styling and release their reserved time slot).
  - Reactivate cancelled appointments (subject to time slot collision checks).
- **Instant Sample Data**: Pre-seeded with sample appointments for immediate review, plus a 1-click **Reset Samples** button.
- **Toast Alerts**: Clear, user-friendly success banners and precise error messages for time slot conflicts.

---

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy ORM, Pydantic v2 validation.
- **Database**: SQLite (default zero-config database) with full PostgreSQL compatibility via `DATABASE_URL`.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Testing**: Pytest with in-memory SQLite (`StaticPool`) and FastAPI TestClient.

---

## 🧠 Application Logic & Assumptions

### 1. Time Slot Overlap Prevention Algorithm
Two appointments $A$ and $B$ on the same date overlap if and only if:
$$\text{Start}_A < \text{End}_B \quad \text{AND} \quad \text{End}_A > \text{Start}_B$$

- **Adjacent Slots Allowed**: An appointment ending at 11:00 and another starting at 11:00 do not overlap ($\text{Start}_B = 11:00 \nless 11:00 = \text{End}_A$).
- **Cancelled Exemption**: Cancelled appointments do not block time slots.
- **Self-Exemption during Edit**: Editing an existing appointment ignores its own current record during collision checks.

### 2. Assumptions Made
1. **Single-Day Appointments**: Appointments occur within a single calendar day (`00:00` to `23:59`).
2. **Time Slot Release**: Cancelling an appointment frees up the reserved time slot for other bookings.
3. **Persisted History**: Cancelled appointments remain visible on the board for auditability.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** & **npm** installed

---

### 1. Start the Backend API

```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Run backend server (starts on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

*API Documentation (Swagger UI) is available at: `http://localhost:8000/docs`*

---

### 2. Start the Frontend Application

```bash
cd frontend

# Install dependencies
npm install

# Run Vite dev server (starts on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🧪 Running Automated Tests

The backend includes a comprehensive unit test suite covering API endpoints, time slot collision logic, invalid time range validation, and status transitions.

To execute the tests:

```bash
cd backend
python -m pytest test_main.py
```

### Test Coverage Highlights:
- `test_create_valid_appointment`: Validates successful creation.
- `test_create_appointment_invalid_time_range`: Rejects `end_time <= start_time`.
- `test_time_overlap_prevention`: Blocks creation of overlapping appointments.
- `test_adjacent_time_slots_allowed`: Confirms back-to-back appointments (e.g. 10-11 and 11-12) succeed.
- `test_cancelled_appointment_frees_time_slot`: Verifies cancelled appointments free up time slots.
- `test_status_update`: Verifies status transitions.

---

## 📁 Project Structure

```
appointment-board/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application & endpoints
│   │   ├── database.py      # SQLAlchemy setup & session provider
│   │   ├── models.py        # SQLAlchemy Appointment model
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── crud.py          # Collision check & database operations
│   │   └── seed.py          # Sample dataset loader
│   ├── test_main.py         # Pytest test suite
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentBoard.jsx       # Date-grouped board view
│   │   │   ├── AppointmentCard.jsx        # Individual appointment card
│   │   │   ├── AppointmentFormModal.jsx   # Add/Edit modal dialog
│   │   │   ├── FilterBar.jsx              # Search, date & status filters
│   │   │   ├── StatsOverview.jsx          # Metrics counters
│   │   │   └── Toast.jsx                  # Notification banner
│   │   ├── services/
│   │   │   └── api.js                     # Backend API client
│   │   ├── App.jsx                        # Main state & UI container
│   │   ├── index.css                      # Tailwind styles
│   │   └── main.jsx                       # React DOM root
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```
