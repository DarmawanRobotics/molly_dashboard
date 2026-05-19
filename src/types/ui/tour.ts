/**
 * Tour runtime types.
 */

export interface TourStatus {
  active: boolean;
  currentPoiIndex: number;
  totalPois: number;
  /** Seconds since tour started */
  elapsed: number;
  activePoi: string | null;
}
