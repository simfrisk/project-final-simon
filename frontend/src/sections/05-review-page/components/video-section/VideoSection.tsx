import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

export const VideoSection = () => {
  // This lets us reference the actual <video> DOM element
  const videoRef = useRef<HTMLVideoElement>(null);
  // This lets us reference the timeline DOM element
  const timelineRef = useRef<HTMLDivElement>(null);

  // Array of markers (timestamps where user clicked video)
  const [markers, setMarkers] = useState<number[]>([]);
  // Progress in percent (for progress bar)
  const [progress, setProgress] = useState<number>(0);
  // Is the video currently playing?
  const [isPlaying, setIsPlaying] = useState(false);
  // Volume level (0 to 1)
  const [volume, setVolume] = useState(1);

  // When the video plays or updates time, update UI state
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

    // Listen to events from the video element
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
    };
  }, []);

  // Play or pause the video when play button is clicked
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  // When volume slider changes
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  // When the user clicks the video area: add a time marker
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    setMarkers((prev) => [...prev, video.currentTime]);
  };

  // Seek video when user clicks on the timeline bar
  const handleTimelineClick = (e: React.MouseEvent) => {
    const video = videoRef.current;
    const timeline = timelineRef.current;
    if (!video || !timeline) return;

    const rect = timeline.getBoundingClientRect(); // timeline size and position
    const clickX = e.clientX - rect.left; // distance from left
    const clickPercent = clickX / rect.width;
    video.currentTime = clickPercent * video.duration;
  };

  // Jump video to a saved marker time
  const goToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play(); // optional: auto play on jump
    }
  };

  // Format seconds into mm:ss
  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Get current time and total duration
  const currentTime = formatTime(videoRef.current?.currentTime || 0);
  const duration = formatTime(videoRef.current?.duration || 0);

  return (
    <Container>
      {/* The video player (click adds markers) */}
      <StyledVideo ref={videoRef} onClick={handleVideoClick} controls={false}>
        <source src="/video1.mp4" type="video/mp4" />
      </StyledVideo>

      {/* Custom controls: play, volume, time */}
      <Controls>
        <PlayButton onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶️'}
        </PlayButton>

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

        <TimeDisplay>{currentTime} / {duration}</TimeDisplay>
      </Controls>

      {/* Custom timeline bar with progress and markers */}
      <PlayBar ref={timelineRef} onClick={handleTimelineClick}>
        {/* Blue progress bar */}
        <Progress style={{ width: `${progress}%` }} />

        {/* Red markers on the timeline */}
        {markers.map((time, i) => {
          const percent = videoRef.current?.duration
            ? (time / videoRef.current.duration) * 100
            : 0;

          return (
            <Marker
              key={i}
              style={{ left: `${percent}%` }}
              onClick={(e) => {
                e.stopPropagation(); // stop timeline click event
                goToTime(time);
              }}
              title={formatTime(time)} // tooltip
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
  background: black;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 40px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: white;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  input[type="range"] {
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