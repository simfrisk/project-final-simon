import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { SideMenu } from './components/side-menu/SideMenu';
import styled from 'styled-components';
import { Navigation } from '../../global-components/Navigation';
import { MediaQueries } from '../../themes/mediaQueries';
import { useEffect } from 'react';
import { useClassStore } from '../../store/classStore';

export const VideoLibraryPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const fetchClasses = useClassStore((state) => state.fetchClasses);
  const classes = useClassStore((state) => state.classes);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value;
    navigate(`/library/classes/${selectedClassId}/projects`);
  };

  return (
    <>
      <Navigation />
      <Section>
        <TopBar>
          <ClassSelect value={classId} onChange={handleClassChange}>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.classTitle}
              </option>
            ))}
          </ClassSelect>
        </TopBar>
        <Content>
          <SideMenuContainer>
            <SideMenu />
          </SideMenuContainer>
          <Outlet context={{ classId, classes, handleClassChange }} />
        </Content>
      </Section>
    </>
  );
};

const Section = styled.section `
  width: 100%;
  padding: 34px 0;

  @media ${MediaQueries.biggerSizes} {
    padding: 0;
  }
`

const Content = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const SideMenuContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
  display: none;
  background-color: ${({theme}) => theme.colors.background};

  @media ${MediaQueries.biggerSizes} {
    display: block;
    padding: 72px 0;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;

    @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`;

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
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: rgba(0, 0, 0, 0.14);
  }

  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;