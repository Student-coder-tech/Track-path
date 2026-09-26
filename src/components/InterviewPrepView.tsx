import React, { useState } from 'react';
import { BookOpen, CheckSquare, Plus, Star, Award, Code, HelpCircle, ChevronRight } from 'lucide-react';
import type { JobApplication } from '../types';

interface InterviewPrepViewProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  applications,
  onSelectApplication,
}) => {
  const [activePrepTab, setActivePrepTab] = useState<'bank' | 'star' | 'checklist'>('bank');

  // Collect all questions asked across all applications
  const allQuestions: Array<{
    question: string;
    company: string;
    roundName: string;
    app: JobApplication;
  }> = [];

  applications.forEach((app) => {
    (app.interviews || []).forEach((int) => {
      (int.questionsAsked || []).forEach((q) => {
        allQuestions.push({
          question: q,
          company: app.company,
          roundName: int.roundName,
          app,
        });
      });
    });
  });

  const [starStories, setStarStories] = useState([
    {
      id: 'star-1',
      title: 'Resolved high-throughput database connection bottleneck',
      situation: 'During heavy seasonal traffic, connection pooling saturated our PostgreSQL instances.',
      task: 'Identified root cause and decreased latency spikes without increasing hardware capacity.',
      action: 'Implemented Redis read-aside caching, configured PgBouncer pooling, and indexed frequent query scans.',
      result: 'Reduced p99 query latency from 850ms to 42ms; saved $2,400 monthly cloud costs.',
      competency: 'Technical Leadership & Performance',
    },
    {
      id: 'star-2',
      title: 'Managed conflicting feature priorities between Product & Engineering',
      situation: 'Product requested a rapid MVP launch while engineering identified architectural security risks.',
      task: 'Facilitated a compromise that unblocked client onboarding while protecting auth boundaries.',
      action: 'Structured a phased milestone delivery: shipped sanitized read-only views first while refactoring auth tokens.',
      result: 'Met strict client deadline with zero production security incidents.',
      competency: 'Communication & Negotiation',
    },
  ]);

  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newCompetency, setNewCompetency] = useState('Problem Solving');
  const [newSituation, setNewSituation] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newResult, setNewResult] = useState('');
  const [showStoryForm, setShowStoryForm] = useState(false);

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;
    setStarStories([
      ...starStories,
      {
        id: `star-${Date.now()}`,
        title: newStoryTitle.trim(),
        competency: newCompetency,
        situation: newSituation.trim(),
        task: newTask.trim(),
        action: newAction.trim(),
        result: newResult.trim(),
      },
    ]);
    setNewStoryTitle('');
    setNewSituation('');
    setNewTask('');
    setNewAction('');
    setNewResult('');
    setShowStoryForm(false);
  };

  const technicalChecklist = [
    { category: 'Data Structures & Algorithms', items: ['Sliding Window & Two Pointers', 'Breadth-First / Depth-First Graph Search', 'Topological Sort & Disjoint Set Union (DSU)', 'Dynamic Programming & Memoization', 'Monotonic Stack / Queue', 'Trie / Prefix Trees'] },
    { category: 'System Architecture & Concurrency', items: ['CAP Theorem & Consistency Models', 'Database Indexing (B-Trees vs LSM Trees)', 'Redis Caching Patterns (Write-through, Read-aside)', 'Rate Limiting Algorithms (Token Bucket, Leaky Bucket)', 'Message Queues (Kafka vs RabbitMQ)', 'Idempotency in API Design'] },
    { category: 'Behavioral & Culture Fit', items: ['STAR Framework for Conflict Resolution', 'Failure & Lessons Learned Story Prepared', 'Why this specific company & mission', 'Questions to ask the interviewer ready', 'Explaining complex technical tradeoffs simply'] },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Interview Intelligence & Prep Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Question bank logged from your actual interviews, behavioral STAR matrix, and technical checkpoints.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActivePrepTab('bank')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activePrepTab === 'bank'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Question Bank ({allQuestions.length})
          </button>
          <button
            onClick={() => setActivePrepTab('star')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activePrepTab === 'star'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            STAR Stories ({starStories.length})
          </button>
          <button
            onClick={() => setActivePrepTab('checklist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activePrepTab === 'checklist'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Checklists
          </button>
        </div>
      </div>

      {/* TAB 1: QUESTION BANK */}
      {activePrepTab === 'bank' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Real Questions Asked in Your Pipeline
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Logged automatically when recording interview rounds
            </span>
          </div>

          {allQuestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <HelpCircle className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No questions recorded yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Open any application, go to the &quot;Interviews&quot; tab, and log rounds with the questions you encountered.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQuestions.map((qItem, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectApplication(qItem.app)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {qItem.company}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {qItem.roundName}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      &quot;{qItem.question}&quot;
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-[11px] text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>View Application</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STAR BEHAVIORAL STORIES */}
      {activePrepTab === 'star' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                STAR Behavioral Response Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structure your accomplishments: Situation, Task, Action, and Result with quantifiable outcomes.
              </p>
            </div>
            <button
              onClick={() => setShowStoryForm(!showStoryForm)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Story</span>
            </button>
          </div>

          {showStoryForm && (
            <form onSubmit={handleSaveStory} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">Create New Behavioral Story</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Story Title / Theme</label>
                  <input
                    type="text"
                    required
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    placeholder="e.g. Debugged production payment timeout"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Core Competency</label>
                  <input
                    type="text"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    placeholder="e.g. Conflict Resolution, System Optimization"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Situation (Context & background)</label>
                <textarea
                  rows={2}
                  value={newSituation}
                  onChange={(e) => setNewSituation(e.target.value)}
                  placeholder="What was the initial problem, challenge, or team setup?"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Task (Your exact responsibility)</label>
                <textarea
                  rows={2}
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needed to be done, and what was your specific role?"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Action (What you specifically executed)</label>
                <textarea
                  rows={2}
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="Which tools, decisions, or architectures did you implement?"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Result (Concrete numbers & metrics)</label>
                <textarea
                  rows={2}
                  value={newResult}
                  onChange={(e) => setNewResult(e.target.value)}
                  placeholder="e.g. Reduced latency 40%, landed $50k deal, zero downtime"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStoryForm(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded shadow-xs"
                >
                  Save Story
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {starStories.map((story) => (
              <div key={story.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{story.title}</h4>
                  <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/70 dark:border-indigo-800/60">
                    {story.competency}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">S · Situation</span>
                    {story.situation}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">T · Task</span>
                    {story.task}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">A · Action</span>
                    {story.action}
                  </div>
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-emerald-950 dark:text-emerald-200">
                    <span className="font-bold text-emerald-900 dark:text-emerald-100 block mb-1">R · Result (Outcome)</span>
                    {story.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHECKLISTS */}
      {activePrepTab === 'checklist' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {technicalChecklist.map((cat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {cat.category}
              </h4>
              <ul className="space-y-2">
                {cat.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
