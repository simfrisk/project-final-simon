import type { RefObject } from "react"

export const useChangeVolume = (
  videoRef: RefObject<HTMLVideoElement | null>,
  setVolume: React.Dispatch<React.SetStateAction<number>>
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
    }
  }
}
