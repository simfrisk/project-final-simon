import { Outlet } from "react-router-dom"
import { SideMenu } from "./components/side-menu/SideMenu"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"

export const VideoLibraryPage = () => {
  return (
    <>
      <Navigation />
      <Section>
        <Content>
          <SideMenuContainer>
            <SideMenu />
          </SideMenuContainer>
          <Outlet />
        </Content>
      </Section>
    </>
  )
}

const Section = styled.section`
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
`

const SideMenuContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
  display: none;
  background-color: ${({ theme }) => theme.colors.background};

  @media ${MediaQueries.biggerSizes} {
    display: block;
    padding: 72px 0;
  }
`
