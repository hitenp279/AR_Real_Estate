export type PropertyType = 'detached_house' | 'penthouse' | 'courtyard_villa';
export type MeasurementUnit = 'metric' | 'imperial';
export type RoomCategory = 'living' | 'kitchen' | 'bedroom' | 'bathroom' | 'office' | 'hallway' | 'balcony';

export interface RoomDimension {
  id: string;
  name: string;
  category: RoomCategory;
  dimensionsMeters: {
    width: number;
    length: number;
    height: number;
  };
  areaSqm: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  description: string;
  isMeasuredFromGeometry: boolean;
}

export interface FloorPlanData {
  svgPath?: string;
  totalAreaSqm: number;
  usableAreaSqm: number;
  floorCount: number;
  ceilingHeightMeters: number;
  rooms: RoomDimension[];
  isArchitecturallyVerified: boolean;
}

export interface VisualizationCapabilities {
  has3DViewer: boolean;
  hasInteriorExploration: boolean;
  hasMobileAR: boolean;
  modelUrl: string;
  optimizedModelUrl?: string;
  modelFormat: 'glb' | 'gltf';
  usdzUrl?: string;
  arPlacement: 'floor' | 'tabletop';
  defaultCamera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
}

export interface ModelAttribution {
  author: string;
  authorUrl?: string;
  modelTitle: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  modifications?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  location: {
    address: string;
    city: string;
    region: string;
    country: string;
  };
  specs: {
    propertyType: PropertyType;
    bedrooms: number;
    bathrooms: number;
    builtUpAreaSqm: number;
    lotSizeSqm?: number;
    yearBuilt: number;
    stories: number;
  };
  highlights: string[];
  images: {
    hero: string;
    gallery: string[];
  };
  capabilities: VisualizationCapabilities;
  floorPlan: FloorPlanData;
  attribution?: ModelAttribution;
  status: 'available' | 'reserved' | 'showcase';
}
