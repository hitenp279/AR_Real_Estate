export type ViewerMode = 'exterior_orbit' | 'interior_walkthrough' | 'floor_plan' | 'ar_placement';

export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  description?: string;
}

export interface ViewerState {
  mode: ViewerMode;
  activeRoomId?: string;
  isFullscreen: boolean;
  isLoading: boolean;
  loadingProgress: number;
  error?: string;
  unit: 'metric' | 'imperial';
}
