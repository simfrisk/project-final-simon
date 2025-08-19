import styled from "styled-components"
import { useState } from "react"

export const HamburgerMenu = () => {
  const [open, setOpen] = useState(false)

  return (
    <Hamburger onClick={() => setOpen(!open)}>
      <Bar open={open} />
      <Bar open={open} />
      <Bar open={open} />
    </Hamburger>
  )
}

interface BarProps {
  open: boolean
}

const Hamburger = styled.div`
  width: 30px;
  height: 22px;
  position: relative;
  cursor: pointer;
  z-index: 1000;
  transition: ease 0.3s;

  &:hover {
    transform: scale(0.92);
  }
`

const Bar = styled.span<BarProps>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: 0.3s ease;

  &:nth-child(1) {
    top: 0;
    transform-origin: top left;
    transform: ${({ open }) => (open ? "rotate(45deg)" : "none")};
  }

  &:nth-child(2) {
    top: 9.5px;
    opacity: ${({ open }) => (open ? 0 : 1)};
  }

  &:nth-child(3) {
    bottom: 0;
    transform-origin: bottom left;
    transform: ${({ open }) => (open ? "rotate(-45deg)" : "none")};
  }
`
