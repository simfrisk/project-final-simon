import { Project } from "./components/Project";
import { CreateProject } from "./components/CreateProject";
import styled from "styled-components";
import { useProjectStore } from "../../store/projectStore";

export const VideoLibraryPage = () => {

  const projects = useProjectStore((state) => state.projects);

  return (
    <Container>
        {projects.map(({ projectId, projectName, projectDescription}) => (
          <Project key={projectId} projectName={projectName } projectDescription={projectDescription}/>
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