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
  const [isTimelineZoomed, setIsTimelineZoomed] = useState(false)
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

  // Keyboard shortcuts for video control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return

      // Only handle if not typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

      if (e.key === "ArrowRight") {
        e.preventDefault()
        video.currentTime = Math.min(video.currentTime + 3, video.duration)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        video.currentTime = Math.max(video.currentTime - 3, 0)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // ✅ Seek video when markerTriggerCount changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = currentTime
    video.pause()
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
    setIsFullscreen(!isFullscreen)
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
    <Container $isFullScreen={isFullscreen}>
      {/* Loading state */}
      {!videoLoaded && (
        <PulsingBackground>
          <SpinningCircle />
        </PulsingBackground>
      )}

      {/* Video render */}
      <StyledVideo
        ref={videoRef}
        onClick={togglePlay}
        controls={false}
        aria-label={isPlaying ? "Pause video" : "Play video"}
        $isFullScreen={isFullscreen}
      >
        {videoUrl && (
          <source
            src={videoUrl}
            type="video/mp4"
          />
        )}
        Your browser does not support the video tag.
      </StyledVideo>

      <Controls $isFullScreen={isFullscreen} $isZoomed={isTimelineZoomed}>
        <PlayPauseButton
          isPlaying={isPlaying}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        />
        <SkipButton
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 3, 0)
            }
          }}
          aria-label="Skip backward 3 seconds"
          title="Skip backward 3 seconds"
        >
          <SkipIcon direction="left">
            <div className="arrow" />
            <div className="arrow" />
          </SkipIcon>
        </SkipButton>
        <SkipButton
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = Math.min(
                videoRef.current.currentTime + 3,
                videoRef.current.duration
              )
            }
          }}
          aria-label="Skip forward 3 seconds"
          title="Skip forward 3 seconds"
        >
          <SkipIcon direction="right">
            <div className="arrow" />
            <div className="arrow" />
          </SkipIcon>
        </SkipButton>
        <TimeDisplay aria-live="polite">
          {formattedTime} / {duration}
        </TimeDisplay>
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

        <ZoomButton
          onClick={() => setIsTimelineZoomed(!isTimelineZoomed)}
          aria-label={isTimelineZoomed ? "Exit timeline zoom" : "Zoom timeline"}
          title={isTimelineZoomed ? "Exit timeline zoom" : "Zoom timeline"}
        >
          {isTimelineZoomed ? "🔍−" : "🔍+"}
        </ZoomButton>

        <FullscreenButton
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "⛶" : "⛶"}
        </FullscreenButton>
      </Controls>

      <TimelineContainer $isZoomed={isTimelineZoomed} $isFullScreen={isFullscreen}>
        <PlayBar
          ref={timelineRef}
          onClick={handleTimelineClick}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={videoEl?.duration || 0}
          aria-valuenow={videoEl?.currentTime || 0}
          aria-label="Video progress bar"
          $isFullScreen={isFullscreen}
          $isZoomed={isTimelineZoomed}
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
      </TimelineContainer>
    </Container>
  )
  //#endregion
}
//#endregion

//#region ---- STYLED COMPONENTS -----

const Container = styled.div<{ $isFullScreen: boolean }>`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;

  ${({ $isFullScreen }) =>
    $isFullScreen &&
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    aspect-ratio: unset;
  `}
`

const StyledVideo = styled.video<{ $isFullScreen: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: black;
  color: white;
`

const Controls = styled.div<{ $isFullScreen: boolean; $isZoomed: boolean }>`
  position: absolute;
  bottom: ${({ $isZoomed, $isFullScreen }) =>
    $isZoomed ? ($isFullScreen ? "130px" : "110px") : $isFullScreen ? "40px" : "20px"};
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
  transition: bottom 0.3s ease;

  ${({ $isFullScreen }) =>
    $isFullScreen &&
    `
    left: 40px;
    right: 40px;
  `}
`

const SkipButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const SkipIcon = styled.div<{ direction: "left" | "right" }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  ${({ direction }) => (direction === "left" ? "transform: scaleX(-1);" : "")}

  .arrow {
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 10px solid white;
  }
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

const ZoomButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
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

const TimelineContainer = styled.div<{ $isZoomed: boolean; $isFullScreen: boolean }>`
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  overflow-x: ${({ $isZoomed }) => ($isZoomed ? "auto" : "visible")};
  overflow-y: visible;
  z-index: 1;
  padding-top: ${({ $isZoomed }) => ($isZoomed ? "60px" : "0")};
  padding-bottom: ${({ $isZoomed }) => ($isZoomed ? "10px" : "0")};
  min-height: ${({ $isZoomed, $isFullScreen }) =>
    $isZoomed ? ($isFullScreen ? "90px" : "78px") : "auto"};
  transition: padding 0.3s ease, min-height 0.3s ease;

  ${({ $isFullScreen }) =>
    $isFullScreen &&
    `
    bottom: 20px;
    left: 40px;
    right: 40px;
  `}

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 6px;
    margin-top: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`

const PlayBar = styled.div<{ $isFullScreen: boolean; $isZoomed: boolean }>`
  position: ${({ $isZoomed }) => ($isZoomed ? "absolute" : "relative")};
  bottom: ${({ $isZoomed }) => ($isZoomed ? "0" : "auto")};
  width: ${({ $isZoomed }) => ($isZoomed ? "300%" : "100%")};
  height: ${({ $isZoomed, $isFullScreen }) =>
    $isZoomed ? "16px" : $isFullScreen ? "12px" : "8px"};
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: width 0.3s ease, height 0.3s ease;
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
  pointer-events: auto;

  &:hover {
    z-index: 10;
  }

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
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    width: 22px;
    height: 22px;
    background: transparent;
    cursor: pointer;
  }

  &:hover {
    transform: scale(1.3);
  }

  &:focus {
    transform: scale(1.2);
    background-color: white;
    outline-offset: -2px;
  }
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
  pointer-events: none;

  ${MarkerWrapper}:hover & {
    display: block;
  }
`

const PulsingBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  background-size: 200% 200%;
  animation: pulse 3s ease-in-out infinite;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;

  @keyframes pulse {
    0% {
      background-position: 0% 50%;
      background-color: #151515;
      opacity: 0.4;
    }
    50% {
      background-position: 100% 50%;
      background-color: #252525;
      opacity: 1;
    }
    100% {
      background-position: 0% 50%;
      background-color: #151515;
      opacity: 0.4;
    }
  }
`

const SpinningCircle = styled.div`
  width: 35px;
  height: 35px;
  border: 4px solid transparent;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 21;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

//#endregion
