import { Navigation } from "./nav/Navigation";
import { Hero } from "./Hero";
import styled from "styled-components";
import { ExplainSection } from "./ExplainSection";

export const LandingPage = () => {
  return (
    <Container>
      <Navigation />
      <Hero />
      <ExplainSection />
    </Container>

  )
};

const Container = styled.section `
`