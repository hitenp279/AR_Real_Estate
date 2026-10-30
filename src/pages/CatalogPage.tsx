import React, { useState, useMemo } from 'react';
import { SAMPLE_PROPERTIES } from '../data/properties';
import { PropertyCard } from '../components/catalog/PropertyCard';
import { FilterBar, FilterState } from '../components/catalog/FilterBar';
import { EmptyCatalogState } from '../components/catalog/EmptyCatalogState';
import { Compass } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  propertyType: 'all',
  bedrooms: 'any',
  priceRange: 'any',
  sortBy: 'featured',
  unit: 'metric',
};

export const CatalogPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Compute filtered & sorted properties
  const filteredProperties = useMemo(() => {
    let result = [...SAMPLE_PROPERTIES];

    // 1. Text Search Query
    const query = filters.searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const subMatch = p.subtitle.toLowerCase().includes(query);
        const descMatch = p.description.toLowerCase().includes(query);
        const cityMatch = p.location.city.toLowerCase().includes(query);
        const countryMatch = p.location.country.toLowerCase().includes(query);
        const highlightsMatch = p.highlights.some((h) => h.toLowerCase().includes(query));
        return titleMatch || subMatch || descMatch || cityMatch || countryMatch || highlightsMatch;
      });
    }

    // 2. Property Type
    if (filters.propertyType !== 'all') {
      result = result.filter((p) => p.specs.propertyType === filters.propertyType);
    }

    // 3. Bedrooms
    if (filters.bedrooms !== 'any') {
      const minBeds = parseInt(filters.bedrooms, 10);
      result = result.filter((p) => p.specs.bedrooms >= minBeds);
    }

    // 4. Price Range (INR)
    if (filters.priceRange !== 'any') {
      if (filters.priceRange === 'under_1.5cr') {
        result = result.filter((p) => p.price < 15000000);
      } else if (filters.priceRange === '1.5cr_2.5cr') {
        result = result.filter((p) => p.price >= 15000000 && p.price <= 25000000);
      } else if (filters.priceRange === 'above_2.5cr') {
        result = result.filter((p) => p.price > 25000000);
      }
    }

    // 5. Sorting
    if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'area_desc') {
      result.sort((a, b) => b.specs.builtUpAreaSqm - a.specs.builtUpAreaSqm);
    }

    return result;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-arch-accent font-semibold">
          <Compass className="w-4 h-4" />
          <span>Curated Architectural Portfolio</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-arch-900 tracking-tight">
          Explore Architectural Residences
        </h1>
        <p className="text-arch-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Filter and discover residential properties engineered with real 3D models, verified metric dimensions, and mobile augmented reality capabilities.
        </p>
      </div>

      {/* Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
        totalResults={filteredProperties.length}
        totalProperties={SAMPLE_PROPERTIES.length}
      />

      {/* Properties Grid or Empty State */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              unit={filters.unit}
            />
          ))}
        </div>
      ) : (
        <EmptyCatalogState
          onReset={handleResetFilters}
          searchQuery={filters.searchQuery}
        />
      )}
    </div>
  );
};
