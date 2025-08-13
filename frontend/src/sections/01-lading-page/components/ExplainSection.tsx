// ExplainSection.tsx
import styled from "styled-components";
import { MediaQueries } from "../../../themes/mediaQueries";
import { Section, Container } from "../../../global-components/Section";
import { spacing } from "../../../themes/spacing";

export const ExplainSection = () => {
  return (
    <Section>
      <Container>
        <Content>
          <Title>How it works</Title>
          <ExplainerVideo autoPlay muted loop>
            <source src="/Explainer3.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </ExplainerVideo>
        </Content>
      </Container>
    </Section>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${spacing.xl};
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: ${spacing.md} 0;
`;

const ExplainerVideo = styled.video`
  width: 100%;
  max-width: 600px;
  border-radius: 15px;
  height: auto;
  margin: 0 auto;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.189);

  @media ${MediaQueries.biggerSizes} {
    max-width: 1200px;
  }
`;