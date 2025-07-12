import styled from "styled-components";
import { MainButton } from "../../../global-components/buttons";

export const Hero = () => {
  return (
    <Container>
      <img src="/Hero.png" alt="Image of some scrible" />
      <MainTitle>Collaborative Video Review, Reimagined for Learning</MainTitle>
      <SubTitle>Time-stamped feedback tools built for classrooms, courses, and content creators.</SubTitle>
      <MainButtonWrapper>
        <MainButton text="Login" url="/login" />
      </MainButtonWrapper>
    </Container>
  )
};

const Container = styled.div `
background-color: ${({theme}) => theme.colors.primary};
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

const SubTitle = styled.p `
color: ${({theme}) => theme.colors.background};
margin: 20px 60px;
text-align: center;
`

const MainButtonWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 100px;
`;