import styled from "styled-components";
import { Link } from "react-router";

export const ReviewNav = () => {
  return (
  <Container to="/library">
    <BackContainer>
    <img src="/icons/back.svg" alt="" />
    <p>Go back</p>
    </BackContainer>
  </Container>
  )
};

const Container = styled(Link) `
display: flex;
align-content: center;
column-gap: 5px;
height: 45px;
width: 100%;
border-bottom: solid gray 1px;
`

const BackContainer = styled.div `
display: flex;
align-content: center;
align-items: center;
column-gap: 5px;
margin: 0 10px;


img {
  height: 20px;
}
`