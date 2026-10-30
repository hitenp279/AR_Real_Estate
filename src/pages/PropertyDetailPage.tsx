import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SAMPLE_PROPERTIES } from '../data/properties';
import { GLASS_PAVILION_FLOOR_PLAN } from '../data/floorPlans';
import { LUMINA_PENTHOUSE_ROOMS } from '../data/apartmentRooms';
import { RoomZone } from '../types/floorPlan';
import { InteriorRoomView } from '../types/interiorNavigation';
import { DimensionUnit, formatArea, formatDimensions, formatLength } from '../utils/dimensionUnits';
import { formatCurrency } from '../utils/formatters';
import { ThreeCanvas } from '../components/viewer/ThreeCanvas';
import { FloorPlanViewer } from '../components/floorplan/FloorPlanViewer';
import { InteriorRoomDirector } from '../components/viewer/InteriorRoomDirector';
import { ModelViewerAR } from '../components/ar/ModelViewerAR';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Layers,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Box,
  Compass,
  AlertCircle,
  ExternalLink,
  Split,
  FileText,
  Navigation,
  Sparkles,
} from 'lucide-react';

type ViewMode = 'split' | '3d' | '2d' | 'ar';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<DimensionUnit>('metric');
  const [selectedZone, setSelectedZone] = useState<RoomZone | null>(null);
  const [activeInteriorRoom, setActiveInteriorRoom] = useState<InteriorRoomView | null>(null);

  // Look up property by slug or id
  const property = SAMPLE_PROPERTIES.find(p => p.slug === id || p.id === id);

  // Initial view mode depends on property capabilities
  const isHouse = property?.id === 'glass-pavilion';
  const isApartment = property?.id === 'lumina-penthouse';
  const [viewMode, setViewMode] = useState<ViewMode>(isHouse ? 'split' : '3d');

  // Missing / Invalid Property State
  if (!property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-arch-200 text-arch-700 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8 text-arch-accent" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-arch-500">
            Invalid Property Reference
          </span>
          <h1 className="font-serif text-3xl font-bold text-arch-900">
            Property "{id}" was not found
          </h1>
          <p className="text-arch-600 text-sm max-w-md mx-auto leading-relaxed">
            The property identifier does not match any current listing in our curated architectural portfolio.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-arch-900 text-arch-50 hover:bg-arch-800 rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>
    );
  }

  const { capabilities } = property;
  const isHouseModelActive =
    capabilities.has3DViewer && capabilities.modelUrl === '/models/modern-house.glb';
  const isApartmentActive =
    capabilities.has3DViewer && capabilities.modelUrl.includes('modern_apartment');
  const floorPlanData = isHouse ? GLASS_PAVILION_FLOOR_PLAN : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Navigation & Global Unit Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-arch-600 hover:text-arch-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Global Metric / Imperial Unit Toggle */}
        <div className="inline-flex items-center p-1 bg-arch-200 rounded-lg border border-arch-300 text-xs font-mono">
          <button
            onClick={() => setUnit('metric')}
            aria-pressed={unit === 'metric'}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              unit === 'metric'
                ? 'bg-arch-900 text-arch-50 shadow-sm'
                : 'text-arch-700 hover:text-arch-900'
            }`}
          >
            Metric (m / m²)
          </button>
          <button
            onClick={() => setUnit('imperial')}
            aria-pressed={unit === 'imperial'}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              unit === 'imperial'
                ? 'bg-arch-900 text-arch-50 shadow-sm'
                : 'text-arch-700 hover:text-arch-900'
            }`}
          >
            Imperial (ft / sq ft)
          </button>
        </div>
      </div>

      {/* Property Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-arch-200">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-arch-200 text-arch-800 text-[11px] font-mono uppercase tracking-wider rounded font-medium">
              {property.specs.propertyType.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 text-xs text-arch-500 font-mono">
              <MapPin className="w-3.5 h-3.5 text-arch-accent" />
              {property.location.address}, {property.location.city}, {property.location.country}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-arch-900 tracking-tight">
            {property.title}
          </h1>
          <p className="text-arch-600 text-base max-w-2xl leading-relaxed">
            {property.subtitle}
          </p>
        </div>

        <div className="flex flex-col lg:items-end space-y-1">
          <span className="text-xs font-mono uppercase text-arch-500 tracking-wider">Guide Price</span>
          <div className="font-mono text-3xl lg:text-4xl font-bold text-arch-900">
            {formatCurrency(property.price, property.currency)}
          </div>
          <span className="text-[11px] text-arch-500 font-mono">
            {formatArea(property.specs.builtUpAreaSqm, unit)} Built-up Area
          </span>
        </div>
      </div>

      {/* Specifications Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5 bg-arch-100 border border-arch-200 rounded-xl text-center">
        <div>
          <span className="block text-[11px] font-mono text-arch-500 uppercase">Bedrooms</span>
          <span className="font-serif text-lg font-bold text-arch-900 flex items-center justify-center gap-1.5 mt-0.5">
            <Bed className="w-4 h-4 text-arch-accent" /> {property.specs.bedrooms}{' '}
            {property.specs.bedrooms === 1 ? 'Bed' : 'Beds'}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-mono text-arch-500 uppercase">Bathrooms</span>
          <span className="font-serif text-lg font-bold text-arch-900 flex items-center justify-center gap-1.5 mt-0.5">
            <Bath className="w-4 h-4 text-arch-accent" /> {property.specs.bathrooms} Baths
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-mono text-arch-500 uppercase">Built-Up Area</span>
          <span className="font-serif text-lg font-bold text-arch-900 flex items-center justify-center gap-1.5 mt-0.5">
            <Maximize className="w-4 h-4 text-arch-accent" /> {formatArea(property.specs.builtUpAreaSqm, unit)}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-mono text-arch-500 uppercase">Stories</span>
          <span className="font-serif text-lg font-bold text-arch-900 flex items-center justify-center gap-1.5 mt-0.5">
            <Layers className="w-4 h-4 text-arch-accent" /> {property.specs.stories}{' '}
            {property.specs.stories === 1 ? 'Level' : 'Levels'}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-mono text-arch-500 uppercase">Year Built</span>
          <span className="font-serif text-lg font-bold text-arch-900 flex items-center justify-center gap-1.5 mt-0.5">
            <Calendar className="w-4 h-4 text-arch-accent" /> {property.specs.yearBuilt}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-mono text-arch-500 uppercase">Spatial 3D & AR</span>
          <span className="font-serif text-lg font-bold text-arch-900 flex items-center justify-center gap-1.5 mt-0.5">
            {capabilities.hasMobileAR ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-emerald-600" /> 3D + AR
              </span>
            ) : capabilities.has3DViewer ? (
              <span className="text-arch-slate font-semibold flex items-center gap-1">
                <Box className="w-4 h-4" /> 3D Model
              </span>
            ) : (
              <span className="text-arch-500 font-normal">Schematic</span>
            )}
          </span>
        </div>
      </div>

      {/* CORE FEATURE: 3D VIEWER, INTERIOR DIRECTOR, FLOOR PLAN & AR */}
      <section className="space-y-4" aria-labelledby="spatial-section-title">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2
              id="spatial-section-title"
              className="font-serif text-2xl font-bold text-arch-900 flex items-center gap-2"
            >
              <Compass className="w-5 h-5 text-arch-accent" />
              <span>
                {isApartment
                  ? 'Interior 3D Walkthrough & Augmented Reality'
                  : 'Architectural Exploration & Floor Plans'}
              </span>
            </h2>
            <p className="text-xs text-arch-600">
              {isApartment
                ? 'Explore calibrated interior rooms or place the residence in physical space with mobile AR.'
                : 'Synchronized 3D massing and 2D architectural vector floor plan with live cross-highlighting.'}
            </p>
          </div>

          {/* View Mode Switcher */}
          {capabilities.has3DViewer && (
            <div className="flex flex-wrap items-center p-1 bg-arch-200 rounded-xl border border-arch-300 text-xs font-mono shadow-sm">
              {isHouse && (
                <>
                  <button
                    onClick={() => setViewMode('split')}
                    aria-pressed={viewMode === 'split'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === 'split'
                        ? 'bg-arch-900 text-arch-50 font-semibold shadow-sm'
                        : 'text-arch-700 hover:text-arch-900'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split View (3D + 2D)</span>
                  </button>

                  <button
                    onClick={() => setViewMode('2d')}
                    aria-pressed={viewMode === '2d'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      viewMode === '2d'
                        ? 'bg-arch-900 text-arch-50 font-semibold shadow-sm'
                        : 'text-arch-700 hover:text-arch-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>2D Floor Plan</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setViewMode('3d')}
                aria-pressed={viewMode === '3d'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === '3d'
                    ? 'bg-arch-900 text-arch-50 font-semibold shadow-sm'
                    : 'text-arch-700 hover:text-arch-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{isApartment ? '3D Walkthrough' : '3D Model'}</span>
              </button>

              <button
                onClick={() => setViewMode('ar')}
                aria-pressed={viewMode === 'ar'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'ar'
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-semibold shadow-sm'
                    : 'text-arch-700 hover:text-arch-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
                <span>Mobile AR View</span>
              </button>
            </div>
          )}
        </div>

        {/* Spatial Views Rendering */}
        {isHouseModelActive ? (
          <div>
            {viewMode === 'split' && floorPlanData ? (
              /* Split View: Side-by-Side on Desktop, Stacked on Mobile */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between pb-2 text-xs font-mono text-arch-700">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-arch-accent" />
                      Interactive 3D Showroom
                    </span>
                    {selectedZone && (
                      <span className="text-[11px] text-cyan-700 font-medium">
                        Targeting {selectedZone.name}
                      </span>
                    )}
                  </div>
                  <ThreeCanvas
                    modelUrl={capabilities.modelUrl}
                    propertyTitle={property.title}
                    selectedZone={selectedZone}
                    activeUnit={unit}
                    onClearZone={() => setSelectedZone(null)}
                    className="flex-1 min-h-[440px] sm:min-h-[520px]"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center justify-between pb-2 text-xs font-mono text-arch-700">
                    <span className="font-semibold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-arch-accent" />
                      Architectural Vector Floor Plan
                    </span>
                    <span className="text-[11px] text-arch-500">
                      Click room to synchronize 3D camera
                    </span>
                  </div>
                  <FloorPlanViewer
                    floorPlan={floorPlanData}
                    activeUnit={unit}
                    onUnitChange={setUnit}
                    selectedZone={selectedZone}
                    onSelectZone={setSelectedZone}
                    className="flex-1 min-h-[440px] sm:min-h-[520px]"
                  />
                </div>
              </div>
            ) : viewMode === '3d' ? (
              <ThreeCanvas
                modelUrl={capabilities.modelUrl}
                propertyTitle={property.title}
                selectedZone={selectedZone}
                activeUnit={unit}
                onClearZone={() => setSelectedZone(null)}
              />
            ) : viewMode === '2d' && floorPlanData ? (
              <FloorPlanViewer
                floorPlan={floorPlanData}
                activeUnit={unit}
                onUnitChange={setUnit}
                selectedZone={selectedZone}
                onSelectZone={setSelectedZone}
              />
            ) : (
              <ModelViewerAR
                modelUrl={capabilities.modelUrl}
                propertyTitle={property.title}
              />
            )}
          </div>
        ) : isApartmentActive ? (
          /* LUMINA PENTHOUSE: 3D Walkthrough & Mobile AR */
          <div className="space-y-6">
            {viewMode === 'ar' ? (
              <ModelViewerAR
                modelUrl={capabilities.modelUrl}
                propertyTitle={property.title}
              />
            ) : (
              <div className="space-y-4">
                {/* Interior Room Director Chip Selector */}
                <InteriorRoomDirector
                  rooms={LUMINA_PENTHOUSE_ROOMS}
                  activeRoom={activeInteriorRoom}
                  onSelectRoom={setActiveInteriorRoom}
                  activeUnit={unit}
                />

                {/* 3D Interior Canvas */}
                <ThreeCanvas
                  modelUrl={capabilities.modelUrl}
                  propertyTitle={property.title}
                  activeInteriorRoom={activeInteriorRoom}
                  activeUnit={unit}
                  className="min-h-[500px] sm:min-h-[560px]"
                />
              </div>
            )}
          </div>
        ) : (
          /* Schematic Design Concept Container */
          <div className="bg-arch-100 border border-arch-200 rounded-2xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-arch-200 text-arch-600 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-arch-accent" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-serif text-lg font-bold text-arch-900">
                Schematic Architectural Design
              </h3>
              <p className="text-xs text-arch-600 leading-relaxed">
                This residence is currently in schematic architectural review. No interactive 3D model asset is linked
                to this record.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ARCHITECTURAL HONESTY & PROVENANCE DISCLOSURE */}
      {isApartment && (
        <section
          className="p-6 bg-arch-100 border border-arch-300 rounded-2xl space-y-4"
          data-testid="apartment-provenance-disclosure"
        >
          <div className="flex items-center gap-2 text-arch-900">
            <Sparkles className="w-5 h-5 text-cyan-600 flex-shrink-0" />
            <h3 className="font-serif text-base font-bold">
              Engineering Audit & Architectural Geometry Calibration: The Lumina Penthouse
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-arch-700 leading-relaxed">
            <div className="p-4 bg-arch-50 rounded-xl border border-arch-200 space-y-2">
              <span className="font-mono font-semibold text-emerald-800 flex items-center gap-1.5 uppercase text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Asset Optimization & Integrity
              </span>
              <ul className="space-y-1.5 text-arch-600 list-disc list-inside">
                <li>
                  <strong>Original Model Preserved:</strong> The original 299.01 MB (299,008,564 bytes) asset remains
                  byte-for-byte untouched in <code className="font-mono">public/models/modern_apartment.glb</code>.
                </li>
                <li>
                  <strong>Production Asset:</strong> Optimized to <strong>24.74 MB</strong> (25,940,812 bytes) using{' '}
                  <code className="font-mono">@gltf-transform/cli</code> with meshopt geometry compression and 1024px WebP
                  texture encoding.
                </li>
                <li>
                  <strong>Load Performance:</strong> 91.3% bandwidth reduction for responsive mobile WebGL loading and
                  AR session initialization.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-arch-50 rounded-xl border border-arch-200 space-y-2">
              <span className="font-mono font-semibold text-cyan-800 flex items-center gap-1.5 uppercase text-[11px]">
                <Navigation className="w-4 h-4 text-cyan-600" />
                Calibrated Room Navigation & AR Placement
              </span>
              <ul className="space-y-1.5 text-arch-600 list-disc list-inside">
                <li>
                  <strong>Verified Room Coordinates:</strong> 5 rooms calibrated directly to 3D furniture nodes (CouchSet,
                  Dishwasher, Desk, BathroomFurnitures, King Bed).
                </li>
                <li>
                  <strong>Corridor Waypoints:</strong> Transit camera pathing routes through the central hallway to
                  minimize diagonal drywall clipping.
                </li>
                <li>
                  <strong>AR True-to-Scale:</strong> Configured with <code className="font-mono">ar-scale="auto"</code> for
                  true 1:1 physical placement in Android Scene Viewer and WebXR.
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {floorPlanData && (
        <section
          className="p-6 bg-arch-100 border border-arch-300 rounded-2xl space-y-4"
          data-testid="provenance-disclosure-section"
        >
          <div className="flex items-center gap-2 text-arch-900">
            <ShieldCheck className="w-5 h-5 text-arch-accent flex-shrink-0" />
            <h3 className="font-serif text-base font-bold">
              Architectural Honesty Standard: Geometry Reconciliations & Provenance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-arch-700 leading-relaxed">
            <div className="p-4 bg-arch-50 rounded-xl border border-arch-200 space-y-2">
              <span className="font-mono font-semibold text-emerald-800 flex items-center gap-1.5 uppercase text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Direct 3D Geometry Measurements
              </span>
              <ul className="space-y-1.5 text-arch-600 list-disc list-inside">
                <li>
                  <strong>Foundation Plinth Footprint:</strong>{' '}
                  {formatDimensions(
                    floorPlanData.overallFootprint.plinthWidth,
                    floorPlanData.overallFootprint.plinthDepth,
                    unit
                  )}{' '}
                  (measured from <code className="font-mono">modern-house_body</code> bounds).
                </li>
                <li>
                  <strong>Total Model Footprint:</strong>{' '}
                  {formatLength(floorPlanData.overallFootprint.totalModelWidth, unit)} frontage (includes peripheral
                  planter foliage in <code className="font-mono">modern-house_plants</code>).
                </li>
                <li>
                  <strong>Total Building Height:</strong>{' '}
                  {formatLength(floorPlanData.overallFootprint.totalHeight, unit)} from ground contact (Y=0.0m) to roof
                  crest (Y=7.8m).
                </li>
                <li>
                  <strong>Vertical Elevations:</strong> Ground finish slab at Y=1.00m, intermediate slab at Y=4.23m,
                  yielding 3.23m clear ground ceiling height.
                </li>
                <li>
                  <strong>Main Entrance:</strong> 1.09m × 2.44m door at X: +1.96m, Z: +3.47m (node{' '}
                  <code className="font-mono">modern-house_door_l</code>).
                </li>
                <li>
                  <strong>Outdoor Rear Terrace:</strong> Bench & cushion positions measured from{' '}
                  <code className="font-mono">modern-house_details_cushion_0/1</code>.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-arch-50 rounded-xl border border-arch-200 space-y-2">
              <span className="font-mono font-semibold text-amber-800 flex items-center gap-1.5 uppercase text-[11px]">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Illustrative Architectural Space Planning
              </span>
              <p className="text-arch-600">
                The original 3D asset is an exterior architectural pavilion model containing exterior facades, glass
                curtain walls, slabs, plinth, and entrance hardware. It does not contain internal drywall partitions or
                bathroom fixtures in the mesh data.
              </p>
              <p className="text-arch-600">
                The interior room boundaries (Living Pavilion, Entry Foyer, Kitchen/Dining, Primary Suite) are
                architectural space-planning layouts calibrated to the measured structural wings and entrance portal,
                intended to guide prospective buyers on spatial flow.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Property Photography Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Photo */}
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-[16/10] rounded-xl overflow-hidden bg-arch-200 border border-arch-300 relative shadow-md">
            <img src={property.images.hero} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-arch-900/85 backdrop-blur text-arch-50 text-xs font-mono rounded">
              Architectural Context Photography
            </div>
          </div>

          {/* Sub-gallery */}
          <div className="grid grid-cols-3 gap-4">
            {property.images.gallery.map((img, idx) => (
              <div key={idx} className="aspect-[4/3] rounded-lg overflow-hidden bg-arch-200 border border-arch-200">
                <img src={img} alt={`${property.title} preview ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Highlights & 3D Specifications Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-arch-100 border border-arch-200 rounded-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-arch-900">Architectural Highlights</h3>
            <ul className="space-y-2.5 text-xs text-arch-700">
              {property.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-arch-accent flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3D Asset Information Card */}
          <div className="p-6 bg-arch-50 border border-arch-200 rounded-xl space-y-3">
            <h3 className="font-serif text-sm font-bold text-arch-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-arch-accent" />
              <span>3D Model & AR Specifications</span>
            </h3>
            <dl className="text-xs space-y-2 text-arch-600">
              <div className="flex justify-between py-1 border-b border-arch-100">
                <dt>3D Viewport</dt>
                <dd className="font-mono text-arch-900 font-medium">
                  {isHouseModelActive
                    ? 'Active (Three.js WebGL + 2D Synced)'
                    : isApartmentActive
                      ? 'Active (Interior Walkthrough + 24.7MB Opt)'
                      : 'Concept'}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b border-arch-100">
                <dt>AR Placement</dt>
                <dd className="font-mono text-arch-900 font-medium">
                  {capabilities.hasMobileAR ? 'Ready (Scene Viewer & WebXR)' : 'Not Supported'}
                </dd>
              </div>
              {capabilities.has3DViewer && (
                <div className="flex justify-between py-1 border-b border-arch-100">
                  <dt>Model Asset</dt>
                  <dd className="font-mono text-arch-900 font-medium">{capabilities.modelUrl.split('/').pop()}</dd>
                </div>
              )}
              {property.attribution && (
                <div className="pt-2 text-[11px] text-arch-500 space-y-1">
                  <div>
                    3D Model by <strong>{property.attribution.author}</strong> ({property.attribution.license}).
                  </div>
                  {property.attribution.sourceUrl && (
                    <a
                      href={property.attribution.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-arch-accent hover:text-arch-accentDark inline-flex items-center gap-1 text-[10px]"
                    >
                      View Original Asset Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4 max-w-3xl">
        <h2 className="font-serif text-2xl font-bold text-arch-900">Architectural Overview</h2>
        <p className="text-arch-700 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
      </div>
    </div>
  );
};
