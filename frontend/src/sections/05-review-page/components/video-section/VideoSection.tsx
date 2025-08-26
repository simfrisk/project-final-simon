//#region ---- Imports -----
import { useRef, useState, useEffect } from "react"
import styled from "styled-components"
import { PlayPauseButton } from "./components/PlayPauseBtn"
import { formatTime } from "./utils/formatTime"
import { unFormatTime } from "./utils/unFormatTime"
import { commentStore } from "../../../../store/commentStore"
import type { MessageType } from "../../../../store/commentStore"
import { useTimecode } from "../../../../store/timeCodeStore"
import { useProjectStore } from "../../../../store/projectStore"
import { useVideoStore } from "../../../../store/videoStore"
import { useTabStore } from "../../../../store/tabStore"
//#endregion

//#region ---- Component -----
export const VideoSection = () => {
  //#region ---- REFS -----
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  //#endregion

  //#region ---- STATE -----
  const [volume, setVolume] = useState(1)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  //#endregion

  //#region ---- STORES -----
  const activeTab = useTabStore((state) => state.activeTab)

  const {
    isPlaying,
    togglePlay,
    videoRef: videoEl,
    setVideoRef,
    setTimeCode,
    currentTime,
    markerTriggerCount,
  } = useVideoStore()

  const messages: MessageType[] = commentStore((state) =>
    activeTab === "private" ? state.privateComments : state.projectComments
  )

  const setTimecode = useTimecode((state) => state.setTimecode)
  const formattedTime = useTimecode((state) => state.timecode)

  const projectVideo = useProjectStore((state) => state.project?.video)
  const duration = formatTime(videoEl?.duration || 0)
  //#endregion

  //#region ---- EFFECTS -----
  // Sync local videoRef with Zustand store
  useEffect(() => {
    if (videoRef.current) {
      setVideoRef(videoRef.current)
    }
  }, [setVideoRef])

  // Set video URL on project load
  useEffect(() => {
    if (!projectVideo) {
      setVideoUrl(null)
      return
    }

    if (typeof projectVideo === "string") {
      setVideoUrl(projectVideo)
    } else if (projectVideo instanceof File) {
      const url = URL.createObjectURL(projectVideo)
      setVideoUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [projectVideo])

  // Loaded metadata
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlayThrough = () => setVideoLoaded(true)
    video.addEventListener("canplaythrough", handleCanPlayThrough)
    return () => video.removeEventListener("canplaythrough", handleCanPlayThrough)
  }, [])

  // Update current time and formatted time on play
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setTimeCode(video.currentTime)
      setTimecode(formatTime(video.currentTime))
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    return () => video.removeEventListener("timeupdate", handleTimeUpdate)
  }, [setTimeCode, setTimecode])

  // Handle fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // ✅ Seek video when markerTriggerCount changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = currentTime
    video.pause() // Optional: remove this line to auto-play after seek
  }, [markerTriggerCount])
  //#endregion

  //#region ---- HANDLERS -----
  // Volume
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (videoRef.current?.requestFullscreen) {
        videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Seek via timeline
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = timelineRef.current
    const video = videoRef.current
    if (!timeline || !video || !video.duration) return

    const rect = timeline.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = clickX / rect.width
    const newTime = percent * video.duration
    video.currentTime = newTime
  }

  const progress =
    videoRef.current && videoRef.current.duration
      ? (videoRef.current.currentTime / videoRef.current.duration) * 100
      : 0
  //#endregion

  //#region ---- RENDER -----
  return (
    <Container>
      <StyledVideo
        ref={videoRef}
        onClick={togglePlay}
        controls={false}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {videoUrl && (
          <source
            src={videoUrl}
            type="video/mp4"
          />
        )}
        Your browser does not support the video tag.
      </StyledVideo>

      <Controls style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PlayPauseButton
            isPlaying={isPlaying}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          />
          <TimeDisplay aria-live="polite">
            {formattedTime} / {duration}
          </TimeDisplay>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <VolumeControl>
            <label htmlFor="volumeSlider">🔊</label>
            <input
              id="volumeSlider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={changeVolume}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={volume}
              aria-label="Volume control"
            />
          </VolumeControl>
          <FullscreenButton
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "⛶" : "⛶"}
          </FullscreenButton>
        </div>
      </Controls>

      <PlayBar
        ref={timelineRef}
        onClick={handleTimelineClick}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={videoEl?.duration || 0}
        aria-valuenow={videoEl?.currentTime || 0}
        aria-label="Video progress bar"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!videoEl) return
          const step = videoEl.duration ? videoEl.duration / 50 : 1
          if (e.key === "ArrowRight")
            videoEl.currentTime = Math.min(videoEl.currentTime + step, videoEl.duration)
          if (e.key === "ArrowLeft") videoEl.currentTime = Math.max(videoEl.currentTime - step, 0)
        }}
      >
        <Progress style={{ width: `${progress}%` }} />
        {videoLoaded &&
          messages.map(({ _id, timeStamp, content }) => {
            const timeInSeconds = unFormatTime(timeStamp)
            const percent = videoEl?.duration ? (timeInSeconds / videoEl.duration) * 100 : 0

            return (
              <MarkerWrapper
                key={_id}
                style={{ left: `${percent}%` }}
              >
                <Marker
                  role="button"
                  tabIndex={0}
                  aria-label={`Comment at ${timeStamp}: ${content}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    commentStore.getState().setSelectedCommentId(_id)
                    commentStore.getState().setSelectedTimeStamp(timeStamp)
                    useVideoStore.getState().setTimeCode(timeInSeconds)
                    useVideoStore.getState().incrementMarkerTrigger()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      commentStore.getState().setSelectedCommentId(_id)
                      commentStore.getState().setSelectedTimeStamp(timeStamp)
                      useVideoStore.getState().setTimeCode(timeInSeconds)
                      useVideoStore.getState().incrementMarkerTrigger()
                    }
                  }}
                />
                <MarkerMessage>{content}</MarkerMessage>
              </MarkerWrapper>
            )
          })}
      </PlayBar>
    </Container>
  )
  //#endregion
}
//#endregion

//#region ---- STYLED COMPONENTS -----

const Container = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
`

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  input[type="range"] {
    width: 80px;
    background: rgba(255, 255, 255, 0.3);
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`

const FullscreenButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`

const TimeDisplay = styled.div`
  color: white;
  font-size: 14px;
  margin-left: auto;
`

const PlayBar = styled.div`
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  z-index: 1;
`

const Progress = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  pointer-events: none;
`

const MarkerWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  overflow: visible;

  &:hover p {
    display: block;
  }
`

const Marker = styled.div`
  width: 10px;
  height: 10px;
  background: #e3e3e3;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
`

const MarkerMessage = styled.p`
  display: none;
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: solid black 1px;
  color: #000000;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 3;
  width: max-content;
  max-width: 300px;
  min-width: 100px;
  white-space: normal;
  word-wrap: break-word;
  text-align: center;

  ${MarkerWrapper}:hover & {
    display: block;
  }
`

//#endregion
