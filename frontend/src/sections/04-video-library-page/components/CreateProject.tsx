import styled from "styled-components";
import { useState } from "react";
import { useProjectStore } from "../../../store/projectStore";
import { MediaQueries } from "../../../themes/mediaQueries";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export const CreateProject = () => {
  const addProject = useProjectStore((state) => state.addProject);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Video file size exceeds 100MB. Please select a smaller file.");
      e.target.value = ""; // reset input
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    if (videoFile && videoFile.size > MAX_FILE_SIZE) {
      alert("Video file size exceeds 100MB. Please select a smaller file.");
      return;
    }

    addProject({
      projectName,
      projectDescription,
      video: videoFile,
    });

    // Clear inputs after creation
    setProjectName("");
    setProjectDescription("");
    setVideoFile(null);
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
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
      <AddProjectBtn onClick={handleCreateProject}>+ Project</AddProjectBtn>
    </FormContainer>
  );
};

// Styles
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background-color: #e1e1e1;
  border-radius: 10px;
  padding: 10px;

  @media ${MediaQueries.biggerSizes} {
    width: 500px;
  }
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
`;

const AddProjectBtn = styled.button`
  height: 40px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
  border: none;
  transition: ease 0.3s;
  color: white;

  &:hover {
    transform: scale(0.96);
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;