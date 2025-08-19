import { useEffect, useState } from "react"
import styled from "styled-components"

import { useProjectStore } from "../../../store/projectStore"
import { useUserStore } from "../../../store/userStore"
import { useEditingStore } from "../../../store/editStore"
import { useClassStore } from "../../../store/classStore"

import { Project } from "./Project"
import { CreateProject } from "./CreateProject"
import { CreateClass } from "./CreateClass"
import { Loader } from "../../../global-components/loader"
import { MediaQueries } from "../../../themes/mediaQueries"
import { ConfirmBox } from "../../../global-components/ComfirmBox"

import { useNavigate, useParams } from "react-router-dom"

export const ProjectsList = () => {
  const { classId } = useParams()

  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const projects = useProjectStore((state) => state.projects)
  const loading = useProjectStore((state) => state.loading)
  const error = useProjectStore((state) => state.error)

  const user = useUserStore((state) => state.user)
  const userRole = user?.role

  const isEditingClass = useEditingStore((state) => state.isEditingClass)
  const isEditingProject = useEditingStore((state) => state.isEditingProject)
  const isRemovingProject = useEditingStore((state) => state.isRemovingProject)
  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass)
  const setIsEditingProject = useEditingStore(
    (state) => state.setIsEditingProject
  )
  const setIsRemovingProject = useEditingStore(
    (state) => state.setIsRemovingProject
  )
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const deleteClass = useClassStore((state) => state.deleteClass)
  const projectId = useEditingStore((state) => state.removingProjectId)

  const fetchClassById = useClassStore((state) => state.fetchClassById)
  const currentClass = useClassStore((state) => state.class)

  //delete project or class selector
  const [deleteSelect, setDeleteSelect] = useState<string>("")

  //Class selector

  const navigate = useNavigate()

  const fetchClasses = useClassStore((state) => state.fetchClasses)
  const classes = useClassStore((state) => state.classes)

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value
    navigate(`/library/classes/${selectedClassId}/projects`)
  }

  //Hide and show option buttons
  const [showOptions, setShowOptions] = useState<boolean>(false)

  useEffect(() => {
    if (classId) {
      fetchProjects(classId)
      fetchClassById(classId)
    }
  }, [fetchProjects, fetchClassById, classId])

  const handleTransparentBackground = () => {
    setIsEditingClass(false)
    setIsEditingProject(false)
    setIsRemovingProject(false)
  }

  const handleEditClass = () => setIsEditingClass(true)
  const handleEditProject = () => setIsEditingProject(true)

  const handlCancel = () => setIsRemovingProject(false)

  const handelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    if (deleteSelect === "classSelect") {
      if (!classId) return
      deleteClass(classId)
      setDeleteSelect("")
    } else {
      if (!projectId) return
      deleteProject(projectId)
    }

    setIsRemovingProject(false)
  }

  if (loading) {
    return (
      <LoadingContainer>
        <h3>Loading projects</h3>
        <Loader />
      </LoadingContainer>
    )
  }

  if (error) return <p>Error: {error}</p>

  //If there are not projects
  if (!loading && projects.length === 0) {
    return (
      <Container>
        <HeaderWrapper>
          <ClassTitle>
            {currentClass?.classTitle ?? "Loading class title..."}
          </ClassTitle>
        </HeaderWrapper>
        <NoProjectsContainer>
          <NoProjectsMessage>
            You have no projects in this class...
          </NoProjectsMessage>
        </NoProjectsContainer>
      </Container>
    )
  }

  //Main return
  return (
    <Container>
      <HeaderWrapper>
        <ClassTitle>
          {currentClass?.classTitle ?? "Loading class title..."}
        </ClassTitle>

        <TopBar>
          <ClassSelect
            value={classId}
            onChange={handleClassChange}
          >
            {classes.map((cls) => (
              <option
                key={cls._id}
                value={cls._id}
              >
                {cls.classTitle}
              </option>
            ))}
          </ClassSelect>

          {userRole === "teacher" && (
            <StyledButton onClick={() => setShowOptions((prev) => !prev)}>
              {showOptions ? "Hide" : "Show options"}
            </StyledButton>
          )}
        </TopBar>

        {userRole === "teacher" && (
          <ButtonContainer>
            {showOptions && (
              <div>
                <div>
                  <StyledButton
                    $add
                    type="button"
                    onClick={handleEditClass}
                  >
                    Add class
                  </StyledButton>
                  <StyledButton
                    $add
                    type="button"
                    onClick={handleEditProject}
                  >
                    Add project
                  </StyledButton>
                </div>
                <div>
                  <StyledButton
                    $delete
                    type="button"
                    onClick={() => {
                      setDeleteSelect("classSelect")
                      setIsRemovingProject(true)
                    }}
                  >
                    Delete class
                  </StyledButton>
                </div>
              </div>
            )}
          </ButtonContainer>
        )}
      </HeaderWrapper>

      <ProjectWrapper>
        {projects.map(
          ({
            _id,
            projectName,
            projectDescription,
            thumbnail,
            projectCreatedBy,
          }) => (
            <Project
              key={_id}
              projectId={_id ?? ""}
              projectName={projectName}
              projectDescription={projectDescription}
              thumbnail={thumbnail}
              projectCreatedBy={projectCreatedBy}
            />
          )
        )}
      </ProjectWrapper>

      {(isEditingClass || isEditingProject || isRemovingProject) && (
        <TransparentBackground onClick={handleTransparentBackground}>
          <CreateWrapper onClick={(e) => e.stopPropagation()}>
            {userRole === "teacher" && isEditingClass && <CreateClass />}
            {userRole === "teacher" && isEditingProject && <CreateProject />}

            {userRole === "teacher" && isRemovingProject && (
              <ConfirmBox
                message={"Are you sure you want to delete?"}
                onCancel={handlCancel}
                onConfirm={handelDelete}
              />
            )}
          </CreateWrapper>
        </TransparentBackground>
      )}
    </Container>
  )
}

// STYLED COMPONENTS

interface StyledButtonProps {
  $add?: boolean
  $delete?: boolean
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  overflow-x: hidden;

  @media ${MediaQueries.biggerSizes} {
    padding: 72px 20px;
  }
`

const ProjectWrapper = styled.div`
  display: grid;
  width: 100%;
  padding: 0 15px;
  gap: 25px;
  justify-content: center;
  box-sizing: border-box;
  grid-template-columns: 1fr;

  @media ${MediaQueries.biggerSizes} {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media ${MediaQueries.widescreen} {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80dvh;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    width: 80%;
  }
`

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
`

const ClassTitle = styled.h2`
  display: none;

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`

const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`

const ClassSelect = styled.select`
  text-align: center;
  padding: 10px 16px;
  font-size: 24px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  width: 203px;
  max-width: 100%;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: rgba(0, 0, 0, 0.14);
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`

const ButtonContainer = styled.div`
  @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ theme, $add, $delete }) =>
    $add ? "green" : $delete ? "red" : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 40px;
  margin: 10px 4px;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme, $add, $delete }) =>
      $add ? "#28b521" : $delete ? "#fa5e5e" : theme.colors.primaryHover};
    transform: scale(0.98);
  }
`

const TransparentBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 2, 2, 0.621);
  z-index: 10;
`

const CreateWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`

const NoProjectsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;
  margin: 30px 0;
`

const NoProjectsMessage = styled.h3`
  color: ${({ theme }) => theme.colors.text};
`
