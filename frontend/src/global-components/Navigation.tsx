import styled from "styled-components";
import { HamburgerMenu } from "../sections/01-lading-page/components/nav/components/Burger";
import { useUserStore } from "../store/userStore";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MediaQueries } from "../themes/mediaQueries";
import { useThemeStore } from "../store/themeStore";

interface MenuProps {
  isOpen: boolean;
}

export const Navigation = () => {
  const { logout } = useUserStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  const handleLogout = (): void => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <Container>
      <StyledLink to="/">
        <h3>Classync</h3>
      </StyledLink>

      <DesktopMenu>
        <ToggleThemeButton onClick={toggleTheme}>Toggle Theme</ToggleThemeButton>

        {isLoggedIn ? (
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        ) : (
          <StyledNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</StyledNavLink>
        )}
      </DesktopMenu>

      <HamburgerWrapper isOpen={isMenuOpen} onClick={toggleMenu}>
        <HamburgerMenu />
      </HamburgerWrapper>

      <MobileMenu isOpen={isMenuOpen}>
        {isLoggedIn ? (
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        ) : (
          <StyledNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</StyledNavLink>
        )}

        <ToggleThemeButton onClick={toggleTheme}>Toggle Theme</ToggleThemeButton>

        <StyledNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</StyledNavLink>
      </MobileMenu>
    </Container>
  );
};

const Container = styled.nav`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  height: 8vh;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
  padding: 30px 30px;
  position: relative;
  z-index: 1000;

  @media ${MediaQueries.biggerSizes} {
    height: 60px;
  }
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  transition: ease 0.3s;
  z-index: 2000;

  &:hover {
    transform: scale(0.94);
  }
`;

const StyledNavLink = styled(Link)`
  color: white;
  text-decoration: none;
  transition: ease 0.3s;

  &:hover {
    transform: scale(0.94);
  }
`;

const LogoutButton = styled.button`
  font-size: 16px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  transition: ease 0.3s;

  &:hover {
    transform: scale(0.94);
  }
`;

const DesktopMenu = styled.div`
  display: none;
  align-items: center;
  gap: 20px;

  @media ${MediaQueries.biggerSizes} {
    display: flex;
  }
`;

const HamburgerWrapper = styled.div<MenuProps>`
  display: block;
  z-index: 2000;

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`;

const MobileMenu = styled.div<MenuProps>`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 8dvh;
  right: 0;
  width: 100dvw;
  height: 92dvh;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  padding-top: 40px;
  z-index: 10;

  transition: transform 0.3s ease, opacity 0.5s ease;
  overflow: hidden;

  transform: ${({ isOpen }) => (isOpen ? "translateY(0)" : "translateY(-100%)")};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }

  a, button {
    margin-bottom: 10px;
  }
`;

const ToggleThemeButton = styled.button`
  position: fixed;
  right: 10px;
  bottom: 10px;
  margin: 20px;
  padding: 10px 16px;
  color: #000000;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: ease 0.3s;

  &:hover {
    transform: scale(0.97);
  }

  @media ${MediaQueries.biggerSizes} {
    position: static;
  }
`;