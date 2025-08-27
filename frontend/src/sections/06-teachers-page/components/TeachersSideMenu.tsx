import styled from "styled-components"
import { MediaQueries } from "../../../themes/mediaQueries"
import type { ClassType } from "../../../store/classStore"
import { useEditingStore } from "../../../store/editStore"

interface TeachersSideMenuProps {
  classesCount: ClassType[]
}
export const TeachersSideMenu = ({ classesCount }: TeachersSideMenuProps) => {
  const currentClassId = useEditingStore((state) => state.currentClassId)
  const setCurrentClassId = useEditingStore((state) => state.setCurrentClassId)

  const handleClassFetch = (id: string) => setCurrentClassId(id)

  return (
    <Container>
      <TopSection>
        <h2>Classes</h2>
        <ClassList>
          {classesCount?.map((cls) => (
            <ClassItem
              onClick={() => handleClassFetch(cls._id)}
              key={cls._id}
              $selected={currentClassId === cls._id}
            >
              <p>{cls.classTitle}</p>
            </ClassItem>
          ))}
        </ClassList>
      </TopSection>
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
  margin-top: 84px;
  width: 250px;
  display: none;

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`

const TopSection = styled.div`
  width: 100%;

  h2 {
    font-size: 24px;
    padding: 0 35px;
    margin-bottom: 24px;
  }
`

const ClassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
`

const ClassItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.offBackgroundActive : theme.colors.background};
  border-radius: 10px;
  width: 100%;
  padding: 10px 25px;
  transition: ease 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(0.97);
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.offBackgroundActive : theme.colors.offBackgroundHover};
  }

  p {
    margin: 0;
    font-weight: ${({ $selected }) => ($selected ? "bold" : "normal")};
  }
`
