import styled from "styled-components";
import { useEffect } from "react";
import { useClassStore } from "../../../../store/classStore";
import { MediaQueries } from "../../../../themes/mediaQueries";
import { Link, useLocation } from "react-router-dom";
import { useEditingStore } from "../../../../store/editStore";

export const SideMenu = () => {
  const classes = useClassStore((state) => state.classes);
  const fetchClasses = useClassStore((state) => state.fetchClasses);
  const location = useLocation();

  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass);
  const setIsEditingProject = useEditingStore((state) => state.setIsEditingProject);


  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleEditClass = async () => {
    setIsEditingClass(true)
  };

  const handleEditProject = async () => {
    setIsEditingProject(true)
  };

  return (
    <>
      <Container>
        <TopSection>
          <h3>Classes</h3>
          <ProjectWrapper>
            {classes.map((cls) => {
              const to = `/library/classes/${cls._id}/projects`;
              const isActive = location.pathname === to;

              return (
                <Class to={to} key={cls._id} $active={isActive}>
                  {cls.classTitle}
                </Class>
              );
            })}
          </ProjectWrapper>
        </TopSection>
        <BottomSection>
          <FormContainer>
            <StyledButton type="submit" onClick={handleEditClass}>
              + Class
            </StyledButton>
            <StyledButton type="submit" onClick={handleEditProject}>
              + Project
            </StyledButton>
          </FormContainer>
        </BottomSection>
      </Container>
    </>
  );
};

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
`;

const TopSection = styled.div``;

const ProjectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
`;

const Class = styled(Link)<{ $active: boolean }>`
  color: black;
  text-decoration: none;
  transition: ease 0.2s;
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};

  &:hover {
    transform: scale(0.97);
  }
`;

const BottomSection = styled.div`
width: 50%;
`;

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
  margin: 10px 0;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  border-radius: 10px;

  @media ${MediaQueries.biggerSizes} {
    width: 100%;
  }
`;
