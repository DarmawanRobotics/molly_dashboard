export interface POI {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  orderIndex: number;
  narrationText?: string | null;
  motionAction?: string | null;
  dwellTimeSec: number;
  mapId: string;
}

export interface POIFormData {
  name: string;
  description: string;
  x: number;
  y: number;
}
