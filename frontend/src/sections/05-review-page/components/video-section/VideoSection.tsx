import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlayPauseButton } from './components/PlayPauseBtn';
import { useVideoStore } from '../../../../store/videoStore';
import { formatTime } from './utils/formatTime'
import { useTogglePlay } from './utils/togglePlay';
import { useChangeVolume } from './utils/changeVolume'
import {getHandleTimelineClick} from './utils/handleTimelineClick'
import { useGoToTime } from './utils/goToTime'

export const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const markerTriggerCount = useVideoStore((state) => state.markerTriggerCount);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    };

    const updatePlayState = () => {
      setIsPlaying(!video.paused);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
    };
  }, []);

  //Controls
  const togglePlay = useTogglePlay(videoRef);
  const changeVolume = useChangeVolume(videoRef, setVolume);
  const handleTimelineClick = getHandleTimelineClick(videoRef, timelineRef);
  const goToTime = useGoToTime(videoRef);

  const currentTime = formatTime(videoRef.current?.currentTime || 0);
  const duration = formatTime(videoRef.current?.duration || 0);

  // 🔥 Detect trigger marker via counter change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setMarkers((prev) => [...prev, video.currentTime]);
  }, [markerTriggerCount]);

  return (
    <Container>

      <StyledVideo ref={videoRef} onClick={togglePlay} controls={false}>
        <source src="/video2.mp4" type="video/mp4" />
      </StyledVideo>

      <Controls>
        <PlayPauseButton isPlaying={isPlaying} onClick={togglePlay} />
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
          {currentTime} / {duration}
        </TimeDisplay>
      </Controls>

      <PlayBar ref={timelineRef} onClick={handleTimelineClick}>
        <Progress style={{ width: `${progress}%` }} />
        {markers.map((time: number, i: number) => {
          const percent = videoRef.current?.duration
            ? (time / videoRef.current.duration) * 100
            : 0;

          return (
            <Marker
              key={i}
              style={{ left: `${percent}%` }}
              onClick={(e) => {
                e.stopPropagation();
                goToTime(time);
              }}
              title={formatTime(time)}
            />
          );
        })}
      </PlayBar>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  background: white;
  overflow: hidden;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
`;


const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  input[type='range'] {
    width: 80px;
  }
`;

const TimeDisplay = styled.div`
  color: white;
  font-size: 14px;
  margin-left: auto;
`;

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
`;

const Progress = styled.div`
  height: 100%;
  background: #2196f3;
  border-radius: 4px;
  pointer-events: none;
`;

const Marker = styled.div`
  position: absolute;
  top: -4px;
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(-50%) scale(1.3);
  }
`;