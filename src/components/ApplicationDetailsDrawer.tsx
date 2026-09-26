import React, { useState } from 'react';
import {
  X,
  Calendar,
  ExternalLink,
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  User,
  Tag,
  AlertCircle
} from 'lucide-react';
import type { JobApplication, ApplicationStatus, InterviewRound } from '../types';

interface ApplicationDetailsDrawerProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus, comment?: string) => Promise<void>;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => Promise<void>;
  onAddInterview: (id: string, interview: any) => Promise<void>;
  onAddNote: (id: string, content: string) => Promise<void>;
  onToggleDeadline: (id: string) => Promise<void>;
}

export const ApplicationDetailsDrawer: React.FC<ApplicationDetailsDrawerProps> = ({
  application,
  isOpen,
  onClose,
  onUpdateStatus,
  onEdit,
  onDelete,
  onAddInterview,
  onAddNote,
  onToggleDeadline,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'interviews' | 'notes' | 'details'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [showStatusCommentInput, setShowStatusCommentInput] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);

  // New Interview Form states
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [roundName, setRoundName] = useState('Technical Screening');
  const [scheduledDate, setScheduledDate] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerRole, setInterviewerRole] = useState('');
  const [prepNotes, setPrepNotes] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [questionsList, setQuestionsList] = useState<string[]>([]);

  if (!isOpen || !application) return null;

  const handleStatusChange = (status: ApplicationStatus) => {
    if (status === application.status) return;
    setPendingStatus(status);
    setShowStatusCommentInput(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    await onUpdateStatus(application.id, pendingStatus, statusComment);
    setStatusComment('');
    setShowStatusCommentInput(false);
    setPendingStatus(null);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    await onAddNote(application.id, newNote);
    setNewNote('');
    setIsSubmittingNote(false);
  };

  const handleAddQuestion = () => {
    if (!questionInput.trim()) return;
    setQuestionsList([...questionsList, questionInput.trim()]);
    setQuestionInput('');
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddInterview(application.id, {
      roundName,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      completed: false,
      interviewerName,
      interviewerRole,
      format: 'Video Call',
      prepNotes,
      questionsAsked: questionsList,
      outcome: 'Pending',
    });
    setShowAddInterview(false);
    setRoundName('Technical Screening');
    setScheduledDate('');
    setInterviewerName('');
    setInterviewerRole('');
    setPrepNotes('');
    setQuestionsList([]);
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200 transition-colors duration-150">
        
        {/* Top Drawer Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-base shrink-0">
              {application.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {application.company}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {application.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(application)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit application"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete application for ${application.company}?`)) {
                  onDelete(application.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Stage Switcher */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stage Status</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= application.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 shrink-0"
              >
                <span>Job Post</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Status Change Comment Box */}
          {showStatusCommentInput && (
            <div className="mt-3 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                Updating status to: <span className="underline">{pendingStatus}</span>
              </div>
              <input
                type="text"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Optional note: e.g. Passed screen, scheduled onsite for next week..."
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowStatusCommentInput(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
                >
                  Save Status
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Deadline Alert Box if exists */}
        {application.deadline && (
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{application.deadlineType}:</span>
              <span className="font-mono text-slate-600 dark:text-slate-400">{application.deadline}</span>
              {application.deadlineNotes && (
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">· {application.deadlineNotes}</span>
              )}
            </div>
            <button
              onClick={() => onToggleDeadline(application.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                application.deadlineCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {application.deadlineCompleted ? 'Completed ✓' : 'Mark Done'}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Status History ({application.timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'interviews'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Interviews ({application.interviews?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Notes ({application.notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Full Details
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          
          {/* TAB 1: Status Audit Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Progression History & Backend Status Updates
              </div>

              {(!application.timeline || application.timeline.length === 0) ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-xs">
                  No timeline events recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {application.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 ring-2 ring-white dark:ring-slate-900" />
                      <div>
                        <div className="flex items-baseline justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {event.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {event.description}
                          </p>
                        )}
                        {(event.fromStatus || event.toStatus) && (
                          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {event.fromStatus ? `${event.fromStatus} → ` : ''}
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{event.toStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Interview Rounds */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Scheduled & Completed Rounds
                </span>
                <button
                  onClick={() => setShowAddInterview(!showAddInterview)}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Round</span>
                </button>
              </div>

              {/* Add Interview Form */}
              {showAddInterview && (
                <form
                  onSubmit={handleSaveInterview}
                  className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add Interview Round</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Round Name</label>
                      <input
                        type="text"
                        required
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        placeholder="e.g. Technical Round 1, System Design"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Interviewer Name</label>
                      <input
                        type="text"
                        value={interviewerName}
                        onChange={(e) => setInterviewerName(e.target.value)}
                        placeholder="e.g. Liam Chen"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Interviewer Role</label>
                      <input
                        type="text"
                        value={interviewerRole}
                        onChange={(e) => setInterviewerRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Prep Notes</label>
                    <input
                      type="text"
                      value={prepNotes}
                      onChange={(e) => setPrepNotes(e.target.value)}
                      placeholder="e.g. Practice graph traversals, review STAR stories"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Questions Asked (if completed)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder="Add a question asked in this round..."
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md font-medium text-slate-800 dark:text-slate-200"
                      >
                        Add
                      </button>
                    </div>
                    {questionsList.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {questionsList.map((q, idx) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            • {q}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowAddInterview(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
                    >
                      Save Interview
                    </button>
                  </div>
                </form>
              )}

              {/* List of interviews */}
              {(!application.interviews || application.interviews.length === 0) ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-xs">
                  No interview rounds logged yet. Click &quot;Log Round&quot; above to schedule or record one.
                </div>
              ) : (
                <div className="space-y-3">
                  {application.interviews.map((int) => (
                    <div
                      key={int.id}
                      className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{int.roundName}</span>
                            {int.completed ? (
                              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                Completed
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                Scheduled
                              </span>
                            )}
                          </div>
                          {int.scheduledDate && (
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                              {new Date(int.scheduledDate).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {int.outcome && (
                          <span className={`text-[11px] font-medium ${
                            int.outcome === 'Passed' ? 'text-emerald-600 dark:text-emerald-400' : int.outcome === 'Rejected' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            Outcome: {int.outcome}
                          </span>
                        )}
                      </div>

                      {int.interviewerName && (
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Interviewer: </span>
                          {int.interviewerName} {int.interviewerRole ? `(${int.interviewerRole})` : ''}
                        </div>
                      )}

                      {int.prepNotes && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Prep / Notes: </span>
                          {int.prepNotes}
                        </div>
                      )}

                      {int.questionsAsked && int.questionsAsked.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Questions Asked:
                          </span>
                          <ul className="space-y-1">
                            {int.questionsAsked.map((q, idx) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded">
                                • {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Notes & Activity */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add quick notes: recruiter feedback, compensation details, tech stack notes..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {(!application.notes || application.notes.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-xs">
                    No notes logged for this application yet.
                  </div>
                ) : (
                  application.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        <span>Logged Note</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Full Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-1">Job Type & Model</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {application.jobType} · {application.workModel}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-1">Location</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {application.location || 'Not specified'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-1">Salary / Stipend</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {application.salaryRange || 'Not disclosed'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-1">Applied Date</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {application.appliedDate}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-1">Resume Version Used</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {application.resumeVersion || 'Default Resume'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 block mb-1">Referral / Source</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {application.referralName || application.source || 'Direct Apply'}
                  </div>
                </div>
              </div>

              {application.tags && application.tags.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {application.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Company Contacts & Recruiters
                </span>
                {(!application.contacts || application.contacts.length === 0) ? (
                  <p className="text-xs text-slate-400 dark:text-slate-600">No recruiters or contacts linked.</p>
                ) : (
                  <div className="space-y-2">
                    {application.contacts.map((c) => (
                      <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-slate-500 dark:text-slate-400">{c.role}</div>
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline block mt-1">
                            {c.email}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
