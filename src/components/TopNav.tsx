import React, { useState } from 'react';
import { Plus, Download, Upload, RotateCcw, Calendar, TrendingUp, Columns3, BookOpen, ChevronDown, Sun, Moon } from 'lucide-react';
import type { ReminderItem } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TopNavProps {
  currentTab: 'pipeline' | 'deadlines' | 'analytics' | 'prep';
  onSelectTab: (tab: 'pipeline' | 'deadlines' | 'analytics' | 'prep') => void;
  onOpenNewModal: () => void;
  reminders: ReminderItem[];
  onResetSample: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewModal,
  reminders,
  onResetSample,
  onExportCsv,
  onExportJson,
  onImportJson,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  // Count active urgent reminders (overdue or due today or within 3 days)
  const urgentCount = reminders.filter(
    (r) => !r.completed && (r.urgency === 'overdue' || r.urgency === 'today' || (r.daysRemaining >= 0 && r.daysRemaining <= 3))
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onSelectTab('pipeline'); }}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-indigo-700 transition-colors">
              TP
            </div>
            <span>TrackPath</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('pipeline')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              currentTab === 'pipeline'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Columns3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Pipeline</span>
          </button>

          <button
            onClick={() => onSelectTab('deadlines')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 relative ${
              currentTab === 'deadlines'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Deadlines</span>
            {urgentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[11px] font-semibold bg-amber-500 text-white rounded-full">
                {urgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              currentTab === 'analytics'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('prep')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              currentTab === 'prep'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Interview Prep</span>
          </button>
        </nav>

        {/* Zone 3: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Data Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
              title="Data backup & options"
            >
              <span className="hidden sm:inline">Options</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => { onExportCsv(); setMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Export to CSV</span>
                  </button>
                  <button
                    onClick={() => { onExportJson(); setMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Backup Data (JSON)</span>
                  </button>
                  <label className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Restore from JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => { onImportJson(e); setMenuOpen(false); }}
                      className="hidden"
                    />
                  </label>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  <button
                    onClick={() => {
                      if (confirm('Reset to standard sample job & internship dataset?')) {
                        onResetSample();
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewModal}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>

      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-1.5 px-2 bg-slate-50 dark:bg-slate-900/90">
        <button
          onClick={() => onSelectTab('pipeline')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            currentTab === 'pipeline' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => onSelectTab('deadlines')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${
            currentTab === 'deadlines' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span>Deadlines</span>
          {urgentCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            currentTab === 'analytics' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onSelectTab('prep')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            currentTab === 'prep' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Prep & Notes
        </button>
      </div>
    </header>
  );
};

