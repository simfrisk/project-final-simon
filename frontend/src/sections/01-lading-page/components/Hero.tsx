import styled from "styled-components"
import { MainButton } from "../../../global-components/buttons"
import { Section as BaseSection } from "../../../global-components/Section"
import { Container as BaseContainer } from "../../../global-components/Section"
import { MediaQueries } from "../../../themes/mediaQueries"
import { spacing } from "../../../themes/spacing"

export const Hero = () => {
  return (
    <Section
      secondarySection
      aria-label="Hero section with introduction to Video Notes for the Modern Classroom"
    >
      <VideoBackground
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="/Teacher.mp4"
          type="video/mp4"
        />
      </VideoBackground>
      <Container role="banner">
        <Content role="presentation">
          <Logo
            src="/Hero2.png"
            alt="Classync logo"
          />
          <MainTitle id="hero-title">Video Notes for the Modern Classroom</MainTitle>
          <SubTitle id="hero-subtitle">
            Time-stamped feedback tools built for classrooms, courses, and content creators.
          </SubTitle>
          <MainButtonWrapper
            role="group"
            aria-label="Primary actions"
          >
            <MainButton
              text="Get Started"
              url="/signUp"
              aria-label="Get started by signing up for Classync"
            />
            <MainButton
              text="Login"
              url="/login"
              aria-label="Login to your Classync account"
            />
          </MainButtonWrapper>
        </Content>
        <StyledImage
          src="./class.jpg"
          alt="Students in a classroom"
        />
      </Container>
    </Section>
  )
}

const Section = styled(BaseSection)`
  position: relative;
  overflow: hidden; /* prevents video overflow scrollbars */
`

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`

const Container = styled(BaseContainer)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  aspect-ratio: 20 / 6;
  gap: ${spacing.lg};

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    align-items: center;
    column-gap: ${spacing.lg};
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.xs};
  max-width: 650px;
  min-width: 300px;
  text-align: center;

  @media ${MediaQueries.biggerSizes} {
    align-items: flex-start;
    text-align: left;
  }
`

const Logo = styled.img`
  height: 200px;
  display: block;

  @media ${MediaQueries.biggerSizes} {
    display: none;
    height: 250px;
  }
`

const MainTitle = styled.h1`
  margin: ${spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`

const SubTitle = styled.h3`
  margin: ${spacing.sm} 0;
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: 21px;
  width: 80%;
`

const MainButtonWrapper = styled.div`
  display: flex;
  margin: ${spacing.lg} 0;
  gap: ${spacing.lg};
`

const StyledImage = styled.img`
  width: 90%;
  border-radius: 15px;
  object-fit: cover;
  flex-shrink: 0;
  display: none;

  @media ${MediaQueries.biggerSizes} {
    display: block;
    max-height: 400px;
    max-width: 600px;
    width: clamp(160px, 30vw, 600px);
  }
`
