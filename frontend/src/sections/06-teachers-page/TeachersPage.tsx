//#region ----- IMPORTS -----
import { useEffect } from "react"
import { Navigation } from "../../global-components/navigation/Navigation"
import { useProjectStore } from "../../store/projectStore"
import styled from "styled-components"

import { TeacherProjectCard } from "./components/TeacherProjectCard"
import { TeachersSideMenu } from "./components/TeachersSideMenu"
import { useEditingStore } from "../../store/editStore"
import { useClassStore } from "../../store/classStore"
import { useWorkspaceStore } from "../../store/workspaceStore"
import { MediaQueries } from "../../themes/mediaQueries"

//#endregion

export const TeachersPage = () => {
  //#region ----- STORE HOOKS -----
  const projects = useProjectStore((state) => state.projects)
  const fetchProjectsWithComments = useProjectStore((state) => state.fetchProjectsWithComments)
  const classes = useClassStore((state) => state.classes)
  const fetchClasses = useClassStore((state) => state.fetchClasses)
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)
  const currentClassId = useEditingStore((state) => state.currentClassId)
  const setCurrentClassId = useEditingStore((state) => state.setCurrentClassId)

  //#endregion

  //#region ----- EFFECTS -----

  // Fetch classes and projects on mount
  useEffect(() => {
    if (currentWorkspaceId) {
      fetchClasses(currentWorkspaceId)
    }
    fetchProjectsWithComments()
  }, [fetchClasses, fetchProjectsWithComments, currentWorkspaceId])

  // Automatically select first class with unchecked student comments
  const classesWithUncheckedComments = classes.filter((cls) => {
    const projectsInClass = projects.filter((project) => project.classId === cls._id)
    const uncheckedStudentCommentsCount = projectsInClass.reduce((count, project) => {
      const uncheckedStudentComments = (project.comments ?? []).filter(
        (comment) =>
          !comment.isChecked &&
          comment.commentType === "question" &&
          comment.commentCreatedBy?.role === "student"
      )
      return count + uncheckedStudentComments.length
    }, 0)
    return uncheckedStudentCommentsCount > 0
  })

  useEffect(() => {
    if (classesWithUncheckedComments.length > 0 && !currentClassId) {
      setCurrentClassId(classesWithUncheckedComments[0]._id)
    }
  }, [classesWithUncheckedComments, currentClassId, setCurrentClassId])
  //#endregion

  //#region ----- EVENT HANDLERS -----
  const handleClassChange = (id: string) => setCurrentClassId(id)
  //#endregion

  //#region ----- DERIVED DATA -----
  // Filter projects for the currently selected class with unchecked questions from students only
  const filteredProjects = projects
    .filter((project) => project.classId === currentClassId)
    .filter(
      (project) =>
        Array.isArray(project.comments) &&
        project.comments.some(
          (comment) =>
            comment.commentType === "question" &&
            comment.isChecked === false &&
            comment.commentCreatedBy?.role === "student"
        )
    )
  //#endregion

  //#region ----- RENDER -----
  return (
    <>
      <Navigation />

      <DashboardLayout>
        <TeachersSideMenu
          classesCount={classesWithUncheckedComments}
          aria-label="Teacher side menu with classes having unchecked comments"
        />

        <MainContent role="main">
          <PageTitle tabIndex={-1}>Teachers Dashboard</PageTitle>

          <ClassSelect
            value={currentClassId || ""}
            onChange={(e) => handleClassChange(e.target.value)}
            aria-label="Select class with unchecked comments"
          >
            {classesWithUncheckedComments.map((cls) => (
              <option
                key={cls._id}
                value={cls._id}
              >
                {cls.classTitle}
              </option>
            ))}
          </ClassSelect>

          <ActionBar
            role="toolbar"
            aria-label="Dashboard actions"
          >
            <WorkingButton aria-label="View all projects">View Projects</WorkingButton>
            <ActionButton aria-label="View all comments">View All Comments</ActionButton>
            <ActionButton aria-label="View messages">View Messages</ActionButton>
          </ActionBar>

          <ProjectsList aria-label="List of projects with unanswered questions">
            {filteredProjects.map(
              ({ _id, projectName, projectDescription, thumbnail, comments }) => {
                const questionComments = (comments ?? []).filter(
                  (comment) => comment.commentType === "question" && !comment.isChecked
                )

                return (
                  <TeacherProjectCard
                    key={_id ?? ""}
                    projectId={_id ?? ""}
                    projectName={projectName}
                    projectDescription={projectDescription}
                    thumbnail={thumbnail}
                    comments={questionComments}
                    aria-label={`Project card for ${projectName}, ${questionComments.length} unanswered questions`}
                  />
                )
              }
            )}
          </ProjectsList>
        </MainContent>
      </DashboardLayout>
    </>
  )
  //#endregion
}

//#region ----- STYLED COMPONENTS -----
const PageTitle = styled.h2`
  text-align: center;
  margin: 34px 0 24px 0;
`

const ClassSelect = styled.select`
  text-align: center;
  padding: 10px 16px;
  margin-bottom: 24px;
  font-size: 16px;
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

  @media ${MediaQueries.biggerSizes} {
    display: none;
    margin-bottom: 0;
  }

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

const DashboardLayout = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  @media ${MediaQueries.biggerSizes} {
    margin-top: 48px;
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ActionBar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
`

const WorkingButton = styled.button`
  margin: 0px 10px 20px 10px;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 35px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 100px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(1.02);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primaryHover};
    outline-offset: 2px;
  }

  @media ${MediaQueries.smallPhone} {
    margin: 0px 4px 20px 4px;
    padding: 8px 2px;
    max-width: 90px;
  }

  @media ${MediaQueries.biggerSizes} {
    max-width: none;
  }
`

const ActionButton = styled.button`
  position: relative;
  margin: 0px 6px 20px 6px;
  padding: 8px 10px;
  max-width: 100px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 35px;
  background-color: #a3a3a3;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
  opacity: 0.6;
  text-decoration: line-through;

  @media ${MediaQueries.biggerSizes} {
    max-width: none;
  }

  &::after {
    content: "upcoming";
    position: absolute;
    top: -8px;
    right: -15px;
    background-color: #ff6b6b;
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    text-transform: uppercase;
    transform: rotate(12deg);
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    @media ${MediaQueries.smallPhone} {
      top: -10px;
      right: -8px;
      transform: rotate(12deg);
      padding: 2px 4px;
    }

    @media ${MediaQueries.biggerSizes} {
      top: -13px;
      right: -16px;
      transform: rotate(0deg);
      padding: 3px 6px;
    }
  }

  @media ${MediaQueries.biggerSizes} {
    margin: 0px 10px 20px 10px;
    padding: 8px 16px;
  }

  @media ${MediaQueries.smallPhone} {
    margin: 0px 2px 20px 2px;
    padding: 8px 2px;
    max-width: 90px;
  }
`

//#endregion
