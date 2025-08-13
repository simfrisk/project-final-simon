import { useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import styled from 'styled-components';

import { useProjectStore } from '../../../store/projectStore';
import { useUserStore } from '../../../store/userStore';
import { useEditingStore } from '../../../store/editStore';
import { useClassStore } from '../../../store/classStore';

import { Project } from './Project';
import { CreateProject } from './CreateProject';
import { CreateClass } from './CreateClass';
import { Loader } from '../../../global-components/loader';
import { MediaQueries } from '../../../themes/mediaQueries';
import { ComfirmBox } from '../../../global-components/ComfirmBox';

type Class = {
  _id: string;
  classTitle: string;
};

type OutletContextType = {
  classId?: string;
  classes: Class[];
  handleClassChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const ProjectsList = () => {
  const { classId } =
    useOutletContext<OutletContextType>();

  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);

  const user = useUserStore((state) => state.user);
  const userRole = user?.role;

  const isEditingClass = useEditingStore((state) => state.isEditingClass);
  const isEditingProject = useEditingStore((state) => state.isEditingProject);
  const isRemovingProject = useEditingStore((state) => state.isRemovingProject);
  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass);
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject);
  const setIsRemovingProject = useEditingStore((state) => state.setIsRemovingProject);


  const fetchClassById = useClassStore((state) => state.fetchClassById);
  const currentClass = useClassStore((state) => state.class);

  useEffect(() => {
    if (classId) {
      fetchProjects(classId);
      fetchClassById(classId);
    }
  }, [fetchProjects, fetchClassById, classId]);

  const handleTransparentBackground = () => {
    setIsEditingClass(false);
    setIsEditingProject(false);
    setIsRemovingProject(false);
  };

  const handleEditClass = () => setIsEditingClass(true);
  const handleEditProject = () => setIsEditingProject(true);

  if (loading) {
    return (
      <LoadingContainer>
        <h3>Loading projects</h3>
        <Loader />
      </LoadingContainer>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <Container>
      <HeaderWrapper>
        <ClassTitle>{currentClass?.classTitle ?? 'Loading class title...'}</ClassTitle>

        {userRole === 'teacher' && (
        <ButtonContainer>
          <StyledButton type="button" onClick={handleEditClass}>
            + Class
          </StyledButton>
          <StyledButton type="button" onClick={handleEditProject}>
            + Project
          </StyledButton>
        </ButtonContainer>)}
      </HeaderWrapper>

      <ProjectWrapper>
        {projects.map(({ _id, projectName, projectDescription, thumbnail }) => (
          <Project
            key={_id}
            projectId={_id ?? ''}
            projectName={projectName}
            projectDescription={projectDescription}
            thumbnail={thumbnail}
          />
        ))}
      </ProjectWrapper>

      {(isEditingClass || isEditingProject || isRemovingProject) && (
        <TransparentBackground onClick={handleTransparentBackground}>
          <CreateWrapper onClick={(e) => e.stopPropagation()}>
            {userRole === 'teacher' && isEditingClass && <CreateClass />}
            {userRole === 'teacher' && isEditingProject && <CreateProject />}
            {userRole === 'teacher' && isRemovingProject && <ComfirmBox />}
          </CreateWrapper>
        </TransparentBackground>
      )}
      
    </Container>
  );
};

// STYLED COMPONENTS

const Container = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 24px;
  padding: 72px 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  
`;

const ProjectWrapper = styled.div`
  display: grid;
  width: 100%;
  gap: 25px;
  justify-content: center;
  box-sizing: border-box;
  grid-template-columns: 1fr;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media ${MediaQueries.widescreen} {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80dvh;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    width: 80%;
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
`;

const ClassTitle = styled.h2 `
display: none;

@media ${MediaQueries.biggerSizes} {
  display: block;
}
`

const ButtonContainer = styled.div`
  @media ${MediaQueries.biggerSizes} {
    display: none;
  }`;

const StyledButton = styled.button`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 40px;
  margin: 10px 4px;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
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

const CreateWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;