import { InteriorRoomView, CorridorWaypoint } from '../types/interiorNavigation';

export const APARTMENT_WAYPOINTS: Record<string, CorridorWaypoint> = {
  westHall: {
    id: 'westHall',
    name: 'West Living Corridor',
    position: [-1.2, 1.45, 1.0],
    connectedWaypoints: ['centerSpine'],
  },
  centerSpine: {
    id: 'centerSpine',
    name: 'Central Entrance Foyer',
    position: [2.5, 1.45, 1.0],
    connectedWaypoints: ['westHall', 'eastHall'],
  },
  eastHall: {
    id: 'eastHall',
    name: 'East Bedroom Gallery',
    position: [7.5, 1.45, 1.0],
    connectedWaypoints: ['centerSpine'],
  },
};

export const LUMINA_PENTHOUSE_ROOMS: InteriorRoomView[] = [
  {
    id: 'living',
    name: 'Grand Living Salon',
    category: 'living',
    subtitle: 'South-West Panoramic Lounge',
    eyePosition: [-2.4, 1.45, 1.8],
    targetPosition: [-4.4, 1.0, 2.8],
    waypointId: 'westHall',
    fov: 65,
    areaSqm: 38.5,
    description:
      'Curated lounge featuring modular sofa, marble coffee tables, and contemporary artwork framing southern light.',
    provenance: 'measured',
    provenanceDetails:
      'Position calibrated to verified 3D furniture nodes CouchSet_Material_1/2 and area rug tapete_sala at X: [-4.4m, +2.9m].',
  },
  {
    id: 'kitchen',
    name: "Chef's Kitchen & Dining",
    category: 'dining',
    subtitle: 'North-West Culinary Gallery',
    eyePosition: [-1.2, 1.45, 0.6],
    targetPosition: [-3.2, 1.05, -1.0],
    waypointId: 'westHall',
    fov: 60,
    areaSqm: 26.2,
    description:
      'Precision matte-black cabinetry, integrated induction cooktop, and artisan prep island with coffee bar.',
    provenance: 'measured',
    provenanceDetails:
      'Position calibrated to verified 3D nodes Dishwasher, Hobs, Sink, and Coffee+Maker at X: [-5.5m to +0.6m, Z: -1.0m].',
  },
  {
    id: 'office',
    name: 'Executive Studio & Office',
    category: 'workspace',
    subtitle: 'Central-East Work Suite',
    eyePosition: [3.8, 1.45, 0.5],
    targetPosition: [5.2, 1.05, -0.7],
    waypointId: 'centerSpine',
    fov: 55,
    areaSqm: 14.8,
    description:
      'Dedicated creative workstation with dual display monitors, ergonomic seating, and acoustic paneling.',
    provenance: 'measured',
    provenanceDetails:
      'Position calibrated to verified 3D furniture node Office+Desk_Screen at X: +5.16m, Z: -0.73m.',
  },
  {
    id: 'bath',
    name: 'Primary Ensuite & Laundry Spa',
    category: 'wellness',
    subtitle: 'Central Spa Bathroom',
    eyePosition: [6.95, 1.45, -0.3],
    targetPosition: [8.0, 1.25, 1.3],
    waypointId: 'eastHall',
    fov: 75,
    areaSqm: 10.3,
    description:
      'Honed marble vanity, fluted frameless glass shower enclosure, and concealed laundry appliance suite.',
    provenance: 'measured',
    provenanceDetails:
      'Position calibrated to verified 3D nodes BathroomFurnitures_Wood/Marble, BathroomWashing_Secadora, and Shower_vidrio at X: +6.9m to +8.6m, Z: -0.6m to +1.8m.',
  },
  {
    id: 'bedroom',
    name: 'Master Bedroom Suite',
    category: 'bedroom',
    subtitle: 'East Horizon Sanctuary',
    eyePosition: [11.0, 1.45, 0.8],
    targetPosition: [12.8, 1.05, 0.5],
    waypointId: 'eastHall',
    fov: 60,
    areaSqm: 31.0,
    description:
      'King-sized platform bed with natural sheer linens, architectural bedside pendants, and morning sunrise exposure.',
    provenance: 'measured',
    provenanceDetails:
      'Position calibrated to verified 3D furniture nodes Bed_Plain_Grey/Natural_Sheer and BedDecors at X: +12.7m to +13.8m.',
  },
];
