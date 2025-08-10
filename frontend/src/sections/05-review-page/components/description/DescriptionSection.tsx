import styled from 'styled-components';
import { useProjectStore } from '../../../../store/projectStore';

export const DescriptionSection = () => {

    const project = useProjectStore((state) => state.project);
  
    if (!project) return null; // or show a loading indicator

  return (
    <CommentListContainer>
      <h3>{project.projectName}</h3>
      <p>{project.projectDescription}</p>
    </CommentListContainer>
    
  );
};

const CommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  width: 100%;
  background-color: ${({theme}) => theme.colors.offBackground};
`;

