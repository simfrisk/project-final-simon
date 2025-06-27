import { Project } from "./components/Project";
import { CreateProject } from "./components/CreateProject";
import styled from "styled-components";
import { useProjectStore } from "../../store/projectStore";
import { useEffect } from "react";

export const VideoLibraryPage = () => {
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Container>
      {projects.map(({ _id, projectName, projectDescription }) => (
        <Project 
          key={_id} 
          projectId={_id ?? ""}
          projectName={projectName} 
          projectDescription={projectDescription} 
        />
      ))}

    <CreateProject />
    </Container>
  )
  
};

const Container = styled.div `
display: flex;
align-items: center;
justify-content: center;
flex-wrap: wrap;
gap: 20px;
margin: 20px;
`