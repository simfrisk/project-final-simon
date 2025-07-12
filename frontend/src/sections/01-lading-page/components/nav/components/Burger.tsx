import styled from 'styled-components';
import { useState } from 'react';

export const HamburgerMenu = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Hamburger onClick={() => setOpen(!open)}>
      <Bar open={open} />
      <Bar open={open} />
      <Bar open={open} />
    </Hamburger>
  );
};

interface BarProps {
  open: boolean;
}

const Hamburger = styled.div`
  width: 30px;
  height: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  z-index: 1000;
`;

const Bar = styled.span<BarProps>`
  height: 4px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 2px;
  transition: 0.3s ease;

  &:nth-child(1) {
    transform: ${({ open }) => (open ? 'rotate(45deg) translateY(9px)' : 'none')};
  }

  &:nth-child(2) {
    opacity: ${({ open }) => (open ? 0 : 1)};
  }

  &:nth-child(3) {
    transform: ${({ open }) => (open ? 'rotate(-45deg) translateY(-9px)' : 'none')};
  }
`;