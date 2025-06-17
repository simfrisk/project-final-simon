import { create } from 'zustand';

interface VideoStore {
  markerTriggerCount: number;
  incrementMarkerTrigger: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  markerTriggerCount: 0,
  incrementMarkerTrigger: () =>
    set((state) => ({ markerTriggerCount: state.markerTriggerCount + 1 })),
}));