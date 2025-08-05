import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../../store/projectStore';
import { Project } from './Project';
import { CreateProject } from './CreateProject';
import { CreateClass } from './CreateClass';
import styled from 'styled-components';
import { Loader } from '../../../global-components/loader';
import { useUserStore } from '../../../store/userStore';
import { MediaQueries } from '../../../themes/mediaQueries';
import { useEditingStore } from '../../../store/editStore';
import { useClassStore } from '../../../store/classStore';

export const ProjectsList = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

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

  const fetchClassById = useClassStore((state) => state.fetchClassById);
  const currentClass = useClassStore((state) => state.class);
  const classes = useClassStore((state) => state.classes);
  const fetchClasses = useClassStore((state) => state.fetchClasses);

  const handleTransparentBackground = () => {
    setIsEditingClass(false);
    setIsEditingProject(false);
  };

  useEffect(() => {
    if (classId) {
      fetchProjects(classId);
      fetchClassById(classId);
    }
    fetchClasses();
  }, [fetchProjects, fetchClassById, fetchClasses, classId]);

  const handleEditClass = () => {
    setIsEditingClass(true);
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value;
    navigate(`/library/classes/${selectedClassId}/projects`);
  };

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
        <h2>{currentClass?.classTitle ?? 'Loading class title...'}</h2>

        <ClassSelect value={classId} onChange={handleClassChange}>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.classTitle}
            </option>
          ))}
        </ClassSelect>

        <ButtonContainer>
          <StyledButton type="button" onClick={handleEditClass}>
            + Class
          </StyledButton>
          <StyledButton type="button" onClick={handleEditProject}>
            + Project
          </StyledButton>
        </ButtonContainer>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const ButtonContainer = styled.div``;

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

const ClassSelect = styled.select`
  text-align: center;
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  width: 203px; 
  max-width: 100%;
  margin-top: 8px;
  margin-bottom: 8px;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}55;
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }

  @media ${MediaQueries.biggerSizes} {
    display: inline-block;
  }
`;