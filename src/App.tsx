import React, { useState, useEffect, useMemo } from 'react';
import {
  Columns3,
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from './services/api';
import type { JobApplication, AnalyticsData, ReminderItem, ApplicationStatus, JobType, WorkModel } from './types';
import { TopNav } from './components/TopNav';
import { PipelineKanban } from './components/PipelineKanban';
import { PipelineTable } from './components/PipelineTable';
import { DeadlinesView } from './components/DeadlinesView';
import { AnalyticsView } from './components/AnalyticsView';
import { InterviewPrepView } from './components/InterviewPrepView';
import { ApplicationModal } from './components/ApplicationModal';
import { ApplicationDetailsDrawer } from './components/ApplicationDetailsDrawer';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'pipeline' | 'deadlines' | 'analytics' | 'prep'>('pipeline');
  const [pipelineViewMode, setPipelineViewMode] = useState<'kanban' | 'table'>('kanban');

  // Core Data
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [workModelFilter, setWorkModelFilter] = useState('All');
  const [sortBy, setSortBy] = useState('appliedDate');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsData, analyticsData, remindersData] = await Promise.all([
        api.getApplications(),
        api.getAnalytics(),
        api.getReminders(),
      ]);
      setApplications(appsData);
      setAnalytics(analyticsData);
      setReminders(remindersData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Error connecting to application tracker backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Selected application derived from ID to always have freshest state
  const selectedApplication = useMemo(() => {
    if (!selectedApplicationId) return null;
    return applications.find((a) => a.id === selectedApplicationId) || null;
  }, [selectedApplicationId, applications]);

  // Filtered & Sorted applications for pipeline
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q)) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (typeFilter !== 'All') {
      result = result.filter((a) => a.jobType === typeFilter);
    }

    if (workModelFilter !== 'All') {
      result = result.filter((a) => a.workModel === workModelFilter);
    }

    // Sort
    if (sortBy === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'company') {
      result.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      // Default: appliedDate descending
      result.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
    }

    return result;
  }, [applications, searchQuery, statusFilter, typeFilter, workModelFilter, sortBy]);

  // Action Handlers
  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus, comment?: string) => {
    try {
      const updated = await api.updateStatus(id, newStatus, comment);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      // Refresh analytics & reminders
      const [newAnalytics, newReminders] = await Promise.all([
        api.getAnalytics(),
        api.getReminders(),
      ]);
      setAnalytics(newAnalytics);
      setReminders(newReminders);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleToggleDeadline = async (id: string) => {
    try {
      const updated = await api.toggleDeadline(id);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      const newReminders = await api.getReminders();
      setReminders(newReminders);
    } catch (err: any) {
      alert(`Error updating deadline: ${err.message}`);
    }
  };

  const handleSaveApplication = async (data: Partial<JobApplication>) => {
    if (editingApplication) {
      const updated = await api.updateApplication(editingApplication.id, data);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await api.createApplication(data);
      setApplications((prev) => [created, ...prev]);
    }
    // Refresh analytics & reminders
    const [newAnalytics, newReminders] = await Promise.all([
      api.getAnalytics(),
      api.getReminders(),
    ]);
    setAnalytics(newAnalytics);
    setReminders(newReminders);
    setEditingApplication(null);
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await api.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApplicationId === id) setSelectedApplicationId(null);
      const [newAnalytics, newReminders] = await Promise.all([
        api.getAnalytics(),
        api.getReminders(),
      ]);
      setAnalytics(newAnalytics);
      setReminders(newReminders);
    } catch (err: any) {
      alert(`Error deleting application: ${err.message}`);
    }
  };

  const handleAddInterview = async (id: string, interview: any) => {
    try {
      const updated = await api.addInterview(id, interview);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      const [newAnalytics, newReminders] = await Promise.all([
        api.getAnalytics(),
        api.getReminders(),
      ]);
      setAnalytics(newAnalytics);
      setReminders(newReminders);
    } catch (err: any) {
      alert(`Error logging interview: ${err.message}`);
    }
  };

  const handleAddNote = async (id: string, content: string) => {
    try {
      const updated = await api.addNote(id, content);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err: any) {
      alert(`Error saving note: ${err.message}`);
    }
  };

  const handleResetSample = async () => {
    try {
      const sampleApps = await api.resetSampleData();
      setApplications(sampleApps);
      const [newAnalytics, newReminders] = await Promise.all([
        api.getAnalytics(),
        api.getReminders(),
      ]);
      setAnalytics(newAnalytics);
      setReminders(newReminders);
    } catch (err: any) {
      alert(`Error resetting data: ${err.message}`);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/export?format=csv';
  };

  const handleExportJson = () => {
    window.location.href = '/api/export?format=json';
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        alert('Invalid file format: Expected JSON array of applications');
        return;
      }
      await api.importData(parsed);
      await fetchData();
      alert(`Successfully imported ${parsed.length} applications.`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150">
      
      {/* 1. Header Navigation Bar */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewModal={() => {
          setEditingApplication(null);
          setIsModalOpen(true);
        }}
        reminders={reminders}
        onResetSample={handleResetSample}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error notification banner if any */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 rounded-lg text-rose-800 dark:text-rose-200 font-semibold border border-rose-200 dark:border-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: PIPELINE VIEW */}
        {currentTab === 'pipeline' && (
          <div className="space-y-4">
            
            {/* Filter & View Switcher Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Left: Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company, role, location, or tags..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Right: Filters & View Mode */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
                >
                  <option value="All">All Stages</option>
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Online Assessment">Online Assessment</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="Behavioral Interview">Behavioral Interview</option>
                  <option value="Final Round">Final Round</option>
                  <option value="Offer">Offer Extended</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>

                {/* Job Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Co-op">Co-op</option>
                  <option value="Contract">Contract</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
                >
                  <option value="appliedDate">Sort: Newest Applied</option>
                  <option value="deadline">Sort: Deadline</option>
                  <option value="rating">Sort: Priority Rating</option>
                  <option value="company">Sort: Company Name</option>
                </select>

                {/* View Mode Toggle: Kanban vs Table */}
                <div className="flex items-center gap-0.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    onClick={() => setPipelineViewMode('kanban')}
                    className={`p-1.5 rounded transition-colors ${
                      pipelineViewMode === 'kanban'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Kanban Board View"
                  >
                    <Columns3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPipelineViewMode('table')}
                    className={`p-1.5 rounded transition-colors ${
                      pipelineViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Spreadsheet / Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

            {/* Pipeline Content View */}
            {loading && applications.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <span>Loading application pipeline...</span>
              </div>
            ) : pipelineViewMode === 'kanban' ? (
              <PipelineKanban
                applications={filteredApplications}
                onSelectApplication={(app) => setSelectedApplicationId(app.id)}
                onUpdateStatus={handleUpdateStatus}
                onOpenNewModal={() => {
                  setEditingApplication(null);
                  setIsModalOpen(true);
                }}
              />
            ) : (
              <PipelineTable
                applications={filteredApplications}
                onSelectApplication={(app) => setSelectedApplicationId(app.id)}
                onUpdateStatus={handleUpdateStatus}
                onToggleDeadline={handleToggleDeadline}
              />
            )}
          </div>
        )}

        {/* TAB 2: DEADLINES & SCHEDULE */}
        {currentTab === 'deadlines' && (
          <DeadlinesView
            reminders={reminders}
            applications={applications}
            onToggleDeadline={handleToggleDeadline}
            onSelectApplication={(app) => setSelectedApplicationId(app.id)}
          />
        )}

        {/* TAB 3: ANALYTICS & CONVERSION */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            applications={applications}
          />
        )}

        {/* TAB 4: INTERVIEW PREP & QUESTIONS */}
        {currentTab === 'prep' && (
          <InterviewPrepView
            applications={applications}
            onSelectApplication={(app) => setSelectedApplicationId(app.id)}
          />
        )}

      </main>

      {/* Add / Edit Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApplication(null);
        }}
        onSubmit={handleSaveApplication}
        initialData={editingApplication}
      />

      {/* Full Details & Timeline Drawer */}
      <ApplicationDetailsDrawer
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplicationId(null)}
        onUpdateStatus={handleUpdateStatus}
        onEdit={(app) => {
          setSelectedApplicationId(null);
          setEditingApplication(app);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteApplication}
        onAddInterview={handleAddInterview}
        onAddNote={handleAddNote}
        onToggleDeadline={handleToggleDeadline}
      />

    </div>
  );
}
