import styled from "styled-components"

interface HamburgerMenuProps {
  isOpen: boolean
  onToggle: () => void
}

export const HamburgerMenu = ({ isOpen, onToggle }: HamburgerMenuProps) => {
  return (
    <Hamburger
      onClick={onToggle}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      role="button"
    >
      <Bar
        open={isOpen}
        $index={1}
      />
      <Bar
        open={isOpen}
        $index={2}
      />
      <Bar
        open={isOpen}
        $index={3}
      />
    </Hamburger>
  )
}

interface BarProps {
  open: boolean
  $index: number
}

const Hamburger = styled.div`
  width: 30px;
  height: 22px;
  position: relative;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: scale(0.92);
  }
`

const Bar = styled.span<BarProps>`
  display: block;
  width: 100%;
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: 0.3s ease;
  transform-origin: ${({ $index }) =>
    $index === 1 ? "top left" : $index === 3 ? "bottom left" : "center"};

  ${({ open, $index }) => {
    if ($index === 1) return `transform: ${open ? "rotate(45deg)" : "none"};`
    if ($index === 2) return `opacity: ${open ? 0 : 1};`
    if ($index === 3) return `transform: ${open ? "rotate(-45deg)" : "none"};`
  }}
`
