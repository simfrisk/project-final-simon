import { Navigation } from "../../../global-components/Navigation";
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