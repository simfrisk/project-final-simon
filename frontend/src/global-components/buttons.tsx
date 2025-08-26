import { Link } from "react-router"
import styled from "styled-components"
import { MediaQueries } from "../themes/mediaQueries"

interface MainButtonProps {
  text: string
  url?: string
}

// MainButton component
export const MainButton: React.FC<MainButtonProps> = ({ text, url }) => {
  const button = <MainStyledButton>{text}</MainStyledButton>
  return url ? <Link to={url}>{button}</Link> : button
}

// SmallButton component
export const SmallButton: React.FC<MainButtonProps> = ({ text, url }) => {
  const button = <SmallStyledButton>{text}</SmallStyledButton>
  return url ? <Link to={url}>{button}</Link> : button
}

// Styled components
const MainStyledButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 22px 35px;
  border-radius: 35px;
  font-size: 1rem;
  border: none;
  transition: all ease 0.3s;
  box-shadow: 0 4px 15px rgba(22, 106, 240, 0.3);
  position: relative;
  overflow: hidden;

  @media ${MediaQueries.biggerSizes} {
    font-size: 1.2rem;
  }

  &:hover {
    scale: 0.95;
    box-shadow: 0 6px 20px rgba(22, 106, 240, 0.4);
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`

const SmallStyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 15px;
  border-radius: 35px;
  font-size: 0.9rem;
  border: none;
  transition: ease 0.3s;

  @media ${MediaQueries.biggerSizes} {
    font-size: 1rem;
  }

  &:hover {
    scale: 0.95;
    background-color: ${({ theme }) => theme.colors.primary};
  }
`
