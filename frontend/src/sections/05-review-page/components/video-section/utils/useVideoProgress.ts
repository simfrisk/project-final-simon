import { useEffect, useState } from "react"
import type { RefObject } from "react"

export const useVideoProgress = (
  videoRef: RefObject<HTMLVideoElement | null>
) => {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100)
    }

    const updatePlayState = () => {
      setIsPlaying(!video.paused)
    }

    video.addEventListener("timeupdate", updateProgress)
    video.addEventListener("play", updatePlayState)
    video.addEventListener("pause", updatePlayState)

    return () => {
      video.removeEventListener("timeupdate", updateProgress)
      video.removeEventListener("play", updatePlayState)
      video.removeEventListener("pause", updatePlayState)
    }
  }, [videoRef])

  return { progress, isPlaying }
}
