import React from 'react';
import AppointmentCard from './AppointmentCard';
import { CalendarX2, RefreshCw } from 'lucide-react';

export default function AppointmentBoard({
  appointments,
  loading,
  onEdit,
  onStatusChange,
  onDelete,
  onResetSeed,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-44 bg-slate-100 rounded-2xl animate-pulse border border-slate-200"
          />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalendarX2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          No appointments found
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
          There are no appointments matching your current date, status, or search filters.
        </p>
        <button
          onClick={onResetSeed}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Sample Appointments</span>
        </button>
      </div>
    );
  }

  // Group appointments by date
  const groupedByDate = appointments.reduce((acc, apt) => {
    const d = apt.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(apt);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-8">
      {dates.map((dateStr) => {
        const items = groupedByDate[dateStr];
        const dateObj = new Date(dateStr + 'T00:00:00');
        const formattedHeader = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <div key={dateStr} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {formattedHeader}
              </h2>
              <span className="bg-slate-200/80 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
