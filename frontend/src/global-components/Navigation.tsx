import styled from "styled-components";
import { HamburgerMenu } from "../sections/01-lading-page/components/nav/components/Burger";

export const Navigation = () => {
  return (
    <>
    <Container>
      <h3>Classync</h3>
      <HamburgerMenu />
    </Container>
    </>
  )
};

const Container = styled.nav `
background-color: ${({theme}) => theme.colors.primary};
color: white;
height: 60px;
width: 100%;
display: flex;
justify-content: space-between;
padding: 20px;
align-items: center;
`