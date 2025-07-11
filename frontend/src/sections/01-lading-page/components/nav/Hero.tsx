import styled from "styled-components";
import { MainButton } from "../../../../global-components/buttons";

export const Hero = () => {
  return (
    <Container>
      <MainTitle>Collaborative Video Review, Reimagined for Learning</MainTitle>
        <MainButton text="Login" url="/login" />  
    </Container>
  )
};

const Container = styled.div `
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 height: 80dvh;
`

const MainTitle = styled.h1 `
margin: 20px;
text-align: center;
`