import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyCatalogStateProps {
  onReset: () => void;
  searchQuery?: string;
}

export const EmptyCatalogState: React.FC<EmptyCatalogStateProps> = ({ onReset, searchQuery }) => {
  return (
    <div className="py-16 px-6 text-center bg-arch-100 border border-arch-200 rounded-xl space-y-5 max-w-xl mx-auto my-6">
      <div className="w-14 h-14 rounded-full bg-arch-200 text-arch-600 flex items-center justify-center mx-auto shadow-inner">
        <SearchX className="w-7 h-7 text-arch-accent" />
      </div>

      <div className="space-y-2">
        <h3 className="font-serif text-2xl font-bold text-arch-900">
          No architectural listings match your criteria
        </h3>
        <p className="text-sm text-arch-600 leading-relaxed">
          {searchQuery ? (
            <>
              No properties matched <span className="font-mono text-arch-900 font-semibold">"{searchQuery}"</span> under current filter constraints.
            </>
          ) : (
            'The active combination of typology, bedroom count, and price range yielded zero matching estates.'
          )}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-arch-900 text-arch-50 hover:bg-arch-800 rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear All Filters</span>
        </button>
      </div>
    </div>
  );
};
