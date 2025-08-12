import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { Navigation } from "../../global-components/Navigation";
import { MediaQueries } from "../../themes/mediaQueries";
import { useEffect } from "react";

// Types
type LoginFormElements = HTMLFormElement & {
  email: HTMLInputElement;
  password: HTMLInputElement;
};

export const LogInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as LoginFormElements;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const success = await login(formData.email, formData.password);

    if (success) {
      navigate("/library/");
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

useEffect(() => {
  if (isLoggedIn) {
    navigate("/library");
  }
}, [isLoggedIn, navigate]);

  return (
    <>
      <Navigation />
      <Container>
        <SideContainer />
        <CardContainer>
          <Card>
            <LogoContainer>
              <Logo src="/logo2.webp" alt="Classync logo" />
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={3}
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

const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 94dvh;
`;

const SideContainer = styled.section`
  display: none;
  width: 80%;
  background-image: url("/sideImage2.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${({theme}) => theme.colors.secondary};

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
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

const WelcomeMessage = styled.div`
  text-align: center;
  margin: 10px 0 30px 0;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 50px;
  margin: 40px auto;
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