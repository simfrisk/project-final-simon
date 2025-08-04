import { Outlet } from 'react-router-dom';
import { SideMenu } from './components/side-menu/SideMenu';
import styled from 'styled-components';
import { Navigation } from '../../global-components/Navigation';
import { Section } from '../../global-components/Section';
import { MediaQueries } from '../../themes/mediaQueries';

export const VideoLibraryPage = () => {
  return (
    <>
      <Navigation />
      <Section>
        <Content>
          <SideMenuContainer>
            <SideMenu />
          </SideMenuContainer>
          <Outlet /> {/* This will render ChooseClassMessage or ProjectsList */}
        </Content>
      </Section>
    </>
  );
};

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

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`;