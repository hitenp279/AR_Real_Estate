import React, { useState } from 'react';
import {
  FloorPlanData,
  FloorPlanLevel,
  RoomZone,
} from '../../types/floorPlan';
import {
  DimensionUnit,
  formatArea,
  formatDimensions,
  formatElevation,
  formatLength,
} from '../../utils/dimensionUnits';
import {
  Layers,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface FloorPlanViewerProps {
  floorPlan: FloorPlanData;
  activeUnit?: DimensionUnit;
  onUnitChange?: (unit: DimensionUnit) => void;
  selectedZone?: RoomZone | null;
  onSelectZone?: (zone: RoomZone | null) => void;
  className?: string;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  floorPlan,
  activeUnit = 'metric',
  onUnitChange,
  selectedZone = null,
  onSelectZone,
  className = '',
}) => {
  const [activeLevelId, setActiveLevelId] = useState<FloorPlanLevel>('level-1');
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const activeLevel =
    floorPlan.levels.find(l => l.id === activeLevelId) || floorPlan.levels[0];

  const handleRoomClick = (room: RoomZone) => {
    if (selectedZone?.id === room.id) {
      onSelectZone?.(null);
    } else {
      onSelectZone?.(room);
    }
  };

  const getCategoryColor = (category: RoomZone['category'], isHovered: boolean, isSelected: boolean) => {
    if (isSelected) {
      return {
        fill: 'rgba(6, 182, 212, 0.28)', // cyan-500
        stroke: '#22d3ee', // cyan-400
        strokeWidth: 2.5,
      };
    }
    if (isHovered) {
      return {
        fill: 'rgba(56, 189, 248, 0.20)', // sky-400
        stroke: '#38bdf8',
        strokeWidth: 2,
      };
    }
    switch (category) {
      case 'living':
        return { fill: 'rgba(30, 41, 59, 0.70)', stroke: '#64748b', strokeWidth: 1.5 };
      case 'dining':
      case 'kitchen':
        return { fill: 'rgba(30, 41, 59, 0.65)', stroke: '#64748b', strokeWidth: 1.5 };
      case 'bedroom':
        return { fill: 'rgba(30, 41, 59, 0.60)', stroke: '#64748b', strokeWidth: 1.5 };
      case 'outdoor':
        return { fill: 'rgba(16, 185, 129, 0.12)', stroke: '#10b981', strokeWidth: 1.5 };
      case 'circulation':
        return { fill: 'rgba(51, 65, 85, 0.50)', stroke: '#475569', strokeWidth: 1.5 };
      case 'bathroom':
      case 'service':
        return { fill: 'rgba(30, 41, 59, 0.55)', stroke: '#475569', strokeWidth: 1.5 };
      default:
        return { fill: 'rgba(30, 41, 59, 0.60)', stroke: '#64748b', strokeWidth: 1.5 };
    }
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}
      data-testid="floor-plan-viewer"
    >
      {/* Top Architectural Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-sm">
        {/* Level Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {floorPlan.levels.map(level => {
            const isActive = level.id === activeLevelId;
            return (
              <button
                key={level.id}
                onClick={() => {
                  setActiveLevelId(level.id);
                  if (selectedZone && selectedZone.level !== level.id) {
                    onSelectZone?.(null);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                aria-pressed={isActive}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{level.shortName}</span>
                <span className="opacity-75 text-[10px] hidden sm:inline">
                  ({formatElevation(level.elevation, activeUnit)})
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Metric / Imperial Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onUnitChange?.('metric')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeUnit === 'metric'
                  ? 'bg-slate-700 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Switch to Metric units"
            >
              Metric (m)
            </button>
            <button
              onClick={() => onUnitChange?.('imperial')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeUnit === 'imperial'
                  ? 'bg-slate-700 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Switch to Imperial units"
            >
              Imperial (ft)
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Canvas & Interactive Graphic */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/11] min-h-[380px] sm:min-h-[460px] bg-slate-950 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none">
        {/* Subtle Architectural Drafting Grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floor Plan Vector SVG */}
        <svg
          viewBox="0 0 1000 660"
          className="w-full h-full max-h-full drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Architectural Hatch Pattern for Terraces */}
            <pattern
              id="timberDeckHatch"
              width="20"
              height="20"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="20"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.3"
              />
            </pattern>
            {/* Stair Tread Pattern */}
            <pattern
              id="stairTreads"
              width="100"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="14"
                x2="100"
                y2="14"
                stroke="#64748b"
                strokeWidth="1"
                opacity="0.4"
              />
            </pattern>
          </defs>

          {/* Exterior Foundation Plinth Footprint (14.80m × 10.00m) */}
          <rect
            x="50"
            y="90"
            width="880"
            height="520"
            rx="6"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <text
            x="490"
            y="630"
            textAnchor="middle"
            className="text-[11px] fill-slate-500 font-mono tracking-widest uppercase"
          >
            Structural Plinth Footprint ·{' '}
            {formatDimensions(
              floorPlan.overallFootprint.plinthWidth,
              floorPlan.overallFootprint.plinthDepth,
              activeUnit
            )}{' '}
            [Measured 3D Base]
          </text>

          {/* Level Specific Room Zones */}
          {activeLevel.rooms.map(room => {
            const isHovered = hoveredZoneId === room.id;
            const isSelected = selectedZone?.id === room.id;
            const styling = getCategoryColor(room.category, isHovered, isSelected);

            return (
              <g
                key={room.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleRoomClick(room)}
                onMouseEnter={() => setHoveredZoneId(room.id)}
                onMouseLeave={() => setHoveredZoneId(null)}
                tabIndex={0}
                role="button"
                aria-label={`${room.name}, ${formatDimensions(room.dimensions.width, room.dimensions.depth, activeUnit)}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoomClick(room);
                  }
                }}
              >
                {/* Room Geometry Polygon */}
                <polygon
                  points={room.svgPolygon}
                  fill={
                    room.category === 'outdoor'
                      ? 'url(#timberDeckHatch)'
                      : styling.fill
                  }
                  stroke={styling.stroke}
                  strokeWidth={styling.strokeWidth}
                  className="transition-colors duration-150"
                />

                {/* Additional hatching overlay for stairs */}
                {room.id === 'gp-stair' && (
                  <polygon
                    points={room.svgPolygon}
                    fill="url(#stairTreads)"
                    pointerEvents="none"
                  />
                )}

                {/* Room Center Label & Dimensions */}
                <text
                  x={room.labelPos.x}
                  y={room.labelPos.y - 8}
                  textAnchor="middle"
                  className={`text-[13px] font-medium pointer-events-none transition-colors ${
                    isSelected
                      ? 'fill-cyan-300 font-bold'
                      : isHovered
                        ? 'fill-sky-300'
                        : 'fill-slate-200'
                  }`}
                >
                  {room.name}
                </text>
                <text
                  x={room.labelPos.x}
                  y={room.labelPos.y + 12}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-slate-400 pointer-events-none"
                >
                  {formatDimensions(
                    room.dimensions.width,
                    room.dimensions.depth,
                    activeUnit
                  )}
                </text>
                <text
                  x={room.labelPos.x}
                  y={room.labelPos.y + 28}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-500 pointer-events-none"
                >
                  {formatArea(room.area, activeUnit)}
                </text>

                {/* Provenance Badge Icon on Room */}
                <circle
                  cx={room.labelPos.x}
                  cy={room.labelPos.y - 28}
                  r="4"
                  fill={room.provenance === 'measured' ? '#10b981' : '#f59e0b'}
                  className="pointer-events-none opacity-80"
                />
              </g>
            );
          })}

          {/* Architectural Entrance Portal Annotation (Level 01) */}
          {activeLevelId === 'level-1' && (
            <g className="pointer-events-none">
              {/* Door Swing Arc */}
              <path
                d="M 520,580 A 60,60 0 0,0 580,640"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line
                x1="520"
                y1="580"
                x2="520"
                y2="640"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text
                x="550"
                y="605"
                className="text-[10px] fill-amber-400 font-mono"
              >
                Entrance (1.09m Door · Measured)
              </text>
            </g>
          )}

          {/* North Arrow & Scale Bar */}
          <g transform="translate(910, 45)" className="pointer-events-none select-none">
            <circle cx="20" cy="20" r="18" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <polygon points="20,8 25,24 20,20 15,24" fill="#38bdf8" />
            <text x="20" y="34" textAnchor="middle" className="text-[9px] fill-slate-300 font-bold font-mono">
              N
            </text>
          </g>

          {/* Graphical Dimension Scale Bar */}
          <g transform="translate(80, 40)" className="pointer-events-none select-none">
            <line x1="0" y1="10" x2="200" y2="10" stroke="#64748b" strokeWidth="2" />
            <line x1="0" y1="5" x2="0" y2="15" stroke="#64748b" strokeWidth="2" />
            <line x1="100" y1="7" x2="100" y2="13" stroke="#64748b" strokeWidth="1.5" />
            <line x1="200" y1="5" x2="200" y2="15" stroke="#64748b" strokeWidth="2" />
            <text x="0" y="24" className="text-[9px] fill-slate-400 font-mono">0</text>
            <text x="100" y="24" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">
              {formatLength(2.5, activeUnit)}
            </text>
            <text x="200" y="24" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono">
              {formatLength(5.0, activeUnit)}
            </text>
          </g>
        </svg>

        {/* Floating Quick Legend / Guide */}
        <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Measured from 3D Model</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Illustrative Architectural Layout</span>
          </div>
        </div>
      </div>

      {/* Selected Zone Deep-Dive Inspector Panel */}
      {selectedZone ? (
        <div
          className="bg-slate-950 border-t border-cyan-900/40 p-4 transition-all"
          data-testid="room-inspector-panel"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-base font-semibold text-white tracking-tight">
                {selectedZone.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  selectedZone.provenance === 'measured'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {selectedZone.provenance === 'measured' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Measured from 3D Model
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Illustrative Space Planning
                  </>
                )}
              </span>
            </div>

            <button
              onClick={() => onSelectZone?.(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900 rounded border border-slate-800 transition-colors"
            >
              Clear Selection
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-slate-900 my-2 text-xs">
            <div>
              <span className="text-slate-500 block">Span (W × D)</span>
              <span className="font-mono text-white font-medium">
                {formatDimensions(
                  selectedZone.dimensions.width,
                  selectedZone.dimensions.depth,
                  activeUnit
                )}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Area</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {formatArea(selectedZone.area, activeUnit)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Clear Ceiling</span>
              <span className="font-mono text-white font-medium">
                {selectedZone.dimensions.height
                  ? formatLength(selectedZone.dimensions.height, activeUnit)
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">3D World Centroid</span>
              <span className="font-mono text-slate-400 text-[11px]">
                X: {selectedZone.centroid3D[0].toFixed(1)}m · Z: {selectedZone.centroid3D[2].toFixed(1)}m
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-2 text-xs text-slate-300">
            <div className="flex-1">
              <span className="text-slate-400 block text-[11px] mb-0.5">Architectural Specification:</span>
              <p className="leading-relaxed">{selectedZone.notes}</p>
            </div>
            <div className="flex-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-slate-400 block text-[11px] mb-0.5 font-medium flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400" />
                Measurement Provenance:
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedZone.provenanceDetails}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Hint */
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-500" />
            Click any room on the floor plan to inspect precise dimensions and synchronize with the 3D model.
          </span>
          <span className="hidden sm:inline font-mono text-slate-500">
            {activeLevel.name} · {formatArea(activeLevel.enclosedArea, activeUnit)} conditioned
          </span>
        </div>
      )}
    </div>
  );
};
