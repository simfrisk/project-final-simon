//#region ----- IMPORTS -----
import { useEffect } from "react"
import { Navigation } from "../../global-components/navigation/Navigation"
import { useProjectStore } from "../../store/projectStore"
import styled from "styled-components"
import { SmallButton } from "../../global-components/buttons"
import { TeacherProjectCard } from "./components/TeacherProjectCard"
import { TeachersSideMenu } from "./components/TeachersSideMenu"
import { useEditingStore } from "../../store/editStore"
import { useClassStore } from "../../store/classStore"
import { MediaQueries } from "../../themes/mediaQueries"

//#endregion

export const TeachersPage = () => {
  //#region ----- STORE HOOKS -----
  const projects = useProjectStore((state) => state.projects)
  const fetchProjectsWithComments = useProjectStore((state) => state.fetchProjectsWithComments)
  const classes = useClassStore((state) => state.classes)
  const fetchClasses = useClassStore((state) => state.fetchClasses)
  const currentClassId = useEditingStore((state) => state.currentClassId)
  const setCurrentClassId = useEditingStore((state) => state.setCurrentClassId)

  //#endregion

  //#region ----- EFFECTS -----

  // Fetch classes and projects on mount
  useEffect(() => {
    fetchClasses()
    fetchProjectsWithComments()
  }, [])

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
            <SmallButton
              text="View Projects"
              aria-label="View all projects"
            />
            <SmallButton
              text="View All Comments"
              aria-label="View all comments"
            />
            <SmallButton
              text="View Messages"
              aria-label="View messages"
            />
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
  margin-top: 40px;
`

const ClassSelect = styled.select`
  text-align: center;
  padding: 10px 16px;
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

//#endregion
