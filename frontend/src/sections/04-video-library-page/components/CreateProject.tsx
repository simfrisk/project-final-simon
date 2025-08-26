//#region ----- IMPORTS -----
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { useState, useRef } from "react"
import { useProjectStore } from "../../../store/projectStore"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useEditingStore } from "../../../store/editStore"
import { spacing } from "../../../themes/spacing"
//#endregion

//#region ----- CONSTANTS -----
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
//#endregion

//#region ----- COMPONENT LOGIC -----
export const CreateProject = () => {
  const { classId } = useParams<{ classId: string }>()
  const addProject = useProjectStore((state) => state.addProject)
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject)

  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [teacher, setTeacher] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [errorMesage, setErrorMessage] = useState("")
  const projectNameRef = useRef<HTMLInputElement>(null)

  //#endregion

  //#region ----- HANDLERS -----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("Video file size exceeds 100MB. Please select a smaller file.")
      e.target.value = ""
      setVideoFile(null)
      return
    }

    setErrorMessage("")
    setVideoFile(file)
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setErrorMessage("Please fill in a project name")
      projectNameRef.current?.focus()
      return
    }

    if (!classId) {
      alert("No class ID found in the route.")
      return
    }

    if (videoFile && videoFile.size > MAX_FILE_SIZE) {
      alert("Video file size exceeds 100MB.")
      return
    }

    await addProject(classId, {
      projectName,
      projectDescription,
      teacher,
      classId,
      video: videoFile,
    })

    // Clear inputs after creation
    setProjectName("")
    setProjectDescription("")
    setTeacher("")
    setVideoFile(null)
    setIsEditingProject(false)
  }
  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <FormContainer
      as="form"
      onSubmit={(e) => {
        e.preventDefault()
        handleCreateProject()
      }}
    >
      <h3>Create a new project</h3>
      <ProjectNameInput
        placeholder="Project Name"
        ref={projectNameRef}
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <DescriptionTextArea
        placeholder="Project Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />
      <ProjectNameInput
        placeholder="Teacher in video"
        value={teacher}
        onChange={(e) => setTeacher(e.target.value)}
      />
      <VideoUploadLabel htmlFor="video-upload">
        Upload video
        <HiddenFileInput
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
        />
      </VideoUploadLabel>
      {videoFile && (
        <FileInfo>
          <FileName>{videoFile.name}</FileName>
          <RemoveFileBtn onClick={() => setVideoFile(null)}>✕</RemoveFileBtn>
        </FileInfo>
      )}

      <ErrorMessage>{errorMesage}</ErrorMessage>

      <AddProjectBtn
        type="submit"
        onClick={handleCreateProject}
      >
        Add Project
      </AddProjectBtn>
    </FormContainer>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${spacing.md};
  width: 92vw;
  background-color: ${({ theme }) => theme.colors.offBackground};
  border: 2px solid ${({ theme }) => theme.colors.textAlternative};
  border-radius: 10px;
  padding: 25px 20px;

  @media ${MediaQueries.biggerSizes} {
    width: 500px;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
    margin: 0 0 ${spacing.sm} 0;
  }

  input {
    background-color: ${({ theme }) => (theme.name === "dark" ? "#363f49" : "#fff")};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  textarea {
    background-color: ${({ theme }) => (theme.name === "dark" ? "#363f49" : "#fff")};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  input[type="file"] {
    background-color: transparent;
  }
`

const ProjectNameInput = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
  height: 45px;
`

const DescriptionTextArea = styled.textarea`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
  min-height: 200px;
`

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
`

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  padding-left: 4px;
  margin: 0;
`

const VideoUploadLabel = styled.label`
  display: inline-block;
  padding: 10px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 6px;
  cursor: pointer;
  margin: 0;
  text-align: center;
  font-weight: 500;
  width: fit-content;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`

const HiddenFileInput = styled.input`
  display: none;
`

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.lightBlue};
  border-radius: 6px;
  margin-top: ${spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`

const FileName = styled.span`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const RemoveFileBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textAlternative};
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`
//#endregion
