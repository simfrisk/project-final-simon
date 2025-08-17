import { useEffect } from "react";
import { Navigation } from "../../global-components/Navigation";
import { useProjectStore } from "../../store/projectStore";
import styled from "styled-components";

import { SmallButton } from "../../global-components/buttons";
import { TeacherProjectCard } from "./components/TeacherProjectCard";
import { TeachersSideMenu } from "./components/TeachersSideMenu";
import { useEditingStore } from "../../store/editStore";
import { useClassStore } from "../../store/classStore";
import { MediaQueries } from "../../themes/mediaQueries";

export const TeachersPage = () => {
  const projects = useProjectStore((state) => state.projects);
  const fetchProjectsWithComments = useProjectStore((state) => state.fetchProjectsWithComments);
  
  const currentClassId = useEditingStore((state) => state.currentClassId);
  const setCurrentClassId = useEditingStore((state) => state.setCurrentClassId);
  
  const classes = useClassStore((state) => state.classes);
  const fetchClasses = useClassStore((state) => state.fetchClasses);

  // Fetch on page load
useEffect(() => {
  fetchClasses();
  fetchProjectsWithComments();
}, []);

// useEffect(() => {
//   console.log("Classes in store:", classes);
// }, [classes]);

// useEffect(() => {
//   console.log("Projects in store:", projects);
// }, [projects]);

  const filteredProjects = projects
    .filter(project => project.classId === currentClassId) 
    .filter(project =>
      Array.isArray(project.comments) &&
      project.comments.some(
        comment => comment.commentType === "question" && comment.isChecked === false
      )
    );

 const classesWithUncheckedComments = classes.filter(cls => {
  const projectsInClass = projects.filter(project => project.classId === cls._id);
  const uncheckedCommentsCount = projectsInClass.reduce((count, project) => {
    const unchecked = (project.comments ?? []).filter(comment => !comment.isChecked);
    return count + unchecked.length;
  }, 0);
  return uncheckedCommentsCount > 0;
});

  const handleClassFetch = (id: string) => setCurrentClassId(id);

  return (
    <>
      <Navigation />

      <DashboardLayout>
       <TeachersSideMenu classesCount={classesWithUncheckedComments} />

        <MainContent>
          <PageTitle>Teachers Dashboard</PageTitle>

          <ClassSelect
            value={currentClassId || ""}
            onChange={(e) => handleClassFetch(e.target.value)}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.classTitle}
              </option>
            ))}
          </ClassSelect>

          <ActionBar>
            <SmallButton text="Projects" />
            <SmallButton text="All comments" />
            <SmallButton text="Messages" />
          </ActionBar>

          <ProjectsList>
            {filteredProjects.map(({ _id, projectName, projectDescription, thumbnail, comments }) => {
              const questionComments = (comments ?? []).filter(
                comment => comment.commentType === "question" && !comment.isChecked
              );

              return (
                <TeacherProjectCard
                  key={_id ?? ""}
                  projectId={_id ?? ""}
                  projectName={projectName}
                  projectDescription={projectDescription}
                  thumbnail={thumbnail}
                  comments={questionComments}
                />
              );
            })}
          </ProjectsList>
        </MainContent>
      </DashboardLayout>
    </>
  );
};

// Styled Components
const PageTitle = styled.h2`
  text-align: center;
  margin-top: 40px;
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
  transition: border-color 0.3s, box-shadow 0.3s;

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: rgba(0, 0, 0, 0.14);
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DashboardLayout = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  @media ${MediaQueries.biggerSizes} {
    margin-top: 48px;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center; 
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
`;