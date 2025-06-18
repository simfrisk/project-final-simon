//#region ---- Imports -----

import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlayPauseButton } from './components/PlayPauseBtn';
import { useVideoStore } from '../../../../store/videoStore';
import { formatTime } from './utils/formatTime'
import { useTogglePlay } from './utils/togglePlay';
import { useChangeVolume } from './utils/changeVolume'
import {getHandleTimelineClick} from './utils/handleTimelineClick'
import { useGoToTime } from './utils/goToTime'
import { useVideoProgress } from './utils/useVideoProgress';

//#endregion

//#region ---- Functions -----

export const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [markers, setMarkers] = useState<number[]>([]);
  const [volume, setVolume] = useState(1);

  const markerTriggerCount = useVideoStore((state) => state.markerTriggerCount);

  //Controls the playback
  const { progress, isPlaying } = useVideoProgress(videoRef);

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

  //#endregion

//#region ---- Return -----

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
            <MarkerWrapper
              key={i}
              style={{ left: `${percent}%` }}
              onClick={(e) => {
                e.stopPropagation();
                goToTime(time);
              }}
            >
              <Marker />
              <MarkerMessage>This is a placerholder text for a comment.</MarkerMessage>
            </MarkerWrapper>
          );
        })}
      </PlayBar>
    </Container>
  );
};

//#endregion

//#region ---- Styling -----

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

const MarkerWrapper = styled.div`
  position: absolute;
  top: -2px;
  transform: translateX(-50%);
  z-index: 2;
  overflow: visible;

  &:hover p {
    display: block;
  }
`;

const Marker = styled.div`
  width: 10px;
  height: 10px;
  background: #e3e3e3;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;

`;

const MarkerMessage = styled.p`
  display: none;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border: solid black 1px;
  color: #000000;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 3;
  max-width: 300px; 
  min-width: 100px; 
  width: max-content; 
  white-space: normal;
  word-wrap: break-word;
  text-align: center;

  ${MarkerWrapper}:hover & {
    display: block;
  }
`;

//#endregion