import styled from "styled-components";
import { HamburgerMenu } from "../sections/01-lading-page/components/nav/components/Burger";
import { useUserStore } from "../store/userStore";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MediaQueries } from "../themes/mediaQueries";
import { useThemeStore } from "../store/themeStore";

interface MenuProps {
  $isOpen: boolean;
}

export const Navigation = () => {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const logout = useUserStore((state) => state.logout);

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
        <p>Beta</p>
      </StyledLink>

      <DesktopMenu>
        <ToggleThemeButton onClick={toggleTheme}>Toggle Theme</ToggleThemeButton>

        {user?.role === "teacher" && (
          <StyledNavLink to="/teachersPage">Teachers Dashboard</StyledNavLink>
        )}

        {isLoggedIn ? (
           <>
              <StyledNavLink to="/library">Library</StyledNavLink>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </>
        ) : (
          <StyledNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</StyledNavLink>
        )}
      </DesktopMenu>

      <HamburgerWrapper $isOpen={isMenuOpen} onClick={toggleMenu}>
        <HamburgerMenu />
      </HamburgerWrapper>

      <MobileMenu $isOpen={isMenuOpen}>
        
        <StyledNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</StyledNavLink>

       {user?.role === "teacher" && (
        <StyledNavLink to="/teachersPage" onClick={() => setIsMenuOpen(false)}>
          Teacher Dashboard
        </StyledNavLink>
        )}

        {isLoggedIn ? (
          <>
            <StyledNavLink to="/library">Library</StyledNavLink>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </>
        ) : ( 
            <StyledNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</StyledNavLink>
         
        )}


        <ToggleThemeButton onClick={toggleTheme}>Toggle Theme</ToggleThemeButton>
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
  display: flex;
  column-gap: 7px;
  color: white;
  text-decoration: none;
  transition: ease 0.3s;
  z-index: 2000;

  &:hover {
    transform: scale(0.94);
  }

  p {
    font-size: 12px;
    transform: translateY(2px);
  }
`;

const StyledNavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: white;
  text-decoration: none;
  transition: ease 0.3s;
  padding: 0; /* remove any default padding */
  border: none; /* just in case */
  background: none;
  font-size: 18px;

  &:hover {
    transform: scale(0.94);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 0 20px;
  }
`;

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  font-size: 18px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  transition: ease 0.3s;
  padding: 0;
  font-family: inherit; /* to match link font */
  
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
  align-items: flex-start;
  padding-top: 50px;
  padding-left: 30px;
  z-index: 10;

  transition: transform 0.3s ease, opacity 0.5s ease;
  overflow: hidden;

    transform: ${({ $isOpen }) => ($isOpen ? "translateY(0)" : "translateY(-100%)")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }

  a, button {
    margin-bottom: 10px;
  }
`;

const ToggleThemeButton = styled.button`
  position: fixed;
  left: 10px;
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
    margin: 0;
  }
`;