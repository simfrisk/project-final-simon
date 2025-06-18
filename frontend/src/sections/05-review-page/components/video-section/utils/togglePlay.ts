import type { RefObject } from 'react';

export const useTogglePlay = (videoRef: RefObject<HTMLVideoElement | null>) => {
  return () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
};