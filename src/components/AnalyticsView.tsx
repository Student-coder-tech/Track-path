import React from 'react';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  Award,
  BarChart3
} from 'lucide-react';
import type { AnalyticsData, JobApplication } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  applications: JobApplication[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, applications }) => {
  if (!analytics) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading pipeline analytics...</p>
      </div>
    );
  }

  const {
    totalApplications,
    activeApplications,
    interviewCount,
    offerCount,
    rejectedCount,
    applicationToInterviewRatio,
    interviewToOfferRatio,
    overallOfferRate,
    rejectionRate,
    averageResponseDays,
    funnel,
    stageDistribution,
    workModelDistribution,
    typeDistribution,
    weeklyVelocity,
  } = analytics;

  // Max count for weekly velocity scaling
  const maxWeeklyCount = Math.max(...weeklyVelocity.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      
      {/* Analytics Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pipeline Analytics & Conversion Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time conversion ratios, funnel retention, and application velocity tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{totalApplications} Applications Tracked</span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Application-to-Interview Ratio */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>App-to-Interview Ratio</span>
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {applicationToInterviewRatio}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{interviewCount}</span> of{' '}
            <span className="font-mono">{totalApplications}</span> progressed to OA/Interview
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tech benchmark: 10–15%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {applicationToInterviewRatio >= 15 ? 'Above avg' : 'Within range'}
            </span>
          </div>
        </div>

        {/* Metric 2: Interview-to-Offer Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Interview-to-Offer</span>
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {interviewToOfferRatio}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{offerCount}</span>{' '}
            {offerCount === 1 ? 'offer' : 'offers'} received from{' '}
            <span className="font-mono">{interviewCount}</span> interviewees
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Industry avg: 20–25%</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {offerCount > 0 ? 'Offer secured' : 'In pipeline'}
            </span>
          </div>
        </div>

        {/* Metric 3: Overall Offer Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Overall Success Rate</span>
            <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {overallOfferRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Offers per total submitted application volume
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rejections: {rejectionRate}%</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">{rejectedCount} total</span>
          </div>
        </div>

        {/* Metric 4: Average Response Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {averageResponseDays !== null ? `${averageResponseDays}d` : '—'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            From application submission to first OA or interview
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Active candidates</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">{activeApplications} active</span>
          </div>
        </div>

      </div>

      {/* Conversion Funnel Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              End-to-End Recruitment Funnel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retention and drop-off through each hiring stage
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Step-by-step conversion</span>
        </div>

        <div className="space-y-3 pt-2">
          {funnel.map((step, idx) => {
            const isFirst = idx === 0;
            const prevStep = idx > 0 ? funnel[idx - 1] : null;
            const stageConversion = prevStep && prevStep.count > 0
              ? Math.round((step.count / prevStep.count) * 100)
              : null;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{step.stage}</span>
                    {stageConversion !== null && (
                      <span className="text-[11px] font-mono text-slate-400">
                        ({stageConversion}% of previous stage)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{step.count}</span>
                    <span className="text-slate-400">({step.percentage}%)</span>
                  </div>
                </div>

                {/* Funnel Progress Bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-blue-500'
                        : idx === 1
                        ? 'bg-purple-500'
                        : idx === 2
                        ? 'bg-indigo-500'
                        : idx === 3
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(step.percentage, step.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Distribution Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Work Model & Role Type Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Work Model & Opportunity Type
          </h3>

          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Work Authorization / Location</span>
              <span className="text-slate-400 font-mono text-[11px]">Proportion</span>
            </div>
            <div className="space-y-2">
              {(['Remote', 'Hybrid', 'Onsite'] as const).map((wm) => {
                const count = workModelDistribution[wm] || 0;
                const pct = totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
                return (
                  <div key={wm} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{wm}</span>
                    <div className="flex items-center gap-2 w-1/2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300 w-10 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Job Classification</span>
              <span className="text-slate-400 font-mono text-[11px]">Counts</span>
            </div>
            <div className="space-y-2">
              {(['Internship', 'Full-time', 'Co-op', 'Contract'] as const).map((jt) => {
                const count = typeDistribution[jt] || 0;
                const pct = totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
                return (
                  <div key={jt} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{jt}</span>
                    <div className="flex items-center gap-2 w-1/2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-700 dark:bg-slate-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-700 dark:text-slate-300 w-10 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Velocity / Momentum Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Application Velocity
            </h3>
            <span className="text-xs font-mono text-slate-400">Weekly cadence</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consistency is paramount in recruiting cycles. Aim for a steady 3–5 high-quality submissions weekly.
          </p>

          <div className="pt-6 flex items-end justify-between gap-3 h-44 border-b border-slate-200 dark:border-slate-800 px-2">
            {weeklyVelocity.map((w, idx) => {
              const heightPercent = Math.round((w.count / maxWeeklyCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {w.count}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-indigo-500 group-hover:bg-indigo-600 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                    {w.weekLabel.replace('Week ', 'W')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Average weekly pace:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {(totalApplications / 6).toFixed(1)} apps / week
            </span>
          </div>
        </div>

      </div>

      {/* Strategic Actionable Guidance */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Hiring Cycle Insights & Recommendations</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-indigo-900/90 dark:text-indigo-200/90 leading-relaxed">
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100/70 dark:border-indigo-900/50">
            <span className="font-bold text-indigo-950 dark:text-indigo-100 block mb-0.5">Strong Initial Conversion</span>
            Your Application-to-Interview ratio ({applicationToInterviewRatio}%) demonstrates that your resume versions and referral strategies are landing well with screeners.
          </div>
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-indigo-100/70 dark:border-indigo-900/50">
            <span className="font-bold text-indigo-950 dark:text-indigo-100 block mb-0.5">Focus on Interview Depth</span>
            Ensure you record questions asked after every interview in TrackPath to build your personalized question bank for upcoming technical and final rounds.
          </div>
        </div>
      </div>

    </div>
  );
};
