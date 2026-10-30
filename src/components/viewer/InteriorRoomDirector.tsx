import React from 'react';
import { InteriorRoomView } from '../../types/interiorNavigation';
import { DimensionUnit, formatArea } from '../../utils/dimensionUnits';
import {
  Sofa,
  UtensilsCrossed,
  Briefcase,
  Bath,
  BedDouble,
  RotateCcw,
  CheckCircle2,
  Navigation,
  Info,
} from 'lucide-react';

interface InteriorRoomDirectorProps {
  rooms: InteriorRoomView[];
  activeRoom: InteriorRoomView | null;
  onSelectRoom: (room: InteriorRoomView | null) => void;
  activeUnit?: DimensionUnit;
  className?: string;
}

export const InteriorRoomDirector: React.FC<InteriorRoomDirectorProps> = ({
  rooms,
  activeRoom,
  onSelectRoom,
  activeUnit = 'metric',
  className = '',
}) => {
  const getRoomIcon = (category: InteriorRoomView['category']) => {
    switch (category) {
      case 'living':
        return <Sofa className="w-4 h-4" />;
      case 'dining':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'workspace':
        return <Briefcase className="w-4 h-4" />;
      case 'wellness':
        return <Bath className="w-4 h-4" />;
      case 'bedroom':
        return <BedDouble className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  const totalRoomsArea = rooms.reduce((sum, r) => sum + (r.areaSqm || 0), 0);

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl ${className}`}
      data-testid="interior-room-director"
    >
      {/* Top Header & Overview Reset Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
            Interior 3D Room Walkthrough
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
            5 Calibrated Zones
          </span>
        </div>

        {activeRoom && (
          <button
            onClick={() => onSelectRoom(null)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
            title="Reset camera to exterior apartment perspective"
            aria-label="Return to exterior overview"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Exterior Overview</span>
          </button>
        )}
      </div>

      {/* Room Selector Chips */}
      <div className="p-3 bg-slate-900/90 flex flex-wrap gap-2">
        {rooms.map(room => {
          const isActive = activeRoom?.id === room.id;
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(isActive ? null : room)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
              aria-pressed={isActive}
            >
              <span className={isActive ? 'text-white' : 'text-cyan-400'}>
                {getRoomIcon(room.category)}
              </span>
              <span>{room.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-black/20 text-white' : 'bg-slate-900/60 text-slate-400'
                }`}
              >
                {formatArea(room.areaSqm, activeUnit)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Room Inspector & Waypoint Pathing Details */}
      {activeRoom ? (
        <div
          className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3"
          data-testid="room-director-inspector"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                {activeRoom.subtitle}
              </span>
              <h4 className="text-base font-semibold text-white">
                {activeRoom.name}
              </h4>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Measured from 3D Model
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeRoom.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-900 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">Area</span>
              <span className="text-white font-bold">
                {formatArea(activeRoom.areaSqm, activeUnit)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Field of View</span>
              <span className="text-cyan-300">{activeRoom.fov}° Perspective</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Eye Height</span>
              <span className="text-slate-300">1.45m Standing</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Circulation Path</span>
              <span className="text-amber-300 text-[11px]">Via Corridor Waypoint</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architectural Alignment & Transition Notice:</span>
            </div>
            <p className="leading-relaxed">
              {activeRoom.provenanceDetails} Camera transit interpolates through the central gallery waypoint to minimize wall clipping. Free orbit and mouse look controls remain fully active.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Click any interior room chip above to teleport the camera into that space and explore the furnishings.
          </span>
          <span className="hidden sm:inline font-mono text-slate-500">
            Total Living Area: {formatArea(totalRoomsArea, activeUnit)}
          </span>
        </div>
      )}
    </div>
  );
};
