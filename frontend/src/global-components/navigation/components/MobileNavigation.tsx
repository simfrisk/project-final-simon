import styled from "styled-components"
import { Link, useLocation } from "react-router-dom"
import { HamburgerMenu } from "./Burger"
import { MediaQueries } from "../../../themes/mediaQueries"

interface User {
  role?: string
  name?: string
  profileImage?: string
}

interface MobileProps {
  user: User | null
  isLoggedIn: boolean
  isMenuOpen: boolean
  toggleMenu: () => void
  toggleTheme: () => void
  handleLogout: () => void
}

export const MobileNavigation = ({
  user,
  isLoggedIn,
  isMenuOpen,
  toggleMenu,
  toggleTheme,
  handleLogout,
}: MobileProps) => {
  const location = useLocation()

  return (
    <>
      <MobileMenuToggle>
        {isLoggedIn && user?.role === "teacher" && (
          <UserProfile to="/admin/users">
            <img
              src={user?.profileImage}
              alt={`${user?.name || "User"} profile picture`}
              aria-hidden="true"
            />
          </UserProfile>
        )}
        <HamburgerMenu
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle mobile navigation menu"
          aria-controls="mobile-nav-menu"
        />
      </MobileMenuToggle>

      <MobileNav
        $isOpen={isMenuOpen}
        aria-label="Mobile Main Navigation"
        role="navigation"
        id="mobile-nav-menu"
      >
        <NavMenu
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <NavMenuItem role="none">
            <NavLinkItem
              to="/"
              onClick={toggleMenu}
              role="menuitem"
              aria-current={location.pathname === "/" ? "page" : undefined}
              aria-label="Return to homepage"
              tabIndex={isMenuOpen ? 0 : -1}
            >
              Home
            </NavLinkItem>
          </NavMenuItem>

          {user?.role === "teacher" && (
            <NavMenuItem role="none">
              <NavLinkItem
                to="/teachers"
                onClick={toggleMenu}
                role="menuitem"
                aria-current={location.pathname === "/teachers" ? "page" : undefined}
                aria-label="Access teachers dashboard and tools"
                tabIndex={isMenuOpen ? 0 : -1}
              >
                Teacher Dashboard
              </NavLinkItem>
            </NavMenuItem>
          )}

          {isLoggedIn ? (
            <>
              <NavMenuItem role="none">
                <NavLinkItem
                  to="/library"
                  onClick={toggleMenu}
                  role="menuitem"
                  aria-current={location.pathname === "/library" ? "page" : undefined}
                  aria-label="Access video library and courses"
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  Library
                </NavLinkItem>
              </NavMenuItem>
              <NavMenuItem role="none">
                <LogoutButton
                  onClick={handleLogout}
                  role="menuitem"
                  aria-label="Sign out of your account"
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  Logout
                </LogoutButton>
              </NavMenuItem>
            </>
          ) : (
            <NavMenuItem role="none">
              <NavLinkItem
                to="/login"
                onClick={toggleMenu}
                role="menuitem"
                aria-current={location.pathname === "/login" ? "page" : undefined}
                aria-label="Sign in to your account"
                tabIndex={isMenuOpen ? 0 : -1}
              >
                Login
              </NavLinkItem>
            </NavMenuItem>
          )}

          <NavMenuItem role="none">
            <ThemeToggleButton
              onClick={toggleTheme}
              role="menuitem"
              aria-label="Toggle between light and dark theme"
              aria-pressed={false}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              Toggle Theme
            </ThemeToggleButton>
          </NavMenuItem>
        </NavMenu>
      </MobileNav>
    </>
  )
}

const MobileNav = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 8dvh;
  right: 0;
  width: 100dvw;
  height: 92dvh;
  background-color: ${({ theme }) => theme.colors.primary};
  padding-top: 50px;
  padding-left: 30px;
  align-items: flex-start;
  z-index: 10;

  transition:
    transform 0.3s ease,
    opacity 0.5s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "translateY(0)" : "translateY(-100%)")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`

const MobileMenuToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const NavMenuItem = styled.li``

const NavLinkItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 12px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: block;
  width: 100%;

  &:hover {
    transform: scale(0.98);
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    background-color: rgba(255, 255, 255, 0.1);
  }
`

const LogoutButton = styled.button`
  font-size: 18px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 12px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: block;
  width: 100%;
  text-align: left;

  &:hover {
    transform: scale(0.98);
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    background-color: rgba(255, 255, 255, 0.1);
  }
`

const UserProfile = styled(Link)`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.92);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ThemeToggleButton = styled.button`
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  display: block;
  width: 100%;
  text-align: left;

  &:hover {
    transform: scale(0.98);
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    background-color: rgba(255, 255, 255, 0.2);
  }
`
