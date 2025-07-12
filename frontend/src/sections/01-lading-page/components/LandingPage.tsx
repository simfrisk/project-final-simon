import { Navigation } from "./nav/Navigation";
import { Hero } from "./nav/Hero";
import styled from "styled-components";

export const LandingPage = () => {
  return (
    <Container>
      <Navigation />

      <Hero />
    </Container>

  )
};

const Container = styled.section `
  background-color: ${({theme}) => theme.colors.primary};
`