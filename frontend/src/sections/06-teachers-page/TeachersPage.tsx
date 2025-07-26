import { useEffect } from "react";
import { Navigation } from "../../global-components/Navigation";
import { useProjectStore } from "../../store/projectStore";
import styled from "styled-components";

import { SmallButton } from "../../global-components/buttons";
import { TeacherProjectCard } from "./components/TeacherProjectCard";

export const TeachersPage = () => {
  const projects = useProjectStore((state) => state.projects);
  const fetchProjectsWithComments = useProjectStore((state) => state.fetchProjectsWithComments);

useEffect(() => {
  console.log("Fetching projects with comments...");
  fetchProjectsWithComments();
}, []);

  return (
    <>
      <Navigation />
      <Title>Teachers dashboard</Title>

      <Sections>
        <SmallButton text={"Projects"} />
        <SmallButton text={"All comments"} />
        <SmallButton text={"Messages"} />
      </Sections>

      <Wrapper>
        {projects
          .filter(project =>
            Array.isArray(project.comments) &&
            project.comments.some((comment: any) => comment.isChecked === false)
          )
          .map(({ _id, projectName, projectDescription, thumbnail, comments }) => (
            <TeacherProjectCard 
              key={_id} 
              projectId={_id ?? ""}
              projectName={projectName} 
              projectDescription={projectDescription}
              thumbnail={thumbnail} 
              comments={comments}
            />
        ))}
      </Wrapper>
    </>
  );
};

// Styled Components

const Title = styled.h2`
  text-align: center;
  margin-top: 40px;
`;

const Sections = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 20px;
`;
