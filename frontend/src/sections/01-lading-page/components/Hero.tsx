import styled from "styled-components"
import { MainButton } from "../../../global-components/buttons"
import { Section } from "../../../global-components/Section"
import { Container as BaseContainer } from "../../../global-components/Section"
import { MediaQueries } from "../../../themes/mediaQueries"
import { spacing } from "../../../themes/spacing"

export const Hero = () => {
  return (
    <Section secondarySection>
      <Container>
        <Content>
          <Logo
            src="/Hero.webp"
            alt="Image of some scribble"
          />
          <MainTitle>Video Notes for the Modern Classroom</MainTitle>
          <SubTitle>
            Time-stamped feedback tools built for classrooms, courses, and
            content creators.
          </SubTitle>
          <MainButtonWrapper>
            <MainButton
              text="Get Started"
              url="/signUp"
            />
            <MainButton
              text="Login"
              url="/login"
            />
          </MainButtonWrapper>
        </Content>
        <StyledImage
          src="./class.jpg"
          alt="Classroom image"
        />
      </Container>
    </Section>
  )
}

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
`

const SubTitle = styled.p`
  margin: ${spacing.sm} 0;
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
