import styled from "styled-components"
import { Link } from "react-router-dom"
import { HamburgerMenu } from "./Burger"
import { MediaQueries } from "../../../themes/mediaQueries"

interface MobileProps {
  user: any
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
}: MobileProps) => (
  <>
    <MobileMenuToggle>
      {isLoggedIn && (
        <UserProfile>
          <img
            src={user?.profileImage}
            alt={`${user?.name || "User"} profile`}
          />
        </UserProfile>
      )}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
      />
    </MobileMenuToggle>

    <MobileNav
      $isOpen={isMenuOpen}
      aria-label="Mobile Main Navigation"
    >
      <NavMenu>
        <NavMenuItem>
          <NavLinkItem
            to="/"
            onClick={toggleMenu}
          >
            Home
          </NavLinkItem>
        </NavMenuItem>

        {user?.role === "teacher" && (
          <NavMenuItem>
            <NavLinkItem
              to="/teachersPage"
              onClick={toggleMenu}
            >
              Teacher Dashboard
            </NavLinkItem>
          </NavMenuItem>
        )}

        {isLoggedIn ? (
          <>
            <NavMenuItem>
              <NavLinkItem
                to="/library"
                onClick={toggleMenu}
              >
                Library
              </NavLinkItem>
            </NavMenuItem>
            <NavMenuItem>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </NavMenuItem>
          </>
        ) : (
          <NavMenuItem>
            <NavLinkItem
              to="/login"
              onClick={toggleMenu}
            >
              Login
            </NavLinkItem>
          </NavMenuItem>
        )}

        <NavMenuItem>
          <ThemeToggleButton onClick={toggleTheme}>
            Toggle Theme
          </ThemeToggleButton>
        </NavMenuItem>
      </NavMenu>
    </MobileNav>
  </>
)

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
  transform: ${({ $isOpen }) =>
    $isOpen ? "translateY(0)" : "translateY(-100%)"};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};

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

  &:hover {
    transform: scale(0.94);
  }
`

const LogoutButton = styled.button`
  font-size: 18px;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    transform: scale(0.94);
  }
`

const UserProfile = styled.div`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ThemeToggleButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.97);
  }
`
