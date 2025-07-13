import styled from "styled-components";
import { HamburgerMenu } from "../sections/01-lading-page/components/nav/components/Burger";
import { Link } from "react-router";

export const Navigation = () => {
  return (
    <>
    <Container>
      <StyledLink to="/">
      <h3>Classync</h3>
      </StyledLink>
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

const StyledLink = styled(Link) `
  color: white;
  text-decoration: none;
  transition: ease .3s;

  &:hover {
    transform: scale(.94);
  }
`