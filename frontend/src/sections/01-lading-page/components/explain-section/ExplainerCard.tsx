import { useRef, useEffect, useState } from "react"
import { useInView } from "framer-motion"
import styled from "styled-components"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { spacing } from "../../../../themes/spacing"

type ExplainerCardProps = {
  title: string
  text: string
  video?: string
  index: number
}

export const ExplainerCard = ({ title, text, video, index }: ExplainerCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(containerRef, { amount: 0.5 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(MediaQueries.biggerSizes)
    setIsMobile(!mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.loop = false
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  useEffect(() => {
    if (isMobile && videoRef.current) {
      videoRef.current.loop = true
      if (isInView) videoRef.current.play()
      else videoRef.current.pause()
    }
  }, [isInView, isMobile])

  return (
    <Container
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      role="listitem"
      aria-labelledby={`card-title-${index}`}
      aria-describedby={`card-text-${index}`}
    >
      <StyledVideo
        ref={videoRef}
        muted
        playsInline
        aria-label={`Demonstration video for ${title}`}
        aria-describedby={`card-text-${index}`}
      >
        <source
          src={video || "/Explainer3.mp4"}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </StyledVideo>
      <CardTitle id={`card-title-${index}`}>{title}</CardTitle>
      <CardText id={`card-text-${index}`}>{text}</CardText>
    </Container>
  )
}

const Container = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: ${spacing.sm};
  border-radius: 15px;
  width: 100%;
  /* remove max-width */
  padding: ${spacing.md};
  background-color: #1f2a36;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
`

const StyledVideo = styled.video`
  border-radius: 5px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
`

const CardText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #b0b8c1;
`
