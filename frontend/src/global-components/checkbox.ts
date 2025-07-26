import styled from 'styled-components';

export const CircleCheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
`;

export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

export const StyledCircle = styled.span<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid #333;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: background 0.2s ease;

  background: ${({ $checked }) => ($checked ? '#333' : 'transparent')};

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
  }
`;