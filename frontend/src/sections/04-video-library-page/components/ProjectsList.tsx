import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../../store/projectStore';
import { Project } from './Project';
import { CreateProject } from './CreateProject';
import styled from 'styled-components';
import { Loader } from '../../../global-components/loader';
import { useUserStore } from '../../../store/userStore';
import { MediaQueries } from '../../../themes/mediaQueries';

export const ProjectsList = () => {
  const { classId } = useParams();
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const user = useUserStore((state) => state.user);
  const userRole = user?.role;

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
      <CreateWrapper>{userRole === 'teacher' && <CreateProject />}</CreateWrapper>
    </Container>
  );
};

// STYLED COMPONENTS

const Container = styled.div`
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
  height: 100dvh;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const CreateWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;