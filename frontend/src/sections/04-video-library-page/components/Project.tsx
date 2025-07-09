import { Link } from "react-router-dom";
import styled from "styled-components";
import { MediaQueries } from "../../../themes/mediaQueries";
import { useProjectStore } from "../../../store/projectStore";

interface ProjectProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
}

export const Project = ({ projectId, projectName, projectDescription }: ProjectProps) => {

const deleteProject = useProjectStore((state) => state.deleteProject);

  return (
    <StyledLink to={`/review/${projectId}`}>
      <Card>
        <Thumbnail src="/thumbnail.png" alt="Thumbnail" />
        <TextContainer>
          <h3>{projectName}</h3>
          <p>{projectDescription}</p>
        </TextContainer>
        <CardFooter>              
          <img src="/icons/edit.svg" alt="Edit Icon" />
          <img src="/icons/delete.svg" alt="Delete Icon"
            onClick={(e) => {
              e.stopPropagation(); 
              e.preventDefault(); 
              deleteProject(projectId);
            }}
          />
        </CardFooter>

      </Card>
    </StyledLink>
  );
};

const Card = styled.div `
display: flex;
align-items: center;
height: 200px;
width: 100%;
background-color: #a7a7a7;
border-radius: 10px;
padding: 20px;
transition: ease .3s;

&:hover {
  transform: scale(.98);
}

@media ${MediaQueries.biggerSizes} {
  height: 200px;
  width: 800px;
}
`

const StyledLink = styled(Link) `
text-decoration: none;
color: black;
`

const Thumbnail = styled.img `
height: 100%;
object-fit: cover;
aspect-ratio: 1 / 1;
border-radius: 10px;

@media ${MediaQueries.biggerSizes} {
  aspect-ratio: 4 / 3;
}
`

const TextContainer = styled.div `
display: flex;
flex-direction: column;
margin: 20px;
max-width: 400px;
`

const CardFooter = styled.div `
display: flex;
column-gap: 10px;
`

