import React from 'react';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { ReminderItem, JobApplication } from '../types';
import { downloadIcsCalendar } from '../utils/calendar';

interface DeadlinesViewProps {
  reminders: ReminderItem[];
  applications: JobApplication[];
  onToggleDeadline: (appId: string) => Promise<void>;
  onSelectApplication: (app: JobApplication) => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  reminders,
  applications,
  onToggleDeadline,
  onSelectApplication,
}) => {
  const overdue = reminders.filter((r) => r.urgency === 'overdue' && !r.completed);
  const today = reminders.filter((r) => r.urgency === 'today' && !r.completed);
  const upcoming = reminders.filter((r) => r.urgency === 'upcoming' && !r.completed);
  const later = reminders.filter((r) => r.urgency === 'later' && !r.completed);
  const completed = reminders.filter((r) => r.completed);

  const handleExport = () => {
    downloadIcsCalendar(reminders, applications);
  };

  const getApplication = (id: string) => applications.find((a) => a.id === id);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Deadline Reminders & Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Never miss an Online Assessment window, interview round, or offer decision deadline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-input dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export to Calendar (.ics)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Overdue Alerts</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${overdue.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {overdue.length}
            </span>
            {overdue.length > 0 && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Action required</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Due Today</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${today.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {today.length}
            </span>
            {today.length > 0 && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Priority</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Next 7 Days</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
              {upcoming.length}
            </span>
            <span className="text-[11px] text-slate-400">upcoming milestones</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Active Reminders</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
              {overdue.length + today.length + upcoming.length + later.length}
            </span>
            <span className="text-[11px] text-slate-400">tracked events</span>
          </div>
        </div>
      </div>

      {/* Main Agenda Section */}
      <div className="space-y-6">

        {/* OVERDUE */}
        {overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Overdue ({overdue.length})</span>
            </div>
            <div className="space-y-2">
              {overdue.map((item, idx) => {
                const app = getApplication(item.applicationId);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleDeadline(item.applicationId)}
                        className="mt-0.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.company}</span>
                          <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold font-mono">
                            {Math.abs(item.daysRemaining)} days overdue ({item.deadline})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.role}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    {app && (
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-input dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors shrink-0"
                      >
                        View App
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DUE TODAY */}
        {today.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Due Today ({today.length})</span>
            </div>
            <div className="space-y-2">
              {today.map((item, idx) => {
                const app = getApplication(item.applicationId);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleDeadline(item.applicationId)}
                        className="mt-0.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.company}</span>
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                            Due Today
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.role}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    {app && (
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-input dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 rounded-lg border border-amber-300 dark:border-amber-800 transition-colors shrink-0"
                      >
                        View App
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NEXT 7 DAYS */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Next 7 Days ({upcoming.length})</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-xs">
              No milestones scheduled within the next 7 days.
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((item, idx) => {
                const app = getApplication(item.applicationId);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-2xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleDeadline(item.applicationId)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.company}</span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                            in {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'} ({item.deadline})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.deadlineType}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{item.role}</span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    {app && (
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
                      >
                        Details
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LATER */}
        {later.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Upcoming Later ({later.length})
            </div>
            <div className="space-y-2">
              {later.map((item, idx) => {
                const app = getApplication(item.applicationId);
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleDeadline(item.applicationId)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{item.company}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Due {item.deadline} (in {item.daysRemaining} days)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.deadlineType} · {item.role}
                        </div>
                      </div>
                    </div>

                    {app && (
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shrink-0"
                      >
                        View
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMPLETED CHECKLIST */}
        {completed.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Milestones ({completed.length})
            </div>
            <div className="space-y-1.5 opacity-60">
              {completed.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 line-through">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.company}:</span>
                    <span>{item.deadlineType}</span>
                    <span className="font-mono text-slate-400">({item.deadline})</span>
                  </div>
                  <button
                    onClick={() => onToggleDeadline(item.applicationId)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
