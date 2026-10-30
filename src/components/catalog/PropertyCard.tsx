import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../../types/property';
import { formatCurrency, formatArea } from '../../utils/formatters';
import { MapPin, Bed, Bath, Maximize, Smartphone, Layers, Eye, HelpCircle } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  unit?: 'metric' | 'imperial';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, unit = 'metric' }) => {
  const { capabilities } = property;

  return (
    <article
      className="group bg-arch-50 border border-arch-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col focus-within:ring-2 focus-within:ring-arch-accent"
      aria-labelledby={`prop-title-${property.id}`}
    >
      {/* Property Hero Image with Architectural Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-arch-200">
        <img
          src={property.images.hero}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-arch-900/60 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 bg-arch-900/85 backdrop-blur-md text-arch-50 text-[10px] font-mono uppercase tracking-wider rounded font-medium shadow-sm">
            {property.specs.propertyType.replace('_', ' ')}
          </span>

          {/* Spatial Capability Indicator */}
          {capabilities.hasMobileAR ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 text-[10px] font-mono uppercase rounded font-semibold shadow-sm">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>AR Ready</span>
            </span>
          ) : capabilities.hasInteriorExploration ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-arch-slate/90 text-arch-100 border border-arch-400/40 text-[10px] font-mono uppercase rounded font-semibold shadow-sm">
              <Layers className="w-3 h-3 text-arch-200" />
              <span>5-Room 3D</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-arch-800/85 text-arch-300 text-[10px] font-mono uppercase rounded font-medium shadow-sm">
              <HelpCircle className="w-3 h-3 text-arch-400" />
              <span>Design Concept</span>
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Price & Location */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-arch-300 uppercase tracking-wider block">
              Guide Price
            </span>
            <div className="font-mono text-lg font-bold leading-none text-arch-50">
              {formatCurrency(property.price, property.currency)}
            </div>
          </div>
          <div className="text-[11px] font-mono text-arch-200 bg-arch-900/70 backdrop-blur px-2 py-1 rounded">
            {property.specs.stories} {property.specs.stories === 1 ? 'Story' : 'Stories'}
          </div>
        </div>
      </div>

      {/* Property Details Content */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-arch-500 font-mono">
            <MapPin className="w-3.5 h-3.5 text-arch-accent flex-shrink-0" />
            <span className="truncate">{property.location.city}, {property.location.country}</span>
          </div>

          <h2 id={`prop-title-${property.id}`} className="font-serif text-xl font-bold text-arch-900 group-hover:text-arch-accent transition-colors">
            <Link to={`/properties/${property.slug}`} className="focus:outline-none">
              {property.title}
            </Link>
          </h2>

          <p className="text-xs text-arch-600 line-clamp-2 leading-relaxed">
            {property.subtitle} — {property.description}
          </p>
        </div>

        {/* Specifications Strip */}
        <div className="pt-3 border-t border-arch-200 grid grid-cols-3 gap-2 text-xs text-arch-700">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-arch-400" />
            <span>{property.specs.bedrooms} {property.specs.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-arch-400" />
            <span>{property.specs.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Maximize className="w-4 h-4 text-arch-400" />
            <span className="font-mono">{formatArea(property.specs.builtUpAreaSqm, unit)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to={`/properties/${property.slug}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-arch-900 text-arch-50 hover:bg-arch-800 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-sm group-hover:shadow"
          >
            <Eye className="w-3.5 h-3.5 text-arch-accent" />
            <span>
              {capabilities.hasMobileAR ? 'Inspect in 3D & AR' : capabilities.hasInteriorExploration ? 'Walkthrough Interior 3D' : 'View Property Details'}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};
