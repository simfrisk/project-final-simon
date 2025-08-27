// FeatureSection.tsx
import { Section, Container } from "../../../../global-components/Section"
import { FeatureTitle } from "./featureTitle"
import { FeatureCards } from "./featureCards"
import styled from "styled-components"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { spacing } from "../../../../themes/spacing"

export const FeatureSection = () => {
  return (
    <Section
      $thirdSection
      aria-labelledby="feature-title"
    >
      <Container>
        <FeatureTitle />
        <CardWrapper>
          <FeatureCards />
        </CardWrapper>
      </Container>
    </Section>
  )
}

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`
