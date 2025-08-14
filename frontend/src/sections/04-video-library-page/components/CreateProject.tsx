import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { useProjectStore } from "../../../store/projectStore";
import { MediaQueries } from "../../../themes/mediaQueries";
import { useEditingStore } from "../../../store/editStore";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const CreateProject = () => {
  const { classId } = useParams<{ classId: string }>();
  const addProject = useProjectStore((state) => state.addProject);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject);



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

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    if (!classId) {
      alert("No class ID found in the route.");
      return;
    }

    if (videoFile && videoFile.size > MAX_FILE_SIZE) {
      alert("Video file size exceeds 100MB.");
      return;
    }

    await addProject(classId, {
      projectName,
      projectDescription,
      classId,
      video: videoFile,
    });

    // Clear inputs after creation
    setProjectName("");
    setProjectDescription("");
    setVideoFile(null);
    setIsEditingProject(false)
  };

  return (
    <FormContainer>
      <ProjectNameInput
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <DescriptionTextArea
        placeholder="Project Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <AddProjectBtn onClick={handleCreateProject}>Add Project</AddProjectBtn>
    </FormContainer>
  );
};

// Styles
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 92vw;
  background-color: #e1e1e1;
  border-radius: 10px;
  padding: 10px;

  @media ${MediaQueries.biggerSizes} {
    width: 500px;
  }
`;

const ProjectNameInput = styled.textarea`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
`;

const DescriptionTextArea = styled.textarea`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
  min-height: 200px;
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