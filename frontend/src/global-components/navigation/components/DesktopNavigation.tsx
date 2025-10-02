import { useState } from "react"
import styled from "styled-components"
import { Link, useLocation } from "react-router-dom"
import { MediaQueries } from "../../../themes/mediaQueries"
import { WorkspaceSelector } from "./WorkspaceSelector"

interface User {
  role?: string
  name?: string
  profileImage?: string
}

interface DesktopProps {
  user: User | null
  isLoggedIn: boolean
  toggleTheme: () => void
  handleLogout: () => void
}

export const DesktopNavigation = ({
  user,
  isLoggedIn,
  toggleTheme,
  handleLogout,
}: DesktopProps) => {
  const location = useLocation()
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false)

  return (
    <DesktopNav
      aria-label="Desktop Main Navigation"
      role="navigation"
    >
      <ThemeToggleButton
        onClick={toggleTheme}
        aria-label="Toggle between light and dark theme"
        aria-pressed={false}
      >
        Toggle Theme
      </ThemeToggleButton>

      <NavMenu
        role="menubar"
        aria-label="Main navigation menu"
      >
        {user?.role === "teacher" && (
          <NavMenuItem role="none">
            <NavLinkItem
              to="/teachers"
              role="menuitem"
              aria-current={location.pathname === "/teachers" ? "page" : undefined}
              aria-label="Access teachers dashboard and tools"
            >
              Teachers Dashboard
            </NavLinkItem>
          </NavMenuItem>
        )}

        {isLoggedIn ? (
          <>
            <NavMenuItem role="none">
              <NavLinkItem
                to="/library"
                role="menuitem"
                aria-current={location.pathname === "/library" ? "page" : undefined}
                aria-label="Access video library and courses"
              >
                Library
              </NavLinkItem>
            </NavMenuItem>

            <UserProfileContainer>
              <UserProfile
                onClick={(e) => {
                  e.preventDefault()
                  setShowWorkspaceSelector(!showWorkspaceSelector)
                }}
              >
                <img
                  src={user?.profileImage}
                  alt={`${user?.name || "User"} profile picture`}
                  aria-hidden="true"
                />
              </UserProfile>
              {showWorkspaceSelector && (
                <WorkspaceSelector onClose={() => setShowWorkspaceSelector(false)} />
              )}
            </UserProfileContainer>

            <NavMenuItem role="none">
              <LogoutButton
                onClick={handleLogout}
                role="menuitem"
                aria-label="Sign out of your account"
              >
                Logout
              </LogoutButton>
            </NavMenuItem>
          </>
        ) : (
          <NavMenuItem role="none">
            <NavLinkItem
              to="/login"
              role="menuitem"
              aria-current={location.pathname === "/login" ? "page" : undefined}
              aria-label="Sign in to your account"
            >
              Login
            </NavLinkItem>
          </NavMenuItem>
        )}
      </NavMenu>
    </DesktopNav>
  )
}

const DesktopNav = styled.nav`
  display: none;
  align-items: center;
  gap: 20px;

  @media ${MediaQueries.biggerSizes} {
    display: flex;
  }
`

const NavMenu = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  padding: 0;
  margin: 0;
`

const NavMenuItem = styled.li``

const NavLinkItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: transform 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    transform: scale(0.94);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    border-radius: 4px;
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
  padding: 8px 12px;
  border-radius: 4px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(0.94);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    border-radius: 4px;
  }
`

const UserProfileContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const UserProfile = styled.button`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  transition: transform 0.3s ease;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;

  &:hover {
    transform: scale(0.92);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }

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

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    border-radius: 6px;
  }

  @media ${MediaQueries.biggerSizes} {
    background: transparent;
    color: white;
    font-weight: normal;
    font-size: 18px;
    padding: 0;
  }
`
