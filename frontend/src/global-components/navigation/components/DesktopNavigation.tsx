import styled from "styled-components"
import { Link } from "react-router-dom"
import { MediaQueries } from "../../../themes/mediaQueries"

interface DesktopProps {
  user: any
  isLoggedIn: boolean
  toggleTheme: () => void
  handleLogout: () => void
}

export const DesktopNavigation = ({
  user,
  isLoggedIn,
  toggleTheme,
  handleLogout,
}: DesktopProps) => (
  <DesktopNav aria-label="Desktop Main Navigation">
    <ThemeToggleButton onClick={toggleTheme}>Toggle Theme</ThemeToggleButton>
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
          <UserProfile>
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
          <NavLinkItem to="/login">Login</NavLinkItem>
        </NavMenuItem>
      )}
    </NavMenu>
  </DesktopNav>
)

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
