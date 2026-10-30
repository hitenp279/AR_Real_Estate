export interface InteriorRoomView {
  id: 'living' | 'kitchen' | 'office' | 'bath' | 'bedroom';
  name: string;
  category: 'living' | 'dining' | 'workspace' | 'wellness' | 'bedroom';
  subtitle: string;
  eyePosition: [number, number, number]; // Camera eye position [X, Y, Z]
  targetPosition: [number, number, number]; // Look-at point [X, Y, Z]
  waypointId: string; // Associated corridor waypoint
  fov: number; // Field of view in degrees
  areaSqm: number;
  description: string;
  provenance: 'measured';
  provenanceDetails: string;
}

export interface CorridorWaypoint {
  id: string;
  name: string;
  position: [number, number, number];
  connectedWaypoints: string[];
}
