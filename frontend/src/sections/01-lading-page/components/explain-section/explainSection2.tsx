import styled from "styled-components";
import { Container, Section } from "../../../../global-components/Section";
import { ExplainerCard } from "./ExplainerCard";
import { MediaQueries } from "../../../../themes/mediaQueries";

export const ExplainSection2 = () => {
  return (
    <Section thirdSection>
      <Container>
     <Title>The platform that powers your online cources</Title>
     <CardWrapper>

       <ExplainerCard title={"Find comments in timeline"} text={"Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."} />

       <ExplainerCard title={"Ask questions at video"} text={"Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."} />

       <ExplainerCard title={"Teachers Page to organize questions"} text={"Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."} />

       <ExplainerCard title={"Peronal comments on time"} text={"Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."} />

       <ExplainerCard title={"All your classes in one page"} text={"Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."} />

       <ExplainerCard title={"Don't forget to give some love"} text={"Ensure your videos play in their highest resolution, always ad‑free. No competitor distractions or random suggestions here."} />

     </CardWrapper>
      </Container>
    </Section>
  )
};

const Title = styled.h2 `
text-align: center;
margin: 20px;
`

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  justify-content: center;
  margin: 60px 0px;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: repeat(3, 1fr);
    justify-content: start; /* optional */
  }
`;