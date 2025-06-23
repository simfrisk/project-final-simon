import { Link } from "react-router-dom";
import styled from "styled-components";

interface ProjectProps {
  projectName: string;
  projectDescription: string;
}

export const Project = ({ projectName, projectDescription }: ProjectProps) => {

  return (

    <StyledLink to="/review">
      <Card>
        <Thumbnail src="/thumbnail.png" alt="Thumbnail" />
        <TextContainer>
        <h3>{projectName}</h3>
        <p>{projectDescription}</p>
        </TextContainer>
      </Card>
    </StyledLink>
  )
};

const Card = styled.div `
display: flex;
align-items: center;
height: 200px;
width: 800px;
background-color: #a7a7a7;
border-radius: 10px;
padding: 20px;
transition: ease .3s;

&:hover {
  transform: scale(.98);
}
`

const StyledLink = styled(Link) `
text-decoration: none;
color: black;
`

const Thumbnail = styled.img `
height: 100%;
object-fit: cover;
aspect-ratio: 4 / 3;
border-radius: 10px;
`

const TextContainer = styled.div `
display: flex;
flex-direction: column;
margin: 20px;
max-width: 400px;
`

