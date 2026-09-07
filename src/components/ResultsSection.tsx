import React from 'react';
import { Award, CheckCircle2, RotateCcw, UserCheck, UserX, Users } from 'lucide-react';
import { MIN_POINTS_FOR_ELIGIBILITY, REQUIRED_CATEGORIES } from '../core/constants';
import type { ParticipantEvaluation } from '../core/types';
import { CategoryProgressStrip } from './CategoryProgressStrip';

interface ResultsSectionProps {
  evaluations: readonly ParticipantEvaluation[];
  summaryCounts: {
    total: number;
    eligible: number;
    ineligible: number;
  };
  onReset?: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  evaluations,
  summaryCounts,
  onReset,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Dedicated Summary Count Stat Cards - Right above the results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Eligible Summary Card */}
        <div className="bg-emerald-50/80 border-2 border-emerald-300/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Eligible Participants</span>
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {summaryCounts.eligible}
              <span className="text-xs font-medium text-emerald-700 ml-1.5">
                of {summaryCounts.total} ({summaryCounts.total > 0 ? Math.round((summaryCounts.eligible / summaryCounts.total) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/90 mt-0.5 font-medium">
              Met all {REQUIRED_CATEGORIES.length} categories &amp; earned &ge; {MIN_POINTS_FOR_ELIGIBILITY} points
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Ineligible Summary Card */}
        <div className="bg-amber-50/80 border-2 border-amber-300/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-amber-600" />
              <span>Ineligible Participants</span>
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {summaryCounts.ineligible}
              <span className="text-xs font-medium text-amber-700 ml-1.5">
                of {summaryCounts.total} ({summaryCounts.total > 0 ? Math.round((summaryCounts.ineligible / summaryCounts.total) * 100) : 0}%)
              </span>
            </div>
            <p className="text-[11px] text-amber-700/90 mt-0.5 font-medium">
              Missing required categories or score &lt; {MIN_POINTS_FOR_ELIGIBILITY}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* Total Evaluated Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Total Evaluated</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {summaryCounts.total}
              <span className="text-xs font-normal text-slate-500 ml-1.5">records</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              100% evaluated without errors
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Results Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header with Title and Reset Action */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Certificate Eligibility Results
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Ordered: Eligible participants first, then Ineligible (sorted by Participant ID ascending).
            </p>
          </div>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-2xs cursor-pointer transition-all active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Board</span>
            </button>
          )}
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-2.5 w-28">Status</th>
                <th className="px-4 py-2.5 w-20">ID</th>
                <th className="px-4 py-2.5 w-32">Participant</th>
                <th className="px-4 py-2.5">Category Progress</th>
                <th className="px-4 py-2.5 w-24 text-right">Points</th>
                <th className="px-4 py-2.5">Evaluation &amp; Failure Reasons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluations.map((item) => (
                <tr
                  key={item.participantId}
                  className={`transition-colors ${
                    item.isEligible ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Eligibility Status Badge */}
                  <td className="px-4 py-3 align-middle">
                    {item.isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                        Ineligible
                      </span>
                    )}
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 align-middle">
                    {item.participantId}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-slate-800 font-semibold align-middle">
                    {item.participantName}
                  </td>

                  {/* Visual Category Progress Strip */}
                  <td className="px-4 py-3 align-middle">
                    <CategoryProgressStrip coveredCategories={item.coveredCategories} />
                  </td>

                  {/* Points Total */}
                  <td className="px-4 py-3 text-right font-mono align-middle">
                    <span
                      className={`font-bold text-sm ${
                        item.totalPoints >= MIN_POINTS_FOR_ELIGIBILITY ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {item.totalPoints}
                    </span>
                    <span className="text-slate-400 text-xs"> / {MIN_POINTS_FOR_ELIGIBILITY}</span>
                  </td>

                  {/* Contracted Failure Reasons */}
                  <td className="px-4 py-3 align-middle">
                    {item.isEligible ? (
                      <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        All criteria met: all {REQUIRED_CATEGORIES.length} categories &amp; &ge; {MIN_POINTS_FOR_ELIGIBILITY} points
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {item.failureReasons.map((reason, rIdx) => {
                          const isPoints = reason === `POINTS_BELOW_${MIN_POINTS_FOR_ELIGIBILITY}`;
                          return (
                            <span
                              key={rIdx}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                                isPoints
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {reason}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
