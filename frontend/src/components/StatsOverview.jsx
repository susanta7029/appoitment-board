import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function StatsOverview({ appointments }) {
  const total = appointments.length;
  const scheduled = appointments.filter((a) => a.status === 'scheduled').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => a.status === 'cancelled').length;

  const stats = [
    {
      label: 'Total Appointments',
      value: total,
      icon: Calendar,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Scheduled',
      value: scheduled,
      icon: Clock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Cancelled',
      value: cancelled,
      icon: XCircle,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-white border ${stat.borderColor} shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}
