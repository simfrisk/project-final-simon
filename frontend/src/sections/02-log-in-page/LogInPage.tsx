import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { MediaQueries } from "../../themes/mediaQueries";
import { Navigation } from "../../global-components/Navigation";

// Define form element structure
type LoginFormElements = HTMLFormElement & {
  email: HTMLInputElement;
  password: HTMLInputElement;
};

export const LogInPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as LoginFormElements;

    if (form.checkValidity()) {
      const email = form.email.value;
      const password = form.password.value;

      console.log("Form submitted:", { email, password });

      // Redirect after successful login
      navigate("/library/");
    } else {
      form.reportValidity(); // show validation tooltips
    }
  };

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

            <form onSubmit={handleSubmit} noValidate>
              <label>
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  required
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  minLength={3}
                  placeholder="Enter Password"
                  required
                />
              </label>
              <ButtonWrapper>
                <StyledButton type="submit">Login</StyledButton>
              </ButtonWrapper>
            </form>

            <StyledLink to="/signUp">Create Account</StyledLink>
          </Card>
        </CardContainer>
      </Container>
    </>
  );
};

const SideContainer = styled.section`
  display: none;
  width: 80%;
  background-image: url("/sideImage2.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${({ theme }) => theme.colors.secondary};

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 94dvh;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    max-width: 2000px;
  }
`;

const Card = styled.section`
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
    background-color: #f6f6f6;
    border: none;
    border-radius: 5px;
    margin: 10px 0;
    width: 100%;
    padding: 10px 10px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Logo = styled.img`
  height: 150px;
  width: 150px;
  border-radius: 20px;
  margin-left: 15px;
`;

const ButtonWrapper = styled.div `
display: flex;
justify-content: center;
`

const StyledButton = styled.button`
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
  margin: 40px auto; 
  text-align: center;
  transition: ease 0.3s;


  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    color: ${({ theme }) => theme.colors.textHover};
    transform: scale(0.95);
  }

  &:active {
    color: ${({ theme }) => theme.colors.textActive};
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  margin: 10px 0 30px 0;
`;