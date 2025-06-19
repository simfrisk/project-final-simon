import { create } from "zustand";

interface TimeCode {
  timecode: string
  setTimecode: (time: string) => void;
}

export const useTimecode = create<TimeCode>((set) => ({
  timecode: '00:00',
  setTimecode: (time) => set({ timecode: time }),
}));