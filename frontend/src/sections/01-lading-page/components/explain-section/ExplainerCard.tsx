import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import styled from "styled-components";
import { MediaQueries } from "../../../../themes/mediaQueries";

type ExplainerCardProps = {
  title: string;
  text: string;
};

export const ExplainerCard = ({title, text}: ExplainerCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.5 });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MediaQueries.biggerSizes);

    // Initial check
    setIsMobile(!mediaQuery.matches);

    // Listener for viewport size changes
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Desktop: play once on hover (no loop)
  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.loop = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Mobile: loop video when in view, pause otherwise
  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.loop = true;
      if (isInView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isMobile]);

  return (
    <Container ref={containerRef}>
    <StyledVideo
      ref={videoRef}
      muted
      playsInline
      onMouseEnter={handleMouseEnter}
    >
      <source src="/Explainer3.mp4" type="video/mp4" />
    </StyledVideo>
      <strong>{title}</strong>
      <p>{text}</p>
    </Container>
  );
};

const Container = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 10px;
  border-radius: 15px;
  width: 100%;
  max-width: 500px ;
  padding: 15px;
  margin: 0 auto;
  background-color: #1F2A36;

`;

const StyledVideo = styled.video`
  border-radius: 5px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
  cursor: pointer;
`;