import { create } from 'zustand';

interface VideoStore {
  markerTriggerCount: number;
  currentTime: number;
  incrementMarkerTrigger: () => void;
  setTimeCode: (time: number) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  markerTriggerCount: 0,
  currentTime: 0,

  incrementMarkerTrigger: () =>
    set((state) => ({ markerTriggerCount: state.markerTriggerCount + 1 })),

  setTimeCode: (time) =>
    set(() => ({ currentTime: time })),
}));