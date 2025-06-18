import type { RefObject } from 'react';

export const useGoToTime = (videoRef: RefObject<HTMLVideoElement | null>) => {
  return (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };
};