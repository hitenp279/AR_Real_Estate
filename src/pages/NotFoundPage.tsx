import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-arch-200 text-arch-700 flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8 text-arch-accent" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-arch-500">
          Error 404 — Architectural Locus Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-arch-900">
          This spatial coordinate does not exist
        </h1>
        <p className="text-arch-600 text-sm max-w-md mx-auto">
          The property or architectural route you requested cannot be located. Return to our curated portfolio to continue exploring.
        </p>
      </div>
      <div className="pt-4">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 px-6 py-3 bg-arch-900 text-arch-50 hover:bg-arch-800 rounded text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Property Catalog</span>
        </Link>
      </div>
    </div>
  );
};
