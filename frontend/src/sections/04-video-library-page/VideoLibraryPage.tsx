import { Project } from "./components/Project";
import { CreateProject } from "./components/CreateProject";
import styled from "styled-components";
import { useProjectStore } from "../../store/projectStore";
import { useEffect } from "react";
import { Loader } from "../../global-components/loader";
import { SideMenu } from "./components/side-menu/SideMenu";
import { Navigation } from "../../global-components/Navigation";
import { Section } from "../../global-components/Section";
import { MediaQueries } from "../../themes/mediaQueries";

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
          <SideMenuContainer>
            <SideMenu />
          </SideMenuContainer>
          <Container>
              <HeaderWrapper>
                <h2>Class Title</h2>
              </HeaderWrapper>
            <ProjectWrapper>
              {projects.map(({ _id, projectName, projectDescription, thumbnail }) => (
                <Project 
                  key={_id} 
                  projectId={_id ?? ""}
                  projectName={projectName} 
                  projectDescription={projectDescription}
                  thumbnail={thumbnail} 
                />
              ))}
            </ProjectWrapper>
            <CreateWrapper>
              <CreateProject />
            </CreateWrapper>
          </Container>
        </Content>
      </Section>
    </>
  );
};

// STYLED COMPONENTS

const Content = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const SideMenuContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
  display: none;

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`;

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
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