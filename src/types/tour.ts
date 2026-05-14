/**
 * Tour related shared types.
 */

export interface TourStatus {
  active: boolean;
  currentPoiIndex: number;
  totalPois: number;
  elapsed: number;
  activePoi: string | null;
}
