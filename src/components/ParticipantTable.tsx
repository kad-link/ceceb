import React, { useState } from 'react';
import { Plus, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';
import type { Activity, Participant } from '../core/types';

interface ParticipantTableProps {
  participants: Participant[];
  activities: readonly Activity[];
  onAddParticipant: () => void;
  onUpdateParticipant: (index: number, updates: Partial<Participant>) => void;
  onRemoveParticipant: (index: number) => void;
  onAddToken: (participantIndex: number, token: string) => void;
  onRemoveToken: (participantIndex: number, tokenIndex: number) => void;
  onEvaluate: () => void;
  onReset: () => void;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  activities,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  onAddToken,
  onRemoveToken,
  onEvaluate,
  onReset,
}) => {
  // Local input state for token entry per participant row
  const [tokenInputs, setTokenInputs] = useState<Record<number, string>>({});

  const handleTokenInputChange = (rowIndex: number, value: string) => {
    setTokenInputs((prev) => ({ ...prev, [rowIndex]: value }));
  };

  const handleAddTokenSubmit = (rowIndex: number) => {
    const rawVal = tokenInputs[rowIndex]?.trim();
    if (!rawVal) return;

    // Handle comma-separated additions if user pastes multiple
    const parts = rawVal.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      for (const part of parts) {
        onAddToken(rowIndex, part);
      }
    } else {
      onAddToken(rowIndex, rawVal);
    }

    setTokenInputs((prev) => ({ ...prev, [rowIndex]: '' }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTokenSubmit(rowIndex);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Editable Participant Roster
        </h2>
        <p className="text-xs text-slate-500">
          Edit IDs, names, and activities as interactive tokens.
        </p>
      </div>

      {/* Participants Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <th className="px-4 py-2.5 w-24">ID</th>
              <th className="px-4 py-2.5 w-36">Name</th>
              <th className="px-4 py-2.5">Completed Activity Tokens</th>
              <th className="px-4 py-2.5 text-center w-16">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                {/* Participant ID Input */}
                <td className="px-4 py-2.5 align-top">
                  <input
                    type="text"
                    value={p.id}
                    onChange={(e) => onUpdateParticipant(idx, { id: e.target.value })}
                    placeholder="e.g. C01"
                    className="w-20 px-2 py-1 font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
                  />
                </td>

                {/* Participant Name Input */}
                <td className="px-4 py-2.5 align-top">
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => onUpdateParticipant(idx, { name: e.target.value })}
                    placeholder="Candidate Name"
                    className="w-32 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 font-medium"
                  />
                </td>

                {/* Completed Activities Token Editor */}
                <td className="px-4 py-2.5 align-top">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Activity Tokens */}
                    {p.activityIds.map((actId, tokenIdx) => (
                      <span
                        key={tokenIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs group hover:bg-slate-200 transition-colors"
                      >
                        <span>{actId}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveToken(idx, tokenIdx)}
                          title={`Remove ${actId}`}
                          className="text-slate-400 hover:text-rose-600 rounded p-0.5 cursor-pointer transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Inline Token Adder */}
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={tokenInputs[idx] ?? ''}
                        onChange={(e) => handleTokenInputChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        placeholder="Add token (e.g. A04)..."
                        className="w-36 px-2 py-0.5 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTokenSubmit(idx)}
                        className="px-1.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer font-medium"
                        title="Add activity token"
                      >
                        Add
                      </button>

                      {/* Quick dropdown picker for fixed activities */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            onAddToken(idx, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="px-1.5 py-1 text-[11px] font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                        title="Quick add from catalog"
                      >
                        <option value="" disabled>
                          + Pick
                        </option>
                        {activities.map((act) => (
                          <option key={act.id} value={act.id}>
                            {act.id} ({act.category}, +{act.points})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>

                {/* Remove Row Action */}
                <td className="px-4 py-2.5 text-center align-top">
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(idx)}
                    title={`Remove ${p.name || p.id}`}
                    disabled={participants.length <= 1}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAddParticipant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs cursor-pointer transition-all active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Participant</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 shadow-2xs cursor-pointer transition-all active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={onEvaluate}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluate Participation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
