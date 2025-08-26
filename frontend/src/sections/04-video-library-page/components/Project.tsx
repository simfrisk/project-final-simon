//#region ----- IMPORTS -----
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import type { ProjectType } from "../../../store/projectStore"
import { useEditingStore } from "../../../store/editStore"
import { useProjectStore } from "../../../store/projectStore"
import { useState } from "react"

//#endregion

//#region ----- INTERFACES -----
interface ProjectProps
  extends Pick<ProjectType, "_id" | "projectName" | "projectDescription" | "thumbnail"> {
  projectId: string
  teacher: string
}

//#endregion

//#region ----- COMPONENT LOGIC -----
export const Project = ({
  projectId,
  projectName,
  projectDescription,
  teacher,
  thumbnail,
}: ProjectProps) => {
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [errorMesage, setErrorMessage] = useState("")

  const setIsRemovingProject = useEditingStore((state) => state.setIsRemovingProject)
  const setRemovingProjectId = useEditingStore((state) => state.setRemovingProjectId)
  const updateProject = useProjectStore((state) => state.updateProject)

  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newTeacher, setNewTeacher] = useState("")

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!projectId) return

    if (!newName.trim() && !newDescription.trim() && !newTeacher.trim()) {
      setErrorMessage("Please fill in Name or description")
      return
    }

    setErrorMessage("")
    await updateProject(projectId, {
      newName,
      newDescription,
      newTeacher,
    })
  }

  const handleShowDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRemovingProject(true)
    setRemovingProjectId(projectId)
  }

  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        aria-label={`View project ${projectName}`}
        onClick={() => navigate(`/review/${projectId}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            navigate(`/review/${projectId}`)
          }
        }}
      >
        <Thumbnail
          src={thumbnail || "/fallback-thumbnail.jpg"}
          alt={`Thumbnail for project ${projectName}`}
        />

        <TextContainer>
          <h3 title={projectName}>{projectName}</h3>
          <p title={projectDescription}>{projectDescription}</p>
        </TextContainer>

        <CardFooter>
          <p>{teacher || "Unknown"}</p>

          <Edit>
            <button
              aria-label={`Edit project ${projectName}`}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              <img
                src="/icons/edit.svg"
                alt=""
                aria-hidden="true"
              />
            </button>
            <button
              aria-label={`Delete project ${projectName}`}
              onClick={handleShowDelete}
            >
              <img
                src="/icons/delete.svg"
                alt=""
                aria-hidden="true"
              />
            </button>
          </Edit>

          <p>Duration: 12:23</p>
        </CardFooter>
      </Card>

      {isEditing && (
        <TransparentBackground
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
          onClick={() => setIsEditing(false)}
        >
          <CreateWrapper onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdate}>
              <h2 id="edit-project-title">Edit Project</h2>

              <label htmlFor="newName">New Name</label>
              <input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                aria-required="false"
              />

              <label htmlFor="newDescription">New Description</label>
              <textarea
                id="newDescription"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                aria-required="false"
              />

              <label htmlFor="newTeacher">New Teacher</label>
              <textarea
                id="newTeacher"
                value={newTeacher}
                onChange={(e) => setNewTeacher(e.target.value)}
                aria-required="false"
              />

              <ErrorMessage role="alert">{errorMesage}</ErrorMessage>

              <button type="submit">Update Project</button>
            </form>
          </CreateWrapper>
        </TransparentBackground>
      )}
    </>
  )
}

//#endregion

//#region ----- STYLED COMPOENTNS -----
const Edit = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  margin: 0 20px 0 0;
  transform: translatey(30%);
  transition:
    opacity 0.3s ease,
    visibility 0s linear 0.3s,
    transform 0.3s ease;

  button {
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease;

    &:hover,
    &:focus {
      background-color: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }

    img {
      filter: ${({ theme }) => theme.filter.inverted};
      width: 20px;
      height: 20px;
    }
  }
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
  transition: ease 0.3s;
  overflow: hidden;
  box-shadow: 0 4px 5px ${({ theme }) => (theme.name === "dark" ? "none" : theme.colors.boxShadow)};
  background-color: ${({ theme }) =>
    theme.name === "dark" ? theme.colors.offBackground : "white"};

  &:hover {
    transform: scale(0.98);
  }

  &:hover ${Edit} {
    opacity: 1;
    visibility: visible;
    transform: translatey(0%);
    transition:
      opacity 1s ease,
      visibility 0s linear 0s,
      transform 0.4s ease;
  }
`

const Thumbnail = styled.img`
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
    white-space: nowrap; /* prevent title wrap */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    display: -webkit-box; /* important for multiline ellipsis */
    -webkit-line-clamp: 2; /* limit to 3 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal; /* allow wrapping inside the lines */
    margin-top: 8px;
  }
`

const CardFooter = styled.div`
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
  background: ${({ theme }) => theme.colors.offBackground};
  border: 2px solid ${({ theme }) => theme.colors.textAlternative};
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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
    background-color: ${({ theme }) => (theme.name === "dark" ? "#363f49" : "#fff")};
    color: ${({ theme }) => theme.colors.text};
    border: none;
  }

  textarea {
    height: 100px;
    padding: 10px 10px;
    border: none;
    border-radius: 5px;
    background-color: ${({ theme }) => (theme.name === "dark" ? "#363f49" : "#fff")};
    color: ${({ theme }) => theme.colors.text};
  }

  button {
    padding: 5px 10px;
    margin: 10px 0;
    border-radius: 10px;
    height: 32px;
    border: none;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white};
  }
`

const TransparentBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  padding-left: 4px;
`

//#endregion
