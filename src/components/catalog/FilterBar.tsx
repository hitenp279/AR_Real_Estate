import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { PropertyType } from '../../types/property';

export interface FilterState {
  searchQuery: string;
  propertyType: 'all' | PropertyType;
  bedrooms: 'any' | '1' | '2' | '4';
  priceRange: 'any' | 'under_1.5cr' | '1.5cr_2.5cr' | 'above_2.5cr';
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'area_desc';
  unit: 'metric' | 'imperial';
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  totalProperties: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  totalProperties,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.propertyType !== 'all' ||
    filters.bedrooms !== 'any' ||
    filters.priceRange !== 'any' ||
    filters.sortBy !== 'featured';

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-arch-100 border border-arch-200 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Search Bar + Controls Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-arch-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search by residence title, city, feature, or architectural keyword..."
            aria-label="Search properties"
            className="w-full pl-10 pr-4 py-2.5 bg-arch-50 border border-arch-300 rounded-lg text-sm text-arch-900 placeholder:text-arch-400 focus:outline-none focus:ring-2 focus:ring-arch-accent/40 focus:border-arch-accent transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter('searchQuery', '')}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-arch-400 hover:text-arch-700 p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Unit Toggle & Result Count */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono">
          <div className="inline-flex items-center p-1 bg-arch-200 rounded-lg border border-arch-300">
            <button
              onClick={() => updateFilter('unit', 'metric')}
              aria-pressed={filters.unit === 'metric'}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filters.unit === 'metric'
                  ? 'bg-arch-900 text-arch-50 shadow-sm'
                  : 'text-arch-700 hover:text-arch-900'
              }`}
            >
              Metric (m²)
            </button>
            <button
              onClick={() => updateFilter('unit', 'imperial')}
              aria-pressed={filters.unit === 'imperial'}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filters.unit === 'imperial'
                  ? 'bg-arch-900 text-arch-50 shadow-sm'
                  : 'text-arch-700 hover:text-arch-900'
              }`}
            >
              Imperial (sq ft)
            </button>
          </div>

          <div className="text-arch-600">
            Showing <strong className="text-arch-900 font-bold">{totalResults}</strong> of {totalProperties}
          </div>
        </div>
      </div>

      {/* Filter Chips & Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-arch-200">
        {/* Property Type Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-type" className="block text-xs font-mono text-arch-600 uppercase tracking-wider">
            Property Typology
          </label>
          <select
            id="filter-type"
            value={filters.propertyType}
            onChange={(e) => updateFilter('propertyType', e.target.value as FilterState['propertyType'])}
            className="w-full px-3 py-2 bg-arch-50 border border-arch-300 rounded-lg text-sm text-arch-900 focus:outline-none focus:ring-1 focus:ring-arch-accent"
          >
            <option value="all">All Architectural Types</option>
            <option value="detached_house">Detached Villa / Residence</option>
            <option value="penthouse">Penthouse / Loft Suite</option>
            <option value="courtyard_villa">Courtyard Villa</option>
          </select>
        </div>

        {/* Bedroom Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-beds" className="block text-xs font-mono text-arch-600 uppercase tracking-wider">
            Bedrooms
          </label>
          <select
            id="filter-beds"
            value={filters.bedrooms}
            onChange={(e) => updateFilter('bedrooms', e.target.value as FilterState['bedrooms'])}
            className="w-full px-3 py-2 bg-arch-50 border border-arch-300 rounded-lg text-sm text-arch-900 focus:outline-none focus:ring-1 focus:ring-arch-accent"
          >
            <option value="any">Any Bedrooms</option>
            <option value="1">1+ Bedroom</option>
            <option value="2">2+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-price" className="block text-xs font-mono text-arch-600 uppercase tracking-wider">
            Price Range
          </label>
          <select
            id="filter-price"
            value={filters.priceRange}
            onChange={(e) => updateFilter('priceRange', e.target.value as FilterState['priceRange'])}
            className="w-full px-3 py-2 bg-arch-50 border border-arch-300 rounded-lg text-sm text-arch-900 focus:outline-none focus:ring-1 focus:ring-arch-accent"
          >
            <option value="any">All Price Points</option>
            <option value="under_1.5cr">Under ₹1,50,00,000</option>
            <option value="1.5cr_2.5cr">₹1,50,00,000 – ₹2,50,00,000</option>
            <option value="above_2.5cr">Above ₹2,50,00,000</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label htmlFor="filter-sort" className="block text-xs font-mono text-arch-600 uppercase tracking-wider">
            Order By
          </label>
          <select
            id="filter-sort"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
            className="w-full px-3 py-2 bg-arch-50 border border-arch-300 rounded-lg text-sm text-arch-900 focus:outline-none focus:ring-1 focus:ring-arch-accent"
          >
            <option value="featured">Curated Showcase</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_desc">Built-Up Area: Largest</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicators & Reset Action */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-arch-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-arch-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-arch-accent" />
            <span>Active filters modifying catalog view</span>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-arch-800 hover:text-arch-900 font-medium px-3 py-1 rounded bg-arch-200 hover:bg-arch-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
