import React from 'react';
import {
  Clock,
  MapPin,
  DollarSign,
  ChevronRight,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Building
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types';

interface PipelineKanbanProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  onOpenNewModal: () => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  statuses: ApplicationStatus[];
  borderColor: string;
  badgeBg: string;
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  onOpenNewModal,
}) => {
  const columns: ColumnConfig[] = [
    {
      id: 'wishlist',
      title: 'Wishlist',
      statuses: ['Wishlist'],
      borderColor: 'border-slate-300 dark:border-slate-700',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'applied',
      title: 'Applied',
      statuses: ['Applied'],
      borderColor: 'border-blue-300 dark:border-blue-700',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'oa',
      title: 'Online Assessment',
      statuses: ['Online Assessment'],
      borderColor: 'border-purple-300 dark:border-purple-700',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'interview',
      title: 'Interviewing',
      statuses: ['Technical Interview', 'Behavioral Interview', 'Final Round'],
      borderColor: 'border-amber-300 dark:border-amber-700',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'offer',
      title: 'Offer Extended',
      statuses: ['Offer'],
      borderColor: 'border-emerald-400 dark:border-emerald-600',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold',
    },
    {
      id: 'archived',
      title: 'Archived / Closed',
      statuses: ['Rejected', 'Withdrawn'],
      borderColor: 'border-slate-200 dark:border-slate-800',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    },
  ];

  const getNextStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    switch (current) {
      case 'Wishlist':
        return 'Applied';
      case 'Applied':
        return 'Online Assessment';
      case 'Online Assessment':
        return 'Technical Interview';
      case 'Technical Interview':
        return 'Behavioral Interview';
      case 'Behavioral Interview':
        return 'Final Round';
      case 'Final Round':
        return 'Offer';
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[calc(100vh-210px)] select-none">
      {columns.map((col) => {
        const colApps = applications.filter((a) => col.statuses.includes(a.status));

        return (
          <div
            key={col.id}
            className="w-80 shrink-0 bg-column/80 dark:bg-slate-900/60 rounded-2xl p-3 border border-line/80 dark:border-slate-800 flex flex-col max-h-[calc(100vh-210px)] transition-colors duration-150"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1.5 py-1 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                  {col.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${col.badgeBg}`}>
                  {colApps.length}
                </span>
              </div>
            </div>

            {/* Column Card List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {colApps.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-xs">
                  No applications in {col.title.toLowerCase()}
                </div>
              ) : (
                colApps.map((app) => {
                  const nextStatus = getNextStatus(app.status);
                  const isOffer = app.status === 'Offer';
                  const isRejected = app.status === 'Rejected';

                  return (
                    <div
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className={`group bg-surface dark:bg-slate-900 rounded-xl p-3.5 border transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 ${
                        isOffer
                          ? 'border-emerald-300 dark:border-emerald-700/60 ring-1 ring-emerald-200/50 dark:ring-emerald-900/30'
                          : isRejected
                          ? 'border-slate-200 dark:border-slate-800 opacity-75'
                          : 'border-slate-200/90 dark:border-slate-800'
                      }`}
                    >
                      {/* Top: Company & Rating */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {app.company}
                          </h4>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                            {app.role}
                          </p>
                        </div>

                        {/* Priority Rating */}
                        <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                            {app.rating}
                          </span>
                        </div>
                      </div>

                      {/* Location & Job Type - Zero Pill Typography with subtle separator */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                        <span>{app.jobType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{app.workModel}</span>
                        {app.location && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{app.location}</span>
                          </>
                        )}
                      </div>

                      {/* Salary if present */}
                      {app.salaryRange && (
                        <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md inline-block mb-2">
                          {app.salaryRange}
                        </div>
                      )}

                      {/* Deadline Countdown if present */}
                      {app.deadline && !app.deadlineCompleted && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200/70 dark:border-amber-800/50">
                          <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate">
                            {app.deadlineType}: <span className="font-mono">{app.deadline}</span>
                          </span>
                        </div>
                      )}

                      {/* Bottom Footer of Card: Quick Action & Date */}
                      <div className="mt-2.5 pt-2 border-t border-line-soft dark:border-slate-800 flex items-center justify-between text-[11px] text-ink-muted dark:text-slate-500 font-mono">
                        <span>Applied {app.appliedDate}</span>

                        {nextStatus && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(app.id, nextStatus);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-0.5 font-sans font-medium"
                            title={`Advance to ${nextStatus}`}
                          >
                            <span>Advance</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
