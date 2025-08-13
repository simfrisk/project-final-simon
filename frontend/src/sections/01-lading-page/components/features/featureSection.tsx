// FeatureSection.tsx
import { Section, Container } from "../../../../global-components/Section";
import { FeatureTitle } from "./FeatureTitle";
import { FeatureCards } from "./FeatureCards";
import styled from "styled-components";
import { MediaQueries } from "../../../../themes/mediaQueries";
import { spacing } from "../../../../themes/spacing";

export const FeatureSection = () => {
  return (
    <Section thirdSection>
      <Container>
        <FeatureTitle />
        <CardWrapper>
          <FeatureCards />
        </CardWrapper>
      </Container>
    </Section>
  );
};

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;