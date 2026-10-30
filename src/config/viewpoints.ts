/**
 * Calibrated Camera Viewpoints for 3D Apartment Interior Walkthrough.
 *
 * All coordinates are measured directly against the transformed GLB geometry
 * (public/models/modern_apartment_optimized.glb).
 */

export interface RoomViewpoint {
  id: string;
  name: string;
  category: string;
  eye: [number, number, number];
  target: [number, number, number];
  fov: number;
  description: string;
}

export const ROOM_VIEWPOINTS: Record<string, RoomViewpoint> = {
  living: {
    id: 'living',
    name: 'Grand Living Salon',
    category: 'living',
    eye: [-2.4, 1.45, 1.8],
    target: [-4.4, 1.0, 2.8],
    fov: 65,
    description: 'South-West Panoramic Lounge facing sofa, coffee table, and cat art wall.',
  },
  kitchen: {
    id: 'kitchen',
    name: "Chef's Kitchen & Dining",
    category: 'dining',
    eye: [-1.2, 1.45, 0.6],
    target: [-3.2, 1.05, -1.0],
    fov: 60,
    description: 'North-West Culinary Gallery facing wood cabinetry, sink, and induction cooktop.',
  },
  office: {
    id: 'office',
    name: 'Executive Studio & Office',
    category: 'workspace',
    eye: [3.8, 1.45, 0.5],
    target: [5.2, 1.05, -0.7],
    fov: 55,
    description: 'Central-East Work Suite facing executive desk, iMac, and shelving.',
  },
  bathroom: {
    id: 'bathroom',
    name: 'Primary Ensuite & Laundry Spa',
    category: 'wellness',
    eye: [6.95, 1.45, -0.3],
    target: [8.0, 1.25, 1.3],
    fov: 75,
    description:
      'Framed from shower glass threshold looking at floating vanity, vessel sink, and stacked laundry tower.',
  },
  bath: {
    id: 'bath',
    name: 'Primary Ensuite & Laundry Spa',
    category: 'wellness',
    eye: [6.95, 1.45, -0.3],
    target: [8.0, 1.25, 1.3],
    fov: 75,
    description:
      'Framed from shower glass threshold looking at floating vanity, vessel sink, and stacked laundry tower.',
  },
  bedroom: {
    id: 'bedroom',
    name: 'Master Bedroom Suite',
    category: 'bedroom',
    eye: [11.0, 1.45, 0.8],
    target: [12.8, 1.05, 0.5],
    fov: 60,
    description: 'King-sized platform bed with bespoke wood headboard wall and nightstands.',
  },
};
