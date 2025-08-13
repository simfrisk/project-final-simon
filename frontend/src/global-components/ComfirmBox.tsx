import { MediaQueries } from "../themes/mediaQueries";
import styled from "styled-components";
import { useEditingStore } from "../store/editStore";
import { useProjectStore } from "../store/projectStore";

export const ComfirmBox = () => {

  const setIsRemovingProject = useEditingStore((state) => state.setIsRemovingProject);
  const projectId = useEditingStore((state) => state.removingProjectId);
  const deleteProject = useProjectStore((state) => state.deleteProject)

  const handlCancel = () => setIsRemovingProject(false);

const handelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
  if (!projectId) return; // early exit if null
  deleteProject(projectId);
  setIsRemovingProject(false);
};

 return (
    <FormContainer>
      <h3>Are you sure you want to delete?</h3>
      <Wrapper>
        <CancelBtn onClick={handlCancel}>Cancel</CancelBtn>
        <RemoveBtn onClick={handelDelete}>Remove</RemoveBtn>
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