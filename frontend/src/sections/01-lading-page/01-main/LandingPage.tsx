import { Navigation } from "../../../global-components/Navigation";
import { Hero } from "../components/Hero";
import styled from "styled-components";
import { ExplainSection } from "../components/ExplainSection";
import { Footer } from "../components/Footer";

export const LandingPage = () => {
  return (
    <Container>
      <Navigation />
      <Hero />
      <ExplainSection />
      <Footer />
    </Container>

  )
};

const Container = styled.section `
`