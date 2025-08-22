import { useRef, useEffect, useState } from "react"
import { useInView } from "framer-motion"
import styled from "styled-components"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { spacing } from "../../../../themes/spacing"

type ExplainerCardProps = {
  title: string
  text: string
  video?: string
}

export const ExplainerCard = ({ title, text, video }: ExplainerCardProps) => {
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
    <Container ref={containerRef}>
      <StyledVideo
        ref={videoRef}
        muted
        playsInline
        onMouseEnter={handleMouseEnter}
      >
        <source
          src={video || "/Explainer3.mp4"}
          type="video/mp4"
        />
      </StyledVideo>
      <strong>{title}</strong>
      <p>{text}</p>
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
`

const StyledVideo = styled.video`
  border-radius: 5px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
  cursor: pointer;
`
