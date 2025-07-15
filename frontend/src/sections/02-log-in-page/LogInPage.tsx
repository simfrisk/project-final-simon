import styled from "styled-components";
import { Link } from "react-router-dom";
import { MediaQueries } from "../../themes/mediaQueries";
import { Navigation } from "../../global-components/Navigation";

export const LogInPage = () => {

  return (
    <>
    <Navigation />
    <Container>
      <SideContainer />
      <CardContainer>
        <Card>
          <LogoContainer>
          <Logo src="/logo2.png" alt="Classync logo" />
          </LogoContainer>
          <WelcomeMessage>
          <h3>Welcome</h3>
          <p>Nice to have you back.</p>
          </WelcomeMessage>
          <label>
            <span>Email Adress</span>
            <input type="text" placeholder="Enter Email"/>
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Enter Password"/>
          </label>

          <StyledButtonLink to="/library/">Enter</StyledButtonLink>
          <StyledLink to="/library">Create Account</StyledLink>
        
        </Card>
      </CardContainer>
    </Container>
    </>
  );
};

const SideContainer = styled.section`
  display: none;
  width: 80%;
  background-image: url("/login-bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`;

const Container = styled.div `
display: flex;
justify-content: center;
height: 94dvh;

`

const CardContainer = styled.div `
display: flex;
justify-content: center;
width: 100%;

@media ${MediaQueries.biggerSizes} {
max-width: 2000px;
  }
`

const Card = styled.section `
display: flex;
flex-direction: column;
padding: 20px;
width: 100%;
max-width: 600px;
margin: 64px auto; 


 @media ${MediaQueries.biggerSizes} {
    justify-content: center;
    width: 95%;
  }

input {
  height: 40px;
  background-color: #F6F6F6;
  border: none;
  border-radius: 5px;
  margin: 10px 0;
  width: 100%;
  padding: 10px 10px;
}
`

const LogoContainer = styled.div `
display: flex;
justify-content: center;
`

const Logo = styled.img `
height: 150px;
width: 150px;
border-radius: 20px;
margin-left: 15px;
`

const StyledButtonLink = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 50px;
  margin: 40px 0;
  text-align: center; 
  align-content: center;
  transition: ease .3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(.98);
  }
`;

const StyledLink = styled(Link)`
color: ${({ theme }) => theme.colors.text};
text-decoration: none;
text-align: center;
transition: ease .3s;

  &:hover {
    color: ${({ theme }) => theme.colors.textHover};
    transform: scale(.95);
  }

  &:active {
    color: ${({ theme }) => theme.colors.textActive};
  }
`;

const WelcomeMessage = styled.div `
text-align: center;
margin: 10px 0 30px 0;
`