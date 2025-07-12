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
          <p>Teachers Name</p>         
          <img src="/icons/edit.svg" alt="Edit Icon" />
          <img src="/icons/delete.svg" alt="Delete Icon"
            onClick={(e) => {
              e.stopPropagation(); 
              e.preventDefault(); 
              deleteProject(projectId);
            }}
          />
          <p>Video Length</p>
        </CardFooter>

      </Card>
    </StyledLink>
  );
};

const Card = styled.div `
display: flex;
flex-direction: column;
width: 100%;
border-radius: 10px;
transition: ease .3s;
overflow: hidden;
box-shadow: 0 4px 5px rgba(0, 0, 0, 0.14);

&:hover {
  transform: scale(.98);
}

@media ${MediaQueries.biggerSizes} {
  width: 200px;
}
`

const StyledLink = styled(Link) `
text-decoration: none;
color: black;
`

const Thumbnail = styled.img `
width: 100%;
object-fit: cover;
aspect-ratio: 16 / 9;
border-radius: 10px;

@media ${MediaQueries.biggerSizes} {
  aspect-ratio: 4 / 3;
}
`

const TextContainer = styled.div `
display: flex;
flex-direction: column;
margin: 20px;
`

const CardFooter = styled.div `
display: flex;
column-gap: 10px;
margin: 0 0 20px 20px;
`

