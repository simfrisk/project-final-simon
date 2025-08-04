import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../../store/projectStore';
import { Project } from './Project';
import { CreateProject } from './CreateProject';
import { CreateClass } from './CreateClass';
import styled from 'styled-components';
import { Loader } from '../../../global-components/loader';
import { useUserStore } from '../../../store/userStore';
import { MediaQueries } from '../../../themes/mediaQueries';
import { useEditingStore } from '../../../store/editStore';

export const ProjectsList = () => {
  const { classId } = useParams();
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const user = useUserStore((state) => state.user);
  const userRole = user?.role;

  const isEditingClass = useEditingStore((state) => state.isEditingClass);
  const isEditingProject = useEditingStore((state) => state.isEditingProject);
  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass);
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject);

  const handleTransparentBackground = () => {
    setIsEditingClass(false)
    setIsEditingProject(false)
  }

  useEffect(() => {
    if (classId) {
      fetchProjects(classId);
    }
  }, [fetchProjects, classId]);

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
        <h2>Class Title</h2> {/* Replace with actual class title if available */}
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
        {(isEditingClass || isEditingProject) && (
      <TransparentBackground onClick={handleTransparentBackground}>
        <CreateWrapper onClick={(e) => e.stopPropagation()}>
          {userRole === 'teacher' && isEditingClass && <CreateClass />}
          {userRole === 'teacher' && isEditingProject && <CreateProject />}
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
  flex-wrap: wrap;
  gap: 24px;
  padding: 0 20px;
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
  justify-content: center;
  width: 100%;
`;

const TransparentBackground = styled.div `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 2, 2, 0.621); 
  z-index: 10; 
`

const CreateWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000; /* Make sure it's on top of other elements */
`;