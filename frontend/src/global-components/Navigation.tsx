import styled from "styled-components"
import { HamburgerMenu } from "../sections/01-lading-page/components/nav/components/Burger"
import { useUserStore } from "../store/userStore"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { MediaQueries } from "../themes/mediaQueries"
import { useThemeStore } from "../store/themeStore"

interface NavProps {
  $isOpen: boolean
}

export const Navigation = () => {
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const logout = useUserStore((state) => state.logout)

  const handleLogout = (): void => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  const toggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev)
  }

  return (
    <NavHeader>
      <LogoLink
        to="/"
        aria-label="Classync Home"
      >
        <h1>Classync</h1>
        <span>Beta</span>
      </LogoLink>

      <DesktopNavigation aria-label="Desktop Main Navigation">
        <ThemeToggleButton
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          Toggle Theme
        </ThemeToggleButton>

        <NavMenu>
          {user?.role === "teacher" && (
            <NavMenuItem>
              <NavLinkItem to="/teachersPage">Teachers Dashboard</NavLinkItem>
            </NavMenuItem>
          )}

          {isLoggedIn ? (
            <>
              <NavMenuItem>
                <NavLinkItem to="/library">Library</NavLinkItem>
              </NavMenuItem>
              <UserProfile aria-label="User Profile">
                <img
                  src={user?.profileImage}
                  alt={`${user?.name || "User"} profile`}
                />
              </UserProfile>
              <NavMenuItem>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              </NavMenuItem>
            </>
          ) : (
            <NavMenuItem>
              <NavLinkItem
                to="/login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </NavLinkItem>
            </NavMenuItem>
          )}
        </NavMenu>
      </DesktopNavigation>

      <MobileMenuToggle $isOpen={isMenuOpen}>
        {isLoggedIn && (
          <UserProfile aria-label="User Profile">
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

      <MobileNavigation
        $isOpen={isMenuOpen}
        aria-label="Mobile Main Navigation"
      >
        <NavMenu>
          <NavMenuItem>
            <NavLinkItem
              to="/"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLinkItem>
          </NavMenuItem>

          {user?.role === "teacher" && (
            <NavMenuItem>
              <NavLinkItem
                to="/teachersPage"
                onClick={() => setIsMenuOpen(false)}
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
                  onClick={() => setIsMenuOpen(false)}
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
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </NavLinkItem>
            </NavMenuItem>
          )}

          <NavMenuItem>
            <ThemeToggleButton
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              Toggle Theme
            </ThemeToggleButton>
          </NavMenuItem>
        </NavMenu>
      </MobileNavigation>
    </NavHeader>
  )
}

/* Styled Components */
const NavHeader = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  position: relative;
  z-index: 1000;
  height: 8vh;

  @media ${MediaQueries.biggerSizes} {
    height: 60px;
  }
`

const LogoLink = styled(Link)`
  display: flex;
  column-gap: 7px;
  color: white;
  text-decoration: none;

  h1 {
    font-size: 1.5rem;
  }

  span {
    font-size: 12px;
    transform: translateY(2px);
  }

  &:hover {
    transform: scale(0.94);
  }
`

const DesktopNavigation = styled.nav`
  display: none;
  align-items: center;
  gap: 20px;

  @media ${MediaQueries.biggerSizes} {
    display: flex;
  }
`

const MobileNavigation = styled.nav<NavProps>`
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

const NavMenu = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;

  @media ${MediaQueries.biggerSizes} {
    flex-direction: row;
    align-items: center;
  }
`

const NavMenuItem = styled.li``

const NavLinkItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.94);
  }

  @media ${MediaQueries.biggerSizes} {
    padding: 0 20px;
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

const MobileMenuToggle = styled.div<NavProps>`
  display: flex;
  align-items: center;
  column-gap: 20px;
  z-index: 2000;

  @media ${MediaQueries.biggerSizes} {
    display: none;
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

  @media ${MediaQueries.biggerSizes} {
    background: transparent;
    color: white;
    font-weight: normal;
    font-size: 18px;
    padding: 0;
  }
`
