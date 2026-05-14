import { create } from "zustand";

interface TourStore {
  active: boolean;

  currentPoiIndex: number;
  elapsed: number;

  totalPois: number;
  activePoi: string | null;

  start: (firstPoiId: string | null, total: number) => void;

  stop: () => void;

  restart: (firstPoiId: string | null) => void;

  nextWP: (nextPoiId: string | null) => void;

  setActivePoi: (id: string | null) => void;

  tick: () => void;
}

/**
 * Tour runtime state store.
 */
export const useTourStore = create<TourStore>((set) => ({
  active: false,

  currentPoiIndex: 0,
  elapsed: 0,

  totalPois: 0,
  activePoi: null,

  /**
   * Start tour execution.
   */
  start: (firstPoiId, total) =>
    set({
      active: true,
      currentPoiIndex: 0,
      elapsed: 0,
      totalPois: total,
      activePoi: firstPoiId,
    }),

  /**
   * Stop current tour.
   */
  stop: () =>
    set({
      active: false,
      activePoi: null,
      elapsed: 0,
    }),

  /**
   * Restart tour from beginning.
   */
  restart: (firstPoiId) =>
    set({
      currentPoiIndex: 0,
      elapsed: 0,
      activePoi: firstPoiId,
    }),

  /**
   * Move to next waypoint.
   */
  nextWP: (nextPoiId) =>
    set((prev) => ({
      currentPoiIndex: prev.currentPoiIndex + 1,

      activePoi: nextPoiId,
    })),

  /**
   * Update current active POI.
   */
  setActivePoi: (id) =>
    set({
      activePoi: id,
    }),

  /**
   * Increment elapsed timer.
   */
  tick: () => set((prev) => (prev.active ? { elapsed: prev.elapsed + 1 } : {})),
}));
