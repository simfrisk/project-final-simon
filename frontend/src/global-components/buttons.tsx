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
background-color: ${({ theme }) => theme.colors.primary};
color: ${({ theme }) => theme.colors.background};
height: 50px;
width: 100px;
border-radius: 10px;
font-size: 1rem;
border: none;
transition: ease .3s;

&:hover {
  scale: .95;
  background-color: ${({ theme }) => theme.colors.primaryHover};
}

`