import React from 'react';
import { MIN_POINTS_FOR_ELIGIBILITY, REQUIRED_CATEGORIES } from '../core/constants';
import type { Activity, Category } from '../core/types';

interface ActivityCatalogProps {
  activities: readonly Activity[];
}

export const getCategoryBadgeStyle = (category: Category) => {
  switch (category) {
    case 'LEARN':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10';
    case 'BUILD':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10';
    case 'SHARE':
      return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10';
  }
};

export const ActivityCatalog: React.FC<ActivityCatalogProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Fixed Activity Catalog</h2>
          <p className="text-xs text-slate-500">Official reference table (read-only)</p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {activities.length} Activities
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <th className="px-4 py-2.5">ID</th>
              <th className="px-4 py-2.5">Activity Name</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{act.id}</td>
                <td className="px-4 py-2.5 text-slate-700 font-medium">{act.name}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${getCategoryBadgeStyle(
                      act.category
                    )}`}
                  >
                    {act.category}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                  +{act.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Criteria: Covers {REQUIRED_CATEGORIES.map((cat, i) => (
          <strong key={cat}>{cat}{i < REQUIRED_CATEGORIES.length - 1 ? ', ' : ''}</strong>
        ))}</span>
        <span>Points: <strong>&ge; {MIN_POINTS_FOR_ELIGIBILITY}</strong></span>
      </div>
    </div>
  );
};
