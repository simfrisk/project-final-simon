import { Section } from "../../../../global-components/Section";
import { FeatureTitle } from "./featureTitle";
import { Container } from "../../../../global-components/Section";
import { FeatureCards } from "./featureCards";
import styled from "styled-components";

export const FeatureScetion = () => {
  return (
    <>
    <Section thirdSection>
      <Container>
        <FeatureTitle />
        <CardWrapper>
          <FeatureCards />
          {/* <FeatureScreens /> */}
        </CardWrapper>
      </Container>
    </Section>
    </>
  )
};

const CardWrapper = styled.div `
display: flex;
flex-direction: column;
`