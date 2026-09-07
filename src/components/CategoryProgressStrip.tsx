import React from 'react';
import { REQUIRED_CATEGORIES } from '../core/constants';
import type { Category } from '../core/types';

interface CategoryProgressStripProps {
  coveredCategories: readonly Category[];
  compact?: boolean;
}

const CATEGORY_STYLES: Record<string, string> = {
  LEARN: 'bg-blue-600 text-white font-semibold shadow-xs',
  BUILD: 'bg-amber-500 text-white font-semibold shadow-xs',
  SHARE: 'bg-purple-600 text-white font-semibold shadow-xs',
};

export const CategoryProgressStrip: React.FC<CategoryProgressStripProps> = ({
  coveredCategories,
  compact = false,
}) => {
  const coveredSet = new Set(coveredCategories);
  const coveredCount = coveredSet.size;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center rounded-md border border-slate-200 bg-slate-100 p-0.5 shadow-2xs">
        {REQUIRED_CATEGORIES.map((category) => {
          const isCovered = coveredSet.has(category);
          const activeClass = CATEGORY_STYLES[category] || 'bg-slate-700 text-white font-semibold shadow-xs';

          return (
            <div
              key={category}
              title={`${category}: ${isCovered ? 'Covered' : 'Missing'}`}
              className={`flex items-center justify-center transition-all duration-150 rounded ${
                compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
              } ${
                isCovered
                  ? activeClass
                  : 'bg-transparent text-slate-400 opacity-60 font-medium'
              }`}
            >
              <span className="mr-0.5">{isCovered ? '✓' : '–'}</span>
              <span>{category}</span>
            </div>
          );
        })}
      </div>
      <span
        className={`font-mono text-[11px] font-semibold ${
          coveredCount === REQUIRED_CATEGORIES.length ? 'text-emerald-600' : 'text-slate-500'
        }`}
      >
        {coveredCount}/{REQUIRED_CATEGORIES.length}
      </span>
    </div>
  );
};

