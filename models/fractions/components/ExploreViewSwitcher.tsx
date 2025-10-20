import React from 'react';
import type { ExploreView } from '../../../types';

interface ExploreViewSwitcherProps {
  activeView: ExploreView;
  onSelectView: (view: ExploreView) => void;
}

const VIEWS: { id: ExploreView; label: string }[] = [
  { id: 'operations', label: 'Operations' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'number_line', label: 'Number Line' },
];

export const ExploreViewSwitcher: React.FC<ExploreViewSwitcherProps> = ({ activeView, onSelectView }) => {
  return (
    <div className="w-full max-w-md mx-auto p-2 rounded-xl flex items-center justify-center gap-2 mb-4 chalk-bg-light">
      {VIEWS.map((view) => (
        <button
          key={view.id}
          onClick={() => onSelectView(view.id)}
          className={`flex-1 font-chalk text-xl py-2 px-4 rounded-lg transition-all duration-200 ${
            activeView === view.id
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-chalk-light hover:bg-slate-600/50'
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};