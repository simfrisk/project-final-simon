import styled from "styled-components";
import { Link } from "react-router-dom";
import { MediaQueries } from "../../themes/mediaQueries";

export const LogInPage = () => {
  return (
    <Container>
      <SideContainer />
      <Card>
        <h3>Login</h3>
        <p>Login to get started</p>
        <label>
          <span>Email Adress</span>
          <input type="text" placeholder="Enter Email"/>
        </label>
        <label>
          <span>Password</span>
          <input type="text" placeholder="Enter Password"/>
        </label>

        <StyledButtonLink to="/library/">Enter</StyledButtonLink>
        <StyledLink to="/library">Create Account</StyledLink>
      </Card>
    </Container>
  );
};

const SideContainer = styled.section`
  display: none;
  width: 100%;
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
width: 100%;

`

const Card = styled.section `
display: flex;
flex-direction: column;
padding: 20px;
width: 100%;
max-width: 700px;

 @media ${MediaQueries.biggerSizes} {
    justify-content: center;
    margin: 0 20px;
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
  background-color: #2d7eff;
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
    background-color: #3f87fb;
    transform: scale(.99);
  }
`;

const StyledLink = styled(Link)`
color: black;
text-decoration: none;
text-align: center;
`