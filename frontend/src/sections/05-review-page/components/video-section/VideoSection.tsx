import { useRef } from 'react';
import styled from 'styled-components';

export const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to jump to a timecode
  const goToTimecode = (timecode: string) => {
    const seconds = timecodeToSeconds(timecode);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
    }
  };

  // Convert "MM:SS" or "HH:MM:SS" timecode to seconds
  const timecodeToSeconds = (tc: string): number => {
    const parts = tc.split(':').map(Number);
    return parts.reduce((acc, part) => acc * 60 + part, 0);
  };

  return (
    <Container>
      <StyledVideo ref={videoRef} controls>
        <source src="/video1.mp4" type="video/mp4" />
      </StyledVideo>

      <TimecodeButtons>
        <TimecodeButton onClick={() => goToTimecode("00:10")}>Go to 00:10</TimecodeButton>
        <TimecodeButton onClick={() => goToTimecode("00:30")}>Go to 00:30</TimecodeButton>
        <TimecodeButton onClick={() => goToTimecode("01:00")}>Go to 01:00</TimecodeButton>
      </TimecodeButtons>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  position: relative;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TimecodeButtons = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
`;

const TimecodeButton = styled.button`
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;