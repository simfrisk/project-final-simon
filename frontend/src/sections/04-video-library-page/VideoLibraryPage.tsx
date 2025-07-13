import { Project } from "./components/Project";
import { CreateProject } from "./components/CreateProject";
import styled from "styled-components";
import { useProjectStore } from "../../store/projectStore";
import { useEffect } from "react";
import { MediaQueries } from "../../themes/mediaQueries";
import { Loader } from "../../global-components/loader";
import { SideMenu } from "./components/side-menu/SideMenu";
import { Navigation } from "../../global-components/Navigation";
import { Section } from "../../global-components/Section";

export const VideoLibraryPage = () => {
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
    <>
    <Navigation />
    <Section>
      <Content>
        <SideMenu />
        <Container>
          <h2>Class Title</h2>
          <ProjectWrapper>
          {projects.map(({ _id, projectName, projectDescription }) => (
            <Project 
              key={_id} 
              projectId={_id ?? ""}
              projectName={projectName} 
              projectDescription={projectDescription} 
            />
          ))}
          </ProjectWrapper>
          <CreateProject />
        </Container>
      </Content>
    </Section>
    </>
  )
  
};

const Content = styled.div `
display: flex;
`

const Container = styled.div `
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
flex-wrap: wrap;
gap: 24px;
margin: 20px;
width: 100%;


@media ${MediaQueries.biggerSizes} {
}
`

const ProjectWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 100%;
`

const LoadingContainer = styled.div `
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100dvh;
`