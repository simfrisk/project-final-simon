import styled from "styled-components";
import { Link } from "react-router-dom";
import { MediaQueries } from "../../themes/mediaQueries";

export const LogInPage = () => {

  return (
    <Container>
      <SideContainer />
      <CardContainer>
        <Card>
          <h3>Login</h3>
          <p>Login to get started</p>
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
  );
};

const SideContainer = styled.section`
  display: none;
  width: 60%;
  height: 100vh;
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
height: 100vh;

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

 @media ${MediaQueries.biggerSizes} {
    justify-content: center;
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