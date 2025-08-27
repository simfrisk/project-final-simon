import { Outlet } from "react-router-dom"
import { SideMenu } from "./components/side-menu/SideMenu"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"

export const VideoLibraryPage = () => {
  return (
    <>
      <InvisibleH1>Video Library</InvisibleH1>
      <Navigation />
      <MainSection aria-label="Video Library Section">
        <ContentWrapper>
          <SideNavContainer aria-label="Video Library Navigation">
            <SideMenu />
          </SideNavContainer>
          <Outlet />
        </ContentWrapper>
      </MainSection>
    </>
  )
}

const MainSection = styled.section`
  width: 100%;
  padding: 34px 0;

  @media ${MediaQueries.biggerSizes} {
    padding: 0;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`

const SideNavContainer = styled.section`
  width: 250px;
  flex-shrink: 0;
  display: none;
  background-color: ${({ theme }) => theme.colors.background};

  @media ${MediaQueries.biggerSizes} {
    display: block;
    padding: 72px 0;
  }
`

const InvisibleH1 = styled.h1`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`
