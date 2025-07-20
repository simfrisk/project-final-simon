import styled from "styled-components";
import { HamburgerMenu } from "../sections/01-lading-page/components/nav/components/Burger";
import { useUserStore } from "../store/userStore";
import { Link, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const { logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();              // clear Zustand + localStorage
    navigate("/");         // redirect to homepage
  };

  return (
    <Container>
      <StyledLink to="/">
        <h3>Classync</h3>
      </StyledLink>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      <HamburgerMenu />
    </Container>
  );
};

const Container = styled.nav`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  align-items: center;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  transition: ease 0.3s;

  &:hover {
    transform: scale(0.94);
  }
`;

const LogoutButton = styled.button`
  font-size: 1.4rem;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  transition: ease 0.3s;

  &:hover {
    transform: scale(0.94);
  }
`;