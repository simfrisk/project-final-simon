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

export const VideoSection = () => {
  const activeTab = useTabStore((state) => state.activeTab)

  const timelineRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [volume, setVolume] = useState(1)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

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
    return () =>
      video.removeEventListener("canplaythrough", handleCanPlayThrough)
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

  // ✅ Seek video when markerTriggerCount changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = currentTime
    video.pause() // Optional: remove this line to auto-play after seek
  }, [markerTriggerCount])

  // Volume
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
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

  return (
    <Container>
      <StyledVideo
        ref={videoRef}
        onClick={togglePlay}
        controls={false}
      >
        {videoUrl && (
          <source
            src={videoUrl}
            type="video/mp4"
          />
        )}
        Your browser does not support the video tag.
      </StyledVideo>

      <Controls>
        <PlayPauseButton
          isPlaying={isPlaying}
          onClick={togglePlay}
        />
        <VolumeControl>
          <label>🔊</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={changeVolume}
          />
        </VolumeControl>
        <TimeDisplay>
          {formattedTime} / {duration}
        </TimeDisplay>
      </Controls>

      <PlayBar
        ref={timelineRef}
        onClick={handleTimelineClick}
      >
        <Progress style={{ width: `${progress}%` }} />
        {videoLoaded &&
          messages.map(({ _id, timeStamp, content }) => {
            const timeInSeconds = unFormatTime(timeStamp)
            const percent = videoEl?.duration
              ? (timeInSeconds / videoEl.duration) * 100
              : 0

            return (
              <MarkerWrapper
                key={_id}
                style={{ left: `${percent}%` }}
                onClick={(e) => {
                  e.stopPropagation()

                  commentStore.getState().setSelectedCommentId(_id)
                  commentStore.getState().setSelectedTimeStamp(timeStamp)

                  useVideoStore.getState().setTimeCode(timeInSeconds)
                  useVideoStore.getState().incrementMarkerTrigger()
                }}
              >
                <Marker />
                <MarkerMessage>{content}</MarkerMessage>
              </MarkerWrapper>
            )
          })}
      </PlayBar>
    </Container>
  )
}

//#region ---- Styling -----

const Container = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  background: white;
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
  background: #2196f3;
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
