import styled from "styled-components"
import { Section } from "../../../global-components/Section"
import { Container as BaseContainer } from "../../../global-components/Section"
import { MediaQueries } from "../../../themes/mediaQueries"
import { spacing } from "../../../themes/spacing"

export const Collaborate = () => {
  return (
    <Section>
      <Container>
        <Title>We collaborate with 150+ online schools</Title>
        <Schools>
          <SchoolImage
            src="./School1.png"
            alt="School 1"
          />
          <SchoolImage
            src="./School2.png"
            alt="School 2"
          />
          <SchoolImage
            src="./School7.png"
            alt="School 7"
          />
          <SchoolImage
            src="./School4.png"
            alt="School 4"
          />
          <SchoolImage
            src="./School3.png"
            alt="School 3"
          />
          <SchoolImage
            src="./School6.png"
            alt="School 6"
          />
        </Schools>
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

const Title = styled.h2``

const Schools = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${spacing.md};

  @media ${MediaQueries.biggerSizes} {
    margin-top: ${spacing.lg};
  }
`

const SchoolImage = styled.img`
  height: 60px;
  margin: ${spacing.xs};
  border-radius: 15px;

  @media ${MediaQueries.biggerSizes} {
    height: 140px;
    margin: ${spacing.lg};
  }
`
