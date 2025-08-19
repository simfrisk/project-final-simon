import { Navigation } from "../../../global-components/Navigation"
import { Hero } from "../components/Hero"
import styled from "styled-components"
import { ExplainSection } from "../components/ExplainSection"
import { ExplainSection2 } from "../components/explain-section/explainSection2"
import { Footer } from "../components/Footer"
import { FeatureSection } from "../components/features/featureSection"
import { Collaborate } from "../components/Collaborate"

export const LandingPage = () => {
  return (
    <Container>
      <Navigation />
      <Hero />
      <Collaborate />
      <ExplainSection2 />
      <ExplainSection />
      <FeatureSection />
      <Footer />
    </Container>
  )
}

const Container = styled.section``
