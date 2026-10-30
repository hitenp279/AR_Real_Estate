export type FloorPlanLevel = 'level-1' | 'level-2';

export type MeasurementProvenance = 'measured' | 'illustrative';

export type RoomCategory =
  | 'living'
  | 'dining'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'outdoor'
  | 'circulation'
  | 'service';

export interface RoomZone {
  id: string;
  name: string;
  level: FloorPlanLevel;
  category: RoomCategory;
  dimensions: {
    width: number; // in meters (X span)
    depth: number; // in meters (Z span)
    height?: number; // in meters (Y span)
  };
  area: number; // in m²
  provenance: MeasurementProvenance;
  provenanceDetails: string;
  notes: string;
  // 3D Synchronization coordinates in Three.js world space
  centroid3D: [number, number, number]; // [x, y, z]
  bounds3D: {
    min: [number, number, number];
    max: [number, number, number];
  };
  // 2D Vector coordinate representation (relative to floorplan viewBox: 0 0 1000 700)
  svgPolygon: string; // e.g. "x1,y1 x2,y2 x3,y3 x4,y4" or rect
  labelPos: { x: number; y: number };
}

export interface FloorPlanLevelData {
  id: FloorPlanLevel;
  name: string;
  shortName: string;
  elevation: number; // Y elevation in meters
  ceilingHeight: number; // in meters
  enclosedArea: number; // in m²
  outdoorArea: number; // in m²
  rooms: RoomZone[];
}

export interface FloorPlanData {
  propertyId: string;
  overallFootprint: {
    plinthWidth: number; // 14.80m (measured structure)
    plinthDepth: number; // 10.00m (measured structure)
    totalModelWidth: number; // 14.92m (including landscape foliage)
    totalHeight: number; // 7.80m (measured structure)
    provenance: MeasurementProvenance;
    reconciliationNotes: string;
  };
  levels: FloorPlanLevelData[];
}
