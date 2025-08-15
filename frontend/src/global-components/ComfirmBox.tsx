import { MediaQueries } from "../themes/mediaQueries";
import styled from "styled-components";

// Props for the ConfirmBox
type ConfirmBoxProps = {
  message?: string;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: () => void;
};

export const ConfirmBox = ({ 
  message, 
  onCancel, 
  onConfirm
}: ConfirmBoxProps) => {

 return (
    <FormContainer>
      <h3>{message}</h3>
      <Wrapper>
        <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        <RemoveBtn onClick={onConfirm}>Remove</RemoveBtn>
      </Wrapper>
    </FormContainer>
  );
};

// Styles
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  width: 92vw;
  background-color: ${({theme}) => theme.colors.offBackground};
  border-radius: 10px;
  padding: 20px;
  text-align: center;
   z-index: 200;

  @media ${MediaQueries.biggerSizes} {
    width: 500px;
  }
`;

const Wrapper = styled.div `
  display: flex;
  width: 100%;
  column-gap: 10px;
`

const CancelBtn = styled.button`
  height: 40px;
  width: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  border: none;
  transition: ease 0.3s;
  color: white;

  &:hover {
    transform: scale(0.96);
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const RemoveBtn = styled.button`
  height: 40px;
  width: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  border: none;
  transition: ease 0.3s;
  background-color: #a61818;
  color: white;

  &:hover {
    transform: scale(0.96);
    background-color: #c51d1d;
  }
`;