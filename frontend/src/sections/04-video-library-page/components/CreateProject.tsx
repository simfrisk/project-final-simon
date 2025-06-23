import styled from "styled-components";

export const CreateProject = () => {
  return (
    <Card>
      <p>+ Project</p>
    </Card>
  )
};

const Card = styled.div `
display: flex;
align-items: center;
justify-content: center;
height: 80px;
width: 120px;
background-color: #dddddd;
border-radius: 10px;
padding: 20px;
transition: ease .3s;

&:hover {
  transform: scale(.96);
}
`