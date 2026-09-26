import React from 'react';
import {
  Star,
  ExternalLink,
  ChevronRight,
  Calendar,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types';

interface PipelineTableProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  onToggleDeadline: (id: string) => Promise<void>;
}

export const PipelineTable: React.FC<PipelineTableProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  onToggleDeadline,
}) => {
  const statuses: ApplicationStatus[] = [
    'Wishlist',
    'Applied',
    'Online Assessment',
    'Technical Interview',
    'Behavioral Interview',
    'Final Round',
    'Offer',
    'Rejected',
    'Withdrawn',
  ];

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
      case 'Online Assessment':
        return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800';
      case 'Technical Interview':
      case 'Behavioral Interview':
      case 'Final Round':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      case 'Applied':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
      case 'Rejected':
      case 'Withdrawn':
        return 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">No applications match your filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-150">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Company & Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Type & Model</th>
              <th className="py-3 px-4">Salary</th>
              <th className="py-3 px-4">Applied Date</th>
              <th className="py-3 px-4">Next Deadline</th>
              <th className="py-3 px-4 text-center">Priority</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                {/* Company & Role */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        <span className="truncate">{app.company}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{app.role}</div>
                    </div>
                  </div>
                </td>

                {/* Status Dropdown */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status}
                    onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Type & Model */}
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                  <div className="font-medium text-slate-800 dark:text-slate-200">{app.jobType}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {app.workModel} {app.location ? `· ${app.location}` : ''}
                  </div>
                </td>

                {/* Salary */}
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                  {app.salaryRange || <span className="text-slate-400 dark:text-slate-600">—</span>}
                </td>

                {/* Applied Date */}
                <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                  {app.appliedDate}
                </td>

                {/* Next Deadline */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  {app.deadline ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleDeadline(app.id)}
                        className={`text-xs ${
                          app.deadlineCompleted
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                        title={app.deadlineCompleted ? 'Mark not completed' : 'Mark completed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <div
                          className={`font-mono text-xs ${
                            app.deadlineCompleted
                              ? 'line-through text-slate-400 dark:text-slate-600'
                              : 'font-semibold text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {app.deadline}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{app.deadlineType}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 font-mono">—</span>
                  )}
                </td>

                {/* Priority */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium text-xs ml-0.5">
                      {app.rating}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onSelectApplication(app)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
