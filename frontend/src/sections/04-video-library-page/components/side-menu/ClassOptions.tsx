import styled from "styled-components";
import { useEditingStore } from "../../../../store/editStore";
import { useClassStore } from "../../../../store/classStore";
import { ConfirmBox } from "../../../../global-components/ComfirmBox";

export const ClassOptions = () => {

const removingClassId = useEditingStore((state) => state.removingClassId);
const setIsRemovingClass = useEditingStore((state) => state.setIsRemovingClass);
const deleteClass = useClassStore((state) => state.deleteClass);

const handelDeleteClass = () => {
  if (removingClassId) {
    deleteClass(removingClassId);
    setIsRemovingClass(false);
  }
};

const handleCancel = () => {
    setIsRemovingClass(false);
  };

  return (
    <>
      <TransparentBackground onClick={handleCancel} />
       <Container>
        <StyledButton>Edit name</StyledButton>
        <StyledButton danger onClick={handelDeleteClass}>Delete Class</StyledButton>
      </Container>
      <ConfirmBox      
      message={"Are you sure you want to delete?"} 
      onCancel={handleCancel} 
      onConfirm={handelDeleteClass}  />
      
    </>
  )
};

interface StyledButtonProps {
  danger?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #c7c7c7;
  position: absolute;
  padding: 5px 10px;
  border-radius: 15px;
  border: none;
  z-index: 10;

  top: 25%;
  right: 79%;
  `

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ danger, theme }) => (danger ? "red" : theme.colors.primary)};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 40px;
  width: 100%;
  margin: 5px auto;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ danger, theme }) => (danger ? "#f1948a" : theme.colors.primaryHover)};
    transform: scale(0.98);
  }
`;

const TransparentBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 2, 2, 0.621);
  z-index: 10;
`;