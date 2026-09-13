import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  seedSampleAppointments,
} from './services/api';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import AppointmentBoard from './components/AppointmentBoard';
import AppointmentFormModal from './components/AppointmentFormModal';
import Toast from './components/Toast';
import { Calendar, HelpCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: 'all',
    search: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [toast, setToast] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments(filters);
      setAppointments(data);
    } catch (err) {
      showToast(err.message || 'Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleOpenAdd = () => {
    setEditingAppointment(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (appointment) => {
    setEditingAppointment(appointment);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData, id) => {
    if (id) {
      await updateAppointment(id, formData);
      showToast(`Appointment '${formData.title}' updated successfully.`);
    } else {
      await createAppointment(formData);
      showToast(`New appointment '${formData.title}' scheduled successfully.`);
    }
    loadAppointments();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateAppointmentStatus(id, newStatus);
      const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      showToast(`Appointment status updated to ${statusLabel}.`);
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      showToast('Appointment deleted.');
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to delete appointment', 'error');
    }
  };

  const handleResetSeed = async () => {
    try {
      await seedSampleAppointments();
      showToast('Board reset with sample appointments.');
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to reset seed data', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Banner / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Appointment Board
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Team Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage, schedule, and track team appointments
              </p>
            </div>

          </div>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Application Specs</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        {showInfo && (
          <div className="bg-blue-900 text-white p-6 rounded-3xl mb-6 shadow-xl relative overflow-hidden animate-fade-in">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-blue-300" />
                Task Overview & Time Slot Conflict Logic
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-300 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-blue-100 leading-relaxed">
              <div>
                <p className="font-semibold text-white mb-1">Key Features Implemented:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View, Add, Edit, Complete, and Cancel appointments.</li>
                  <li>Filter appointments dynamically by Date and Status.</li>
                  <li>Cancelled appointments remain visible with strike-through styling.</li>
                  <li>Real-time toast alerts for success & conflict warnings.</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Time Slot Overlap Rule:</p>
                <p>
                  Two active appointments on the same date conflict if{' '}
                  <code className="bg-blue-800 px-1 py-0.5 rounded text-blue-200 font-mono">
                    NewStart &lt; ExistingEnd
                  </code>{' '}
                  AND{' '}
                  <code className="bg-blue-800 px-1 py-0.5 rounded text-blue-200 font-mono">
                    NewEnd &gt; ExistingStart
                  </code>
                  . Cancelled appointments release their reserved slot.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Overview */}
        <StatsOverview appointments={appointments} />

        {/* Filters and Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onOpenAddModal={handleOpenAdd}
          onResetSeed={handleResetSeed}
        />

        {/* Appointment Grid / Board */}
        <AppointmentBoard
          appointments={appointments}
          loading={loading}
          onEdit={handleOpenEdit}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onResetSeed={handleResetSeed}
        />
      </main>

      {/* Add / Edit Form Modal */}
      <AppointmentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingAppointment}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Appointment Board — Full Stack Developer Intern Practical Assessment</p>
      </footer>
    </div>
  );
}
