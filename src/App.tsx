import React from 'react';
import { Award, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import { MIN_POINTS_FOR_ELIGIBILITY, REQUIRED_CATEGORIES } from './core/constants';
import { ActivityCatalog } from './components/ActivityCatalog';
import { ParticipantTable } from './components/ParticipantTable';
import { ResultsSection } from './components/ResultsSection';
import { ValidationErrorsPanel } from './components/ValidationErrorsPanel';
import { useEligibilityBoard } from './hooks/useEligibilityBoard';

export const App: React.FC = () => {
  const {
    participants,
    activities,
    evaluationResult,
    hasEvaluated,
    evaluate,
    reset,
    addParticipant,
    updateParticipant,
    removeParticipant,
    addActivityToken,
    removeActivityToken,
  } = useEligibilityBoard();

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  SI26_P12
                </span>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
                  College Event Certificate Eligibility Board
                </h1>
              </div>
              <p className="text-xs text-slate-500 m-0">
                Participation aggregator, category &amp; point verification engine
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-slate-50 border-slate-200 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>
                Status:{' '}
                {!hasEvaluated ? (
                  <strong className="text-slate-700">Awaiting Evaluation</strong>
                ) : evaluationResult?.isValid ? (
                  <strong className="text-emerald-700">Evaluated (Valid)</strong>
                ) : (
                  <strong className="text-rose-700">Evaluation Blocked</strong>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Grid: Fixed Catalog + Editable Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Fixed Activity Catalog & Criteria Card */}
          <div className="lg:col-span-4 space-y-5">
            <ActivityCatalog activities={activities} />

            {/* Criteria Quick Reference Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Eligibility Contract Requirements</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>
                  <strong>Category Requirement:</strong> Must complete activities covering all {REQUIRED_CATEGORIES.length} categories:{' '}
                  {REQUIRED_CATEGORIES.map((cat, i) => (
                    <span key={cat} className="font-semibold text-slate-800">
                      {cat}{i < REQUIRED_CATEGORIES.length - 1 ? ', ' : ''}
                    </span>
                  ))}.
                </li>
                <li>
                  <strong>Point Requirement:</strong> Total activity points must be{' '}
                  <strong>&ge; {MIN_POINTS_FOR_ELIGIBILITY}</strong>.
                </li>
                <li>
                  <strong>No Short-Circuit:</strong> Both category and point requirements are fully checked.
                </li>
                <li>
                  <strong>Ordered Failure Reasons:</strong> LEARN &rarr; BUILD &rarr; SHARE &rarr; POINTS_BELOW_6.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Editable Participant Table */}
          <div className="lg:col-span-8">
            <ParticipantTable
              participants={participants}
              activities={activities}
              onAddParticipant={addParticipant}
              onUpdateParticipant={updateParticipant}
              onRemoveParticipant={removeParticipant}
              onAddToken={addActivityToken}
              onRemoveToken={removeActivityToken}
              onEvaluate={evaluate}
              onReset={reset}
            />
          </div>
        </div>

        {/* Validation Errors Display (When any validation error exists) */}
        {hasEvaluated && evaluationResult && !evaluationResult.isValid && (
          <ValidationErrorsPanel errors={evaluationResult.errors} />
        )}

        {/* Evaluation Results Display (When evaluation is valid) */}
        {hasEvaluated && evaluationResult && evaluationResult.isValid && (
          <ResultsSection
            evaluations={evaluationResult.evaluations}
            summaryCounts={evaluationResult.summaryCounts}
          />
        )}

        {/* Idle Prompt Before Evaluate is Clicked */}
        {!hasEvaluated && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 shadow-2xs">
            <CheckCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-semibold text-slate-700">Awaiting Evaluation</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Edit participant records or tokens above as needed, then click the primary{' '}
              <strong className="text-blue-600">"Evaluate Participation"</strong> button to verify eligibility.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
