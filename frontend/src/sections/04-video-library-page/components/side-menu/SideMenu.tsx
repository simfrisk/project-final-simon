import styled from "styled-components"
import { useEffect } from "react"
import { useClassStore } from "../../../../store/classStore"
import { MediaQueries } from "../../../../themes/mediaQueries"
import { Link, useLocation } from "react-router-dom"
import { useEditingStore } from "../../../../store/editStore"
import { useNavigate, useParams } from "react-router-dom"
import { useUserStore } from "../../../../store/userStore"
import { ClassOptions } from "./ClassOptions"

export const SideMenu = () => {
  const classes = useClassStore((state) => state.classes)
  const fetchClasses = useClassStore((state) => state.fetchClasses)
  const location = useLocation()

  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass)
  const setIsEditingProject = useEditingStore(
    (state) => state.setIsEditingProject
  )
  const setIsRemovingClass = useEditingStore(
    (state) => state.setIsRemovingClass
  )
  const isRemovingClass = useEditingStore((set) => set.isRemovingClass)
  const setRemovingClassId = useEditingStore((set) => set.setRemovingClassId)
  const removingClassId = useEditingStore((state) => state.removingClassId)

  const user = useUserStore((state) => state.user)
  const userRole = user?.role

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const { classId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!classId && classes.length > 0) {
      navigate(`/library/classes/${classes[0]._id}/projects`, { replace: true })
    }
  }, [classId, classes, navigate])

  const handleEditClass = async () => {
    setIsEditingClass(true)
  }

  const handleEditProject = async () => {
    setIsEditingProject(true)
  }

  const handelMoreInfo = (
    e: React.MouseEvent<HTMLParagraphElement>,
    classId: string
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setIsRemovingClass(true)
    setRemovingClassId(classId)
  }

  return (
    <Container>
      <TopSection>
        <h3>Classes</h3>
        <ProjectWrapper>
          {classes.map((cls) => {
            const to = `/library/classes/${cls._id}/projects`
            const isActive = location.pathname === to

            return (
              <Class
                to={to}
                key={cls._id}
                $active={isActive}
              >
                {cls.classTitle}
                <MoreInfo onClick={(e) => handelMoreInfo(e, cls._id)}>
                  &#8942;
                </MoreInfo>
              </Class>
            )
          })}
        </ProjectWrapper>
      </TopSection>

      {isRemovingClass && <ClassOptions classId={removingClassId || ""} />}

      {userRole === "teacher" && (
        <BottomSection>
          <FormContainer>
            <StyledButton
              type="button"
              onClick={handleEditClass}
            >
              + Class
            </StyledButton>
            <StyledButton
              type="button"
              onClick={handleEditProject}
            >
              + Project
            </StyledButton>
          </FormContainer>
        </BottomSection>
      )}
    </Container>
  )
}

// Styled Components

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

  h3 {
    padding: 0 35px;
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

const MoreInfo = styled.p`
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
