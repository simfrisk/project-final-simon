import styled from "styled-components"

export const CircleCheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
`

export const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  display: none;
`

export const StyledCircle = styled.span<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid #333;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  background: ${({ $checked }) => ($checked ? "#607491ff;" : "transparent")};
  border-color: ${({ $checked }) => ($checked ? "#607491ff" : "#333")};

  &::after {
    content: "";
    display: ${({ $checked }) => ($checked ? "block" : "none")};
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -60%) rotate(45deg);
  }
`
