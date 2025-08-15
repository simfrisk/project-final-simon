import styled from "styled-components";
import { useEffect } from "react";
import { useClassStore } from "../../../store/classStore";
import { MediaQueries } from "../../../themes/mediaQueries";
import { useEditingStore } from "../../../store/editStore";

export const TeachersSideMenu = () => {
  const classes = useClassStore((state) => state.classes);
  const fetchClasses = useClassStore((state) => state.fetchClasses);
  
  const currentClassId = useEditingStore((state) => state.currentClassId);
  const setCurrentClassId = useEditingStore((state) => state.setCurrentClassId);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handelClassFetch = (id: string) => {
    setCurrentClassId(id);
  };

  return (
    <Container>
      <TopSection>
        <h3>Classes</h3>
        <ClassList>
          {classes.map((cls) => (
            <ClassItem 
            onClick={() => handelClassFetch(cls._id)} 
            key={cls._id}
            $selected={currentClassId === cls._id}
            >
              <p>{cls.classTitle}</p>
            </ClassItem>
          ))}
        </ClassList>
      </TopSection>
    </Container>
  );
};

// Styled Components
const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 40px;
  background-color: ${({ theme }) => theme.colors.background};
  height: 85dvh;
  margin-top: 84px;
  display: none;
  width: 20%;
  display: none;

  h3 {
    margin-bottom: 24px;
  }

  @media ${MediaQueries.biggerSizes} {
    display: flex;
    display: block;
  }
`;

const TopSection = styled.div`
  width: 100%;

  h3 {
    padding: 0 35px;
  }
`;

const ClassList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
`;

const ClassItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
`;