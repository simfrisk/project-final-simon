import { Project } from "./components/Project";
import { CreateProject } from "./components/CreateProject";
import styled from "styled-components";

export const VideoLibraryPage = () => {
  return (
    <Container>
    <Project />
    <Project />
    <Project />
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