import styled from "styled-components";
import { HamburgerMenu } from "./components/Burger";

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
/* background-color: ${({ theme }) => theme.colors.primary}; */
color: ${({ theme }) => theme.colors.background};
height: 60px;
width: 100%;
display: flex;
justify-content: space-between;
padding: 20px;
align-items: center;
`