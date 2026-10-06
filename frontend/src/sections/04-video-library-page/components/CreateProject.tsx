//#region ----- IMPORTS -----
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { useState, useRef, useEffect } from "react"
import { useProjectStore } from "../../../store/projectStore"
import { getUploadLimits } from "../../../utils/upload/uploadMedia"
import type { UploadLimits } from "../../../utils/upload/types"
import { MediaQueries } from "../../../themes/mediaQueries"
import { useEditingStore } from "../../../store/editStore"
import { spacing } from "../../../themes/spacing"
//#endregion

//#region ----- HELPERS -----
const toMegabytes = (bytes: number) => Math.round(bytes / (1024 * 1024))
//#endregion

//#region ----- COMPONENT LOGIC -----
export const CreateProject = () => {
  const { classId } = useParams<{ classId: string }>()
  const addProject = useProjectStore((state) => state.addProject)
  const cancelUpload = useProjectStore((state) => state.cancelUpload)
  const uploadProgress = useProjectStore((state) => state.uploadProgress)
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject)

  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [teacher, setTeacher] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [errorMesage, setErrorMessage] = useState("")
  const [limits, setLimits] = useState<UploadLimits | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const projectNameRef = useRef<HTMLInputElement>(null)

  const isUploading = uploadProgress !== null
  //#endregion

  //#region ----- EFFECTS -----
  useEffect(() => {
    let active = true
    getUploadLimits()
      .then((loaded) => {
        if (active) setLimits(loaded)
      })
      .catch(() => {
        // Retried when a file is picked, the message is shown then.
      })
    return () => {
      active = false
    }
  }, [])

  // Closing the form or leaving the page must not leave an upload running unseen.
  useEffect(() => {
    return () => cancelUpload()
  }, [cancelUpload])
  //#endregion

  //#region ----- HANDLERS -----
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return

    const reject = (message: string) => {
      setErrorMessage(message)
      input.value = ""
      setVideoFile(null)
    }

    let activeLimits = limits
    if (!activeLimits) {
      try {
        activeLimits = await getUploadLimits()
        setLimits(activeLimits)
      } catch {
        reject("Could not check the upload limits. Please try again in a moment.")
        return
      }
    }

    if (file.size > activeLimits.videoMaxBytes) {
      reject(
        `Video file size exceeds ${toMegabytes(activeLimits.videoMaxBytes)}MB. Please select a smaller file.`
      )
      return
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || ""
    if (!activeLimits.videoFormats.includes(extension)) {
      reject(`Unsupported video format. Allowed: ${activeLimits.videoFormats.join(", ")}.`)
      return
    }

    setErrorMessage("")
    setVideoFile(file)
  }

  const handleCreateProject = async () => {
    if (isSubmitting) return

    if (!projectName.trim()) {
      setErrorMessage("Please fill in a project name")
      projectNameRef.current?.focus()
      return
    }

    if (!classId) {
      setErrorMessage("No class ID found in the route.")
      return
    }

    setErrorMessage("")
    setIsSubmitting(true)
    const result = await addProject(classId, {
      projectName,
      projectDescription,
      teacher,
      classId,
      video: videoFile,
    })
    setIsSubmitting(false)

    if (result.success) {
      // Clear inputs after creation
      setProjectName("")
      setProjectDescription("")
      setTeacher("")
      setVideoFile(null)
      setIsEditingProject(false)
    } else if (!result.cancelled) {
      setErrorMessage(result.message)
    }
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
        maxLength={200}
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
          accept={limits ? limits.videoFormats.map((f) => `.${f}`).join(",") : "video/*"}
          disabled={isSubmitting}
          onChange={handleFileChange}
        />
      </VideoUploadLabel>
      {videoFile && (
        <FileInfo>
          <FileName>{videoFile.name}</FileName>
          {!isSubmitting && (
            <RemoveFileBtn
              type="button"
              aria-label="Remove selected video"
              onClick={() => setVideoFile(null)}
            >
              ✕
            </RemoveFileBtn>
          )}
        </FileInfo>
      )}

      {isUploading && (
        <ProgressWrapper>
          <ProgressText aria-live="polite">
            {uploadProgress >= 1
              ? "Finishing up..."
              : `Uploading video... ${Math.floor(uploadProgress * 100)}%`}
          </ProgressText>
          <ProgressTrack
            role="progressbar"
            aria-label="Video upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(uploadProgress * 100)}
          >
            <ProgressFill style={{ width: `${Math.floor(uploadProgress * 100)}%` }} />
          </ProgressTrack>
        </ProgressWrapper>
      )}

      <ErrorMessage role="alert">{errorMesage}</ErrorMessage>

      <AddProjectBtn
        type="submit"
        disabled={isSubmitting}
      >
        {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Add Project"}
      </AddProjectBtn>
      {isUploading && (
        <CancelUploadBtn
          type="button"
          disabled={uploadProgress >= 1}
          onClick={cancelUpload}
        >
          Cancel upload
        </CancelUploadBtn>
      )}
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
    resize: vertical;
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

  @media ${MediaQueries.smallPhone} {
    min-height: 80px !important;
  }
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const CancelUploadBtn = styled.button`
  height: 40px;
  background-color: transparent;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.textAlternative};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ease 0.3s;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`

const ProgressText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9em;
`

const ProgressTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.lightBlue};
`

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.primary};
  transition: width 0.2s ease;
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
