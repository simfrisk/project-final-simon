import { Outlet, useLocation } from "react-router-dom"
import { SideMenu } from "./components/side-menu/SideMenu"
import styled from "styled-components"
import { Navigation } from "../../global-components/navigation/Navigation"
import { MediaQueries } from "../../themes/mediaQueries"
import { CreateClass } from "./components/CreateClass"
import { useEditingStore } from "../../store/editStore"

export const VideoLibraryPage = () => {
  const isEditingClass = useEditingStore((state) => state.isEditingClass)
  const setIsEditingClass = useEditingStore((state) => state.setIsEditingClass)
  const location = useLocation()

  const handleModalClose = () => {
    setIsEditingClass(false)
  }

  // Don't show modal when on the main /library route (ChooseClassMessage route)
  const showModal = isEditingClass && !location.pathname.endsWith("/library")

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
      {showModal && (
        <ModalContainer onClick={handleModalClose}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CreateClass />
          </ModalContent>
        </ModalContainer>
      )}
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

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(2, 2, 2, 0.621);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.div`
  position: relative;
  z-index: 1001;
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
