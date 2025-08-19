import { create } from "zustand"

interface VideoStore {
  markerTriggerCount: number
  currentTime: number
  incrementMarkerTrigger: () => void
  setTimeCode: (time: number) => void

  videoRef: HTMLVideoElement | null
  setVideoRef: (ref: HTMLVideoElement) => void
  isPlaying: boolean
  togglePlay: () => void
  stopVideo: () => void
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  markerTriggerCount: 0,
  currentTime: 0,

  incrementMarkerTrigger: () =>
    set((state) => ({ markerTriggerCount: state.markerTriggerCount + 1 })),

  setTimeCode: (time) => set(() => ({ currentTime: time })),

  videoRef: null,
  setVideoRef: (ref) => set({ videoRef: ref }),
  isPlaying: false,

  togglePlay: () => {
    const video = get().videoRef
    if (!video) return

    if (video.paused) {
      video.play()
      set({ isPlaying: true })
    } else {
      video.pause()
      set({ isPlaying: false })
    }
  },

  stopVideo: () => {
    const video = get().videoRef
    if (!video) return

    video.pause()
    set({ isPlaying: false })
  },
}))
