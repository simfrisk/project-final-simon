import { Navigation } from "../../../global-components/Navigation";
import { Hero } from "../components/Hero";
import styled from "styled-components";
import { ExplainSection } from "../components/ExplainSection";
import { Footer } from "../components/Footer";
import VideoUploader from "../../../testing";
// import { VideoUploader } from "../components/test";

export const LandingPage = () => {
  return (
    <Container>
      <Navigation />
      <Hero />
      <ExplainSection />
      {/* <VideoUploader /> */}
      <Footer />
      <VideoUploader />
    </Container>

  )
};

const Container = styled.section `
`