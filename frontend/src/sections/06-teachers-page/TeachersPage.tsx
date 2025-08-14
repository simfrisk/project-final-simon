import { useEffect } from "react";
import { Navigation } from "../../global-components/Navigation";
import { useProjectStore } from "../../store/projectStore";
import styled from "styled-components";

import { SmallButton } from "../../global-components/buttons";
import { TeacherProjectCard } from "./components/TeacherProjectCard";
import { TeachersSideMenu } from "./components/TeachersSideMenu";
import { useEditingStore } from "../../store/editStore";

export const TeachersPage = () => {
  const projects = useProjectStore((state) => state.projects);
  const fetchProjectsWithComments = useProjectStore((state) => state.fetchProjectsWithComments);
  const currentClassId = useEditingStore((state) => state.currentClassId);

  useEffect(() => {
    fetchProjectsWithComments();
  }, []);

  const filteredProjects = projects
    .filter(project => project.classId === currentClassId) 
    .filter(project =>
      Array.isArray(project.comments) &&
      project.comments.some(
        comment => comment.commentType === "question" && comment.isChecked === false
      )
    );

  return (
    <>
      <Navigation />

      <DashboardLayout>
        <TeachersSideMenu />

        <MainContent>
          <PageTitle>Teachers Dashboard</PageTitle>
          <select name="testing" id="">
            <option value="test">Class</option>
          </select>

          <ActionBar>
            <SmallButton text="Projects" />
            <SmallButton text="All comments" />
            <SmallButton text="Messages" />
          </ActionBar>

          <ProjectsList>
            {filteredProjects.map(({ _id, projectName, projectDescription, thumbnail, comments }) => {
              const questionComments = (comments ?? []).filter(
                comment =>
                  comment.commentType === "question" && comment.isChecked === false
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

const DashboardLayout = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
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