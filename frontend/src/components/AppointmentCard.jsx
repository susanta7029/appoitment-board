import React from 'react';
import { Clock, Calendar, CheckCircle2, Ban, Edit3, Trash2, RotateCw } from 'lucide-react';

export default function AppointmentCard({
  appointment,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const { id, title, description, date, start_time, end_time, status } = appointment;

  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const isScheduled = status === 'scheduled';

  // Format date display
  const formatDateDisplay = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === tom) return 'Tomorrow';

    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        isCancelled
          ? 'bg-slate-50/70 border-slate-200 opacity-80'
          : isCompleted
          ? 'border-emerald-100 hover:border-emerald-200'
          : 'border-slate-200 hover:border-blue-200'
      }`}
    >
      <div>
        {/* Header: Date, Time & Status Pill */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDateDisplay(date)}
            </span>
            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {start_time} - {end_time}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isScheduled
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-base font-bold text-slate-900 mb-1 line-clamp-1 ${
            isCancelled ? 'line-through text-slate-500' : ''
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={`text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2 ${
              isCancelled ? 'text-slate-400' : ''
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
        {/* Status Actions */}
        <div className="flex items-center gap-1">
          {isScheduled && (
            <>
              <button
                onClick={() => onStatusChange(id, 'completed')}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                title="Mark appointment as completed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>
              <button
                onClick={() => onStatusChange(id, 'cancelled')}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                title="Cancel appointment"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {isCompleted && (
            <button
              onClick={() => onStatusChange(id, 'scheduled')}
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1"
              title="Re-open appointment"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Re-open</span>
            </button>
          )}

          {isCancelled && (
            <button
              onClick={() => onStatusChange(id, 'scheduled')}
              className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              title="Reactivate appointment"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reactivate</span>
            </button>
          )}
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(appointment)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Appointment"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Appointment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
