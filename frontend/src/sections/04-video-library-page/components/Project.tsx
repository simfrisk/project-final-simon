import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { ProjectType } from "../../../store/projectStore";
import { useEditingStore } from "../../../store/editStore";
import { useProjectStore } from "../../../store/projectStore";
import { useState } from "react";

interface ProjectProps extends Pick<ProjectType, "_id" | "projectName" | "projectDescription" | "thumbnail"> {
  projectId: string;
}

export const Project = ({ projectId, projectName, projectDescription, thumbnail }: ProjectProps) => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const setIsRemovingProject = useEditingStore((state) => state.setIsRemovingProject);
  const setRemovingProjectId = useEditingStore((state) => state.setRemovingProjectId);
  const updateProject = useProjectStore((state) => state.updateProject);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (!projectId) return;
    await updateProject(projectId, {
      newName,
      newDescription,
    });
  };

  const handleShowDelete = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation(); 
    setIsRemovingProject(true);
    setRemovingProjectId(projectId);
  };

  return (
    <>
    <Card onClick={() => navigate(`/review/${projectId}`)}>
      <Thumbnail src={thumbnail || "/fallback-thumbnail.jpg"} alt="Thumbnail" />

      <TextContainer>
        <h3>{projectName}</h3>
        <p>{projectDescription}</p>
      </TextContainer>

      <CardFooter>
        <p>Professor Daniels</p>

        <Edit>
          <img src="/icons/edit.svg" alt="Edit Icon" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}/>
          <img src="/icons/delete.svg" alt="Delete Icon" onClick={handleShowDelete} />
        </Edit>

        <p>Duration: 12:23</p>
      </CardFooter>
    </Card>

     {isEditing && (
  <TransparentBackground onClick={() => setIsEditing(false)}>
    <CreateWrapper onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleUpdate}>
        <label htmlFor="newName">New Name</label>
        <input
          id="newName"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <label htmlFor="newDescription">New Description</label>
        <textarea
          id="newDescription"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />

        <button type="submit">Update Project</button>
      </form>
    </CreateWrapper>
  </TransparentBackground>
)}
        </>
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
box-shadow: 0 4px 5px ${({theme}) => theme.colors.boxShadow};

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

const Thumbnail = styled.img `
width: 100%;
object-fit: cover;
aspect-ratio: 16 / 9;
border-radius: 10px;
`

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 20px 5px 20px;
  max-width: 100%;
  height: 100px;

  h3 {
    white-space: nowrap;       /* prevent title wrap */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    display: -webkit-box;         /* important for multiline ellipsis */
    -webkit-line-clamp: 2;        /* limit to 3 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;          /* allow wrapping inside the lines */
    margin-top: 8px;
  }
`;

const CardFooter = styled.div `
display: flex;
justify-content: space-between;
margin: 2px 20px 20px 20px;
`

const CreateWrapper = styled.div`
  position: fixed;
  width: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1000;

  form {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }

  input {
    height: 32px;
    padding: 5px 10px;
    border-radius: 5px;
  }

  textarea {
    height: 100px;
    padding: 10px 10px;
    border-radius: 5px;
  }

  button {
    padding: 5px 10px;
    margin: 10px 0;
    border-radius: 10px;
    height: 32px;
    border: none;
    background-color: ${({theme}) => theme.colors.primary};
    color: ${({theme}) => theme.colors.background};
  }
`;

const TransparentBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;