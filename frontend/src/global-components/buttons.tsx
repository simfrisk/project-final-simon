import { Link } from "react-router";
import styled from "styled-components";
import { MediaQueries } from "../themes/mediaQueries";

interface MainButtonProps {
  text: string;
  url?: string;
}

// MainButton component
export const MainButton: React.FC<MainButtonProps> = ({ text, url }) => {
  const button = <MainStyledButton>{text}</MainStyledButton>;
  return url ? <Link to={url}>{button}</Link> : button;
};

// SmallButton component
export const SmallButton: React.FC<MainButtonProps> = ({ text, url }) => {
  const button = <SmallStyledButton>{text}</SmallStyledButton>;
  return url ? <Link to={url}>{button}</Link> : button;
};

// Styled components
const MainStyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  padding: 22px 35px;
  border-radius: 35px;
  font-size: 1rem;
  border: none;
  transition: ease 0.3s;

  @media ${MediaQueries.biggerSizes} {
    font-size: 1.2rem;
  }

  &:hover {
    scale: 0.95;
    background-color: ${({ theme }) => theme.colors.secondaryHover};
  }
`;

const SmallStyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background};
  color: black;
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
`;