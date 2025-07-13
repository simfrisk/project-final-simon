import { Link } from "react-router";
import styled from "styled-components";
import { MediaQueries } from "../themes/mediaQueries";

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
color: white;
padding: 22px 35px;
border-radius: 35px;
font-size: 1rem;
border: none;
transition: ease .3s;

@media ${MediaQueries.biggerSizes} {
  font-size: 1.2rem;
}

&:hover {
  scale: .95;
  background-color: ${({ theme }) => theme.colors.secondaryHover};
}

`