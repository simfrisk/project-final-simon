import { Navigation } from "../../../global-components/navigation/Navigation"
import { Hero } from "../components/Hero"
import styled from "styled-components"
// import { ExplainSection } from "../components/ExplainSection"
import { Demos } from "../components/demo"
import { Footer } from "../components/Footer"
import { FeatureSection } from "../components/features/featureSection"
import { Collaborate } from "../components/Collaborate"
import { Target } from "../components/target/Target"
import { BackendStatusIndicator } from "../../../components/BackendStatusIndicator"

export const LandingPage = () => {
  return (
    <Container>
      <BackendStatusIndicator autoCheck={true} />
      <Navigation />
      <Hero />
      <Collaborate />
      <Demos />
      <Target />
      {/* <ExplainSection /> */}
      <FeatureSection />
      <Footer />
    </Container>
  )
}

const Container = styled.section``
