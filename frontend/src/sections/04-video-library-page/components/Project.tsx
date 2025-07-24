import { Link } from "react-router-dom";
import styled from "styled-components";
import { useProjectStore } from "../../../store/projectStore";
import type { ProjectType } from "../../../store/projectStore";

interface ProjectProps extends Pick<ProjectType, "_id" | "projectName" | "projectDescription" | "thumbnail"> {
  projectId: string;
}

export const Project = ({ projectId, projectName, projectDescription, thumbnail }: ProjectProps) => {

const deleteProject = useProjectStore((state) => state.deleteProject);

  return (
    <StyledLink to={`/review/${projectId}`}>
      <Card>
        <Thumbnail src={thumbnail || "/fallback-thumbnail.jpg"} alt="Thumbnail" />
        <TextContainer>
          <h3>{projectName}</h3>
          <p>{projectDescription}</p>
        </TextContainer>
        <CardFooter>     
          <p>Professor Daniels</p>     
          <Edit>    
          <img src="/icons/edit.svg" alt="Edit Icon" />
          <img src="/icons/delete.svg" alt="Delete Icon"
            onClick={(e) => {
              e.stopPropagation(); 
              e.preventDefault(); 
              deleteProject(projectId);
            }}
          />
          </Edit>
          <p>Duration: 12:23</p>
        </CardFooter>

      </Card>
    </StyledLink>
  );
};

const Edit = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  width: 40px;
  margin: 0 20px 0 0;
  cursor: pointer;
  transform: translatey(30%);
  transition: opacity 0.3s ease, visibility 0s linear 0.3s, transform 0.3s ease;

  img:hover {
    transition: ease .3s;
    transform: scale(0.9);
  }
`;

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

&:hover ${Edit} {
  opacity: 1;
  visibility: visible;
  transform: translatey(0%);
  transition: opacity 1s ease, visibility 0s linear 0s, transform 0.4s ease;
}
`

const StyledLink = styled(Link) `
text-decoration: none;
color: ${({theme}) => theme.colors.text};
`

const Thumbnail = styled.img `
width: 100%;
object-fit: cover;
aspect-ratio: 16 / 9;
border-radius: 10px;
`

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;

  p, h3 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CardFooter = styled.div `
display: flex;
justify-content: space-between;
margin: 20px 20px;
`



