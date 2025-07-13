import { Link } from "react-router";
import styled from "styled-components";

interface MainButtonProps {
  text: string;
  url: string;
}

export const MainButton: React.FC<MainButtonProps> = ({ text, url }) => {
  return (
    <Link to={url}>
      <Button>{text}</Button>
    </Link>
  );
};

const Button = styled.button `
background-color: ${({ theme }) => theme.colors.secondary};
color: ${({ theme }) => theme.colors.background};
padding: 22px 35px;
border-radius: 35px;
font-size: 1.2rem;
border: none;
transition: ease .3s;

&:hover {
  scale: .95;
  background-color: ${({ theme }) => theme.colors.secondaryHover};
}

`