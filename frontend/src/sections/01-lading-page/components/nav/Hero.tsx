import styled from "styled-components";
import { MainButton } from "../../../../global-components/buttons";

export const Hero = () => {
  return (
    <Container>
      <img src="/Hero.png" alt="Image of some scrible" />
      <MainTitle>Collaborative Video Review, Reimagined for Learning</MainTitle>
      <MainButtonWrapper>
        <MainButton text="Login" url="/login" />
      </MainButtonWrapper>
    </Container>
  )
};

const Container = styled.div `
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;


 img {
  margin: 100px 0 20px 0 ;
  height: 200px;
 }
`

const MainTitle = styled.h1 `
margin: 20px;
color: ${({theme}) => theme.colors.background};
text-align: center;
`

const MainButtonWrapper = styled.div`
  margin-bottom: 200px;
`;