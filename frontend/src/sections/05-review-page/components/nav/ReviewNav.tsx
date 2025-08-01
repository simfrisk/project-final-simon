import styled from "styled-components";
import { useNavigate } from "react-router";

export const ReviewNav = () => {

 const navigate = useNavigate();

  return (
  <Container>
    <BackContainer onClick={() => navigate(-1)}>
    <img src="/icons/back.svg" alt="Go back" />
    <p>Go back</p>
    </BackContainer>
  </Container>
  )
};

const Container = styled.nav `
/* background-color: ${({theme}) => theme.colors.primary}; */
display: flex;
align-content: center;
column-gap: 5px;
height: 45px;
width: 100%;
border-bottom: solid gray 1px;
`

const BackContainer = styled.div `
color:  ${({ theme }) => theme.colors.text};
display: flex;
align-content: center;
align-items: center;
column-gap: 5px;
margin: 0 10px;
transition: ease .3s;
text-decoration: none;

&:hover{
  transform: scale(.95);
  color:  ${({ theme }) => theme.colors.textHover};
}


img {
  height: 20px;
}
`