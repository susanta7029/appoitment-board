const API_BASE = '/api';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.detail || data.message || 'An unexpected error occurred.';
    throw new Error(errorMessage);
  }
  return data;
}

export async function fetchAppointments(filters = {}) {
  const params = new URLSearchParams();
  if (filters.date) params.append('filter_date', filters.date);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const url = `${API_BASE}/appointments${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function createAppointment(payload) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateAppointment(id, payload) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function deleteAppointment(id) {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function seedSampleAppointments() {
  const res = await fetch(`${API_BASE}/appointments/seed`, {
    method: 'POST',
  });
  return handleResponse(res);
}
