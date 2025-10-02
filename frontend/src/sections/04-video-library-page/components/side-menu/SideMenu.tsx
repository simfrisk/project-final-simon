//#region ----- IMPORTS -----
import styled from "styled-components"
import { useEffect } from "react"
import { useClassStore } from "../../../../store/classStore"
import { useWorkspaceStore } from "../../../../store/workspaceStore"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { useEditingStore } from "../../../../store/editStore"
import { useUserStore } from "../../../../store/userStore"
import { ClassOptions } from "./ClassOptions"
//#endregion

//#region ----- COMPONENT LOGIC -----
export const SideMenu = () => {
  const classes = useClassStore((state) => state.classes)
  const fetchClasses = useClassStore((state) => state.fetchClasses)
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId)
  const fetchUserWorkspaces = useWorkspaceStore((state) => state.fetchUserWorkspaces)
  const location = useLocation()

  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass)
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject)
  const setIsRemovingClass = useEditingStore((state) => state.setIsRemovingClass)
  const isRemovingClass = useEditingStore((set) => set.isRemovingClass)
  const setRemovingClassId = useEditingStore((set) => set.setRemovingClassId)
  const removingClassId = useEditingStore((state) => state.removingClassId)

  const user = useUserStore((state) => state.user)
  const userRole = user?.role

  const { classId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentWorkspaceId) {
      // Fetch workspaces and auto-select first one if none selected
      fetchUserWorkspaces()
    }
  }, [fetchUserWorkspaces, currentWorkspaceId])

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchClasses(currentWorkspaceId)
    }
  }, [fetchClasses, currentWorkspaceId])

  useEffect(() => {
    if (!classId && classes.length > 0) {
      navigate(`/library/classes/${classes[0]._id}/projects`, { replace: true })
    }
  }, [classId, classes, navigate])

  const handleEditClass = () => setIsEditingClass(true)
  const handleEditProject = () => setIsEditingProject(true)

  const handleMoreInfo = (e: React.MouseEvent<HTMLButtonElement>, classId: string) => {
    e.stopPropagation()
    e.preventDefault()
    setIsRemovingClass(true)
    setRemovingClassId(classId)
  }

  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <Container
      role="navigation"
      aria-label="Class Side Menu"
    >
      <TopSection aria-label="Class List">
        <h2>Classes</h2>
        <ProjectWrapper>
          {classes.map((cls) => {
            const to = `/library/classes/${cls._id}/projects`
            const isActive = location.pathname === to

            return (
              <Class
                to={to}
                key={cls._id}
                $active={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{cls.classTitle}</span>
                {userRole === "teacher" && (
                  <MoreInfo
                    onClick={(e) => handleMoreInfo(e, cls._id)}
                    aria-label={`More options for class ${cls.classTitle}`}
                    aria-haspopup="true"
                    role="button"
                    tabIndex={0}
                  >
                    &#8942;
                  </MoreInfo>
                )}
              </Class>
            )
          })}
        </ProjectWrapper>
      </TopSection>

      {isRemovingClass && <ClassOptions classId={removingClassId || ""} />}

      {userRole === "teacher" && (
        <BottomSection aria-label="Class Actions">
          <FormContainer>
            <StyledButton
              type="button"
              onClick={handleEditClass}
              aria-label="Add new class"
            >
              + Class
            </StyledButton>
            <StyledButton
              type="button"
              onClick={handleEditProject}
              aria-label="Add new project"
            >
              + Project
            </StyledButton>
          </FormContainer>
        </BottomSection>
      )}
    </Container>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 40px;
  background-color: ${({ theme }) => theme.colors.background};
  height: 85dvh;
  margin-top: 60px;
  display: none;

  h3 {
    margin-bottom: 24px;
  }

  @media ${MediaQueries.biggerSizes} {
    display: flex;
  }
`

const TopSection = styled.div`
  width: 100%;

  h2 {
    padding: 0 35px;
    font-size: 24px;
  }
`

const ProjectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
`

const MoreInfo = styled.button`
  all: unset;
  cursor: pointer;
  visibility: hidden;
  position: relative;
  margin: 0;
  padding: 0 4px;
  transform: scale(1.2);
  color: ${({ theme }) => theme.colors.textAlternative};
  transition: ease 0.3s;

  &:hover {
    font-weight: bolder;
    transform: scale(1.4);
    color: ${({ theme }) => theme.colors.text};
  }
`

const Class = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: ease 0.2s;
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.offBackgroundActive : "none"};
  border-radius: 10px;
  width: 100%;
  padding: 10px 25px;
  position: relative;

  &:hover {
    transform: scale(0.97);
    background-color: ${({ theme }) => theme.colors.offBackgroundHover};
  }

  &:hover ${MoreInfo} {
    visibility: visible;
  }
`

const BottomSection = styled.div`
  width: 100%;
`

const StyledButton = styled.button`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 40px;
  width: 80%;
  margin: 10px auto;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }
`

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  border-radius: 10px;

  @media ${MediaQueries.biggerSizes} {
    width: 100%;
  }
`
//#endregion
