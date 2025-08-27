import styled from "styled-components"
import { Section } from "../../../global-components/Section"
import { Container as BaseContainer } from "../../../global-components/Section"
import { MediaQueries } from "../../../themes/mediaQueries"
import { spacing } from "../../../themes/spacing"

export const Collaborate = () => {
  return (
    <Section aria-labelledby="collaborate-title">
      <Container>
        <Title id="collaborate-title">We collaborate with 150+ online schools</Title>
        <Schools
          aria-label="Partner schools logos"
          aria-describedby="collaborate-description"
        >
          <SchoolImage
            src="./School1.webp"
            alt="School 1 partner logo"
            aria-label="School 1 partner institution"
          />
          <SchoolImage
            src="./School2.webp"
            alt="School 2 partner logo"
            aria-label="School 2 partner institution"
          />
          <SchoolImage
            src="./School7.webp"
            alt="School 7 partner logo"
            aria-label="School 7 partner institution"
          />
          <SchoolImage
            src="./School4.webp"
            alt="School 4 partner logo"
            aria-label="School 4 partner institution"
          />
          <SchoolImage
            src="./School3.webp"
            alt="School 3 partner logo"
            aria-label="School 3 partner institution"
          />
          <SchoolImage
            src="./School6.webp"
            alt="School 6 partner logo"
            aria-label="School 6 partner institution"
          />
        </Schools>
        <Description
          id="collaborate-description"
          aria-hidden="true"
        >
          Our platform collaborates with over 150 online schools and educational institutions to
          provide comprehensive learning solutions.
        </Description>
      </Container>
    </Section>
  )
}

const Container = styled(BaseContainer)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`

const Title = styled.h2`
  margin-bottom: ${spacing.md};
`

const Schools = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${spacing.md};
  width: 100%;

  gap: ${spacing.sm};

  @media ${MediaQueries.biggerSizes} {
    margin-top: ${spacing.lg};
    gap: ${spacing.lg};
    flex-wrap: nowrap;
    justify-content: space-between;
  }
`

const SchoolImage = styled.img`
  border-radius: 15px;
  height: clamp(80px, 20vw, 180px);

  @media ${MediaQueries.biggerSizes} {
    height: clamp(50px, 13vw, 180px);
    flex: 1;
    object-fit: contain;
  }
`

const Description = styled.p`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  margin: 0;
  padding: 0;
`
