import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { DesktopNavigation } from "./components/DesktopNavigation"
import { MobileNavigation } from "./components/MobileNavigation"
import { useUserStore } from "../../store/userStore"
import { useThemeStore } from "../../store/themeStore"
import { MediaQueries } from "../../themes/mediaQueries"

export const Navigation = () => {
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const logout = useUserStore((state) => state.logout)
  const navigate = useNavigate()
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  return (
    <NavHeader>
      <LogoLink
        to="/"
        aria-label="Classync Home"
      >
        <h1>Classync</h1>
        <span>Beta</span>
      </LogoLink>

      <DesktopNavigation
        user={user}
        isLoggedIn={isLoggedIn}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />

      <MobileNavigation
        user={user}
        isLoggedIn={isLoggedIn}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />
    </NavHeader>
  )
}

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
