import type { RefObject } from 'react';

export const getHandleTimelineClick = (
  videoRef: RefObject<HTMLVideoElement | null>,
  timelineRef: RefObject<HTMLDivElement | null>
) => {
  return (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const timeline = timelineRef.current;
    if (!video || !timeline) return;

    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    video.currentTime = clickPercent * video.duration;
  };
};