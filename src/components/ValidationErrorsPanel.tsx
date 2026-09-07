import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import type { ValidationError } from '../core/types';

interface ValidationErrorsPanelProps {
  errors: readonly ValidationError[];
  onReset?: () => void;
}

export const ValidationErrorsPanel: React.FC<ValidationErrorsPanelProps> = ({ errors, onReset }) => {
  if (errors.length === 0) return null;

  return (
    
    <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-4 text-slate-900 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                Evaluation Blocked: {errors.length} Validation {errors.length === 1 ? 'Error' : 'Errors'} Found
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Per contract requirements, any input error clears result rows and counts from previous evaluations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200/80 text-rose-800">
                0 Results Evaluated
              </span>
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-800 bg-white border border-rose-300 rounded hover:bg-rose-100 cursor-pointer shadow-2xs transition-all active:scale-98"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Defaults</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {errors.map((err, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white rounded-lg border border-rose-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    {err.errorType}
                  </span>
                  <span className="text-slate-600 font-medium">
                    Participant: <strong className="text-slate-900">{err.participantId}</strong>
                  </span>
                  {err.activityId && (
                    <span className="text-slate-600 font-medium">
                      | Activity: <strong className="text-slate-900">{err.activityId}</strong>
                    </span>
                  )}
                </div>
                <div className="text-slate-700 font-sans text-xs">
                  {err.description}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-rose-200/60 text-[11px] text-rose-600 font-mono whitespace-pre-wrap">
            {errors.map((err) => err.formattedMessage).join('\n')}
          </div>
        </div>
      </div>
    </div>
  );
};
