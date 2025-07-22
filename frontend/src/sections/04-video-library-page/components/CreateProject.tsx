import styled from "styled-components";
import { useState } from "react";
import { useProjectStore } from "../../../store/projectStore";
import { MediaQueries } from "../../../themes/mediaQueries";

export const CreateProject = () => {
  const addProject = useProjectStore((state) => state.addProject);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    addProject({
      projectName,
      projectDescription,
      video: "", // or default path
    });

    // Clear inputs after creation
    setProjectName("");
    setProjectDescription("");
  };

  return (
    <FormContainer>
      <Input
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <Input
        placeholder="Project Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={e => e.target.files && setVideoFile(e.target.files[0])} />
    {/* your inputs and button */}
      <AddProjectBtn onClick={handleCreateProject}>+ Project</AddProjectBtn>
    </FormContainer>
  );
};

// Styles
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  background-color: #e1e1e1;
  border-radius: 10px;
  padding: 10px;

    @media ${MediaQueries.biggerSizes} {
    width: 800px;
  } 
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 200px;
`;

const AddProjectBtn = styled.button`
  height: 40px;
  background-color: ${({theme}) => theme.colors.primary};
  border-radius: 10px;
  border: none;
  transition: ease 0.3s;
  color: white;

  &:hover {
    transform: scale(0.96);
      background-color: ${({theme}) => theme.colors.primaryHover};
  }
`;